describe("flashcards controller", function() {
    var localStorageService;
    var FlashCardsUserService;
    var FlashCardsDataService;
    var scope;
    var getController;    

    var mockAuthenticationResponse = {
        status: 'verified',
        sessionId: 15
    };

    var mockLogoutResponse = {
        status: 'success'
    };
    
    beforeEach(module('FlashCards'));
    beforeEach(inject(function($rootScope, $injector, $controller, _localStorageService_, _FlashCardsUserService_, _FlashCardsDataService_) {
        myRootScope = $rootScope;
        scope = myRootScope.$new();
        FlashCardsUserService = _FlashCardsUserService_;
        FlashCardsDataService = _FlashCardsDataService_;
        localStorageService = _localStorageService_;
        

        getController = function(ctrl) {
            return $controller(ctrl, {$scope: scope});
        };

        $httpBackend = $injector.get('$httpBackend');
        $state = $injector.get('$state');

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

        /* mock date constructor */
        var dateConstructor = Date;
        spyOn(window, 'Date').and.callFake(function(params) {
            if (params) {
                return new dateConstructor(params);
            }
            return new dateConstructor('2014-01-02');
        });


    }));

    it ('should begin with an empty notification system', function() {
        var theController = getController('FlashCardsController');
        expect(scope.notifications).toEqual([]);
    });

    it ('should transition to the /login state upon clicking of the logout button', function(done) {

        // set up mock authentication response from server:
        $httpBackend.expectPOST('server.js', {"data":"{\"username\":\"Tyler\",\"sessionId\":15,\"authenticationToken\":\"1234567890\"}","action":"verifySession"}, {"Accept":"application/json, text/plain, */*","X-Requested-With":"XMLHttpRequest","Content-Type":"application/x-www-form-urlencoded;charset=utf-8"}).respond(200, {results: [JSON.stringify(mockAuthenticationResponse)]});
        $httpBackend.expectGET('templates/login-tpl.html').respond(401, '');
        $httpBackend.expectPOST('server.js', {"data":{},"action":"logout"}, {"Accept":"application/json, text/plain, */*","X-Requested-With":"XMLHttpRequest","Content-Type":"application/x-www-form-urlencoded;charset=utf-8"}).respond(200, {results: [JSON.stringify(mockLogoutResponse)]});
        $httpBackend.expectPOST('server.js', {"data":"{\"username\":\"Tyler\",\"sessionId\":15,\"authenticationToken\":\"1234567890\"}","date":"Wed Jan 01 2014 19:00:00 GMT-0500 (EST)","action":"getFlashCards"}, {"Accept":"application/json, text/plain, */*","X-Requested-With":"XMLHttpRequest","Content-Type":"application/x-www-form-urlencoded;charset=utf-8"}).respond(200, {results: [JSON.stringify(mockAuthenticationResponse)]});
        $httpBackend.expectGET('templates/login-tpl.html').respond(401, '');
        //$httpBackend.expectGET('templates/login-tpl.html').respond(401, '');
        //$httpBackend.expectPOST('server.js', {"data":"{\"username\":\"Tyler\",\"sessionId\":15,\"authenticationToken\":\"1234567890\"}","date":"Wed Jan 01 2014 19:00:00 GMT-0500 (EST)","action":"getFlashCards"}, {"Accept":"application/json, text/plain, */*","X-Requested-With":"XMLHttpRequest","Content-Type":"application/x-www-form-urlencoded;charset=utf-8"}).respond(200, {results: [JSON.stringify(mockAuthenticationResponse)]});
        //$httpBackend.expectGET('templates/login-tpl.html').respond(401, '');        
        //$httpBackend.expectGET('templates/login-tpl.html').respond(401, '');

        // set up mock flashcards data from server:
        //$httpBackend.expectPOST('server.js', {"data":{"username":"johndoe123","sessionId":15, "authenticationToken":"1234567890"},"action":"getFlashCards"}, {"Accept":"application/json, text/plain, */*","X-Requested-With":"XMLHttpRequest","Content-Type":"application/x-www-form-urlencoded;charset=utf-8"}).respond(200, {results: [JSON.stringify(mockAuthenticationResponse)]});
        
        // set mock localstorage values
        localStorageService.set('session', JSON.stringify({
            username: 'Tyler',
            sessionId: 15,
            authenticationToken: '1234567890'
        }));

        // instantiate controller module - this will result in a 'verifyUserSession' call followed by a 'getFlashCards' call
        var theController = getController('FlashCardsController');
        myRootScope.$digest();
        done();
        scope.logout();
        myRootScope.$digest();
        done();
        expect(localStorageService.get('session')).toBeUndefined();

        // transition $stateProvider to the flashcards page
        //$state.go('flashcards');
        
        // flush outstanding xhr requests
        $httpBackend.flush();
    });

    it ('should transition to the login state upon clicking of the logout button', function() {

        // set up mock authentication response from server:
        $httpBackend.expectPOST('server.js', {"data":"{\"username\":\"Tyler\",\"sessionId\":15,\"authenticationToken\":\"1234567890\"}","action":"verifySession"}, {"Accept":"application/json, text/plain, */*","X-Requested-With":"XMLHttpRequest","Content-Type":"application/x-www-form-urlencoded;charset=utf-8"}).respond(200, {results: [JSON.stringify(mockAuthenticationResponse)]});
        $httpBackend.expectGET('templates/flashcards-tpl.html').respond(401, '');
        $httpBackend.expectGET('templates/login-tpl.html').respond(401, '');
        $httpBackend.expectPOST('server.js', {"data":"{\"username\":\"Tyler\",\"sessionId\":15,\"authenticationToken\":\"1234567890\"}","date":"Wed Jan 01 2014 19:00:00 GMT-0500 (EST)","action":"getFlashCards"}, {"Accept":"application/json, text/plain, */*","X-Requested-With":"XMLHttpRequest","Content-Type":"application/x-www-form-urlencoded;charset=utf-8"}).respond(200, {results: [JSON.stringify(mockAuthenticationResponse)]});
        $httpBackend.expectGET('templates/login-tpl.html').respond(401, '');        
        //$httpBackend.expectGET('templates/login-tpl.html').respond(401, '');

        // set up mock flashcards data from server:
        //$httpBackend.expectPOST('server.js', {"data":{"username":"johndoe123","sessionId":15, "authenticationToken":"1234567890"},"action":"getFlashCards"}, {"Accept":"application/json, text/plain, */*","X-Requested-With":"XMLHttpRequest","Content-Type":"application/x-www-form-urlencoded;charset=utf-8"}).respond(200, {results: [JSON.stringify(mockAuthenticationResponse)]});
        

        // set mock localstorage values
        localStorageService.set('session', JSON.stringify({
            username: 'Tyler',
            sessionId: 15,
            authenticationToken: '1234567890'
        }));

        // instantiate controller module - this will result in a 'verifyUserSession' call followed by a 'getFlashCards' call
        var theController = getController('FlashCardsController');

        // transition $stateProvider to the flashcards page
        $state.go('flashcards');
        
        // flush outstanding xhr requests
        $httpBackend.flush();
    });
});
