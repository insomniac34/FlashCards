/* 
    A simple HTTP server 
        Written by Tyler Raborn
*/

var ns = require('node-static');
var fileServer = new ns.Server('./');

require('http').createServer(function (request, response) {

        console.log("Request: " + request.url);

        if (request.method == 'POST') {

            // serverside actions based on post url:
            switch(request.url) {

                case '/src/serverv3.js': 
                    console.log("POST TO SERVER!");

                    var res = {};
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
                                console.log('request for flashcards received!');
                                break;

                            default:
                                break;
                        }

                    });

                    request.on('end', function() {
                        // empty 200 OK response for now
                        response.writeHead(200, "OK", {'Content-Type': 'text/html'});
                        response.end();

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
