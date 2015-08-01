// Copyright © 2015 by Bit Smasher Labs.  All Rights Reserved.
(function (commonNs, $, undefined) {
    "use strict";

    commonNs.init = function () {
        addStartsWithFunction();
        addStringFormatMethod();
        addReplaceAllMethod();
        addRemoveSpacesMethod();
    }

    //#region Dates

    commonNs.utcDate = function () {
        var now = new Date();
        var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
        return now_utc;
    }

    commonNs.utcDateSansTime = function () {
        var now = new Date();
        var now_utc = new Date(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate()
            );
        return now_utc;
    }

    commonNs.toIsoString = function (dt) {
        var iso = dt.getFullYear() +
            '-' + pad(dt.getMonth() + 1) +
            '-' + pad(dt.getDate()) +
            'T' + pad(dt.getHours()) +
            ':' + pad(dt.getMinutes()) +
            ':' + pad(dt.getSeconds()) +
            '.' + (dt.getMilliseconds() / 1000).toFixed(3).slice(2, 5) +
            'Z';
        return iso;
    }

    function pad(number) {
        var r = String(number);
        if (r.length === 1) {
            r = '0' + r;
        }
        return r;
    }

    commonNs.addDays = function (dt, days) {
        var dat = new Date(dt.valueOf());
        dat.setDate(dat.getDate() + days);
        return dat;
    }

    commonNs.dateDiffInDays = function (fromDate, toDate) {
        var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
        var diffDays = Math.round(
            (toDate.getTime() - fromDate.getTime())
            / (oneDay)
            );
        return diffDays;
    }

    commonNs.toLocalDateTimeString = function (dt) {
        var s = dt.toString();
        var parts = s.split('T');
        s = parts[0] + ' ' + parts[1];
        commonNs.log('dt ' + s);
        var ldt = new Date(s + ' UTC');
        return ldt.toLocaleDateString() + ', ' + ldt.toTimeString().substring(0,8);
    }

    commonNs.toLocalDateString = function (dt) {
        var s = dt.toString();
        var parts = s.split('T');
        s = parts[0] + ' ' + parts[1];
        commonNs.log('dt ' + s);
        var ldt = new Date(s + ' UTC');
        return ldt.toLocaleDateString();
    }

    commonNs.formatUtcAsLocalDateTime = function (utcDt) {
        var s = utcDt.toString();
        var parts = s.split('T');
        s = parts[0] + ' ' + parts[1];
        var ldt = new Date(s + ' UTC');

        var hours = ldt.getHours();
        var minutes = ldt.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return ldt.getMonth() + 1 + "/" + ldt.getDate() + "/" + ldt.getFullYear() + "  " + strTime;
    }
    //#endregion

    //#region String methods

    function addStartsWithFunction() {
        if (typeof String.prototype.startsWith != 'function') {
            String.prototype.startsWith = function (str) {
                return this.slice(0, str.length) == str;
            };
        }
    }

    // Add format() method to String.
    // eg, String.format('{0} is dead, but {1} is alive! {0} {2}', 'ASP', 'ASP.NET');
    function addStringFormatMethod() {
        if (!String.format) {
            String.format = function (format) {
                var args = Array.prototype.slice.call(arguments, 1);
                return format.replace(/{(\d+)}/g, function (match, number) {
                    return typeof args[number] != 'undefined'
                      ? args[number]
                      : match
                    ;
                });
            };
        }
    }

    // Add replaceAll() method to String.
    // eg, String.replaceAll('this and that and the other', 'and', 'or') => 'this or that or the other'
    function addReplaceAllMethod() {
        if (!String.replaceAll) {
            String.replaceAll = function (str, find, replace) {
                return str.split(find).join(replace);
            };
        }
    }

    function addRemoveSpacesMethod() {
        if (!String.removeSpaces) {
            String.removeSpaces = function (str) {
                return str.replace(/\s+/g, '');
            }
        }
    }

    //#endregion

    //#region Diagnostics

    commonNs.log = function (s) {
        console.log(s);
    }

    commonNs.dump = function (o) {
        var cpy = {};
        $.extend(true, cpy, o);
        var oJS = ko.toJS(cpy);

        deleteUnneededProperties(oJS);
        commonNs.log(ko.toJSON(oJS));
    }

    commonNs.deleteUnneededProperties = function (o) {
        deleteProperty(o, '__ko_mapping__');
    }

    function deleteProperty(o, propName) {
        if (o.hasOwnProperty(propName)) {
            delete o[propName];
        }
    }

    //#endregion

    //#region Misc

    commonNs.isInt = function (value) {
        return !isNaN(value) && (function (x) { return (x | 0) === x; })(parseFloat(value))
    }

    commonNs.generateGUID =
        (
            typeof (window.crypto) != 'undefined' &&
            typeof (window.crypto.getRandomValues) != 'undefined'
        ) ?
        function () {
            var buf = new Uint16Array(8);
            window.crypto.getRandomValues(buf);
            var S4 = function (num) {
                var ret = num.toString(16);
                while (ret.length < 4) {
                    ret = "0" + ret;
                }
                return ret;
            };
            return (S4(buf[0]) + S4(buf[1]) + "-" + S4(buf[2]) + "-" + S4(buf[3]) + "-" + S4(buf[4]) + "-" + S4(buf[5]) + S4(buf[6]) + S4(buf[7]));
        }
        :
        function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };

    //#endregion

}(window.commonNs = window.commonNs || {}, jQuery));
