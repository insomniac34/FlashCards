/*
    A component of the FlashCards Verification SQL system, responsible for executing the NodeJS object relational mapping functions under test
*/

var orm = require('../orm.js');
var sys = require('sys');
var exec = require('child_process').exec;

exports.testFlashcardsUpdateQuery = function() {

    console.log("executing testFlashcardsUpdateQuery()...");

    var mockJsonPayload = {
        username: 'test',
        sessionId: 10,
        authenticationToken: '1234567890'
    };

    var mockHttpResponse = {
        writeHead: function() {return;},
        write: function() {return;},
        end: function() {    
            setTimeout(function() {
                process.exit();
            }, 1000);         
        }       
    };

    var newFlashcards = [{
            questionAnswerPairings: [{question: 'Why?', answer: 'Because'}]
        }, {
            questionAnswerPairings: [{question: 'What are the best kind of cats?', answer: 'dead ones'}]
        }, {
            questionAnswerPairings: [{question: 'another question', answer: 'another answer'}]
        }
    ];

    orm.createFlashcards(
        mockHttpResponse,
        newFlashcards,
        mockJsonPayload.username,
        mockJsonPayload.authenticationToken
    );
};

exports.testFlashcardsUpdateQuery();