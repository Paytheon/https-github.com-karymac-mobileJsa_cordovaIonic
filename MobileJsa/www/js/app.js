/// <reference path="core/common.js" />
// Copyright © 2015 by Bit Smasher Labs.  All Rights Reserved.

angular.module('starter', ['ionic', 'starter.controllers'])

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }

        init();
    });

    function init() {
        commonNs.init();
        dbNs.init();
        cloudNs.init();
        environmentNs.init();
        geoNs.init();
        persistNs.init();
        persistMgrNs.init();
        syncNs.init();
    }
})

.config(function ($compileProvider, $stateProvider, $urlRouterProvider) {

  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })

  .state('app.search', {
    url: "/search",
    views: {
      'menuContent': {
        templateUrl: "templates/search.html"
      }
    }
  })

    .state('app.home', {
        url: "/home",
        views: {
            'menuContent': {
                templateUrl: "templates/home.html",
                controller: 'homeCtrl'
            }
        }
    })

  .state('app.employees', {
      url: "/employees",
    views: {
      'menuContent': {
          templateUrl: "templates/employees.html"
      }
    }
  })

  .state('app.employee', {
      url: "/employees/:employeeId",
    views: {
      'menuContent': {
        templateUrl: "templates/employee.html",
        controller: 'employeeCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});
