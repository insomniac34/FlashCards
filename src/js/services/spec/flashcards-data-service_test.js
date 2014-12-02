/* 
    Unit test module for flashcards data controller
*/

describe("FlashCardsDataService functionality", function() {
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

    it ('should use submitFlashCardData() to update the application backend with flashcard data', function() {
               
    });

    it ('should use getFlashCardData() to fetch up-to-date flashcard data from the application backend', function() {

    });

});