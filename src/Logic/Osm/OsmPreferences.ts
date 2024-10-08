import { Store, UIEventSource } from "../UIEventSource"
import { OsmConnection } from "./OsmConnection"
import { LocalStorageSource } from "../Web/LocalStorageSource"
import OSMAuthInstance = OSMAuth.osmAuth
import { Utils } from "../../Utils"

export class OsmPreferences {

    private preferences: Record<string, UIEventSource<string>> = {}

    private localStorageInited: Set<string> = new Set()
    /**
     * Contains all the keys as returned by the OSM-preferences.
     * Used to clean up old preferences
     */
    private seenKeys: string[] = []

    private readonly _allPreferences: UIEventSource<Record<string, string>> = new UIEventSource({})
    public readonly allPreferences: Store<Readonly<Record<string, string>>> = this._allPreferences
    private readonly _fakeUser: boolean
    private readonly auth: OSMAuthInstance
    private readonly osmConnection: OsmConnection

    constructor(auth: OSMAuthInstance, osmConnection: OsmConnection, fakeUser: boolean = false) {
        this.auth = auth
        this._fakeUser = fakeUser
        this.osmConnection = osmConnection
        osmConnection.OnLoggedIn(() => {
            this.loadBulkPreferences()
            return true
        })
    }


    private setPreferencesAll(key: string, value: string) {
        if (this._allPreferences.data[key] !== value) {
            this._allPreferences.data[key] = value
            this._allPreferences.ping()
        }
    }

    private initPreference(key: string, value: string = undefined): UIEventSource<string> {
        if (this.preferences[key] !== undefined) {
            if (value !== undefined) {
                this.preferences[key].set(value)
            }
            return this.preferences[key]
        }
        const pref = this.preferences[key] = new UIEventSource(value, "preference: " + key)
        if (value) {
            this.setPreferencesAll(key, value)
        }
        pref.addCallback(v => {
            this.uploadKvSplit(key, v)
            this.setPreferencesAll(key, v)
        })
        return pref
    }

    private async loadBulkPreferences() {
        const prefs = await this.getPreferencesDictDirectly()
        this.seenKeys = Object.keys(prefs)
        const legacy = OsmPreferences.getLegacyCombinedItems(prefs)
        const merged = OsmPreferences.mergeDict(prefs)
        if(Object.keys(legacy).length > 0){
            await this.removeLegacy(legacy)
        }
        for (const key in merged) {
            this.initPreference(key, prefs[key])
        }
        for (const key in legacy) {
            this.initPreference(key, legacy[key])
        }
    }


    public getPreference(
        key: string,
        defaultValue: string = undefined,
        prefix?: string,
    ) {
        return this.getPreferenceSeedFromlocal(key, defaultValue, { prefix })
    }

