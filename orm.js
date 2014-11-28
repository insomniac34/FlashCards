/* 
    An Interface for the Flashcards Object-Relational Schema
        Written by Tyler Raborn
*/

var activeSessions = {};
var mysql = require('mysql');
var crypto = require('crypto');

Date.prototype.addHours = function(h) {    
   this.setTime(this.getTime() + (h*60*60*1000)); 
   return this;   
}

var initialRun = true;
var MAX_CONNECTIONS = 10;

var connectionPool = [];
var connectionMutex = [];
var availableConnections = [];
var closedConnections = [];

function initializeConnectionPool(maxConnections) {
    console.log("Initializing connection pool with " + maxConnections.toString() + " connections");
    for (var i = 0; i < maxConnections; i++) {
        connectionPool.push(mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'password',
            database: 'test'
        }));
        connectionMutex.push(false);
    }

    i = 0;
    connectionPool.forEach(function(con) {
        con.dataSourceId = i;
        i+=1;
    });
}

function destroyConnectionPool() {
    connectionPool.forEach(function(connection) {
        connection.end();
    });
}

var connectionIterator = 0;
function getConnection() {
    if (initialRun) {
        initializeConnectionPool(MAX_CONNECTIONS);
        initialRun = false;
    }

    var attempts = 0;
    while(attempts != MAX_CONNECTIONS) {
        if (connectionIterator === MAX_CONNECTIONS) {
            connectionIterator = 0;
        }

        if (connectionMutex[connectionIterator] === false) {
            connectionMutex[connectionIterator] = true;
            console.log("Datasource " + connectionPool[connectionIterator].dataSourceId.toString() + " acquired with " + attempts.toString() + " attempts.");
            connectionIterator+=1;
            return connectionPool[connectionIterator];
        }
        else {
            connectionIterator+=1;
        } 
        attempts+=1;       
    }
    return null;    
}

function releaseConnection(connection) {
    console.log("Releasing datasource " + connection.dataSourceId.toString());
    connectionMutex[connection.dataSourceId] = false;
}  

/* 
SESSIONS TABLE
+-----------------+--------------+------+-----+---------+----------------+
| Field           | Type         | Null | Key | Default | Extra          |
+-----------------+--------------+------+-----+---------+----------------+
| session_id      | int(11)      | NO   | PRI | NULL    | auto_increment |
| user            | varchar(100) | YES  |     | NULL    |                |
| expiration_date | date         | NO   |     | NULL    |                |
| session_start   | date         | NO   |     | NULL    |                |
+-----------------+--------------+------+-----+---------+----------------+
*/

exports.purgeExpiredSessions = function() {
    var con = getConnection();
    var getExpiredSessionsQuery = "SELECT `session_id` FROM `sessions` WHERE `sessions.expiration_date` < NOW() ORDER BY `session_id` DESC";
    con.query(getExpiredSessionsQuery, function(err, rows, fields) {
        if (err) {
            throw err;
        }

        rows.forEach(function(row) {
            var deleteSessionQuery = "DELETE FROM `sessions` WHERE `sessions.session_id`=\'" + row.session_id + "\'";
            con.query(deleteSessionQuery, function(_err, _rows, _fields) {
                if (_err) {
                    throw _err;
                }
            });
        });
    }); 

    releaseConnection(con);
};

