describe("Hello, world!", function() {
    var scope;
    var theController;

    beforeEach(module('FlashCards'));
    beforeEach(angular.mock.inject(function($rootScope, $controller) {
        scope = $rootScope.$new();
        theController = $controller("ConfigurationController", { $scope: scope });
    }));

    it ("Should so some stuff", function() {
        expect(scope.notifications).toEqual([]);
    });
});