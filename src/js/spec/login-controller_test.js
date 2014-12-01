describe("Login controller functionality", function() {

    var scope;
    var localStorageService;
    var getController;

    beforeEach(module('FlashCards'));
    beforeEach(inject(function($rootScope, $controller, $injector, _localStorageService_) {
        
        scope = $rootScope.$new();
        $httpBackend = $injector.get('$httpBackend');
        theController = $injector.get('$LoginController');
        $state = $injector.get('$state');
        localStorageService = _localStorageService_;
        getController = function(controllerName) {
            return $controller(controllerName, {$scope: scope});
        };
    }));

    it ('should have an empty notification system upon application startup', function() {
        var theController = getController('LoginController');
        expect(scope.notifications).toEqual([]);
    });

    it ('should check localstorage for a currently active session', function() {

    });


});