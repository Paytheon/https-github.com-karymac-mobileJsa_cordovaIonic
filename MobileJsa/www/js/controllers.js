/// <reference path="core/persistMgr.js" />
/// <reference path="core/common.js" />
/// <reference path="core/cloud.js" />
/// <reference path="core/environment.js" />
/// <reference path="core/db.js" />
/// <reference path="core/sync.js" />
// Copyright © 2015 by Bit Smasher Labs.  All Rights Reserved.

angular.module('starter.controllers', [])

.controller('AppCtrl', function ($scope, $ionicModal, $timeout) {


    function setDb() {
        if (persistMgrNs.isLoggedIn()) {
            $scope.db = dbNs.getMirroredData();
            var li = persistMgrNs.getLoggedInAs();
            $scope.company = dbNs.getCompany($scope.db, li.companyId);
            $scope.employee = dbNs.getEmployee($scope.db, li.employeeId);
        } else {
            $scope.company = null;
            $scope.employee = null;
        }
    }
    setDb();

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

    $scope.closeLogin = function () {
        $scope.loginModal.hide();
    };

    $scope.showLogin = function () {
        $scope.loginData.errorMessage = '';
        $scope.loginModal.show();
    };

    $scope.doLogin = function () {
        $scope.loginData.errorMessage = '';

        // TODO: try to login local first.

        // TODO: require network connectivity, error msg, no login if not.
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

                    // TODO: consider checking if MD already has a company which does not match loginInfo, reset MD.

                    syncNs.updateMirroredData(md, syncData);
                    syncNs.removeIndices(md);
                    dbNs.setMirroredData(md);
                    commonNs.log('synced mirrored data: ' + ko.toJSON(md));

                    setDb();

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
})

.controller('employeeCtrl', function ($scope, $stateParams) {
    var emplId = parseInt($stateParams.employeeId);
    $scope.employee = dbNs.getEmployee($scope.$parent.$parent.db, emplId);
})

.controller('formCtrl', function ($scope, $stateParams) {
    console.log('---formCtrl---');
    console.log(ko.toJSON($stateParams));
    console.log(ko.toJSON(
        $scope.$parent.$parent.db
        ));

    var formDefId = parseInt($stateParams.formDefId);
    $scope.formDef = dbNs.getFormDef($scope.$parent.$parent.db, formDefId);
})
;