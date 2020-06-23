import {UIElement} from "./UIElement";
import {UIEventSource} from "./UIEventSource";
import {Changes} from "../Logic/Changes";

export class PendingChanges extends UIElement{

    private readonly changes;

    constructor(changes: Changes, countdown: UIEventSource<number>) {
        super(undefined); // We do everything manually here!
        this.changes = changes;


        countdown.addCallback(function () {

            const percentage = Math.max(0, 100 * countdown.data / 20000);

            let bar = document.getElementById("pending-bar");
            if (bar === undefined) {
                return;
            }
            const style = bar.style;
            style.width = percentage + "%";
            style["margin-left"] = (50 - (percentage / 2)) + "%";

        });

        changes.pendingChangesES.addCallback(function () {
            const c = changes._pendingChanges.length;
            const text = document.getElementById("pending-text");
            if (c == 0) {
                text.style.opacity = "0";
                text.innerText = "Saving...";
            } else {
                text.innerText = c + " pending";
                text.style.opacity = "1";
            }


            const bar = document.getElementById("pending-bar");

            if (bar === null) {
                return;
            }


            if (c == 0) {
                bar.style.opacity = "0";
            } else {
                bar.style.opacity = "0.5";
            }

        });
    }
    
    protected InnerRender(): string {
        return "<div id='pending-bar' style='width:100%; margin-left:0%'></div>" +
            "<div id='pending-text'></div>";
    }   
    
    InnerUpdate(htmlElement: HTMLElement) {
    }


}