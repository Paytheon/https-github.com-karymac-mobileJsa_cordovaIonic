/// <reference path="persist.js" />
// Copyright © 2015 by Bit Smasher Labs.  All Rights Reserved.

// TODO: refactor this and others into services

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

    dbNs.getTableRow = function (md, tableName, propertyName, propertyVal) {
        var matches = $.grep(md[tableName], function (e, i) {
            return e[propertyName] == propertyVal;
        });
        return matches.length == 1 ? matches[0] : null;
    };

}(window.dbNs = window.dbNs || {}, jQuery));
