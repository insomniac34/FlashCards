/* 
    Unit test module for login controller
*/

describe("Login controller functionality", function() {
    var scope;
    var getController;
    var FlashCardsDataService;
    var FlashCardsUserService;
    var requestHandler;
    var localStorageService;
    var theRootScope;

    var mockAuthenticationResponse = {
        status: 'success',
        sessionId: 10,
        authenticationToken: '1234567890'
    };

    beforeEach(module('FlashCards'));
    beforeEach(inject(function($rootScope, $controller, $injector, _FlashCardsDataService_, _localStorageService_, _FlashCardsUserService_) {
        scope = $rootScope.$new();
        //controllerService = $controller;
        theRootScope = $rootScope;
        getController = function(theController) {
            return $controller(theController, {$scope: scope});
        };

        FlashCardsDataService = _FlashCardsDataService_;
        FlashCardsUserService = _FlashCardsUserService_;

        $httpBackend = $injector.get('$httpBackend');
        $state = $injector.get('$state');

        localStorageService = _localStorageService_;

        var requestHandler = $httpBackend.when('POST', 'server.js').respond([{status: 'success'}]);

        //SEE: https://docs.angularjs.org/api/ngMock/service/$httpBackend FOR AWESOME $HTTPBACKEND TEST EXAMPLES

        var store = {};
        spyOn(localStorageService, 'get').and.callFake(function (key) {
            return store[key];
        });
        spyOn(localStorageService, 'set').and.callFake(function (key, value) {
            return store[key] = value + '';
        });
        spyOn(localStorageService, 'remove').and.callFake(function (key) {
            store[key] = undefined;
        });  
  
    }));

    it ('should have an empty notification system upon application startup', function() {
        var theController = getController('LoginController');
        expect(scope.notifications).toEqual([]);
    });   

    it ('should authenticate a user and log them in on success', function() {

        $httpBackend.expectGET('templates/login-tpl.html').respond(401, '');
        //$httpBackend.expectPOST('server.js', {"action":"verifySession"}, {"Accept":"application/json, text/plain, */*","X-Requested-With":"XMLHttpRequest","Content-Type":"application/x-www-form-urlencoded;charset=utf-8"}).respond(200, {results: [JSON.stringify(mockAuthenticationResponse)]});
        $httpBackend.expectPOST('server.js', {"data":{"username":"tyler","password":"password"},"action":"login"}, {"Accept":"application/json, text/plain, */*","X-Requested-With":"XMLHttpRequest","Content-Type":"application/x-www-form-urlencoded;charset=utf-8"}).respond(200, {results: [JSON.stringify(mockAuthenticationResponse)]});
        $httpBackend.expectGET('templates/home-tpl.html').respond(401, '');
        //$httpBackend.expectGET('templates/login-tpl.html').respond(401, '');
        //$httpBackend.expectGET('templates/home-tpl.html').respond(401, '');
        
        var theController = getController('LoginController');
        scope.attemptedUsername = 'tyler';
        scope.login('tyler', 'password');

        $httpBackend.flush();
        expect(true).toBe(true);
    });


});