    /**
     * Gets a OSM-preference.
     * The OSM-preference is cached in local storage and updated from the OSM.org as soon as those values come in.
     * THis means that values written before being logged in might be erased by the cloud settings
     */
    private getPreferenceSeedFromlocal(
        key: string,
        defaultValue: string = undefined,
        options?: {
            prefix?: string,
            saveToLocalStorage?: true | boolean
        },
    ): UIEventSource<string> {
        if (options?.prefix) {
            key = options.prefix + key
        }
        key = key.replace(/[:/"' {}.%\\]/g, "")


        const localStorage = LocalStorageSource.Get(key)
        if (localStorage.data === "null" || localStorage.data === "undefined") {
            localStorage.set(undefined)
        }
        const pref: UIEventSource<string> = this.initPreference(key, localStorage.data ?? defaultValue)
        if (this.localStorageInited.has(key)) {
            return pref
        }

        if (options?.saveToLocalStorage ?? true) {
            pref.addCallback(v => localStorage.set(v)) // Keep a local copy
        }
        this.localStorageInited.add(key)
        return pref
    }

    public ClearPreferences() {
        console.log("Starting to remove all preferences")
        this.removeAllWithPrefix("")
    }

    public async removeLegacy(legacyDict: Record<string, string>) {
        for (const k in legacyDict) {
            const v = legacyDict[k]
            console.log("Upgrading legacy preference",k )
            await this.removeAllWithPrefix(k)
            this.osmConnection.getPreference(k).set(v)
        }
    }

    /**
     *
     * OsmPreferences.mergeDict({abc: "123", def: "123", "def:0": "456", "def:1":"789"}) // => {abc: "123", def: "123456789"}
     */
    private static mergeDict(dict: Record<string, string>): Record<string, string> {
        const newDict = {}

        const allKeys: string[] = Object.keys(dict)
        const normalKeys = allKeys.filter(k => !k.match(/[a-z-_0-9A-Z]*:[0-9]+/))
        for (const normalKey of normalKeys) {
            if (normalKey.match(/-combined-[0-9]*$/) || normalKey.match(/-combined-length$/)) {
                // Ignore legacy keys
                continue
            }
            const partKeys = OsmPreferences.keysStartingWith(allKeys, normalKey)
            const parts = partKeys.map(k => dict[k])
            newDict[normalKey] = parts.join("")
        }
        return newDict
    }


    /**
     * Gets all items which have a 'combined'-string, the legacy long preferences
     *
     *   const input = {
     *             "extra-noncombined-key":"xyz",
     *             "mapcomplete-unofficial-theme-httpsrawgithubusercontentcomosm-catalanwikidataimgmainwikidataimgjson-combined-0":
     *                 "{\"id\":\"https://raw.githubusercontent.com/osm-catalan/wikidataimg/main/wikidataimg.json\",\"icon\":\"https://upload.wikimedia.org/wikipedia/commons/5/50/Yes_Check_Circle.svg\",\"title\":{\"ca\":\"wikidataimg\",\"_context\":\"themes:wikidataimg.title\"},\"shortDescription\"",
     *             "mapcomplete-unofficial-theme-httpsrawgithubusercontentcomosm-catalanwikidataimgmainwikidataimgjson-combined-1":
     *                 ":{\"ca\":\"Afegeix imatges d'articles de wikimedia\",\"_context\":\"themes:wikidataimg\"}}",
     *         }
     *         const merged = OsmPreferences.getLegacyCombinedItems(input)
     *         const data = merged["mapcomplete-unofficial-theme-httpsrawgithubusercontentcomosm-catalanwikidataimgmainwikidataimgjson"]
     *         JSON.parse(data) // =>  {"id": "https://raw.githubusercontent.com/osm-catalan/wikidataimg/main/wikidataimg.json", "icon": "https://upload.wikimedia.org/wikipedia/commons/5/50/Yes_Check_Circle.svg","title": { "ca": "wikidataimg", "_context": "themes:wikidataimg.title" }, "shortDescription": {"ca": "Afegeix imatges d'articles de wikimedia","_context": "themes:wikidataimg"}}
     *         merged["extra-noncombined-key"] // => undefined
     */
    public static getLegacyCombinedItems(dict: Record<string, string>): Record<string, string> {
        const merged: Record<string, string> = {}
        const keys = Object.keys(dict)
        const toCheck = Utils.NoNullInplace(Utils.Dedup(keys.map(k => k.match(/(.*)-combined-[0-9]+$/)?.[1])))
        for (const key of toCheck) {
            let i = 0
            let str = ""
            let v: string
            do {
                v = dict[key + "-combined-" + i]
                str += v ?? ""
                i++
            } while (v !== undefined)
            merged[key] = str
        }
        return merged
    }


    /**
     * Bulk-downloads all preferences
     * @private
     */
    private getPreferencesDictDirectly(): Promise<Record<string, string>> {
        return new Promise<Record<string, string>>((resolve, reject) => {
            this.auth.xhr(
                {
                    method: "GET",
                    path: "/api/0.6/user/preferences",
                },
                (error, value: XMLDocument) => {
                    if (error) {
                        console.log("Could not load preferences", error)
                        reject(error)
                        return
                    }
                    const prefs = value.getElementsByTagName("preference")
                    const dict: Record<string, string> = {}
                    for (let i = 0; i < prefs.length; i++) {
                        const pref = prefs[i]
                        const k = pref.getAttribute("k")
                        dict[k] = pref.getAttribute("v")
                    }
                    resolve(dict)
                },
            )
        })

    }

    /**
     * Returns all keys matching `k:[number]`
     * Split separately for test
     *
     * const keys = ["abc", "def", "ghi", "ghi:0", "ghi:1"]
     * OsmPreferences.keysStartingWith(keys, "xyz") // => []
     * OsmPreferences.keysStartingWith(keys, "abc") // => ["abc"]
     * OsmPreferences.keysStartingWith(keys, "ghi") // => ["ghi", "ghi:0", "ghi:1"]
     *
     */
    private static keysStartingWith(allKeys: string[], key: string): string[] {
        const keys = allKeys.filter(k => k === key || k.match(new RegExp(key + ":[0-9]+")))
        keys.sort()
        return keys
    }

    /**
     * Smart 'upload', which splits the value into `k`, `k:0`, `k:1` if needed.
     * If `v` is null, undefined, empty, "undefined" (literal string) or "null" (literal string), will delete `k` and `k:[number]`
     *
     */
    private async uploadKvSplit(k: string, v: string) {

        if (v === null || v === undefined || v === "" || v === "undefined" || v === "null") {
            const keysToDelete = OsmPreferences.keysStartingWith(this.seenKeys, k)
            await Promise.all(keysToDelete.map(k => this.deleteKeyDirectly(k)))
            return
        }


        await this.uploadKeyDirectly(k, v.slice(0, 255))
        v = v.slice(255)
        let i = 0
        while (v.length > 0) {
            await this.uploadKeyDirectly(`${k}:${i}`, v.slice(0, 255))
            v = v.slice(255)
            i++
        }

    }

    /**
     * Directly deletes this key
     * @param k
     * @private
     */
    private deleteKeyDirectly(k: string) {
        if (!this.osmConnection.userDetails.data.loggedIn) {
            console.debug(`Not saving preference ${k}: user not logged in`)
            return
        }

        if (this._fakeUser) {
            return
        }
        return new Promise<void>((resolve, reject) => {

                this.auth.xhr(
                    {
                        method: "DELETE",
                        path: "/api/0.6/user/preferences/" + encodeURIComponent(k),
                        headers: { "Content-Type": "text/plain" },
                    },
                    (error) => {
                        if (error) {
                            console.warn("Could not remove preference", error)
                            reject(error)
                            return
                        }
                        console.debug("Preference ", k, "removed!")
                        resolve()
                    },
                )
            },
        )
    }

    /**
     * Uploads the given k=v to the OSM-server
     * Deletes it if 'v' is undefined, null or empty
     */
    private async uploadKeyDirectly(k: string, v: string) {
        if (!this.osmConnection.userDetails.data.loggedIn) {
            console.debug(`Not saving preference ${k}: user not logged in`)
            return
        }

        if (this._fakeUser) {
            return
        }
        if (v === undefined || v === "" || v === null) {
            await this.deleteKeyDirectly(k)
            return
        }

        if (v.length > 255) {
            console.error("Preference too long, max 255 chars", { k, v })
            throw "Preference too long, at most 255 characters are supported"
        }

        return new Promise<void>((resolve, reject) => {

            this.auth.xhr(
                {
                    method: "PUT",
                    path: "/api/0.6/user/preferences/" + encodeURIComponent(k),
                    headers: { "Content-Type": "text/plain" },
                    content: v,
                },
                (error) => {
                    if (error) {
                        console.warn(`Could not set preference "${k}"'`, error)
                        reject(error)
                        return
                    }
                    resolve()
                },
            )
        })
    }

    async removeAllWithPrefix(prefix: string) {
        const keys = this.seenKeys
        for (const key in keys) {
            await this.deleteKeyDirectly(key)
        }
    }


}
