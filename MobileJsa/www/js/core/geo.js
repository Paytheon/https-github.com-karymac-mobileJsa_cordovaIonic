// Copyright © 2015 by Bit Smasher Labs.  All Rights Reserved.
/// <reference path="common.js" />

(function (geoNs, $, undefined) {
    "use strict";

    geoNs.init = function () {
        commonNs.log('geoNs.init');
    }

    geoNs.getCurrentPosition = function (onComplete) {
        onComplete({
            coords: {
                latitude: 1.23,
                longitude: 4.56
            }
        });
    }

}(window.geoNs = window.geoNs || {}, jQuery));
