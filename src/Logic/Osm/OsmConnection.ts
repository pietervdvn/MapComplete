import { osmAuth } from "osm-auth"
import { Store, Stores, UIEventSource } from "../UIEventSource"
import { OsmPreferences } from "./OsmPreferences"
import { Utils } from "../../Utils"
import { LocalStorageSource } from "../Web/LocalStorageSource"
import { AuthConfig } from "./AuthConfig"
import Constants from "../../Models/Constants"
import { Feature, Point } from "geojson"

interface OsmUserInfo {
    id: number
    display_name: string
    account_created: string
    description: string
    contributor_terms: { agreed: boolean }
    roles: []
    changesets: { count: number }
    traces: { count: number }
    blocks: { received: { count: number; active: number } }
    img?: { href: string }
    home: { lat: number, lon: number }
    languages?: string[]
    messages: { received: { count: number, unread: number }, sent: { count: number } }
}

export default class UserDetails {
    public name
    public uid: number
    public csCount = 0
    public img?: string
    public unreadMessages = 0
    public totalMessages: number = 0
    public home: { lon: number; lat: number }
    public backend: string
    public account_created: string
    public tracesCount: number = 0
    public description: string
    public languages: string[]

    constructor(backend: string) {
        this.backend = backend
    }
}

export type OsmServiceState = "online" | "readonly" | "offline" | "unknown" | "unreachable"

interface CapabilityResult {
    version: "0.6" | string
    generator: "OpenStreetMap server" | string
    copyright: "OpenStreetMap and contributors" | string
    attribution: "http://www.openstreetmap.org/copyright" | string
    license: "http://opendatacommons.org/licenses/odbl/1-0/" | string
    api: {
        version: { minimum: "0.6"; maximum: "0.6" }
        area: { maximum: 0.25 | number }
        note_area: { maximum: 25 | number }
        tracepoints: { per_page: 5000 | number }
        waynodes: { maximum: 2000 | number }
        relationmembers: { maximum: 32000 | number }
        changesets: {
            maximum_elements: 10000 | number
            default_query_limit: 100 | number
            maximum_query_limit: 100 | number
        }
        notes: { default_query_limit: 100 | number; maximum_query_limit: 10000 | number }
        timeout: { seconds: 300 | number }
        status: {
            database: OsmServiceState
            api: OsmServiceState
            gpx: OsmServiceState
        }
    }
    policy: {
        imagery: {
            blacklist: { regex: string }[]
        }
    }
}

export class OsmConnection {
    public auth: osmAuth
    public userDetails: UIEventSource<UserDetails>
    public isLoggedIn: Store<boolean>
    public gpxServiceIsOnline: UIEventSource<OsmServiceState> = new UIEventSource<OsmServiceState>(
        "unknown"
    )
    public apiIsOnline: UIEventSource<OsmServiceState> = new UIEventSource<OsmServiceState>(
        "unknown"
    )

    public loadingStatus = new UIEventSource<"not-attempted" | "loading" | "error" | "logged-in">(
        "not-attempted"
    )
    public preferencesHandler: OsmPreferences
    public readonly _oauth_config: AuthConfig
    private readonly _dryRun: Store<boolean>
    private readonly fakeUser: boolean
    private readonly _iframeMode: boolean
    private readonly _singlePage: boolean
    private isChecking = false
    private readonly _doCheckRegularly

