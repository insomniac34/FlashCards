angular.module('FlashCards')

.controller('LoginController', ['localStorageService', '$cookieStore', '$log', '$state', '$scope', '$http', 'FlashCardsUserService', function LoginController(localStorageService, $cookieStore, $log, $state, $scope, $http, FlashCardsUserService) {

    $scope.attemptedUsername = "";
    $scope.attemptedPassword = "";

    $scope.notifications = [];  
    $scope.empty = {};
    $scope.newUser = {};

    // if user session is already active, go to home page
    $log.info("localstorage is " + JSON.stringify(localStorageService.get('session')));
    if (localStorageService.get('session') !== null) {
        var sessionData = localStorageService.get('session');
        FlashCardsUserService.verifyUserSession(sessionData).then(function(response) {
            $log.info("Response is: " + JSON.stringify(response));
            if (angular.equals(JSON.parse(response[0]).status, "verified")) {
                $log.info("User session is now active with username " + localStorageService.get("session").username);
                $state.go('home');
            }
        });        
    }
    else {
        $state.go('login');
    }       

    $scope.login = function(attemptedUsername, attemptedPassword) {
        if (angular.equals(attemptedUsername, "") || angular.equals(attemptedPassword, "")) {
            $log.info('invalid login info!');
            $scope.notifications.push({
                msg: 'Please enter your credentials!',
                type: 'danger'
            });
            $scope.reset();
            return;
        }

        var userData = {
            username: attemptedUsername,
            password: attemptedPassword
        };

        FlashCardsUserService.attemptUserLogin(userData).then(function(response) {
            $log.info("Response is: " + JSON.stringify(response));
            if (angular.equals(JSON.parse(response[0]).status, "success")) {

                var sessionData = {
                    username: $scope.attemptedUsername,
                    sessionId: JSON.parse(response[0]).sessionId,
                    authenticationToken: JSON.parse(response[0]).authenticationToken
                };

                $log.info("setting session in ls to " + JSON.stringify(sessionData));
                localStorageService.set('session', sessionData);
                $state.go('home');
            }
            else {
                $scope.notifications.push({
                    msg: 'Invalid login!',
                    type: 'danger'
                });
                $scope.reset();
            }
        });
    };

    $scope.register = function() {
        if ($scope.newUser.email === undefined ||
            $scope.newUser.username === undefined ||
            $scope.newUser.password === undefined ||
            $scope.newUser.passwordDuplicate == undefined) {
            $scope.notifications.push({
                msg: 'Please enter all fields!',
                type: 'danger'
            });            
            $scope.resetRegistration();
            return;
        } 

        if (!angular.equals($scope.newUser.password, $scope.newUser.passwordDuplicate)) {
            $scope.notifications.push({
                msg: 'Passwords do not match!',
                type: 'danger'
            });            
            $scope.resetRegistration();
            return;
        }

        var accountData = {
            username: $scope.newUser.username,
            password: $scope.newUser.password,
            email: $scope.newUser.email
        };

        FlashCardsUserService.registerNewUser(accountData).then(function(response) {
            $log.info("Response is: " + JSON.stringify(response));

            if (angular.equals(JSON.parse(response[0]).status, "usernameExists")) {
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
            $scope.resetRegistration();
        });
    };

    $scope.reset = function() {
        $scope.attemptedPassword = "";
        $scope.attemptedUsername = "";
    };

    $scope.resetRegistration = function() {
        $scope.newUser = angular.copy($scope.empty);
    };

    $scope.closeNotification = function(index) {
        $scope.notifications.splice(index, 1);
    };      
}])

;
