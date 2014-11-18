/* 
    An Interface for the Flashcards Object-Relational Schema
*/

var mysql = require('mysql');

var orm = {
    
    this.getFlashCards = function(username) {
        var con = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'password',
            database: 'test'
        });        
    };

    this.submitFlashCards = function() {

    };


};