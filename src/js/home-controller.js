angular.module('FlashCards')

.controller('HomeController', ['$scope', function HomeController($scope) {
    console.log("Hello from HomeController");
    $scope.pageTitle = "FlashCards";
}])

;