    constructor(options?: {
        dryRun?: Store<boolean>
        fakeUser?: false | boolean
        oauth_token?: UIEventSource<string>
        // Used to keep multiple changesets open and to write to the correct changeset
        singlePage?: boolean
        attemptLogin?: boolean
        /**
         * If true: automatically check if we're still online every 5 minutes + fetch messages
         */
        checkOnlineRegularly?: true | boolean
    }) {
        options ??= {}
        this.fakeUser = options?.fakeUser ?? false
        this._singlePage = options?.singlePage ?? true
        this._oauth_config = Constants.osmAuthConfig
        this._doCheckRegularly = options?.checkOnlineRegularly ?? true
        console.debug("Using backend", this._oauth_config.url)
        this._iframeMode = Utils.runningFromConsole ? false : window !== window.top

        // Check if there are settings available in environment variables, and if so, use those
        if (
            import.meta.env.VITE_OSM_OAUTH_CLIENT_ID !== undefined &&
            import.meta.env.VITE_OSM_OAUTH_SECRET !== undefined
        ) {
            console.debug("Using environment variables for oauth config")
            this._oauth_config.oauth_client_id = import.meta.env.VITE_OSM_OAUTH_CLIENT_ID
            this._oauth_config.oauth_secret = import.meta.env.VITE_OSM_OAUTH_SECRET
        }

        this.userDetails = new UIEventSource<UserDetails>(
            undefined,
            "userDetails"
        )
        if (options.fakeUser) {
            const ud = this.userDetails.data
            ud.csCount = 5678
            ud.uid = 42
            ud.unreadMessages = 0
            ud.name = "Fake user"
            ud.totalMessages = 42
            ud.languages = ["en"]
            ud.description =
                "The 'fake-user' is a URL-parameter which allows to test features without needing an OSM account or even internet connection."
            this.loadingStatus.setData("logged-in")
        }
        this.UpdateCapabilities()

        this.isLoggedIn = this.userDetails.map(
            (user) => user !== undefined && this.apiIsOnline.data === "online",
            [this.apiIsOnline]
        )

        this._dryRun = options.dryRun ?? new UIEventSource<boolean>(false)

        this.updateAuthObject(false)
        if (!this.fakeUser) {
            this.CheckForMessagesContinuously()
        }

        this.preferencesHandler = new OsmPreferences(this.auth, this, this.fakeUser)

        if (options.oauth_token?.data !== undefined) {
            this.auth.bootstrapToken(options.oauth_token.data, (err, result) => {
                console.log("Bootstrap token called back", err, result)
                this.AttemptLogin()
            })

            options.oauth_token.setData(undefined)
        }
        if (
            !Utils.runningFromConsole &&
            this.auth.authenticated() &&
            options.attemptLogin !== false
        ) {
            this.AttemptLogin()
        } else {
            console.log("Not authenticated")
        }
    }

    public GetPreference<T extends string = string>(
        key: string,
        defaultValue: string = undefined,
        options?: {
            prefix?: string
        }
    ): UIEventSource<T | undefined> {
        const prefix = options?.prefix ?? "mapcomplete-"
        return <UIEventSource<T>>this.preferencesHandler.getPreference(key, defaultValue, prefix)
    }

    public getPreference<T extends string = string>(
        key: string,
        defaultValue: string = undefined,
        prefix: string = "mapcomplete-"
    ): UIEventSource<T | undefined> {
        return <UIEventSource<T>>this.preferencesHandler.getPreference(key, defaultValue, prefix)
    }

    public LogOut() {
        this.auth.logout()
        this.userDetails.setData(undefined)
        console.log("Logged out")
        this.loadingStatus.setData("not-attempted")
    }

    /**
     * The backend host, without path or trailing '/'
     *
     * new OsmConnection().Backend() // => "https://www.openstreetmap.org"
     */
    public Backend(): string {
        return this._oauth_config.url
    }

    public async AttemptLogin() {
        this.UpdateCapabilities()
        if (this.loadingStatus.data !== "logged-in") {
            // Stay 'logged-in' if we are already logged in; this simply means we are checking for messages
            this.loadingStatus.setData("loading")
        }
        if (this.fakeUser) {
            this.loadingStatus.setData("logged-in")
            console.log("AttemptLogin called, but ignored as fakeUser is set")
            return
        }
        this.updateAuthObject(true)

        LocalStorageSource.get("location_before_login").setData(
            Utils.runningFromConsole ? undefined : window.location.href
        )
        try {

            const u = <OsmUserInfo>JSON.parse(await this.interact("user/details.json", "GET", {
                "accept-encoding": "application/json"
            })).user

            if (!u) {
                this.loadingStatus.setData("error")
                return
            }

            this.userDetails.set({
                name: u.display_name,
                img: u.img?.href,
                unreadMessages: u.messages.received.unread,
                tracesCount: u.traces.count,
                uid: u.id,
                account_created: u.account_created,
                totalMessages: u.messages.received.count,
                languages: u.languages,
                home: u.home,
                backend: this.Backend(),
                description: u.description,
                csCount: u.changesets.count
            })
            this.loadingStatus.setData("logged-in")
        } catch (err) {
            console.log("Could not login due to:", err)
            this.loadingStatus.setData("error")
            if (err.status == 401) {
                console.log("Clearing tokens...")
                // Not authorized - our token probably got revoked
                this.auth.logout()
                this.LogOut()
            } else {
                console.log("Other error. Status:", err.status)
                this.apiIsOnline.setData("unreachable")
            }
        }

    }