// user x is attempting to initialize a session...
exports.initializeSession = function(serverResponse, username, attemptedPassword) {
    var con = getConnection();
    var dbResults = [];

    // verify user credentials
    var userVerificationQuery = "SELECT * FROM `users` WHERE `users.name`=\'" + username + "\'";
    con.query(userVerificationQuery, function(err, rows, fields) {
        if (err) {
            throw err;
        }

        // user does not exist:
        if (rows.length === 0) {
            dbResults.push(JSON.stringify({
                status: 'invalidUsername'   
            }));
            serverResponse.writeHead(200, "OK", {'Content-Type': 'application/json'});
            console.log("WRITING: " + dbResults.toString());
            serverResponse.write(JSON.stringify({results: dbResults}));      
            serverResponse.end();     
            return;        
        }

        // invalid password:
        if (rows[0].password.localeCompare(crypto.createHash('sha256').update(attemptedPassword).digest('hex')) !== 0) {
            dbResults.push(JSON.stringify({
                status: 'invalidPassword'
            }));
            serverResponse.writeHead(200, "OK", {'Content-Type': 'application/json'});
            console.log("WRITING: " + dbResults.toString());
            serverResponse.write(JSON.stringify({results: dbResults}));      
            serverResponse.end();     
            return;  
        }

        // verify current session state:
        var statusVerificationQuery = "SELECT * FROM `sessions` WHERE `session.user`=\'" + username + "\'";
        con.query(statusVerificationQuery, function(err, rows, fields) {
            if (err) {
                throw err;
            }

            // if session already active, destroy active session and replace it with new one
            if (rows.length !== 0) {
                console.log("Destroying already-active user session...");
                var destroySessionQuery = "DELETE FROM `sessions` WHERE `session.user`=\'"+username+"\'";
                con.query(destroySessionQuery, function(err, rows, fields) {
                    if (err) {
                        throw err;
                    }

                    // insert new session:
                    var createSessionQuery = "INSERT INTO `sessions` VALUES (NULL, \'" + username + "\', DATE_ADD(NOW(), INTERVAL 1 DAY), NOW()";
                    con.query(createSessionQuery, function(err, rows, fields) {
                        if (err) {
                            throw err;
                        }
                        serverResponse.writeHead(200, "OK", {'Content-Type': 'application/json'});
                        console.log("WRITING: " + dbResults.toString());
                        serverResponse.write(JSON.stringify({results: dbResults}));      
                        serverResponse.end();  
                    });   
                });
            }
            else {
                var createSessionQuery = "INSERT INTO `sessions` VALUES (NULL, \'" + username + "\', DATE_ADD(NOW(), INTERVAL 1 DAY), NOW()";
                con.query(createSessionQuery, function(err, rows, fields) {
                    if (err) {
                        throw err;
                    }
                    serverResponse.writeHead(200, "OK", {'Content-Type': 'application/json'});
                    console.log("WRITING: " + dbResults.toString());
                    serverResponse.write(JSON.stringify({results: dbResults}));      
                    serverResponse.end();  
                });                
            }       
        });        
    });

    releaseConnection(con);    
};

exports.destroySession = function(username, sessionId, serverResponse) {
    var dbResults = [];
    var con = getConnection();
    var sessionDestructionQuery = "DELETE FROM `sessions` WHERE `sessions.session_id`=\'" + sessionId + "\' AND `sessions.user`=\'" + username + "\'";
    con.query(sessionDestructionQuery, function(err, rows, fields) {
        if (err) {
            throw err;
        }

        dbResults.push(JSON.stringify({
            status: 'success'
        }));        

        serverResponse.writeHead(200, "OK", {'Content-Type': 'application/json'});
        console.log("WRITING: " + dbResults.toString());
        serverResponse.write(JSON.stringify({results: dbResults}));      
        serverResponse.end();    
    });

    releaseConnection(con);
};

exports.createFlashcards = function(newFlashcards, userId) {
    if (newFlashcards === null || newFlashcards === undefined || newFlashcards.length === 0) {
        console.log("no new flashcards to add to database: " + JSON.stringify(newFlashcards));
        return;
    }

    // insert new flashcards into database
    var con = getConnection();
    newFlashcards.forEach(function(flashcard) {
        var questions = "";
        var answers = "";
        flashcard.questionAnswerPairings.forEach(function(questionAnswerPairing) {
            questions+=questionAnswerPairing.question+"\n";
            answers+=questionAnswerPairing.answer+"\n";
        });

        var insertionQuery = "INSERT INTO `flashcards` VALUES (NULL, 'ty', \'" + questions + "\', \'" + answers + "\')";
        console.log("INSERTION QUERY IS: " + insertionQuery);
        con.query(insertionQuery, function(err, rows, fields) {
            if (err) {
                throw err;
            }
        });
    });

    releaseConnection(con);
};

