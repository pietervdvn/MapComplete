import {UIEventSource} from "../UIEventSource";
import * as idb from "idb-keyval"
import {Utils} from "../../Utils";

/**
 * UIEventsource-wrapper around indexedDB key-value
 */
export class IdbLocalStorage {


    public static Get<T>(key: string, options?: { defaultValue?: T, whenLoaded?: (t: T | null) => void }): UIEventSource<T> {
        const src = new UIEventSource<T>(options?.defaultValue, "idb-local-storage:" + key)
        if (Utils.runningFromConsole) {
            return src;
        }
        src.addCallback(v => idb.set(key, v))
        
        idb.get(key).then(v => {
            src.setData(v ?? options?.defaultValue);
            if (options?.whenLoaded !== undefined) {
                options?.whenLoaded(v)
            }
        }).catch(err => {
            console.warn("Loading from local storage failed due to", err)
            if (options?.whenLoaded !== undefined) {
                options?.whenLoaded(null)
            }
        })
        return src;

    }

    public static SetDirectly(key: string, value) {
        idb.set(key, value)
    }

    static GetDirectly(key: string) {
        return idb.get(key)
    }
}
