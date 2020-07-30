import {UIEventSource} from "./UI/UIEventSource";
import {Changes} from "./Logic/Osm/Changes";
import {State} from "./State";

export class Helpers {

    static DoEvery(millis: number, f: (() => void)) {
        window.setTimeout(
            function () {
                f();
                Helpers.DoEvery(millis, f);
            }
            , millis)
    }


    static SetupAutoSave() {

        const changes = State.state.changes;
        const millisTillChangesAreSaved = State.state.secondsTillChangesAreSaved;
        const saveAfterXMillis = State.state.secondsTillChangesAreSaved.data * 1000;
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

        millisTillChangesAreSaved.addCallback((time) => {
                if (time <= 0 && changes.pendingChangesES.data > 0) {
                    changes.uploadAll(undefined);
                }
            }
        )

        Helpers.DoEvery(
            1000,
            () => {
                millisTillChangesAreSaved
                    .setData(millisTillChangesAreSaved.data - 1000)
            });
    }


    /*
    * Registers an action that:
    * -> Upload everything to OSM
    * -> Asks the user not to close. The 'not to close' dialog should profide enough time to upload
    * -> WHen uploading is done, the window is closed anyway
     */
    static LastEffortSave() {
        const changes = State.state.changes;
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


        document.addEventListener('visibilitychange',() => {
            if(document.visibilityState === "visible"){
                return;
            }
            if (changes.pendingChangesES.data == 0) {
                return;
            }

            console.log("Upmoading: loss of focus")
            changes.uploadAll(function () {
                window.close()
            });
        })

    }
    
}