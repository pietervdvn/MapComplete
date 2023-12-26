import { UIEventSource } from "../UIEventSource"

/**
 * UIEventsource-wrapper around localStorage
 */
export class LocalStorageSource {
    static GetParsed<T>(key: string, defaultValue: T): UIEventSource<T> {
        return LocalStorageSource.Get(key).sync(
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
            (value) => JSON.stringify(value)
        )
    }

    static Get(key: string, defaultValue: string = undefined): UIEventSource<string> {
        try {
            let saved = localStorage.getItem(key)
            if (saved === "undefined") {
                saved = undefined
            }
            const source = new UIEventSource<string>(saved ?? defaultValue, "localstorage:" + key)

            source.addCallback((data) => {
                try {
                    localStorage.setItem(key, data)
                } catch (e) {
                    // Probably exceeded the quota with this item!
                    // Lets nuke everything
                    localStorage.clear()
                }
            })
            return source
        } catch (e) {
            return new UIEventSource<string>(defaultValue)
        }
    }
}