    /**
     * Interact with the API.
     *
     * @param path the path to query, without host and without '/api/0.6'. Example 'notes/1234/close'
     * @param method
     * @param header
     * @param content
     * @param allowAnonymous if set, will use the anonymous-connection if the main connection is not authenticated
     */
    public async interact(
        path: string,
        method: "GET" | "POST" | "PUT" | "DELETE",
        header?: Record<string, string>,
        content?: string,
        allowAnonymous: boolean = false
    ): Promise<string> {
        const connection: osmAuth = this.auth
        if (allowAnonymous && !this.auth.authenticated()) {
            const possibleResult = await Utils.downloadAdvanced(
                `${this.Backend()}/api/0.6/${path}`,
                header,
                method,
                content
            )
            if (possibleResult["content"]) {
                return possibleResult["content"]
            }
            console.error(possibleResult)
            throw "Could not interact with OSM:" + possibleResult["error"]
        }

        return new Promise((ok, error) => {
            connection.xhr(
                {
                    method,
                    headers: header,
                    content,
                    path: `/api/0.6/${path}`
                },
                function(err, response) {
                    if (err !== null) {
                        error(err)
                    } else {
                        ok(response)
                    }
                }
            )
        })
    }

    public async post<T = string>(
        path: string,
        content?: string,
        header?: Record<string, string>,
        allowAnonymous: boolean = false
    ): Promise<T> {
        return <T>await this.interact(path, "POST", header, content, allowAnonymous)
    }

    public async put<T extends string>(
        path: string,
        content?: string,
        header?: Record<string, string>
    ): Promise<T> {
        return <T>await this.interact(path, "PUT", header, content)
    }

    public async get(
        path: string,
        header?: Record<string, string>,
        allowAnonymous: boolean = false
    ): Promise<string> {
        return await this.interact(path, "GET", header, undefined, allowAnonymous)
    }

    public closeNote(id: number | string, text?: string): Promise<string> {
        let textSuffix = ""
        if ((text ?? "") !== "") {
            textSuffix = "?text=" + encodeURIComponent(text)
        }
        if (this._dryRun.data) {
            console.warn("Dryrun enabled - not actually closing note ", id, " with text ", text)
            return new Promise((ok) => {
                ok("")
            })
        }
        return this.post(`notes/${id}/close${textSuffix}`)
    }

    public reopenNote(id: number | string, text?: string): Promise<string> {
        if (this._dryRun.data) {
            console.warn("Dryrun enabled - not actually reopening note ", id, " with text ", text)
            return new Promise((resolve) => {
                resolve("")
            })
        }
        let textSuffix = ""
        if ((text ?? "") !== "") {
            textSuffix = "?text=" + encodeURIComponent(text)
        }
        return this.post(`notes/${id}/reopen${textSuffix}`)
    }

