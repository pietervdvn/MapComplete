import { osmAuth } from "osm-auth"
import { Store, Stores, UIEventSource } from "../UIEventSource"
import { OsmPreferences } from "./OsmPreferences"
import { Utils } from "../../Utils"
import { LocalStorageSource } from "../Web/LocalStorageSource"
import { AuthConfig } from "./AuthConfig"
import Constants from "../../Models/Constants"

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
}

export default class UserDetails {
    public loggedIn = false
    public name = "Not logged in"
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
    private _onLoggedIn: ((userDetails: UserDetails) => void)[] = []
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
        attemptLogin?: true | boolean
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
            new UserDetails(this._oauth_config.url),
            "userDetails"
        )
        if (options.fakeUser) {
            const ud = this.userDetails.data
            ud.csCount = 5678
            ud.uid = 42
            ud.loggedIn = true
            ud.unreadMessages = 0
            ud.name = "Fake user"
            ud.totalMessages = 42
            ud.languages = ["en"]
            this.loadingStatus.setData("logged-in")
        }
        this.UpdateCapabilities()

        this.isLoggedIn = this.userDetails.map(
            (user) =>
                user.loggedIn &&
                (this.apiIsOnline.data === "unknown" || this.apiIsOnline.data === "online"),
            [this.apiIsOnline]
        )
        this.isLoggedIn.addCallback((isLoggedIn) => {
            if (this.userDetails.data.loggedIn == false && isLoggedIn == true) {
                // We have an inconsistency: the userdetails say we _didn't_ log in, but this actor says we do
                // This means someone attempted to toggle this; so we attempt to login!
                this.AttemptLogin()
            }
        })

        this._dryRun = options.dryRun ?? new UIEventSource<boolean>(false)

        this.updateAuthObject()
        if (!this.fakeUser) {
            this.CheckForMessagesContinuously()
        }

        this.preferencesHandler = new OsmPreferences(this.auth, this, this.fakeUser)

        if (options.oauth_token?.data !== undefined) {
            console.log(options.oauth_token.data)
            this.auth.bootstrapToken(options.oauth_token.data, (err, result) => {
                console.log("Bootstrap token called back", err, result)
                this.AttemptLogin()
            })

            options.oauth_token.setData(undefined)
        }
        if (!Utils.runningFromConsole && this.auth.authenticated() && options.attemptLogin !== false) {
            this.AttemptLogin()
        } else {
            console.log("Not authenticated")
        }
    }

    public GetPreference<T extends string = string>(
        key: string,
        defaultValue: string = undefined,
        options?: {
            documentation?: string
            prefix?: string
        }
    ): UIEventSource<T | undefined> {
        return <UIEventSource<T>>this.preferencesHandler.GetPreference(key, defaultValue, options)
    }

    public GetLongPreference(key: string, prefix: string = "mapcomplete-"): UIEventSource<string> {
        return this.preferencesHandler.GetLongPreference(key, prefix)
    }

    public OnLoggedIn(action: (userDetails: UserDetails) => void) {
        this._onLoggedIn.push(action)
    }

    public LogOut() {
        this.auth.logout()
        this.userDetails.data.loggedIn = false
        this.userDetails.data.csCount = 0
        this.userDetails.data.name = ""
        this.userDetails.ping()
        console.log("Logged out")
        this.loadingStatus.setData("not-attempted")
        this.preferencesHandler.preferences.setData(undefined)
    }

    /**
     * The backend host, without path or trailing '/'
     *
     * new OsmConnection().Backend() // => "https://www.openstreetmap.org"
     */
    public Backend(): string {
        return this._oauth_config.url
    }

    public AttemptLogin() {
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

        console.log("Trying to log in...")
        this.updateAuthObject()

        LocalStorageSource.Get("location_before_login").setData(
            Utils.runningFromConsole ? undefined : window.location.href
        )
        this.auth.xhr(
            {
                method: "GET",
                path: "/api/0.6/user/details"
            },
            (err, details: XMLDocument) => {
                if (err != null) {
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
                    return
                }

                if (details == null) {
                    this.loadingStatus.setData("error")
                    return
                }

                // details is an XML DOM of user details
                const userInfo = details.getElementsByTagName("user")[0]

                const data = this.userDetails.data
                data.loggedIn = true
                console.log("Login completed, userinfo is ", userInfo)
                data.name = userInfo.getAttribute("display_name")
                data.account_created = userInfo.getAttribute("account_created")
                data.uid = Number(userInfo.getAttribute("id"))
                data.languages = Array.from(
                    userInfo.getElementsByTagName("languages")[0].getElementsByTagName("lang")
                ).map((l) => l.textContent)
                data.csCount = Number.parseInt(
                    userInfo.getElementsByTagName("changesets")[0].getAttribute("count") ?? "0"
                )
                data.tracesCount = Number.parseInt(
                    userInfo.getElementsByTagName("traces")[0].getAttribute("count") ?? "0"
                )

                data.img = undefined
                const imgEl = userInfo.getElementsByTagName("img")
                if (imgEl !== undefined && imgEl[0] !== undefined) {
                    data.img = imgEl[0].getAttribute("href")
                }

                const description = userInfo.getElementsByTagName("description")
                if (description !== undefined && description[0] !== undefined) {
                    data.description = description[0]?.innerHTML
                }
                const homeEl = userInfo.getElementsByTagName("home")
                if (homeEl !== undefined && homeEl[0] !== undefined) {
                    const lat = parseFloat(homeEl[0].getAttribute("lat"))
                    const lon = parseFloat(homeEl[0].getAttribute("lon"))
                    data.home = { lat: lat, lon: lon }
                }

                this.loadingStatus.setData("logged-in")
                const messages = userInfo
                    .getElementsByTagName("messages")[0]
                    .getElementsByTagName("received")[0]
                data.unreadMessages = parseInt(messages.getAttribute("unread"))
                data.totalMessages = parseInt(messages.getAttribute("count"))

                this.userDetails.ping()
                for (const action of this._onLoggedIn) {
                    action(this.userDetails.data)
                }
                this._onLoggedIn = []
            }
        )
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

    public async post<T extends string>(
        path: string,
        content?: string,
        header?: Record<string, string>,
        allowAnonymous: boolean = false
    ): Promise<T> {
        return <T> await this.interact(path, "POST", header, content, allowAnonymous)
    }

    public async put<T extends string>(
        path: string,
        content?: string,
        header?: Record<string, string>
    ): Promise<T> {
        return <T> await this.interact(path, "PUT", header, content)
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
            return new Promise(resolve => {
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
            "Content-Length": ""+body.length
        })
        const parsed = JSON.parse(response)
        console.log("Uploaded GPX track", parsed)
        return { id: parsed }
    }

    public addCommentToNote(id: number | string, text: string): Promise<void> {
        if (this._dryRun.data) {
            console.warn("Dryrun enabled - not actually adding comment ", text, "to  note ", id)
            return new Promise((ok) => {
                ok()
            })
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
            const previousLocation = LocalStorageSource.Get("location_before_login")
            callback(previousLocation.data)
        })
    }

    private updateAuthObject() {
        this.auth = new osmAuth({
            client_id: this._oauth_config.oauth_client_id,
            url: this._oauth_config.url,
            scope: "read_prefs write_prefs write_api write_gpx write_notes openid",
            redirect_uri: Utils.runningFromConsole
                ? "https://mapcomplete.org/land.html"
                : window.location.protocol + "//" + window.location.host + "/land.html",
            singlepage: true, // We always use 'singlePage', it is the most stable - including in PWA
            auto: true
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
            try {
                console.log("Api is offline - trying to reconnect...")
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
        this.FetchCapabilities().then(({ api, gpx }) => {
            this.apiIsOnline.setData(api)
            this.gpxServiceIsOnline.setData(gpx)
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

    private async FetchCapabilities(): Promise<{ api: OsmServiceState; gpx: OsmServiceState }> {
        if (Utils.runningFromConsole) {
            return { api: "online", gpx: "online" }
        }
        const result = await Utils.downloadAdvanced(this.Backend() + "/api/0.6/capabilities")
        if (result["content"] === undefined) {
            console.log("Something went wrong:", result)
            return { api: "unreachable", gpx: "unreachable" }
        }
        const xmlRaw = result["content"]
        const parsed = new DOMParser().parseFromString(xmlRaw, "text/xml")
        const statusEl = parsed.getElementsByTagName("status")[0]
        const api = <OsmServiceState>statusEl.getAttribute("api")
        const gpx = <OsmServiceState>statusEl.getAttribute("gpx")
        return { api, gpx }
    }
}
