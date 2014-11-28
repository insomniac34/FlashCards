angular.module('FlashCards')

/* 
    username and pw checked in database on backend, if validated initiates a session
*/

.service('FlashCardsUserService', ['$http', '$log', function FlashCardsUserService($http, $log) {
    this.attemptUserLogin = function(params) {
        var jsonPayload = {
            data: params, 
            action: 'login'
        };

        return $http.post('server.js', jsonPayload, {'Content-Type': 'application/x-www-form-urlencoded'}).then(function(response) {
            return angular.fromJson(response).data.results;
        });
    };

    this.attemptUserLogout = function(params) {
        var jsonPayload = {
            data: params, 
            action: 'logout'
        };

        return $http.post('server.js', jsonPayload, {'Content-Type': 'application/x-www-form-urlencoded'}).then(function(response) {
            return angular.fromJson(response).data.results;
        });        
    };

    this.registerNewUser = function(params) {
        var jsonPayload = {
            data: params, 
            action: 'userRegistration'
        };

        return $http.post('server.js', jsonPayload, {'Content-Type': 'application/x-www-form-urlencoded'}).then(function(response) {
            return angular.fromJson(response).data.results;
        }); 
    };
}])

;
