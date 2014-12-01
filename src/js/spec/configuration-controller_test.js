/* 
    Unit test module for Configuration Tool
*/

describe("flashcards configuration tool", function() {
    var scope;
    var getController;
    var FlashCardsDataService;
    var FlashCardsUserService;
    var requestHandler;
    var localStorageService;

    var mockSessionResponse = {
        status: 'verified',
        sessionId: 10
    };

    beforeEach(module('FlashCards'));
    beforeEach(inject(function($rootScope, $controller, $injector, _FlashCardsDataService_, _localStorageService_, _FlashCardsUserService_) {
        scope = $rootScope.$new();
        //controllerService = $controller;

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

/*
    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });    
*/

    it ("should begin with an empty notification system", function() {
        var theController = getController('ConfigurationController');
        expect(scope.notifications).toEqual([]);
    });

    it ("should stage a new question when the add question button is pressed", function() {
        var theController = getController('ConfigurationController');

        scope.currentNewQuestion = "Why is blah?";
        scope.pushQuestion();
        expect(scope.newQuestions).toEqual(["Why is blah?"]);
    });

    it ("should stage a new answer when the add answer button is pressed", function() {
        var theController = getController('ConfigurationController');

        scope.currentNewAnswer = "because blah";
        scope.pushAnswer();
        expect(scope.newAnswers).toEqual(["because blah"]);
    });

    it ("should create a new flashcard and add it to the master flashcards list when the create flashcard button is pressed", function() {
        var theController = getController('ConfigurationController');

        scope.currentNewAnswer = "because blah.";
        scope.currentNewQuestion = "why is blah?";
        scope.pushAnswer();
        scope.pushQuestion();

        //create new local (unsaved) flashcard
        scope.createFlashCard();

        expect(scope.newFlashCards).toEqual([{questionAnswerPairings: [ { question: 'why is blah?', answer: 'because blah.' } ], hints: [  ], display: true, saved: false } ]);
    });

    it ("should throw an error when the create flashcard button is pressed with only an answer present", function testCreateFlashCardWithNoQuestion() {
        var theController = getController('ConfigurationController');

        scope.currentNewAnswer = "because blah.";
        scope.pushAnswer();

        //create new local (unsaved) flashcard
        scope.createFlashCard();

        expect(scope.notifications).toContain({
            msg: 'You must have at least one question and answer to make a new flashcard!',
            type: 'warning'
        });
        expect(scope.newFlashCards[0]).toBeUndefined();
    });    

    it ("should throw an error when the create flashcard button is pressed with only a question present", function testCreateFlashCardWithNoAnswer() {
        var theController = getController('ConfigurationController');

        scope.currentNewQuestion = "why is blah?";
        scope.pushQuestion();

        //create new local (unsaved) flashcard
        scope.createFlashCard();

        expect(scope.notifications).toContain({
            msg: 'You must have at least one question and answer to make a new flashcard!',
            type: 'warning'
        });
        expect(scope.newFlashCards[0]).toBeUndefined();
    });   

    it ("should delete a given flashcard when its delete button is pressed", function testFlashcardDeletion() {
        var theController = getController('ConfigurationController');

        scope.currentNewAnswer = "because blah.";
        scope.currentNewQuestion = "why is blah?";
        scope.pushAnswer();
        scope.pushQuestion();

        //create new local (unsaved) flashcard
        scope.createFlashCard();
        expect(scope.newFlashCards).toEqual([{questionAnswerPairings: [ { question: 'why is blah?', answer: 'because blah.' } ], hints: [  ], display: true, saved: false } ]);     

        //delete latest flashcard
        scope.deleteFlashCard(0);           
        expect(scope.newFlashCards).toEqual([]);     
    });   

    it ("should verify that an authorized session is currently active before fetching serverside data", function testSessionAuthenticationLogic() {
        scope.username = "johndoe123";
        var sessionId = 10;
        var sessionData = {
            username: scope.username,
            sessionId: sessionId
        };
        localStorageService.set('session', JSON.stringify(sessionData));
        
        /*
            AngularJS (and other modern JS frameworks) utilize the concept of Promises when handling asynchronous operations such as 
            AJAX requests. Traditionally it has always been difficult to perform unit tests on asynchronous operations due to the variable
            length of time they can take to complete. Jasmine 2.0 has added the Done() function, which tells the unit test to suspend execution 
            UNTIL the promise is complete, allowing for easier testing of this common language feature.
        */

        // tests to be evaluated on the promise's response
        var testResponse = function(response) {
            expect(JSON.parse(response[0]).status).toBe('verified');
            expect(JSON.parse(response[0]).sessionId).toBe(10);  
        };

        // error should not be thrown
        var failureTest = function(error) {
            expect(error).toBeUndefined();
        };

        // external method that calls done(), which ensures that Jasmine waits for the async op to complete
        var done = function() {
            done();
        };

        $httpBackend.expectPOST('server.js', {"data":{"username":"johndoe123","sessionId":10},"action":"verifySession"}, {"Accept":"application/json, text/plain, */*","X-Requested-With":"XMLHttpRequest","Content-Type":"application/x-www-form-urlencoded;charset=utf-8"}).respond(200, {results: [JSON.stringify(mockSessionResponse)]});
        $httpBackend.expectGET('templates/login-tpl.html').respond(401, '');
        FlashCardsUserService.verifyUserSession(sessionData).then(testResponse).catch(failureTest).finally(done);
        $httpBackend.flush();
    });
    
   it ("should show only saved flashcards when the radio button is set to 'Middle' ", function() {
        var theController = getController('ConfigurationController');

        scope.newFlashCards = [{
            questionAnswerPairings: [{questions: 'Why is blah?', answers: 'because blah'}],
            hints: [],
            display: true,
            saved: true
        }, {
            questionAnswerPairings: [{questions: 'Why?', answers: 'because'}],
            hints: [],
            display: true,
            saved: false
        }];

        //set radio model to rightmost value
        scope.radioModel = "Middle";
        //calling $digest forces the 
        scope.$digest();

        expect(scope.newFlashCards[0].display).toBe(true);
        expect(scope.newFlashCards[1].display).toBe(false);
   }); 

   it ("should display only unsaved flashcards when the radio button is set to 'Right'", function() {
        var theController = getController('ConfigurationController');

        scope.newFlashCards = [{
            questionAnswerPairings: [{questions: 'Why is blah?', answers: 'because blah'}],
            hints: [],
            display: true,
            saved: true
        }, {
            questionAnswerPairings: [{questions: 'Why?', answers: 'because'}],
            hints: [],
            display: true,
            saved: false
        }];

        //set radio model to rightmost value
        scope.radioModel = "Right";
        scope.$digest();

        expect(scope.newFlashCards[0].display).toBe(false);
        expect(scope.newFlashCards[1].display).toBe(true);
   });

   it ("should display both saved and unsaved flashcards when the left radio button is set", function() {
        var theController = getController('ConfigurationController');

        scope.newFlashCards = [{
            questionAnswerPairings: [{questions: 'Why is blah?', answers: 'because blah'}],
            hints: [],
            display: false,
            saved: true
        }, {
            questionAnswerPairings: [{questions: 'Why?', answers: 'because'}],
            hints: [],
            display: true,
            saved: false
        }];

        //set radio model to rightmost value
        scope.radioModel = "Left";
        scope.$digest();

        expect(scope.newFlashCards[0].display).toBe(true);
        expect(scope.newFlashCards[1].display).toBe(true);    
   });
});








