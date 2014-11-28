angular.module('FlashCards')

.controller('FlashCardsLoginController', ['$scope', '$http', 'FlashCardsUserService', function FlashCardsLoginController($scope, $http, FlashCardsUserService) {

    $scope.attemptedUsername = "";
    $scope.attemptedPassword = "";
    $scope.notifications = [];  

    $scope.newUsername = "";
    $scope.newPassword = "";
    $scope.newPasswordDuplicate = "";
    $scope.newEmail = "";

    $scope.empty = {};

    $scope.login = function(attemptedUsername, attemptedPassword) {
        var userData = {
            username: attemptedUsername,
            password: attemptedPassword
        };

        FlashCardsUserService.attemptUserLogin(userData).then(function(response) {
            if (angular.equals(response.status, "success")) {
                //urlRouteProvider.transitionTo();
            }
            else {

            }
        });
    };

    $scope.register = function(newUsername, newPassword) {
        var accountData = {
            username: attemptedUsername,
            password: attemptedPassword
        };

        FlashCardsUserService.registerNewUser(accountData).then(function(response) {
            if (angular.equals(response.status, "usernameExists")) {
                $scope.notifications.push({
                    msg: 'That username is already in use!',
                    type: 'danger'
                });
            }
            else {
                $scope.notifications.push({
                    msg: 'Account succesfully registered!',
                    type: 'success'
                });
            }
        });
    };

}])

;
