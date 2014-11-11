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
    $scope.isMultiQuestionAnswers = false;
    $scope.newQuestions = [];
    $scope.newAnswers = [];
    $scope.flashCardList = [];

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
    };

    function createNewFlashCard(questionAnswerPairings, hints) {
        var newFlashCard = {
            questionAnswerPairings: [],
            hints: []
        };

        angular.forEach(questionAnswerPairings, function(questionAnswerPairing) {
            newFlashCard.push(questionAnswerPairing);
        });
        angular.forEach(hints, function(hint) {
            newFlashCard.push(hint);
        });

        return newFlashCard;
    }
}])

;