angular.module('FlashCards')

.controller('FlashCardsController', ['$scope', function FlashCardsController($scope) {
    console.log("Hello from FlashCardsController");   
    $scope.things = ["A", "Set", "Of", "Things"]; 
}])

;
