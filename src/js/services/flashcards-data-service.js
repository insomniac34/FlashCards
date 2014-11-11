
angular.module('FlashCards')

.service('FlashCardsDataService', ['$http', function FlashCardsDataService($http) {
    
    this.submitFlashCardData = function(params) {
        return $http.post('newFlashCard.htm', {data: params, action: 'submitFlashCards'}, {'Content-Type': 'application/x-www-form-urlencoded'}).then(function(response) {
            return response.data[0];
        });
    };

    this.getFlashCardData = function() {
        return $http.post('newFlashCard.htm', {date: new Date().toString(), action: 'getFlashCards'}, {'Content-Type': 'application/x-www-form-urlencoded'}).then(function(response) {
            return response.data[0];
        });        
    };
}])

;

