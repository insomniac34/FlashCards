/*
 *  Controller for creating new flashcards and saving them to remote DB
 *
 *      Definitions:
 *          Multi-Question FlashCard: A Flashcard with N question-answer pairings
 *          Multi-Answer Question: A question 
 *          Ordered Answer: A question whose answer is N answers in an explicit order
 */         

angular.module('FlashCards')

.controller('ConfigurationController', ['$state', 'localStorageService', '$log', '$scope', '$http', 'FlashCardsUserService', 'FlashCardsDataService', function ConfigurationController($state, localStorageService, $log, $scope, $http, FlashCardsUserService, FlashCardsDataService) {
    $scope.pageTitle = "FlashCards Configuration Tool";    
    $scope.notifications = [];
    $scope.newFlashCards = [];
    $scope.newMultiQuestionFlashCards = [];
    $scope.isMultipleAnswers = false;
    $scope.newQuestions = [];
    $scope.radioModel = "Middle";
    $scope.newAnswers = [];
    $scope.flashCardList = [];
    $scope.displayed = [];
    $scope.flashCardOptions = [];
    $scope.deletedFlashCards = [];

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
                $log.info("result received: " + JSON.stringify(results[0]));
                if (JSON.parse(results[0]).status !== undefined) {
                    //this means a message is being transmitted from the server; the only possible message for this situation is an authentication failure.
                    var result = localStorageService.remove('session');
                    $state.go('login');
                    return;                    
                }
                else {
                    angular.forEach(results, function(result) {
                        var resultObj = JSON.parse(result);
                        $log.info("resultObj is: " + JSON.stringify(resultObj));     
                
                        $scope.newFlashCards.push(createNewFlashCard([{
                            question: resultObj.questions,
                            answer: resultObj.answers
                        }]));

                        /* since these come from the server, they are, by definition, saved */
                        $scope.newFlashCards[$scope.newFlashCards.length-1].saved = true;
                    });
                }
            });
        });        
    }    
    else {
        $state.go('login');
    }   

    $scope.$watch('radioModel', function(radioModel) {
        if (radioModel === null) {
            return;
        }

        angular.forEach($scope.newFlashCards, function(newFlashCard) {
            newFlashCard.display = false;
        });

        switch(radioModel) {
            case "Left":
                $log.info("show all!");
                angular.forEach($scope.newFlashCards, function(newFlashCard) {
                    newFlashCard.display = true;
                });
                break;

            case "Right":
                $log.info("show unsaved!");
                angular.forEach($scope.newFlashCards, function(newFlashCard) {
                    newFlashCard.display = (!newFlashCard.saved) ? true : false;
                });
                break;

            case "Middle":
                $log.info("show saved!");
                angular.forEach($scope.newFlashCards, function(newFlashCard) {
                    newFlashCard.display = (newFlashCard.saved) ? true : false;
                });
                break;

            default:
                angular.forEach($scope.newFlashCards, function(newFlashCard) {
                    newFlashCard.display = true;
                });
                break;
        }        
    });

    $scope.submitNewMultiQuestionFlashCard = function() {
        if (multiQuestionIsPossible()) {
            var newQuestionAnswerPairings = [];
            for (var i = 0; i < $scope.newQuestions.length; i++) {
                var newQuestionAnswerPairing = {
                    question: angular.copy($scope.newQuestions[i]),
                    answer: angular.copy($scope.newAnswers[i])
                };
                newQuestionAnswerPairings.push(newQuestionAnswerPairing);
            }
            $scope.newFlashCards.push(createNewFlashCard(newQuestionAnswerPairings));
            $scope.notifications.push({
                msg: 'New flashcard succesfully saved!',
                type: 'success'
            });
        }
        else {
            $scope.notifications.push({
                msg: 'Unable to save MultiQuestion flashcard, number of questions must match number of answers!',
                type: 'warning'
            });
        }   
    };

    $scope.submitNewFlashCard = function() {

    };

    $scope.showFlashCardOptions = function(index) {
        $scope.flashCardOptions[index] = ($scope.flashCardOptions[index]) ? true : false;
    };

    $scope.deleteFlashCard = function(index) {
        var tempArray = angular.copy($scope.newFlashCards);
        $scope.newFlashCards = [];
        var i = 0;
        angular.forEach(tempArray, function(obj) {
            if (i != index) {
                $scope.newFlashCards.push(obj);    
            }
            else {
                $scope.deletedFlashCards.push(obj);
            }
            i+=1;
        });
    };    

    $scope.createFlashCard = function() {
        if ($scope.newAnswers.length === 0 || $scope.newQuestions.length === 0) {
            $scope.notifications.push({
                msg: 'You must have at least one question and answer to make a new flashcard!',
                type: 'warning'
            });
            return;
        }

        if ($scope.newAnswers.length !== $scope.newQuestions.length) {
            $scope.notifications.push({
                msg: 'Cannot create flashcard; all questions must map to answers!',
                type: 'warning'
            });
            return;
        }

        var newQuestionAnswerPairings = [];
        for (var i = 0; i < $scope.newQuestions.length; i++) {
            var newQuestionAnswerPairing = {
                question: angular.copy($scope.newQuestions[i]),
                answer: angular.copy($scope.newAnswers[i])
            };
            newQuestionAnswerPairings.push(newQuestionAnswerPairing);
        }

        $scope.newFlashCards.push(createNewFlashCard(newQuestionAnswerPairings));
        $scope.notifications.push({
            msg: 'New flashcard succesfully created!',
            type: 'success'
        });
        $scope.newQuestions = [];
        $scope.newAnswers = [];        
    };

    $scope.clearQuestions = function() {
        $scope.newQuestions = [];
    };

    $scope.clearAnswers = function() {
        $scope.newAnswers = [];
    };

    $scope.save = function() {
        var sessionData = localStorageService.get('session');
        var params = {
            flashcards: [],
            deletedFlashCards: angular.copy($scope.deletedFlashCards),
            multiQuestionFlashCards: angular.copy($scope.newMultiQuestionFlashCards),
            username: sessionData.username,
            authenticationToken: sessionData.authenticationToken,
            sessionId: sessionData.sessionId
        }; 

        angular.forEach($scope.newFlashCards, function(flashcard) {
            if (!flashcard.saved) {
                params.flashcards.push(flashcard);
            }
        }); 

        if (params.flashcards.length === 0 && params.deletedFlashCards.length === 0) {
            $scope.notifications.push({msg: 'No new flashcards to save!', type: 'danger'});
            return;
        }

        $log.info("about to submit flashcards...JSON payload is: " + JSON.stringify(params));
        FlashCardsDataService.submitFlashCardData(params).then(function(response) {
            $log.info("RESPONSE IS: " + JSON.stringify(response));
            if (angular.equals(JSON.parse(response[0]).status, 'success')) {
                $scope.notifications.push({msg: 'Flashcard data has been saved!', type: 'success'});
            }
            else {
                localStorageService.remove('session');
                $state.go('login');
            }
        });
    };

    $scope.currentNewQuestion = "";
    $scope.currentNewAnswer = "";

    $scope.pushQuestion = function() {
        if (!angular.equals($scope.currentNewQuestion, "") &&
            $scope.newQuestions.indexOf($scope.currentNewQuestion) === -1) {
            $scope.newQuestions.push($scope.currentNewQuestion);  
            $scope.currentNewQuestion = "";  
        } 
        else {
            $scope.notifications.push({
                msg: 'You cannot do that!', 
                type: 'warning'
            });
            $scope.currentNewQuestion = ""; 
        }
    };

    $scope.pushAnswer = function() {
        if (!angular.equals($scope.currentNewAnswer, "") &&
            $scope.newAnswers.indexOf($scope.currentNewAnswer) === -1) {
            $scope.newAnswers.push($scope.currentNewAnswer);  
            $scope.currentNewAnswer = "";  
        } 
        else {
            $scope.notifications.push({
                msg: 'You cannot do that!', 
                type: 'warning'
            });
            $scope.currentNewAnswer = ""; 
        }
    };

    $scope.closeNotification = function(index) {
        $scope.notifications.splice(index, 1);
    };      

    function multiQuestionIsPossible() {
        return ($scope.newQuestions.length === $scope.newAnswers.length);
    }

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


