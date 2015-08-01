// Copyright © 2015 by Bit Smasher Labs.  All Rights Reserved.
/// <reference path="common.js" />

// Provides simple get/save key/value operations.

(function (persistNs, $, undefined) {
    "use strict";

    var storageSize = 0;

    persistNs.init = function () {
        commonNs.log('persistNs.init');
        persistNs.recomputeStorageSize();
    }

    persistNs.recomputeStorageSize = function () {
        storageSize = 0;
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            var value = localStorage.getItem(key);
            storageSize += key.length + value.length;
        }
    }

    persistNs.getStorageSize = function () {
        return storageSize;
    }

    persistNs.clear = function () {
        localStorage.clear();
        storageSize = 0;
    };

    persistNs.setItem = function (key, value) {
        var s = localStorage.getItem(key);
        if (s != null) {
            storageSize -= s.length;
            storageSize -= key.length;
        }

        var json = JSON.stringify(value);
        storageSize += json.length;
        storageSize += key.length;
        localStorage.setItem(key, json);
    }

    persistNs.getItem = function (key) {
        var s = localStorage.getItem(key);
        var o = JSON.parse(s);
        return o;
    }

    persistNs.removeItem = function (key) {
        // TODO: verify correctness: doesn't appear to adjust storageSize, as does setItem.
        localStorage.removeItem(key);
    }

}(window.persistNs = window.persistNs || {}, jQuery));
