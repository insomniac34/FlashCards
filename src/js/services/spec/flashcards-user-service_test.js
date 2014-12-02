/* 
    Unit test module for user controller
*/

describe("FlashCardsUserService functionality", function() {
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

    var mockSessionResponse = {
        status: 'verified',
        sessionId: 10
    };

    var mockRegistrationResponse = {
        status: 'success'
    };  

    var mockLogoutResponse = {
        status: 'success'
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

    }));

    it ('should use verifyUserSession() to determine if a user session is currently active', function(done) {
        
        // tests to be evaluated on the promise's response
        var testResponse = function(response) {
            expect(JSON.parse(response[0]).status).toBe('verified');
            expect(JSON.parse(response[0]).sessionId).toBe(10);  
        };

        // error should not be thrown
        var failureTest = function(error) {
            expect(error).toBeUndefined();
        };

        $httpBackend.expectPOST('server.js', {"data":{"username":"tyler","sessionId":10, "authenticationToken":"1234567890"},"action":"verifySession"}, {"Accept":"application/json, text/plain, */*","X-Requested-With":"XMLHttpRequest","Content-Type":"application/x-www-form-urlencoded;charset=utf-8"}).respond(200, {results: [JSON.stringify(mockSessionResponse)]});
        $httpBackend.expectGET('templates/login-tpl.html').respond(401, '');

        var sessionParams = {
            username: 'tyler',
            sessionId: 10,
            authenticationToken: '1234567890'
        };

        FlashCardsUserService.verifyUserSession(sessionParams).then(testResponse).catch(failureTest).finally(done);

        $httpBackend.flush();        
    });

    it ('should use attemptUserLogin() to verify the authenticity of the supplied user credentials', function(done) {

        // tests to be evaluated on the promise's response
        var testResponse = function(response) {
            expect(JSON.parse(response[0]).status).toBe('success');
            expect(JSON.parse(response[0]).sessionId).toBe(10);  
            expect(JSON.parse(response[0]).authenticationToken).toBe('1234567890');
        };

        // error should not be thrown
        var failureTest = function(error) {
            expect(error).toBeUndefined();
        };

        $httpBackend.expectPOST('server.js', {"data":{"username":"tyler","password":"password"},"action":"login"}, {"Accept":"application/json, text/plain, */*","X-Requested-With":"XMLHttpRequest","Content-Type":"application/x-www-form-urlencoded;charset=utf-8"}).respond(200, {results: [JSON.stringify(mockAuthenticationResponse)]});
        $httpBackend.expectGET('templates/login-tpl.html').respond(401, '');

        var loginParams = {
            username: 'tyler',
            password: 'password'
        };
        FlashCardsUserService.attemptUserLogin(loginParams).then(testResponse).catch(failureTest).finally(done);

        $httpBackend.flush();
    });

    it ('should use registerNewUser() to submit the users registration data to the application backend', function(done) {
        // tests to be evaluated on the promise's response
        var testResponse = function(response) {
            expect(JSON.parse(response[0]).status).toBe('success');
        };

        // error should not be thrown
        var failureTest = function(error) {
            expect(error).toBeUndefined();
        };

        $httpBackend.expectPOST('server.js', {"data":{"username":"tyler","password":"password","email":"blah@blah.com"},"action":"userRegistration"}, {"Accept":"application/json, text/plain, */*","X-Requested-With":"XMLHttpRequest","Content-Type":"application/x-www-form-urlencoded;charset=utf-8"}).respond(200, {results: [JSON.stringify(mockRegistrationResponse)]});
        $httpBackend.expectGET('templates/login-tpl.html').respond(401, '');

        var mockAccountData = {
            username: 'tyler',
            password: 'password',
            email: 'blah@blah.com'
        };

        FlashCardsUserService.registerNewUser(mockAccountData).then(testResponse).catch(failureTest).finally(done);

        $httpBackend.flush();
    });

    it ('should use attemptUserLogout() to submit a logout request to the application backend', function(done) {
        // tests to be evaluated on the promise's response
        var testResponse = function(response) {
            expect(JSON.parse(response[0]).status).toBe('success');
        };

        // error should not be thrown
        var failureTest = function(error) {
            expect(error).toBeUndefined();
        };

        $httpBackend.expectPOST('server.js', {"data":{"username":"tyler","sessionId":10,"authenticationToken":"1234567890"},"action":"logout"}, {"Accept":"application/json, text/plain, */*","X-Requested-With":"XMLHttpRequest","Content-Type":"application/x-www-form-urlencoded;charset=utf-8"}).respond(200, {results: [JSON.stringify(mockLogoutResponse)]});
        $httpBackend.expectGET('templates/login-tpl.html').respond(401, '');

        // this would normally be extracted from localstorage...
        var mockUserData = {
            username: 'tyler',
            sessionId: 10,
            authenticationToken: '1234567890'
        };

        FlashCardsUserService.attemptUserLogout(mockUserData).then(testResponse).catch(failureTest).finally(done);

        $httpBackend.flush();
    });
});









