// Copyright © 2015 by Bit Smasher Labs.  All Rights Reserved.
/// <reference path="common.js" />


// Handles all communication with server.
(function (cloudNs, $, undefined) {
    "use strict";

    var baseUrl = 'http://localhost:13728';
    //var baseUrl = '';

    cloudNs.init = function(){
        commonNs.log("cloudNs init");
        $.support.cors = true;
    }

    cloudNs.ping = function () {
        var ao = ajaxGetObject('Ping');
        $.ajax(ao);
    }

    // Payload = {companyId, employeeId, deviceId, secret}
    cloudNs.login = function (companyAbbreviatedName, emplPin, deviceGuid, onComplete) {
        var data = {
            companyAbbreviatedName: companyAbbreviatedName,
            emplPin: emplPin,
            deviceGuid: deviceGuid
        };

        var ao = ajaxPostObject('Login', data, onComplete);
        $.ajax(ao);
    }

    // Payload = {sessionToken}
    cloudNs.connect = function (loginInfo, onComplete) {
        var data = {
            companyId: loginInfo.companyId,
            employeeId: loginInfo.employeeId,
            deviceId: loginInfo.deviceId,
            secret: loginInfo.secret
        };
        var ao = ajaxGetObject('Connect', data, onComplete);
        $.ajax(ao);
    }

    cloudNs.disconnect = function (sessionToken, onComplete) {
        var data = { sessionToken: sessionToken };
        var ao = ajaxGetObject('Disconnect', data, onComplete);
        $.ajax(ao);
    }

    // Payload = {syncData}
    cloudNs.getSyncData = function (sessionToken, updateDeviceLastSynced, onComplete) {
        var data = {
            sessionToken: sessionToken,
            updateDeviceLastSynced: updateDeviceLastSynced
        };

        var ao = ajaxGetObject('GetSyncData', data, onComplete);
        $.ajax(ao);
    }

    cloudNs.connectAndGetSyncData = function (loginInfo, updateDeviceLastSynced, onComplete) {
        // Connect
        cloudNs.connect(loginInfo, function (r1) {
            if (r1.ErrorMessage != null) {
                onComplete(r1);
                return;
            }
            // GetSyncData
            var sessionToken = r1.Payload.sessionToken;
            cloudNs.getSyncData(sessionToken, updateDeviceLastSynced, function (r2) {
                if (r2.ErrorMessage != null) {
                    onComplete(r2);
                    return;
                }
                // Disconnect
                cloudNs.disconnect(sessionToken, function (r3) {
                    if (r3.ErrorMessage != null) {
                        onComplete(r3);
                        return;
                    }
                    onComplete(r2); // <- send back r2, which contains syncData
                });
            });
        });
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
