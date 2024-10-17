import { UIEventSource } from "../UIEventSource"
import { Utils } from "../../Utils"

/**
 * UIEventsource-wrapper around localStorage
 */
export class LocalStorageSource {

    private static readonly _cache: Record<string, UIEventSource<string>> = {}

    static getParsed<T>(key: string, defaultValue: T): UIEventSource<T> {
        return LocalStorageSource.get(key).sync(
            (str) => {
                if (str === undefined) {
                    return defaultValue
                }
                try {
                    return JSON.parse(str)
                } catch {
                    return defaultValue
                }
            },
            [],
            (value) => JSON.stringify(value),
        )
    }

    static get(key: string, defaultValue: string = undefined): UIEventSource<string> {
        const cached = LocalStorageSource._cache[key]
        if (cached) {
            return cached
        }
        let saved = defaultValue
        if (!Utils.runningFromConsole) {

            try {
                saved = localStorage.getItem(key)
                if (saved === "undefined") {
                    saved = undefined
                }
            } catch (e) {
                console.error("Could not get value", key, "from local storage")
            }
        }
        const source = new UIEventSource<string>(saved ?? defaultValue, "localstorage:" + key)

        source.addCallback((data) => {
            if (data === undefined || data === "" || data === null) {
                localStorage.removeItem(key)
                return
            }
            try {
                localStorage.setItem(key, data)
            } catch (e) {
                // Probably exceeded the quota with this item!
                // Let's nuke everything
                localStorage.clear()
            }
        })
        LocalStorageSource._cache[key] = source
        return source
    }
}
