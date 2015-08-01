// Copyright © 2015 by Bit Smasher Labs.  All Rights Reserved.
/// <reference path="bootstrap_FormDefs.js" />
/// <reference path="persist.js" />
/// <reference path="common.js" />

// Built on top of persistNs, provides persistence of high-level objects.
(function (persistMgrNs, $, undefined) {
    "use strict";

    var GlobalSettingsKey = '_gs';
    var LoginInfoKey = '_li';

    persistMgrNs.init = function () {
        commonNs.log('persistMgrNs.init');
    }

    // --- login/logout
    persistMgrNs.setLoggedInAs = function (loginInfo) {
        persistNs.setItem(LoginInfoKey, loginInfo);
    }
    persistMgrNs.getLoggedInAs = function () {
        return persistNs.getItem(LoginInfoKey);
    }
    persistMgrNs.logout = function () {
        persistNs.removeItem(LoginInfoKey);
    }
    persistMgrNs.isLoggedIn = function () {
        return persistMgrNs.getLoggedInAs() != null;
    }

    // --- global settings
    persistMgrNs.setGlobalSettings = function (gs) {
        return persistNs.setItem(GlobalSettingsKey, gs);
    }
    persistMgrNs.getGlobalSettings = function () {
        return persistNs.getItem(GlobalSettingsKey);
    }

}(window.persistMgrNs = window.persistMgrNs || {}, jQuery));
