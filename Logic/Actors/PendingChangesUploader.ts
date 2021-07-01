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