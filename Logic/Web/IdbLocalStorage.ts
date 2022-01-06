import {UIEventSource} from "../UIEventSource";
import * as idb from "idb-keyval"
import ScriptUtils from "../../scripts/ScriptUtils";
import {Utils} from "../../Utils";
/**
 * UIEventsource-wrapper around indexedDB key-value
 */
export class IdbLocalStorage {

    
    public static Get<T>(key: string, options: { defaultValue?: T }): UIEventSource<T>{
        const src = new UIEventSource<T>(options.defaultValue, "idb-local-storage:"+key)
        if(Utils.runningFromConsole){
            return src;
        }
        idb.get(key).then(v => src.setData(v ?? options.defaultValue))
        src.addCallback(v => idb.set(key, v))
        return src;
        
    }
    
    public static SetDirectly(key: string, value){
        idb.set(key, value)
    }

    static GetDirectly(key: string) {
        return idb.get(key)
    }
}
