// core components:
angular.module("FlashCards", ['ngAnimate', 'ui.router', 'ui.bootstrap'])

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
$urlRouterProvider.otherwise("home");
$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
$httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

    $stateProvider
    .state('home', {
      url: "/home",
      templateUrl: "templates/home-tpl.html",
      controller: "HomeController"
    })
    .state('flashcards', {
      url: "/flashcards",
      templateUrl: "templates/flashcards-tpl.html",
      controller: "FlashCardsController"
    })
    .state('configuration', {
      url: '/configuration',
      templateUrl: 'templates/configuration-tpl.html',
      controller: 'ConfigurationController'
    })

    ;
});
