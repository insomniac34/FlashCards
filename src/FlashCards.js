// core components:
angular.module("FlashCards", ['ngRoute', 'ngCookies', 'ngAnimate', 'ui.router', 'ui.bootstrap', 'LocalStorageModule'])

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
$urlRouterProvider.otherwise("login");
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
    .state('login', {
      url: '/login',
      templateUrl: 'templates/login-tpl.html',
      controller: 'LoginController'
    })
    ;
});
