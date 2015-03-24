var weatherapp = angular.module('weatherapp', ['ionic', 'ngCordova', 'ngStorage', 'homeController'])

/*********************************************************************************************
*
*
* App On Run
*
*
*********************************************************************************************/

weatherapp.run(function($ionicPlatform, $localStorage) {
    $localStorage.settings = {units: 'metric'};
    $localStorage.units = [{unit:'metric'},{unit:'fahrenheit'}];
    $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
        if(window.cordova && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.StatusBar) {
          StatusBar.styleDefault();
        }
  });
})

/*********************************************************************************************
*
*
* App Config
*
*
*********************************************************************************************/

weatherapp.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider

    //homepage
    .state('home', {
        url: '/home',
        templateUrl: 'templates/home.html',
        controller: 'homeControllerWrapper'
    })

    $urlRouterProvider.otherwise('/home');
});
