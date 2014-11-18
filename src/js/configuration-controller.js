/*
 *  Controller for creating new flashcards and saving them to remote DB
 *
 *      Definitions:
 *          Multi-Question FlashCard: A Flashcard with N question-answer pairings
 *          Multi-Answer Question: A question 
 *          Ordered Answer: A question whose answer is N answers in an explicit order
 */         


angular.module('FlashCards')

.controller('ConfigurationController', ['$log', '$scope', '$http', 'FlashCardsDataService', function ConfigurationController($log, $scope, $http, FlashCardsDataService) {
    $scope.pageTitle = "FlashCards Configuration Tool";    
    $scope.notifications = [];
    $scope.newFlashCards = [];
    $scope.newMultiQuestionFlashCards = [];
    $scope.isMultipleAnswers = false;
    $scope.newQuestions = [];
    $scope.newAnswers = [];
    $scope.flashCardList = [];
    $scope.radioModel = "Left";
    $scope.displayed = [];
    $scope.flashCardOptions = [];

    /* retrieve up-to-date data from server */
    FlashCardsDataService.getFlashCardData().then(function(response) {
        $log.info("data received: " + JSON.stringify(response));
        if (response) {
            //WARNING: assigning the global array to the response object F's everything in the A
            //$scope.newFlashCards = response;            
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

    $scope.displayOption = function() {
        //$log.info("CLICKED! $scope.radioModel is: " + $scope.radioModel);
        switch($scope.radioModel) {
            case "Left":
                $log.info("left!");
                break;
            case "Right":
                $log.info("right!");
                break;
            case "Middle":
                $log.info("middle!");
                break;
            default:
                break;
        }
    };

    $scope.save = function() {
        if ($scope.newFlashCards.length === 0 && $scope.newMultiQuestionFlashCards.length === 0) {
            $log.info("no data to save!");
            return;
        }
        $log.info("saving data!");

        var params = {
            flashcards: $scope.newFlashCards,
            multiQuestionFlashCards: $scope.newMultiQuestionFlashCards
        };  

        FlashCardsDataService.submitFlashCardData(params).then(function(response) {
            if (response) {
                $scope.notifications.push({msg: 'Flashcard data has been saved!', type: 'success'});
            }
            else {
                $scope.notifications.push({msg: 'There was an error processing your request!', type: 'warning'});
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
            hints: []
        };
        angular.forEach(questionAnswerPairings, function(questionAnswerPairing) {
            newFlashCard.questionAnswerPairings.push(questionAnswerPairing);
        });


        return newFlashCard;
    }
}])

;