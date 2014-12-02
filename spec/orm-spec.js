/*
    Unit test module for flashcards object relational mapping interface
        Written by Tyler Raborn
*/

var orm = require('../orm.js');

describe("object-relational mapping interface", function() {

    it ("should initialize the connection pool to the passed-in size", function testConnectionPoolInit() {
        var MAX_CONNECTIONS = 50;
        orm.initializeConnectionPool(MAX_CONNECTIONS);
        expect(orm.connectionPool.length).toBe(50);
    });

    it ('should reset the connection pool to empty upon calling destroyConnectionPool()', function testConnectionPoolDestroy() {
        var MAX_CONNECTIONS = 50;
        orm.initializeConnectionPool(MAX_CONNECTIONS);
        orm.destroyConnectionPool();
        expect(orm.connectionPool.length).toBe(0);        
    });

    it ('should assign a unique identifier to all connections during initialization', function testDatasourceId() {
        var MAX_CONNECTIONS = 10;
        orm.initializeConnectionPool(MAX_CONNECTIONS);
        orm.connectionPool.forEach(function(connection) {
            expect(connection.dataSourceId).not.toBeUndefined();
        });        
    });

    it ('should return a valid datasource upon calling getConnection()', function testGetConnection() {
        var MAX_CONNECTIONS = 50;
        orm.initializeConnectionPool(MAX_CONNECTIONS);
        var connection = orm.getConnection();
        expect(connection).not.toBeUndefined();         
    });

    it ('should lock the appropriate database connection upon calling getConnection()', function testGetConnectionMutex() {
        var MAX_CONNECTIONS = 50;
        orm.initializeConnectionPool(MAX_CONNECTIONS);
        var connection = orm.getConnection();        
        expect(orm.connectionMutex[0]).toBe(true);
    });

    it ('should free a used database connection upon calling releaseConnection()', function testReleaseConnection() {
        var MAX_CONNECTIONS = 50;
        orm.initializeConnectionPool(MAX_CONNECTIONS);
        var connection = orm.getConnection();      
        orm.releaseConnection(connection);
        expect(orm.connectionMutex[2]).toBe(false);  
    });


});
