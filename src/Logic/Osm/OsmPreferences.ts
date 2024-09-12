import { Store, UIEventSource } from "../UIEventSource"
import { OsmConnection } from "./OsmConnection"
import { LocalStorageSource } from "../Web/LocalStorageSource"
import OSMAuthInstance = OSMAuth.osmAuth

export class OsmPreferences {

    private normalPreferences: Record<string, UIEventSource<string>> = {}
    private longPreferences: Record<string, UIEventSource<string>> = {}
    private localStorageInited: Set<string> = new Set()

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

    private getLongValue(allPrefs: Record<string, string>, key: string): string {
        const count = Number(allPrefs[key + "-length"])
        let str = ""
        for (let i = 0; i < count; i++) {
            str += allPrefs[key + i]
        }
        return str

    }

    private setPreferencesAll(key: string, value: string) {
        if (this._allPreferences.data[key] !== value) {
            this._allPreferences.data[key] = value
            this._allPreferences.ping()
        }
    }

    private initPreference(key: string, value: string = "", excludeFromAll: boolean = false): UIEventSource<string> {
        if (this.normalPreferences[key] !== undefined) {
            return this.normalPreferences[key]
        }
        const pref = this.normalPreferences[key] = new UIEventSource(value, "preference: " + key)
        if(value && !excludeFromAll){
            this.setPreferencesAll(key, value)
        }
        pref.addCallback(v => {
            this.UploadPreference(key, v)
            if(!excludeFromAll){
                this.setPreferencesAll(key, v)
            }
        })
        return pref
    }

    private initLongPreference(key: string, initialValue: string): UIEventSource<string> {
        if (this.longPreferences[key] !== undefined) {
            return this.longPreferences[key]
        }
        const pref = this.longPreferences[key] = new UIEventSource<string>(initialValue, "long-preference-"+key)
        const maxLength = 255
        const length = UIEventSource.asInt(this.initPreference(key + "-length", "0", true))
        if(initialValue){
            this.setPreferencesAll(key, initialValue)
        }
        pref.addCallback(v => {
            if(v === null || v === undefined || v === ""){
                length.set(null)
                return
            }
            length.set(Math.ceil((v?.length ?? 1) / maxLength))
            let i = 0
            while (v.length > 0) {
                this.UploadPreference(key + "-" + i, v.substring(0, maxLength))
                i++
                v = v.substring(maxLength)
            }
            this.setPreferencesAll(key, v)
        })
        return pref
    }

    private async loadBulkPreferences() {
        const prefs = await this.getPreferencesDict()
        const isCombined = /-combined-/
        for (const key in prefs) {
            if (key.endsWith("-combined-length")) {
                const v = this.getLongValue(prefs, key.substring(0, key.length - "-length".length))
                this.initLongPreference(key, v)
            }
            if (key.match(isCombined)) {
                continue
            }
            this.initPreference(key, prefs[key])
        }
    }


    /**
     * OSM preferences can be at most 255 chars.
     * This method chains multiple together.
     * Values written into this key will be erased when the user logs in
     */
    public GetLongPreference(key: string, prefix: string = "mapcomplete-"): UIEventSource<string> {
        return this.getPreferenceSeedFromlocal(key, true, undefined, { prefix })
    }

    public GetPreference(
        key: string,
        defaultValue: string = undefined,
        options?: {
            documentation?: string
            prefix?: string
        },
    ) {
        return this.getPreferenceSeedFromlocal(key, false, defaultValue, options)
    }

    /**
     * Gets a OSM-preference.
     * The OSM-preference is cached in local storage and updated from the OSM.org as soon as those values come in.
     * THis means that values written before being logged in might be erased by the cloud settings
     * @param key
     * @param defaultValue
     * @param options
     * @constructor
     */
    private getPreferenceSeedFromlocal(
        key: string,
        long: boolean,
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


        let pref : UIEventSource<string>
        const localStorage = LocalStorageSource.Get(key)
        if(localStorage.data === "null" || localStorage.data === "undefined"){
            localStorage.set(undefined)
        }
        if(long){
            pref = this.initLongPreference(key, localStorage.data ?? defaultValue)
        }else{
            pref = this.initPreference(key, localStorage.data  ?? defaultValue)
        }

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


    /**
     * Bulk-downloads all preferences
     * @private
     */
    private getPreferencesDict(): Promise<Record<string, string>> {
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
     * UPloads the given k=v to the OSM-server
     * Deletes it if 'v' is undefined, null or empty
     */
    private UploadPreference(k: string, v: string) {
        if (!this.osmConnection.userDetails.data.loggedIn) {
            console.debug(`Not saving preference ${k}: user not logged in`)
            return
        }

        if (this._fakeUser) {
            return
        }
        if (v === undefined || v === "" || v === null) {
            this.auth.xhr(
                {
                    method: "DELETE",
                    path: "/api/0.6/user/preferences/" + encodeURIComponent(k),
                    headers: { "Content-Type": "text/plain" },
                },
                (error) => {
                    if (error) {
                        console.warn("Could not remove preference", error)
                        return
                    }
                    console.debug("Preference ", k, "removed!")
                },
            )
            return
        }

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
                    return
                }
            },
        )
    }

    removeAllWithPrefix(prefix: string) {
        for (const key in this.normalPreferences) {
            if(key.startsWith(prefix)){
                this.normalPreferences[key].set(null)
            }
        }
        for (const key in this.longPreferences) {
            if(key.startsWith(prefix)){
                this.longPreferences[key].set(null)
            }
        }
    }

    getExistingPreference(key: string, defaultValue: undefined, prefix: string ): UIEventSource<string> {
        if (prefix) {
            key = prefix + key
        }
        key = key.replace(/[:/"' {}.%\\]/g, "")

        if(this.normalPreferences[key]){
            return this.normalPreferences[key]
        }
        return this.longPreferences[key]

    }
}
