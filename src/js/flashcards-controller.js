angular.module('FlashCards')

.controller('FlashCardsController', ['$state', 'localStorageService', '$log', '$scope', '$http', 'FlashCardsUserService', 'FlashCardsDataService', function FlashCardsController($state, localStorageService, $log, $scope, $http, FlashCardsUserService, FlashCardsDataService) {
    console.log("Hello from FlashCardsController");   
    $scope.pageTitle = "FlashCards!";

    $scope.notifications = [];
    $scope.flashcards = [];
    $scope.currentIndex = 0;
    $scope.currentFlashcard = {};

    /*
    FlashCard object is as follows:

    var newFlashCard = {
        questionAnswerPairings: [],
        hints: [],
        display: true,
        saved: false
    };    
    */

    $log.info("localstorage is " + JSON.stringify(localStorageService.get('session')));
    if (localStorageService.get('session') !== null) {
        var sessionData = localStorageService.get('session');
        FlashCardsUserService.verifyUserSession(sessionData).then(function(response) {
            $log.info("Response is: " + JSON.stringify(response));
            if (!angular.equals(JSON.parse(response[0]).status, "verified")) {
                var result = localStorageService.remove('session');
                $state.go('login');
                return;
            }

            // retrieve up-to-date data from server
            $log.info("writing session data: " + JSON.stringify(sessionData)); 
            FlashCardsDataService.getFlashCardData(sessionData).then(function(results) {
                $log.info("result received: " + JSON.stringify(results));
                if (results.length === 0) {
                    $scope.notifications.push({
                        msg: 'We were unable to find any flashcards. Create some and start building your collection!',
                        type: 'warning'
                    });
                    return;
                }
                else if (JSON.parse(results[0]).status !== undefined) {
                    //this means a message is being transmitted from the server; the only possible message for this situation is an authentication failure.
                    var result = localStorageService.remove('session');
                    $state.go('login');
                    return;                    
                }
                else {
                    angular.forEach(results, function(result) {
                        var resultObj = JSON.parse(result);
                        $log.info("resultObj is: " + JSON.stringify(resultObj));     
                
                        $scope.flashcards.push(createNewFlashCard([{
                            question: resultObj.questions,
                            answer: resultObj.answers
                        }]));

                        // since these come from the server, they are, by definition, saved 
                        $scope.flashcards[$scope.flashcards.length-1].saved = true;
                    });
                    $scope.currentFlashcard = $scope.flashcards[$scope.currentIndex];
                }
            });
        });        
    }    
    else {
        $state.go('login');
    }   

    $scope.nextFlashcard = function() {
        $log.info("NEXT!");
        $scope.currentIndex = ($scope.currentIndex === $scope.flashcards.length-1) ? 0 : $scope.currentIndex+1;
        $scope.currentFlashcard = $scope.flashcards[$scope.currentIndex];
    };

    $scope.logout = function() {
        var userData = {
            username: angular.copy(localStorageService.get('session').username),
            sessionId: angular.copy(localStorageService.get('session').sessionId),
            authenticationToken: angular.copy(localStorageService.get('session').authenticationToken)
        };

        // step 1: delete session from server
        FlashCardsUserService.attemptUserLogout(userData).then(function(response) {
            if (angular.equals(JSON.parse(response[0]).status, "success")) {        
                // step 2: delete local storage
                var result = localStorageService.remove('session');

                // step 3: reroute to login page
                $state.go('login');
            }
        });
    }; 

    function createNewFlashCard(questionAnswerPairings, hints) {
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
    }       
}])

;