    public async openNote(lat: number, lon: number, text: string): Promise<{ id: number }> {
        if (this._dryRun.data) {
            console.warn("Dryrun enabled - not actually opening note with text ", text)
            return new Promise<{ id: number }>((ok) => {
                window.setTimeout(
                    () => ok({ id: Math.floor(Math.random() * 1000) }),
                    Math.random() * 5000
                )
            })
        }
        // Lat and lon must be strings for the API to accept it
        const content = `lat=${lat}&lon=${lon}&text=${encodeURIComponent(text)}`
        const response = await this.post(
            "notes.json",
            content,
            {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            true
        )
        const parsed = JSON.parse(response)
        console.log("Got result:", parsed)
        const id = parsed.properties
        console.log("OPENED NOTE", id)
        return id
    }

    public async getNote(id: number): Promise<Feature<Point>> {
        return JSON.parse(await this.get("notes/" + id + ".json"))
    }

    public static GpxTrackVisibility = ["private", "public", "trackable", "identifiable"] as const

    public async uploadGpxTrack(
        gpx: string,
        options: {
            description: string
            visibility: (typeof OsmConnection.GpxTrackVisibility)[number]
            filename?: string
            /**
             * Some words to give some properties;
             *
             * Note: these are called 'tags' on the wiki, but I opted to name them 'labels' instead as they aren't "key=value" tags, but just words.
             */
            labels: string[]
        }
    ): Promise<{ id: number }> {
        if (this._dryRun.data) {
            console.warn("Dryrun enabled - not actually uploading GPX ", gpx)
            return new Promise<{ id: number }>((ok) => {
                window.setTimeout(
                    () => ok({ id: Math.floor(Math.random() * 1000) }),
                    Math.random() * 5000
                )
            })
        }

        const contents = {
            file: gpx,
            description: options.description,
            tags: options.labels?.join(",") ?? "",
            visibility: options.visibility
        }

        if (!contents.description) {
            throw "The description of a GPS-trace cannot be the empty string, undefined or null"
        }
        const extras = {
            file:
                "; filename=\"" +
                (options.filename ?? "gpx_track_mapcomplete_" + new Date().toISOString()) +
                "\"\r\nContent-Type: application/gpx+xml"
        }

        const boundary = "987654"

        let body = ""
        for (const key in contents) {
            body += "--" + boundary + "\r\n"
            body += "Content-Disposition: form-data; name=\"" + key + "\""
            if (extras[key] !== undefined) {
                body += extras[key]
            }
            body += "\r\n\r\n"
            body += contents[key] + "\r\n"
        }
        body += "--" + boundary + "--\r\n"

        const response = await this.post("gpx/create", body, {
            "Content-Type": "multipart/form-data; boundary=" + boundary,
            "Content-Length": "" + body.length
        })
        const parsed = JSON.parse(response)
        console.log("Uploaded GPX track", parsed)
        return { id: parsed }
    }

    public addCommentToNote(id: number | string, text: string): Promise<void> {
        if (this._dryRun.data) {
            console.warn("Dryrun enabled - not actually adding comment ", text, "to  note ", id)
            return Utils.waitFor(1000)
        }
        if ((text ?? "") === "") {
            throw "Invalid text!"
        }

        return new Promise((ok, error) => {
            this.auth.xhr(
                {
                    method: "POST",

                    path: `/api/0.6/notes/${id}/comment?text=${encodeURIComponent(text)}`
                },
                function(err) {
                    if (err !== null) {
                        error(err)
                    } else {
                        ok()
                    }
                }
            )
        })
    }

    /**
     * To be called by land.html
     */
    public finishLogin(callback: (previousURL: string) => void) {
        this.auth.authenticate(function() {
            // Fully authed at this point
            console.log("Authentication successful!")
            const previousLocation = LocalStorageSource.get("location_before_login")
            callback(previousLocation.data)
        })
    }

    private updateAuthObject(autoLogin: boolean) {
        this.auth = new osmAuth({
            client_id: this._oauth_config.oauth_client_id,
            url: this._oauth_config.url,
            scope: "read_prefs write_prefs write_api write_gpx write_notes",
            redirect_uri: Utils.runningFromConsole
                ? "https://mapcomplete.org/land.html"
                : window.location.protocol + "//" + window.location.host + "/land.html",
            /* We use 'singlePage' as much as possible, it is the most stable - including in PWA.
             * However, this breaks in iframes so we open a popup in that case
             */
            singlepage: !this._iframeMode,
            auto: autoLogin,
            apiUrl: this._oauth_config.api_url ?? this._oauth_config.url
        })
    }

    private CheckForMessagesContinuously() {
        if (this.isChecking) {
            return
        }
        Stores.Chronic(3 * 1000).addCallback(() => {
            if (!(this.apiIsOnline.data === "unreachable" || this.apiIsOnline.data === "offline")) {
                return
            }
            if (!this.isLoggedIn.data) {
                return
            }
            try {
                this.AttemptLogin()
            } catch (e) {
                console.log("Could not login due to", e)
            }
        })
        this.isChecking = true
        if (!this._doCheckRegularly) {
            return
        }
        Stores.Chronic(60 * 5 * 1000).addCallback(() => {
            if (this.isLoggedIn.data) {
                try {
                    this.AttemptLogin()
                } catch (e) {
                    console.log("Could not login due to", e)
                }
            }
        })
    }

    private UpdateCapabilities(): void {
        if (this.fakeUser) {
            return
        }
        this.FetchCapabilities()
            .then(({ api, gpx }) => {
                this.apiIsOnline.setData(api)
                this.gpxServiceIsOnline.setData(gpx)
            })
            .catch((err) => {
                console.log("Could not reach the api:", err)
                this.apiIsOnline.set("unreachable")
                this.gpxServiceIsOnline.set("unreachable")
            })
    }

    private readonly _userInfoCache: Record<number, OsmUserInfo> = {}

    public async getInformationAboutUser(id: number): Promise<OsmUserInfo> {
        if (id === undefined) {
            return undefined
        }
        if (this._userInfoCache[id]) {
            return this._userInfoCache[id]
        }
        const info = await this.get("user/" + id + ".json", { accepts: "application/json" }, true)
        const parsed = JSON.parse(info)["user"]
        this._userInfoCache[id] = parsed
        return parsed
    }

    private async FetchCapabilities(): Promise<{
        api: OsmServiceState
        gpx: OsmServiceState
        database: OsmServiceState
    }> {
        if (Utils.runningFromConsole) {
            return { api: "online", gpx: "online", database: "online" }
        }
        try {
            const result = await Utils.downloadJson<CapabilityResult>(
                this.Backend() + "/api/0.6/capabilities.json"
            )
            if (result?.api?.status === undefined) {
                console.log("Something went wrong:", result)
                return { api: "unreachable", gpx: "unreachable", database: "unreachable" }
            }
            return result.api.status
        } catch (e) {
            console.error("Could not fetch capabilities")
            return { api: "offline", gpx: "offline", database: "online" }
        }
    }
}
