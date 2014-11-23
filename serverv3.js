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
var fileServer = new ns.Server('./');

require('http').createServer(function (request, response) {

        console.log("Request: " + request.url);
        if (request.method == 'POST') {
            // serverside actions based on post url:
            switch(request.url) {

                case '/src/serverv3.js': 
                    console.log("POST TO SERVER!");

                    var dbResults = [];

                    request.on('data', function(chunk) {
                        console.log("Received body data:");
                        console.log(JSON.parse(chunk).toString());
                        var data = JSON.parse(chunk);
                        console.log(data.action);

                        switch(data.action) {

                            case 'submitFlashCards':
                                console.log('flashcard data submitted!');
                                break;

                            case 'getFlashCards':
                                var con = mysql.createConnection({
                                    host: 'localhost',
                                    user: 'root',
                                    password: 'password',
                                    database: 'test'
                                });

                                var getFlashCardsQuery = "SELECT * FROM flashcards";
                                con.query(getFlashCardsQuery, function(err, rows, fields) {
                                    if (err) {
                                        throw err;
                                    }

                                    rows.forEach(function(row) {
                                        //console.log("pushing : " + JSON.stringify(row));
                                        dbResults.push(JSON.stringify(row));
                                    });

                                    response.writeHead(200, "OK", {'Content-Type': 'application/json'});
                                    console.log("WRITING: " + dbResults.toString());
                                    response.write(JSON.stringify({results: dbResults}));      
                                    response.end();                              
                                });

                                console.log('request for flashcards received!');
                                
                                con.end();
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
