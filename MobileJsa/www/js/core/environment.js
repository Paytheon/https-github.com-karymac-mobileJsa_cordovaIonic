// Copyright © 2015 by Bit Smasher Labs.  All Rights Reserved.
/// <reference path="common.js" />
/// <reference path="persist.js" />

(function (environmentNs, $, undefined) {
    "use strict";

    var isDebug = true;
    var DeviceInfoKey = '_di';

    environmentNs.init = function () {
        commonNs.log('environmentNs.init');
    };

    // --- device info
    environmentNs.getDeviceInfo = function () {
        var di = persistNs.getItem(DeviceInfoKey);
        if (di == null) {
            di = {
                deviceGuid: commonNs.generateGUID()
            };
            persistNs.setItem(DeviceInfoKey, di);
        }
        return di;
    }

    environmentNs.isDebug = function () {
        return isDebug;
    };

    environmentNs.isNetworkAvailable = function () {
        try {
            commonNs.log('network state: ' + getNetworkState());

            var networkState = navigator.connection.type;
            return networkState != Connection.UNKNOWN && networkState != Connection.NONE;
        } catch (e) {
            commonNs.log('environmentNs.isNetworkAvailable: ' + e);
        }

        return false;
    };

    function getNetworkState() {
        var networkState = navigator.connection.type;

        var states = {};
        states[Connection.UNKNOWN] = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI] = 'WiFi connection';
        states[Connection.CELL_2G] = 'Cell 2G connection';
        states[Connection.CELL_3G] = 'Cell 3G connection';
        states[Connection.CELL_4G] = 'Cell 4G connection';
        states[Connection.CELL] = 'Cell generic connection';
        states[Connection.NONE] = 'No network connection';

        return states[networkState];
    };

}(window.environmentNs = window.environmentNs || {}, jQuery));
