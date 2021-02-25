import {Changes} from "../Osm/Changes";
import Constants from "../../Models/Constants";
import {UIEventSource} from "../UIEventSource";

export default class PendingChangesUploader{
    
    private lastChange : Date;
    
    constructor(changes: Changes, selectedFeature: UIEventSource<any>) {
        const self = this;
        this.lastChange = new Date();
        changes.pending.addCallback(() => {
            self.lastChange = new Date();
            
            window.setTimeout(() => {
                const diff = (new Date().getTime() - self.lastChange.getTime()) / 1000;
                if(Constants.updateTimeoutSec >= diff - 1){
                    changes.flushChanges("Flushing changes due to timeout");
                }
            }, Constants.updateTimeoutSec * 1000);
        });
        
        
        selectedFeature
            .stabilized(10000)
            .addCallback(feature => {
            if(feature === undefined){
                // The popup got closed - we flush
                changes.flushChanges("Flushing changes due to popup closed");
            }
        });

        document.addEventListener('mouseout', e => {
            // @ts-ignore
            if (!e.toElement && !e.relatedTarget) {
                changes.flushChanges("Flushing changes due to focus lost");
            }
        });
        
        document.onfocus = () => {
            changes.flushChanges("OnFocus")
        }

        document.onblur = () => {
            changes.flushChanges("OnFocus")
        }
        try{
            document.addEventListener("visibilitychange", () => {
                changes.flushChanges("Visibility change")
            }, false);
        }catch(e){
            console.warn("Could not register visibility change listener", e)
        }


        window.onbeforeunload = function(e){ 
            
            if(changes.pending.data.length == 0){
                return;
            }
            changes.flushChanges("onbeforeunload - probably closing or something similar");
            e.preventDefault();
            return "Saving your last changes..."
        }

    }
    
    
    
}