import { UIEventSource } from "../UIEventSource"
import * as idb from "idb-keyval"
import { Utils } from "../../Utils"

/**
 * UIEventsource-wrapper around indexedDB key-value
 */
export class IdbLocalStorage {
    private static readonly _sourceCache: Record<string, UIEventSource<any>> = {}

    public static Get<T>(
        key: string,
        options?: { defaultValue?: T; whenLoaded?: (t: T | null) => void },
    ): UIEventSource<T> {
        if (IdbLocalStorage._sourceCache[key] !== undefined) {
            return IdbLocalStorage._sourceCache[key]
        }
        const src = new UIEventSource<T>(options?.defaultValue, "idb-local-storage:" + key)
        if (Utils.runningFromConsole) {
            return src
        }
        src.addCallback((v) => idb.set(key, v))

        idb.get(key)
            .then((v) => {
                src.setData(v ?? options?.defaultValue)
                if (options?.whenLoaded !== undefined) {
                    options?.whenLoaded(v)
                }
            })
            .catch((err) => {
                console.warn("Loading from local storage failed due to", err)
                if (options?.whenLoaded !== undefined) {
                    options?.whenLoaded(null)
                }
            })
        IdbLocalStorage._sourceCache[key] = src
        return src
    }

    public static SetDirectly(key: string, value: any): Promise<void> {
        return idb.set(key, value)
    }

    static GetDirectly(key: string): Promise<any> {
        return idb.get(key)
    }

    static clearAll() {
        return idb.clear()
    }
}
