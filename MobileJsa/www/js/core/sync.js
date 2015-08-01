/// <reference path="cloud.js" />
/// <reference path="common.js" />
/// <reference path="../jshashtable-3.0.js" />
/// <reference path="persistMgr.js" />
// Copyright © 2015 by Bit Smasher Labs.  All Rights Reserved.


// Given syncData from server, builds and maintains a set of JS
// arrays of objects which mirror server database tables.
(function (syncNs, $, undefined) {
    "use strict";

    syncNs.init = function () {
        commonNs.log("syncNs init");
    }

    // SyncData from server is an array of SyncDataDTO objects:
    // SyncDataDTO {
    //      TableName: 'Company',
    //      DeletedIds: [1,2,3],
    //      KeyPropertyName: 'CompanyId',
    //      CreateOrUpdate: [
    //          {company object},
    //          {company object},
    //          {company object}
    //      ]
    // }

    // Update mirroredData with syncData from server.  MirroredData is
    // an object whose properties are "table" arrays, whose elements
    // represent rows, eg:
    //  mirroredData {
    //      Company: [{},{},etc],
    //      Employee: [{},{},etc],
    //      etc
    //  }


    // returns Hashtable whose key values are the table's primary keys, and whose
    // values are the table's row indices, not the rows themselves.
    syncNs.buildPrimaryKeyIndex = function (mirroredDataForOneTable, keyPropName) {
        var ht = new Hashtable();
        $.each(mirroredDataForOneTable, function (i, row) {
            ht.put(row[keyPropName], i);
        });
        return ht;
    }

    syncNs.updateMirroredData = function (mirroredData, syncData) {
        // init
        $.each(syncData, function (i, tbl) {
            // Ensure mirroredData has collections for each table in syncData.
            if (!mirroredData.hasOwnProperty(tbl.TableName)) {
                mirroredData[tbl.TableName] = [];
            }

            // Todo: remove collections for tables no longer in syncData.

            // build primary key indices for each table in mirroredData.
            var ht = syncNs.buildPrimaryKeyIndex(mirroredData[tbl.TableName], tbl.KeyPropertyName);
            mirroredData[tbl.TableName + 'Idx'] = ht;
        });

        // Remove rows to delete.
        $.each(syncData, function (i, tbl) {
            var indicesToDelete = [];
            $.each(tbl.DeletedIds, function (j, idToDelete) {
                var rowIndex = mirroredData[tbl.TableName + 'Idx'].get(idToDelete);
                if (rowIndex != null) {
                    indicesToDelete.push(rowIndex);
                    mirroredData[tbl.TableName + 'Idx'].remove(idToDelete);
                }
            });
            indicesToDelete.sort(compareInts).reverse();
            $.each(indicesToDelete, function (j, indexToDelete) {
                mirroredData[tbl.TableName].splice(indexToDelete, 1);
            });
        });

        // Create or update rows.
        $.each(syncData, function (i, tbl) {
            $.each(tbl.CreateOrUpdate, function (j, srcRow) {
                var srcId = srcRow[tbl.KeyPropertyName];
                var rowIndex = mirroredData[tbl.TableName + 'Idx'].get(srcId);
                if (rowIndex == null) {
                    // Create
                    mirroredData[tbl.TableName].push(srcRow);
                    mirroredData[tbl.TableName + 'Idx'].put(srcId, mirroredData[tbl.TableName].length - 1);
                } else {
                    // Update
                    mirroredData[tbl.TableName][rowIndex] = srcRow;
                }
            });
        });

        // Notice we're leaving the primary key indices on the mirroredData object for
        // subsequent use; they'll likely need to be removed prior to persisting mirroredData.
    }

    // Remove indices from mirroredData.
    syncNs.removeIndices = function (mirroredData) {
        var props = Object.getOwnPropertyNames(mirroredData);
        $.each(props, function (i, nm) {
            if(nm.endsWith('Idx')){
                delete mirroredData[nm];
            }
        });
    }

    function compareInts(a, b) {
        return a - b;
    }


}(window.syncNs = window.syncNs || {}, jQuery));
