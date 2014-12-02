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
    var createNewFlashCard;

    var mockAuthenticationResponse = {
        status: 'success',
        sessionId: 10,
        authenticationToken: '1234567890'
    };

    var mockSessionResponse = {
        status: 'verified',
        sessionId: 10
    };

    var mockSubmissionResponse = {
        status: 'success'
    };

    var mockFlashcardData = {
        "id":14,
        "user":"tyler",
        "questions":"LOL",
        "answers":"LOL?"
    };

    beforeEach(module('FlashCards'));
    beforeEach(inject(function($rootScope, $controller, $injector, _FlashCardsDataService_, _localStorageService_, _FlashCardsUserService_) {
        scope = $rootScope.$new();
        //controllerService = $controller;
        theRootScope = $rootScope;
        getController = function(theController) {
            return $controller(theController, {$scope: scope});
        };

        createNewFlashCard = function(questionAnswerPairings, hints) {
            var newFlashCard = {
                questionAnswerPairings: [],
                hints: [],
                display: true,
                saved: false
            };

            angular.forEach(questionAnswerPairings, function(questionAnswerPairing) {
                newFlashCard.questionAnswerPairings.push(questionAnswerPairing);
            });

            return newFlashCard;
        };        

        FlashCardsDataService = _FlashCardsDataService_;
        FlashCardsUserService = _FlashCardsUserService_;

        $httpBackend = $injector.get('$httpBackend');
        $state = $injector.get('$state');

        /* mock date constructor */
        var dateConstructor = Date;
        spyOn(window, 'Date').and.callFake(function(params) {
            if (params) {
                return new dateConstructor(params);
            }
            return new dateConstructor('2014-01-02');
        });        

    }));

    it ('should use submitFlashCardData() to update the application backend with flashcard data', function(done) {
        // tests to be evaluated on the promise's response
        var testResponse = function(response) {
            expect(JSON.parse(response[0]).status).toBe('success');
        };

        // error should not be thrown
        var failureTest = function(error) {
            expect(error).toBeUndefined();
        };

        $httpBackend.expectPOST('server.js', {"data":{"flashcards":[{"questionAnswerPairings":[{"question":"WHY IS BLAH???","answer":"BECAUSE BLAH!"}],"hints":[],"display":true,"saved":false}],"deletedFlashCards":[{"questionAnswerPairings":[{"question":"AM I CONFUSED???","answer":"YES!"}],"hints":[],"display":true,"saved":false},{"questionAnswerPairings":[{"question":"AM I TIRED???","answer":"YES!"}],"hints":[],"display":true,"saved":false}],"multiQuestionFlashCards":[],"username":"tyler","authenticationToken":"1234567890","sessionId":10},"action":"submitFlashCards"}, {"Accept":"application/json, text/plain, */*","X-Requested-With":"XMLHttpRequest","Content-Type":"application/x-www-form-urlencoded;charset=utf-8"}).respond(200, {results: [JSON.stringify(mockSubmissionResponse)]});
        $httpBackend.expectGET('templates/login-tpl.html').respond(401, '');

        var mockParams = {
            flashcards: [
                createNewFlashCard([{question: 'WHY IS BLAH???', answer: 'BECAUSE BLAH!'}], [])
            ],
            deletedFlashCards: [
                createNewFlashCard([{question: 'AM I CONFUSED???', answer: 'YES!'}], []),
                createNewFlashCard([{question: 'AM I TIRED???', answer: 'YES!'}], [])
            ],
            multiQuestionFlashCards: [], // not yet implemented
            username: 'tyler',
            authenticationToken: '1234567890',
            sessionId: 10
        }; 

        FlashCardsDataService.submitFlashCardData(mockParams).then(testResponse).catch(failureTest).finally(done);

        $httpBackend.flush();        
    });

    it ('should use getFlashCardData() to fetch up-to-date flashcard data from the application backend', function(done) {
        
        var testResponse = function(response) {
            expect(JSON.parse(response[0]).id).toBe(14);
            expect(JSON.parse(response[0]).user).toBe('tyler');
            expect(JSON.parse(response[0]).questions).toBe('LOL');
            expect(JSON.parse(response[0]).answers).toBe('LOL?'); 
        };

        // error should not be thrown
        var failureTest = function(error) {
            expect(error).toBeUndefined();
        };

        $httpBackend.expectPOST('server.js', {"data":{"username":"tyler","sessionId":10,"authenticationToken":"1234567890"},"date":"Wed Jan 01 2014 19:00:00 GMT-0500 (EST)","action":"getFlashCards"}, {"Accept":"application/json, text/plain, */*","X-Requested-With":"XMLHttpRequest","Content-Type":"application/x-www-form-urlencoded;charset=utf-8"}).respond(200, {results: [JSON.stringify(mockFlashcardData)]});
        $httpBackend.expectGET('templates/login-tpl.html').respond(401, '');

        // this would normally be extracted from localstorage...
        var mockSessionParams = {
            username: 'tyler',
            sessionId: 10,
            authenticationToken: '1234567890'
        };

        FlashCardsDataService.getFlashCardData(mockSessionParams).then(testResponse).catch(failureTest).finally(done);

        $httpBackend.flush(); 
    });

});