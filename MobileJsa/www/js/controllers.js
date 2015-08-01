/// <reference path="core/persistMgr.js" />
/// <reference path="core/common.js" />
/// <reference path="core/cloud.js" />
/// <reference path="core/environment.js" />
/// <reference path="core/db.js" />
/// <reference path="core/sync.js" />
// Copyright © 2015 by Bit Smasher Labs.  All Rights Reserved.

angular.module('starter.controllers', [])

.controller('AppCtrl', function ($scope, $ionicModal, $timeout) {

    // LOGIN ---------------------------------------------
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.loginModal = modal;
    });

    $scope.isLoggedIn = function () {
        return persistMgrNs.isLoggedIn();
    };

    $scope.loginData = {};

    $scope.closeLogin = function() {
        $scope.loginModal.hide();
    };

    $scope.showLogin = function () {
        $scope.loginData.errorMessage = '';
        $scope.loginModal.show();
    };

    $scope.doLogin = function () {
        $scope.loginData.errorMessage = '';

        cloudNs.login(
            $scope.loginData.companyAbbreviatedName,
            $scope.loginData.emplPin,
            environmentNs.getDeviceInfo().deviceGuid,
            function (r1) {
                if (r1.ErrorMessage != null) {
                    $scope.$apply(function () {
                        $scope.loginData.errorMessage = r1.ErrorMessage;
                    });
                    return;
                }
                var li = r1.Payload; // companyId, employeeId, deviceId, secret
                // do a quick sync to bootstrap the system.
                cloudNs.connectAndGetSyncData(li, false, function (r2) {
                    if (r2.ErrorMessage != null) {
                        $scope.$apply(function () {
                            $scope.loginData.errorMessage = r2.ErrorMessage;
                        });
                        return;
                    }
                    // sync db
                    var syncData = r2.Payload.syncData;
                    var md = dbNs.getMirroredData();
                    syncNs.updateMirroredData(md, syncData);
                    dbNs.setMirroredData(md);

                    commonNs.log('logged in: ' + ko.toJSON(li));
                    persistMgrNs.setLoggedInAs(li);
                });

                $scope.closeLogin();
            });
    };

    $scope.doLogout = function () {
        persistMgrNs.setLoggedInAs(null);
        $scope.$apply();
    }
    // ---------------------------------------------------

    // Cleanup
    $scope.$on('$destroy', function () {
        $scope.loginModal.remove();
    });

    // KO test stuff
    var koVm = {
        someText: ko.observable('ko obs value')
    };

    $scope.bindKo = function () {
        var el = document.getElementById('knockoutCrap');
        ko.applyBindings(koVm, el);
    };
})

.controller('homeCtrl', function ($scope) {

    //$scope.playlists = [
    //  { title: 'Reggae', id: 1 },
    //  { title: 'Chill', id: 2 },
    //  { title: 'Dubstep', id: 3 },
    //  { title: 'Indie', id: 4 },
    //  { title: 'Rap', id: 5 },
    //  { title: 'Cowbell', id: 6 }
    //];
})

.controller('PlaylistCtrl', function ($scope, $stateParams) {
    console.log('---PlaylistCtrl---');
})

.controller('PlaylistCtrl', function ($scope, $stateParams) {
    console.log('---PlaylistCtrl---');
});
