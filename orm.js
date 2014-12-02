/* 
    Object-Relational Mapping (ORM) for the Flashcards Application Backend
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

exports.connectionPool = [];
exports.connectionMutex = [];
var availableConnections = [];
var closedConnections = [];

exports.initializeConnectionPool = function(maxConnections) {
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

exports.destroyConnectionPool = function() {
    connectionPool.forEach(function(connection) {
        connection.end();
    });
    connectionPool.length = 0;
}

var connectionIterator = 0;
exports.getConnection = function() {
    if (initialRun) {
        initializeConnectionPool(MAX_CONNECTIONS);
        initialRun = false;
    }

    var attempts = 0;
    while(attempts != MAX_CONNECTIONS) {
        console.log("connection iterator is " + connectionIterator.toString());
        if (connectionIterator === MAX_CONNECTIONS-1) {
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

exports.releaseConnection = function(connection) {
    console.log("Releasing datasource " + (connection.dataSourceId-1).toString());
    connectionMutex[connectionIterator-1] = false;
}  

//aliases for internal usage convenience
var getConnection = exports.getConnection;
var releaseConnection = exports.releaseConnection;
var initializeConnectionPool = exports.initializeConnectionPool;
var destroyConnectionPool = exports.destroyConnectionPool;
var connectionPool = exports.connectionPool;
var connectionMutex = exports.connectionMutex;

/* 
SESSIONS TABLE
+-----------------+--------------+------+-----+---------+----------------+
| Field           | Type         | Null | Key | Default | Extra          |
+-----------------+--------------+------+-----+---------+----------------+
| session_id      | int(11)      | NO   | PRI | NULL    | auto_increment |
| user            | varchar(100) | YES  |     | NULL    |                |
| expiration_date | datetime     | YES  |     | NULL    |                |
| session_start   | datetime     | YES  |     | NULL    |                |
| token           | varchar(512) | YES  |     | NULL    |                |
+-----------------+--------------+------+-----+---------+----------------+
*/
exports.verifySession = function(serverResponse, username, sessionId, authenticationToken) {
    var dbResults = [];

    var con = getConnection();
    var verifyUserSessionQuery = "SELECT * FROM `sessions` WHERE sessions.session_id=\'"+sessionId+"\' AND sessions.user=\'"+username+"\' AND sessions.token=\'" + JSON.stringify(authenticationToken) + "\'";
    con.query(verifyUserSessionQuery, function(err, rows, fields) {        
        if (rows.length !== 0) {
            console.log("rows is " + JSON.stringify(rows));
            console.log("VERIFYSESSION(): Comparing passed-in auth token " + JSON.stringify(authenticationToken) + " to " + rows[0].token);
            dbResults.push(JSON.stringify({
                status: 'verified',
                sessionId: sessionId
            }));
        }
        else {
            dbResults.push(JSON.stringify({
                status: 'failure'
            }));            
        }
        serverResponse.writeHead(200, "OK", {'Content-Type': 'application/json'});
        console.log("WRITING: " + dbResults.toString());
        serverResponse.write(JSON.stringify({results: dbResults}));      
        serverResponse.end();     
    });
    releaseConnection(con); 
};

