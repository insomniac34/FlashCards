angular.module('FlashCards')

.controller('FlashCardsController', ['$scope', function FlashCardsController($scope) {
    console.log("Hello from FlashCardsController");   
    $scope.pageTitle = "FlashCards!";

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
}])

;