exports.deleteFlashcards = function(targetFlashcards, userId) {
    if (targetFlashcards === null || targetFlashcards === undefined || targetFlashcards.length === 0) {
        console.log("no flashcards to delete from database: " + JSON.stringify(targetFlashcards));
        return;
    }    

    // remove deleted flashcards from database
    var con = getConnection();
    targetFlashcards.forEach(function(flashCard) {
        var questions = "";
        var answers = "";
        flashcard.questionAnswerPairings.forEach(function(questionAnswerPairing) {
            questions+=questionAnswerPairing.question+"\n";
            answers+=questionAnswerPairing.answer+"\n";
        });

        var removalQuery = "DELETE FROM `flashcards` WHERE `questions`=\'"+questions+"\' AND `answers`=\'"+answers+"\'";
        con.query(removalQuery, function(err, rows, fields) {
            if (err) {
                throw err;
            }  
        });
    });
    
    releaseConnection(con);
};

exports.retrieveAndTransmitFlashcards = function(serverResponse) {
    var con = getConnection();  

    var dbResults = [];
    var getFlashCardsQuery = "SELECT * FROM `flashcards` ORDER BY `flashcards.id` DESC";
    con.query(getFlashCardsQuery, function(err, rows, fields) {
        if (err) {
            throw err;
        }

        rows.forEach(function(row) {
            //console.log("pushing : " + JSON.stringify(row));
            dbResults.push(JSON.stringify(row));
        });

        serverResponse.writeHead(200, "OK", {'Content-Type': 'application/json'});
        console.log("WRITING: " + dbResults.toString());
        serverResponse.write(JSON.stringify({results: dbResults}));      
        serverResponse.end();                              
    });

    releaseConnection(con);
};

/*
USERS TABLE
+-----------+--------------+------+-----+---------+----------------+
| Field     | Type         | Null | Key | Default | Extra          |
+-----------+--------------+------+-----+---------+----------------+
| id        | int(11)      | NO   | PRI | NULL    | auto_increment |
| user_name | varchar(100) | YES  |     | NULL    |                |
| password  | varchar(100) | YES  |     | NULL    |                |
| email     | varchar(100) | YES  |     | NULL    |                |
+-----------+--------------+------+-----+---------+----------------+
*/
exports.registerNewUser = function(serverResponse, attemptedUsername, newPassword, newEmail) {
    var dbResults = [];
    var con = getConnection();
    var userExistenceQuery = "SELECT * FROM `users` WHERE `user.name`=\'" + attemptedUsername + "\'";
    con.query(userExistenceQuery, function(err, rows, fields) {
        if (rows.length > 0) {

            // user exists
            dbResults.push(JSON.stringify({
                status: 'usernameExists'
            }));

            serverResponse.writeHead(200, "OK", {'Content-Type': 'application/json'});
            console.log("WRITING: " + dbResults.toString());
            serverResponse.write(JSON.stringify({results: dbResults}));      
            serverResponse.end();     
            return;              
        }
        else {
            var userCreationQuery = "INSERT INTO `users` VALUES (NULL, \'" + attemptedUsername + "\', \'" + newPassword + "\', \'" + newEmail + "\')";
            con.query(userCreationQuery, function(err, rows, fields) {
                if (err) {
                    throw err;
                }

                dbResults.push(JSON.stringify({
                    status: 'success'
                }));

                serverResponse.writeHead(200, "OK", {'Content-Type': 'application/json'});
                console.log("WRITING: " + dbResults.toString());
                serverResponse.write(JSON.stringify({results: dbResults}));      
                serverResponse.end();     
                return;
            });
        }
    });

    releaseConnection(con);
};