exports.purgeExpiredSessions = function() {
    var con = getConnection();
    var getExpiredSessionsQuery = "SELECT * FROM `sessions` WHERE sessions.expiration_date < NOW() ORDER BY `session_id` DESC";
    con.query(getExpiredSessionsQuery, function(err, rows, fields) {
        if (err) {
            throw err;
        }

        rows.forEach(function(row) {
            var deleteSessionQuery = "DELETE FROM `sessions` WHERE sessions.session_id=\'" + row.session_id + "\'";
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
    var userVerificationQuery = "SELECT * FROM `users` WHERE users.user_name=\'" + username + "\'";
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
        var statusVerificationQuery = "SELECT * FROM `sessions` WHERE sessions.user=\'" + username + "\'";
        con.query(statusVerificationQuery, function(_err, _rows, _fields) {
            if (_err) {
                throw _err;
            }

            // if session already active, destroy active session and replace it with new one
            if (_rows.length !== 0) {
                console.log("Destroying already-active user session...");
                var destroySessionQuery = "DELETE FROM `sessions` WHERE sessions.user=\'"+username+"\'";
                con.query(destroySessionQuery, function(__err, __rows, __fields) {
                    if (__err) {
                        throw __err;
                    }

                    crypto.randomBytes(128, function(error, buf) {
                        if (error) {
                            throw error;
                        }
                        console.log('Created Auth Token: Generated %d bytes of random data: %s', buf.length, JSON.stringify(buf));
                       
                        // insert new session:
                        var createSessionQuery = "INSERT INTO `sessions` VALUES (NULL, \'" + username + "\', DATE_ADD(NOW(), INTERVAL 1 DAY), NOW(), \'"+ JSON.stringify(buf) +"\')";
                        con.query(createSessionQuery, function(___err, ___rows, ___fields) {
                            if (___err) {
                                throw ___err;
                            }
                            var sessionIdQuery = "SELECT * FROM `sessions` WHERE sessions.user=\'"+username+"\'";
                            con.query(sessionIdQuery, function(____err, ____rows, ____fields) {
                                console.log("ROWS IS " + JSON.stringify(____rows));
                                dbResults.push(JSON.stringify({
                                    status: 'success',
                                    sessionId: ____rows[0].session_id,
                                    authenticationToken: buf
                                }));   

                                serverResponse.writeHead(200, "OK", {'Content-Type': 'application/json'});
                                console.log("WRITING: " + dbResults.toString());
                                serverResponse.write(JSON.stringify({results: dbResults}));      
                                serverResponse.end();  
                            }); 
                        });                       
                    });
                });
            }
            else {
                crypto.randomBytes(128, function(error, buf) {
                    if (error) {
                        throw error;
                    }

                    console.log('Created Auth Token: Generated %d bytes of random data: %s', buf.length, JSON.stringify(buf));
                    var createSessionQuery = "INSERT INTO `sessions` VALUES (NULL, \'" + username + "\', DATE_ADD(NOW(), INTERVAL 1 DAY), NOW(), \'"+ JSON.stringify(buf) +"\')";
                    con.query(createSessionQuery, function(__err, __rows, __fields) {
                        if (__err) {
                            throw __err;
                        }
                        var sessionIdQuery = "SELECT * FROM `sessions` WHERE sessions.user=\'"+username+"\'";
                        con.query(sessionIdQuery, function(___err, ___rows, ___fields) {
                            if (___err) {
                                throw ___err;
                            }
                            console.log("ROWS IS " + JSON.stringify(___rows));

                            dbResults.push(JSON.stringify({
                                status: 'success',
                                sessionId: ___rows[0].session_id,
                                authenticationToken: buf
                            }));   

                            serverResponse.writeHead(200, "OK", {'Content-Type': 'application/json'});
                            console.log("WRITING: " + dbResults.toString());
                            serverResponse.write(JSON.stringify({results: dbResults}));      
                            serverResponse.end();  
                        });
                    });  
                });                              
            }       
        });        
    });

    releaseConnection(con);    
};

exports.destroySession = function(serverResponse, username, sessionId, authenticationToken) {
    var dbResults = [];
    var con = getConnection();
    var sessionDestructionQuery = "DELETE FROM `sessions` WHERE sessions.session_id=\'" + sessionId + "\' AND sessions.user=\'" + username + "\' AND sessions.token=\'"+ JSON.stringify(authenticationToken) +"\'";
    console.log("DESTROYING SESSION with query: " + sessionDestructionQuery);
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

/*
FLASHCARDS TABLE
+-----------+--------------+------+-----+---------+----------------+
| Field     | Type         | Null | Key | Default | Extra          |
+-----------+--------------+------+-----+---------+----------------+
| id        | int(11)      | NO   | PRI | NULL    | auto_increment |
| user      | varchar(100) | YES  |     | NULL    |                |
| questions | varchar(200) | YES  |     | NULL    |                |
| answers   | varchar(200) | YES  |     | NULL    |                |
+-----------+--------------+------+-----+---------+----------------+
*/
exports.createFlashcards = function(serverResponse, newFlashcards, username, authenticationToken) {
    if (newFlashcards === null || newFlashcards === undefined || newFlashcards.length === 0) {
        console.log("no new flashcards to add to database: " + JSON.stringify(newFlashcards));
        return;
    }
    var dbResults = [];
    var con = getConnection();
    var sessionAuthenticationQuery = "SELECT * FROM `sessions` WHERE sessions.token=\'" + JSON.stringify(authenticationToken) + "\' AND sessions.user=\'" + username + "\'";
    console.log("createFlashcards(): sessionAuthenticationQuery is: " + sessionAuthenticationQuery);
    con.query(sessionAuthenticationQuery, function(err, rows, fields) {
        if (err) {
            throw err;
        }

        // authenticate user session
        if (rows.length === 0) {
            dbResults.push(JSON.stringify({
                status: 'authentication-failure'
            }));            
            serverResponse.writeHead(200, "OK", {'Content-Type': 'application/json'});
            console.log("WRITING: " + dbResults.toString());
            serverResponse.write(JSON.stringify({results: dbResults}));      
            serverResponse.end();               
            return;
        }

        // insert new flashcards into database
        newFlashcards.forEach(function(flashcard) {
            var questions = "";
            var answers = "";
            flashcard.questionAnswerPairings.forEach(function(questionAnswerPairing) {
                questions+=questionAnswerPairing.question+"";
                answers+=questionAnswerPairing.answer+"";
            });

            var insertionQuery = "INSERT INTO `flashcards` VALUES (NULL, \'" + username + "\', \'" + questions + "\', \'" + answers + "\')";
            console.log("INSERTION QUERY IS: " + insertionQuery);
            con.query(insertionQuery, function(_err, _rows, _fields) {
                if (_err) {
                    throw _err;
                }
            });
        });

        dbResults.push(JSON.stringify({
            status: 'success'
        }));          
        serverResponse.writeHead(200, "OK", {'Content-Type': 'application/json'});
        console.log("CREATEFLASHCARDS: WRITING: " + dbResults.toString());
        serverResponse.write(JSON.stringify({results: dbResults}));      
        serverResponse.end();               
    });

    releaseConnection(con);
};

exports.deleteFlashcards = function(serverResponse, targetFlashcards, username, authenticationToken) {
    if (targetFlashcards === null || targetFlashcards === undefined || targetFlashcards.length === 0) {
        console.log("no flashcards to delete from database: " + JSON.stringify(targetFlashcards));
        return;
    }    

    var dbResults = [];
    var con = getConnection();
    var sessionAuthenticationQuery = "SELECT * FROM `sessions` WHERE sessions.token=\'" + JSON.stringify(authenticationToken) + "\' AND sessions.user=\'" + username + "\'";
    console.log("deleteFlashcards(): authentication query is " + sessionAuthenticationQuery);
    con.query(sessionAuthenticationQuery, function(err, rows, fields) {
        if (err) {
            throw err;
        }

        // authenticate user session
        if (rows.length === 0) {
            dbResults.push(JSON.stringify({
                status: 'authentication-failure'
            }));            
            serverResponse.writeHead(200, "OK", {'Content-Type': 'application/json'});
            console.log("WRITING: " + dbResults.toString());
            serverResponse.write(JSON.stringify({results: dbResults}));      
            serverResponse.end();               
            return;
        }

        // remove deleted flashcards from database
        targetFlashcards.forEach(function(flashcard) {
            var questions = "";
            var answers = "";
            flashcard.questionAnswerPairings.forEach(function(questionAnswerPairing) {
                questions+=questionAnswerPairing.question+"";
                answers+=questionAnswerPairing.answer+"";
            });

            var removalQuery = "DELETE FROM `flashcards` WHERE questions=\'" + questions + "\' AND answers=\'" + answers + "\' AND user=\'" + username + "\'";
            console.log("removal query is: " + removalQuery);
            con.query(removalQuery, function(_err, _rows, _fields) {
                if (_err) {
                    throw _err;
                }  
            });
        });
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

exports.retrieveAndTransmitFlashcards = function(serverResponse, username, authenticationToken) {
    var con = getConnection();  
    var dbResults = [];
    var sessionAuthenticationQuery = "SELECT * FROM `sessions` WHERE sessions.token=\'" + JSON.stringify(authenticationToken) + "\' AND sessions.user=\'" + username + "\'";    
    console.log("retrieveAndTransmitFlashcards(): verification query is: " + sessionAuthenticationQuery);
    con.query(sessionAuthenticationQuery, function(err, rows, fields) {
        if (err) {
            throw err;
        }
        console.log("retrieveAndTransmitFlashcards(): result of verification query has length: " + rows.length.toString());
        // authenticate user session
        if (rows.length === 0) {
            dbResults.push(JSON.stringify({
                status: 'authentication-failure'
            }));            
            serverResponse.writeHead(200, "OK", {'Content-Type': 'application/json'});
            console.log("WRITING: " + dbResults.toString());
            serverResponse.write(JSON.stringify({results: dbResults}));      
            serverResponse.end();               
            return;
        }

        var getFlashCardsQuery = "SELECT * FROM `flashcards` ORDER BY flashcards.id DESC";
        console.log("retrieveAndTransmitFlashcards(): getFlashCardsQuery is: " + getFlashCardsQuery);
        con.query(getFlashCardsQuery, function(_err, _rows, _fields) {
            if (_err) {
                throw _err;
            }

            _rows.forEach(function(row) {
                //console.log("pushing : " + JSON.stringify(row));
                dbResults.push(JSON.stringify(row));
            });
            serverResponse.writeHead(200, "OK", {'Content-Type': 'application/json'});
            console.log("WRITING: " + dbResults.toString());
            serverResponse.write(JSON.stringify({results: dbResults}));      
            serverResponse.end();                              
        });
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
    var userExistenceQuery = "SELECT * FROM `users` WHERE users.user_name=\'" + attemptedUsername + "\'";
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
            var encryptedPassword = crypto.createHash('sha256').update(newPassword).digest('hex');
            var userCreationQuery = "INSERT INTO `users` VALUES (NULL, \'" + attemptedUsername + "\', \'" + encryptedPassword + "\', \'" + newEmail + "\')";
            con.query(userCreationQuery, function(_err, _rows, _fields) {
                if (_err) {
                    throw _err;
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

