/* 
    A simple HTTP server 
        Written by Tyler Raborn
*/

/*
var connection = mysql.createConnection(
    {
      host     : 'localhost',
      user     : 'your-username',
      password : 'your-password',
      database : 'wordpress',
    }
);
*/

var mysql = require('mysql');
var ns = require('node-static');
var orm = require('./orm.js');
var fileServer = new ns.Server('./');

require('http').createServer(function (request, response) {

        console.log("Request: " + request.url);
        if (request.method == 'POST') {
            // serverside actions based on post url:
            switch(request.url) {

                case '/src/server.js': 
                    console.log("POST TO SERVER!");

                    var dbResults = [];

                    request.on('data', function(chunk) {
                        console.log("Received body data:");
                        console.log(JSON.parse(chunk).toString());
                        var jsonPayload = JSON.parse(chunk);
                        console.log("ACTION IS " + jsonPayload.action);

                        switch(jsonPayload.action) {

                            case 'submitFlashCards':
                                console.log("action: SUBMITFLASHCARDS!");
                                console.log('flashcard data submitted!');
                                console.log('Value of data to be synced with backend: ' + JSON.stringify(jsonPayload));

                                orm.createFlashcards(
                                    response,
                                    jsonPayload.data.flashcards,
                                    jsonPayload.data.username,
                                    jsonPayload.data.authenticationToken
                                );

                                orm.deleteFlashcards(
                                    response,
                                    jsonPayload.data.deletedFlashCards,
                                    jsonPayload.data.username,
                                    jsonPayload.data.authenticationToken
                                );

                                break;

                            case 'getFlashCards':
                                console.log("action: GETFLASHCARDS!");
                                orm.retrieveAndTransmitFlashcards(
                                    response,
                                    jsonPayload.data.username,
                                    jsonPayload.data.authenticationToken
                                );
                                
                                break;

                            case 'login':
                                console.log("User is attempting login with credentials: " + jsonPayload.data.username + " and " + jsonPayload.data.password);
                                orm.initializeSession(
                                    response,
                                    jsonPayload.data.username,
                                    jsonPayload.data.password
                                );

                                break;

                            case 'verifySession':
                                orm.purgeExpiredSessions();
                                orm.verifySession(
                                    response,
                                    jsonPayload.data.username,
                                    jsonPayload.data.sessionId,
                                    jsonPayload.data.authenticationToken
                                );
                                
                                break;

                            case 'logout':
                                orm.destroySession(
                                    response,
                                    jsonPayload.data.username,
                                    jsonPayload.data.sessionId,
                                    jsonPayload.data.authenticationToken
                                );

                                break;

                            case 'userRegistration':
                                console.log("User is attempting to create account with credentials: " + jsonPayload.data.username + " and " + jsonPayload.data.password + " and " + jsonPayload.data.email);
                                orm.registerNewUser(
                                    response,
                                    jsonPayload.data.username,
                                    jsonPayload.data.password,
                                    jsonPayload.data.email
                                );

                                break;

                            default:
                                request.on('end', function() {
                                    // empty 200 OK response for now
                                    response.writeHead(200, "OK", {'Content-Type': 'text/html'});
                                    console.log("dbresults being written: " + dbResults.toString());

                                    dbResults.forEach(function(dbResult) {
                                        console.log("results: " + dbResult);
                                    });

                                    response.write(dbResults.toString());
                                    response.end();
                                });
                                break;
                        }
                    });

                    break;
                
                default:
                    console.log("[200] " + request.method + " to " + request.url);
                    request.on('data', function(chunk) {
                        console.log("Received body data:");
                        console.log(chunk.toString());
                    });

                    request.on('end', function() {
                        // empty 200 OK response for now
                        response.writeHead(200, "OK", {'Content-Type': 'text/html'});
                        response.end();
                    });

                    break;
            }
        } else {
            fileServer.serve(request, response);
        }

}).listen(8080);

