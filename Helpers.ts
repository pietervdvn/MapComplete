import {OsmConnection} from "./Logic/OsmConnection";
import {Changes} from "./Logic/Changes";
import {UIEventSource} from "./UI/UIEventSource";
import {PendingChanges} from "./UI/PendingChanges";

export class Helpers {


    static SetupAutoSave(changes: Changes, secondsTillChangesAreSaved : UIEventSource<number>) {

// This little function triggers the actual upload:
// Either when more then three answers are selected, or when no new answer has been added for the last 20s
// @ts-ignore
        window.decreaseTime = function () {
            var time = secondsTillChangesAreSaved.data;
            if (time <= 0) {
                if (changes._pendingChanges.length > 0) {
                    changes.uploadAll(undefined);
                }
            } else {
                secondsTillChangesAreSaved.setData(time - 1000);

            }
            window.setTimeout('decreaseTime()', 1000);
        };


        changes.pendingChangesES.addCallback(function () {

            var c = changes._pendingChanges.length;
            if (c > 10) {
                secondsTillChangesAreSaved.setData(0);
                changes.uploadAll(undefined);
                return;
            }

            if (c > 0) {
                secondsTillChangesAreSaved.setData(5000);
            }

        });

        // @ts-ignore
        window.decreaseTime(); // The timer keeps running...
    }

    /**
     * All elements with class 'activate-osm-authentication' are loaded and get an 'onclick' to authenticate
     * @param osmConnection
     */
    static registerActivateOsmAUthenticationClass(osmConnection: OsmConnection) {

        const authElements = document.getElementsByClassName("activate-osm-authentication");
        for (let i = 0; i < authElements.length; i++) {
            let element = authElements.item(i);
            // @ts-ignore
            element.onclick = function () {
                osmConnection.AttemptLogin();
            }
        }
    }
    
    
    
    /*
    * Registers an action that:
    * -> Upload everything to OSM
    * -> Asks the user not to close. The 'not to close' dialog should profide enough time to upload
    * -> WHen uploading is done, the window is closed anyway
     */
    static LastEffortSave(changes : Changes){

        window.addEventListener("beforeunload", function (e) {
            // Quickly save everyting!
            if (changes._pendingChanges.length == 0) {
                return "";
            }

            changes.uploadAll(function () {
                window.close()
            });
            var confirmationMessage = "Nog even geduld - je laatset wijzigingen worden opgeslaan!";

            (e || window.event).returnValue = confirmationMessage; //Gecko + IE
            return confirmationMessage;                            //Webkit, Safari, Chrome
        });

    }

}