import {OsmConnection} from "./Logic/OsmConnection";
import {Changes} from "./Logic/Changes";
import {UIEventSource} from "./UI/UIEventSource";

export class Helpers {


    static SetupAutoSave(changes: Changes, millisTillChangesAreSaved : UIEventSource<number>, saveAfterXMillis : number) {

// This little function triggers the actual upload:
// Either when more then three answers are selected, or when no new answer has been added for the last 20s
// @ts-ignore
        window.decreaseTime = function () {
            var time = millisTillChangesAreSaved.data;
            if (time <= 0) {
                if (changes.pendingChangesES.data > 0) {
                    changes.uploadAll(undefined);
                }
            } else {
                millisTillChangesAreSaved.setData(time - 1000);
            }
            window.setTimeout('decreaseTime()', 1000);
        };


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

        // @ts-ignore
        window.decreaseTime(); // The timer keeps running...
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
            if (changes.pendingChangesES.data == 0) {
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