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
            $scope.company = dbNs.getTableRow($scope.db, 'Company', 'CompanyId', li.companyId);
            $scope.employee = dbNs.getTableRow($scope.db, 'Employee', 'EmployeeId', li.employeeId);
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

    $ionicModal.fromTemplateUrl('templates/logout.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.logoutModal = modal;
    });

    $scope.isLoggedIn = function () {
        return persistMgrNs.isLoggedIn();
    };

    $scope.loginData = {};

    $scope.closeLogin = function () {
        $scope.loginModal.hide();
    };

    $scope.closeLogout = function () {
        $scope.logoutModal.hide();
    };

    $scope.showLogin = function () {
        $scope.loginData.errorMessage = '';
        $scope.loginModal.show();
    };

    $scope.showLogout = function () {
        $scope.logoutModal.show();
    };

    $scope.hasError = function () {
        var em = $scope.loginData.errorMessage;
        return em != null && em.length > 0;
    }

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
                    commonNs.log('logged in: ' + ko.toJSON(li));

                    persistMgrNs.setLoggedInAs(li);
                    setDb();
                    $scope.$apply();
                });

                $scope.closeLogin();
            });
    };

    $scope.doLogout = function () {
        persistMgrNs.setLoggedInAs(null);
        $scope.company = null;
        $scope.employee = null;
        $scope.$apply();
        $scope.closeLogout();
        window.location = '#/app/home';
    }
    // ---------------------------------------------------

    // Cleanup
    $scope.$on('$destroy', function () {
        $scope.loginModal.remove();
    });
})

.controller('homeCtrl', function ($scope) {
})

.controller('employeeCtrl', function ($scope, $stateParams) {
    var emplId = parseInt($stateParams.employeeId);
    $scope.employee = dbNs.getTableRow($scope.$parent.$parent.db, 'Employee', 'EmployeeId', emplId);
})

.controller('formCtrl', function ($scope, $stateParams) {
    var formDefId = parseInt($stateParams.formDefId);
    $scope.formDef = dbNs.getTableRow($scope.$parent.$parent.db, 'FormDef', 'FormDefId', formDefId);

    // KO viewmodel bound to rich form.
    // TODO: check for memory leaks around the dynamic KO stuff
    var koVm = null;

    function initForm() {
        var htmlWithMarkup = $scope.formDef.RichFormHtmlWithMarkup;
        var rfd = richFormDefNs.convertHtmlWithMarkupToRichFormDef(htmlWithMarkup);

        var el = $('#formBoundWithKO');
        el.html(rfd.html);
        commonNs.log(rfd.html);

        //$(".mjsadate").datepicker();

        koVm = richFormDefNs.createViewModelForRichForm(rfd);
        ko.applyBindings(koVm, el[0]);
    };
    initForm();

    // Use to strip KO VM of validation props.
    function cloneAndRemoveUnnecessaryProperties(o) {
        var cpy = {};
        $.extend(true, cpy, o);

        var allPropNms = Object.getOwnPropertyNames(cpy);
        var propsToDelete = $.grep(allPropNms, function (nm, i) {
            return nm.indexOf('_isValid') >= 0 || nm.indexOf('_invalidReason') >= 0;
        });
        $.each(propsToDelete, function (i, nm) {
            delete cpy[nm];
        });
        return cpy;
    }
})
;