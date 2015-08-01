/// <reference path="persist.js" />
// Copyright © 2015 by Bit Smasher Labs.  All Rights Reserved.

(function (dbNs, $, undefined) {
    "use strict";

    var DbKey = '_db';

    dbNs.init = function () {
        commonNs.log("dbNs init");
    };

    dbNs.getMirroredData = function () {
        var md = persistNs.getItem(DbKey);
        if (md == null)
            md = {};
        return md;
    };

    dbNs.setMirroredData = function (md) {
        persistNs.setItem(DbKey, md);
    };

}(window.dbNs = window.dbNs || {}, jQuery));
