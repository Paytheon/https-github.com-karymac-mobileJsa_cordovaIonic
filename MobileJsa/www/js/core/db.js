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

    dbNs.getCompany = function (md, companyId) {
        var co = $.grep(md.Company, function (c, i) {
            return c.CompanyId == companyId;
        });
        return co.length == 1 ? co[0] : null;
    };

    dbNs.getEmployee = function (md, employeeId) {
        var em = $.grep(md.Employee, function (e, i) {
            return e.EmployeeId == employeeId;
        });
        return em.length == 1 ? em[0] : null;
    }

}(window.dbNs = window.dbNs || {}, jQuery));
