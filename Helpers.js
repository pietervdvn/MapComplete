"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Helpers = void 0;
var Helpers = /** @class */ (function () {
    function Helpers() {
    }
    Helpers.DoEvery = function (millis, f) {
        window.setTimeout(function () {
            f();
            Helpers.DoEvery(millis, f);
        }, millis);
    };
    Helpers.SetupAutoSave = function (changes, millisTillChangesAreSaved, saveAfterXMillis) {
        changes.pendingChangesES.addCallback(function () {
            var c = changes.pendingChangesES.data;
            if (c > 10) {
                millisTillChangesAreSaved.setData(0);
                changes.uploadAll(undefined);
                return;
            }
            if (c > 0) {
                millisTillChangesAreSaved.setData(saveAfterXMillis);
            }
        });
        millisTillChangesAreSaved.addCallback(function (time) {
            if (time <= 0 && changes.pendingChangesES.data > 0) {
                changes.uploadAll(undefined);
            }
        });
        Helpers.DoEvery(1000, function () {
            millisTillChangesAreSaved
                .setData(millisTillChangesAreSaved.data - 1000);
        });
    };
    /*
    * Registers an action that:
    * -> Upload everything to OSM
    * -> Asks the user not to close. The 'not to close' dialog should profide enough time to upload
    * -> WHen uploading is done, the window is closed anyway
     */
    Helpers.LastEffortSave = function (changes) {
        window.addEventListener("beforeunload", function (e) {
            // Quickly save everyting!
            if (changes.pendingChangesES.data == 0) {
                return "";
            }
            changes.uploadAll(function () {
                window.close();
            });
            var confirmationMessage = "Nog even geduld - je laatset wijzigingen worden opgeslaan!";
            (e || window.event).returnValue = confirmationMessage; //Gecko + IE
            return confirmationMessage; //Webkit, Safari, Chrome
        });
    };
    return Helpers;
}());
exports.Helpers = Helpers;
