angular.module('FlashCards')

.controller('HomeController', ['FlashCardsUserService', '$log', 'localStorageService', '$state', '$scope', function HomeController(FlashCardsUserService, $log, localStorageService, $state, $scope) {
    console.log("Hello from HomeController");
    $scope.pageTitle = "FlashCards";

    $log.info("localstorage is " + JSON.stringify(localStorageService.get('session')));
    if (localStorageService.get('session') !== null) {
        var sessionData = localStorageService.get('session');
        FlashCardsUserService.verifyUserSession(sessionData).then(function(response) {
            $log.info("Response is: " + JSON.stringify(response));
            if (!angular.equals(JSON.parse(response[0]).status, "verified")) {
                var result = localStorageService.remove('session');
                $state.go('login');
            }
        });        
    }
    else {
        $state.go('login');
    }    

    $scope.logout = function() {
        
        var userData = {
            username: angular.copy(localStorageService.get('session').username),
            sessionId: angular.copy(localStorageService.get('session').sessionId)
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
