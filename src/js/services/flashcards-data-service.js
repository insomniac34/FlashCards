
angular.module('FlashCards')

.service('FlashCardsDataService', ['$http', '$log', function FlashCardsDataService($http, $log) {
    
    this.submitFlashCardData = function(params) {
        $log.info("submitting flashcard data!");
        return $http.post('serverv3.js', {data: params, action: 'submitFlashCards'}, {'Content-Type': 'application/x-www-form-urlencoded'}).then(function(response) {
            $log.info('Response received!');
            return response;
        });
    };

    this.getFlashCardData = function() {
        $log.info("retrieving flashcard data!");
        return $http.post('serverv3.js', {date: new Date().toString(), action: 'getFlashCards'}, {'Content-Type': 'application/x-www-form-urlencoded'}).then(function(response) {
            $log.info('Response received!');
            return response;
        });        
    };
}])

;

