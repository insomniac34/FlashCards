/* 
    An Interface for the Flashcards Object-Relational Schema
        Written by Tyler Raborn
*/

var activeSessions = {};
var mysql = require('mysql');

Date.prototype.addHours = function(h) {    
   this.setTime(this.getTime() + (h*60*60*1000)); 
   return this;   
}

function getConnection() {
    return mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'test'
    });    
};    

exports.getFlashCardsByUser = function(username) {
    var con = getConnection();
    var getFlashCardQuery = "SELECT * FROM flashcards WHERE flashcards.user=\'" + username + "\' ORDER BY `id` desc";
    var results = [];
    con.query(getFlashCardQuery, function(err, rows, fields) {
        rows.forEach(function(row) {
            results.push(JSON.stringify(row));
        });
    });
    con.end();
    return results;
};

exports.createNewFlashCard = function(username, newFlashCard) {
    var con = getConnection();
    var getFlashCardQuery = "INSERT INTO `flashcards` VALUES (NULL, \'" + username + "\', \'" + newFlashCard.questions + "\', \'" + newFlashCard.answers + "\')";
    var results = [];
    con.query(getFlashCardQuery, function(err, rows, fields) {
        rows.forEach(function(row) {
            results.push(JSON.stringify(row));
        });
    });
    con.end();
    return results;
};

exports.createNewSession = function(username) {
    var con = getConnection();
    var randVal = Math.random() % 10000; /* generate unique session id */
    var newSessionQuery = "INSERT INTO `sessions` VALUES (\'" + randVal + "\', \'" + username + "\', \'" + new Date().addHours(24).toString() + "\')";
    var results = [];
    con.query(newSessionQuery, function(err, rows, field) {
        rows.forEach(function(row) {
            results.push(JSON.stringify(row));
        });
    });
    con.end();
    return results;
};

exports.getSessionByUser = function(username) {
    var con = getConnection();      
    var sessionStateQuery = "SELECT * FROM `sessions` WHERE user=\'"+username+"\'";
    var result = [];
    con.query(sessionStateQuery, function(err, rows, field) {
        
    }); 
    con.end();
    return result;
};

exports.getSessionById = function(id) {
    var con = getConnection();      
    var sessionStateQuery = "SELECT * FROM `sessions` WHERE id=\'"+id+"\'";
    var result = [];
    con.end();
    return result;
};

exports.getSessionExpirationDate = function() {
    var con = getConnection();      

    con.end();
};


