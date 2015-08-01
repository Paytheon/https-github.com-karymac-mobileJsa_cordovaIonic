// Copyright © 2015 by Bit Smasher Labs.  All Rights Reserved.
/// <reference path="common.js" />


// Handles all communication with server.
(function (cloudNs, $, undefined) {
    "use strict";

    var baseUrl = 'http://localhost:13728';
    //var baseUrl = '';

    cloudNs.init = function(){
        $.support.cors = true;
    }

    cloudNs.ping = function () {
        var ao = ajaxGetObject('Ping');
        $.ajax(ao);
    }

    cloudNs.login = function (companyAbbreviatedName, emplPin, deviceGuid, onComplete) {
        var data = {
            companyAbbreviatedName: companyAbbreviatedName,
            emplPin: emplPin,
            deviceGuid: deviceGuid
        };

        var ao = ajaxPostObject('Login', data, onComplete);
        $.ajax(ao);
    }

    cloudNs.connect = function (linkGuid, onComplete) {
        var data = { linkGuid: linkGuid };
        var ao = ajaxGetObject('Connect', data, onComplete);
        $.ajax(ao);
    }

    cloudNs.disconnect = function (linkGuid, onComplete) {
        var data = { linkGuid: linkGuid };
        var ao = ajaxGetObject('Disconnect', data, onComplete);
        $.ajax(ao);
    }

    //#region Plumbing

    // If provided, onComplete is called even if server returned error,
    // so should check data.ErrorResult.
    function ajaxGetObject(action, data, onComplete) {
        return {
            type: "GET",
            url: buildUrl(action),
            data: data,
            dataType: "json",
            crossDomain: true,
            success: function (data) {
                //commonNs.log('cloud got from server: '+ko.toJSON(data));

                if (onComplete != null)
                    onComplete(data);
            },
            error: function (xhr, errorType, exception) {
                var errorMessage = exception || xhr.statusText;
                if (onComplete != null)
                    onComplete({ErrorMessage:errorMessage});
            }
        };
    }

    // If provided, onComplete is called even if server returned error,
    // so should check data.ErrorResult.
    function ajaxPostObject(action, data, onComplete) {
        return {
            type: "POST",
            url: buildUrl(action),
            data: JSON.stringify(data),
            dataType: "json",
            contentType: "application/json",
            crossDomain: true,
            success: function (data) {
                //commonNs.log('cloud got from server: ' + ko.toJSON(data));

                if (onComplete != null)
                    onComplete(data);
            },
            error: function (xhr, errorType, exception) {
                var errorMessage = exception || xhr.statusText;
                if (onComplete != null)
                    onComplete({ ErrorMessage: errorMessage });
            }
        };
    }

    function buildUrl(action) {
        return baseUrl + '/api/dev/' + action;
    }

    //#endregion

}(window.cloudNs = window.cloudNs || {}, jQuery));
