// @ts-ignore
import { osmAuth } from "osm-auth"
import { Store, Stores, UIEventSource } from "../UIEventSource"
import { OsmPreferences } from "./OsmPreferences"
import { Utils } from "../../Utils"
import { LocalStorageSource } from "../Web/LocalStorageSource"
import { AuthConfig } from "./AuthConfig"
import Constants from "../../Models/Constants"
import OSMAuthInstance = OSMAuth.OSMAuthInstance

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
    public auth: OSMAuthInstance
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
    private readonly _iframeMode: Boolean | boolean
    private readonly _singlePage: boolean
    private isChecking = false

    constructor(options?: {
        dryRun?: Store<boolean>
        fakeUser?: false | boolean
        oauth_token?: UIEventSource<string>
        // Used to keep multiple changesets open and to write to the correct changeset
        singlePage?: boolean
        attemptLogin?: true | boolean
    }) {
        options ??= {}
        this.fakeUser = options?.fakeUser ?? false
        this._singlePage = options?.singlePage ?? true
        this._oauth_config = Constants.osmAuthConfig
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
        }
        const self = this
        this.UpdateCapabilities()
        this.isLoggedIn = this.userDetails.map(
            (user) =>
                user.loggedIn &&
                (self.apiIsOnline.data === "unknown" || self.apiIsOnline.data === "online"),
            [this.apiIsOnline]
        )
        this.isLoggedIn.addCallback((isLoggedIn) => {
            if (self.userDetails.data.loggedIn == false && isLoggedIn == true) {
                // We have an inconsistency: the userdetails say we _didn't_ log in, but this actor says we do
                // This means someone attempted to toggle this; so we attempt to login!
                self.AttemptLogin()
            }
        })

        this._dryRun = options.dryRun ?? new UIEventSource<boolean>(false)

        this.updateAuthObject()

        this.preferencesHandler = new OsmPreferences(
            this.auth,
            <any /*This is needed to make the tests work*/>this
        )

        if (options.oauth_token?.data !== undefined) {
            console.log(options.oauth_token.data)
            const self = this
            this.auth.bootstrapToken(options.oauth_token.data, (err, result) => {
                console.log("Bootstrap token called back", err, result)
                self.AttemptLogin()
            })

            options.oauth_token.setData(undefined)
        }
        if (this.auth.authenticated() && options.attemptLogin !== false) {
            this.AttemptLogin()
        } else {
            console.log("Not authenticated")
        }
    }

    public GetPreference(
        key: string,
        defaultValue: string = undefined,
        options?: {
            documentation?: string
            prefix?: string
        }
    ): UIEventSource<string> {
        return this.preferencesHandler.GetPreference(key, defaultValue, options)
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
        const self = this
        console.log("Trying to log in...")
        this.updateAuthObject()
        LocalStorageSource.Get("location_before_login").setData(
            Utils.runningFromConsole ? undefined : window.location.href
        )
        this.auth.xhr(
            {
                method: "GET",
                path: "/api/0.6/user/details",
            },
            function (err, details: XMLDocument) {
                if (err != null) {
                    console.log(err)
                    self.loadingStatus.setData("error")
                    if (err.status == 401) {
                        console.log("Clearing tokens...")
                        // Not authorized - our token probably got revoked
                        self.auth.logout()
                        self.LogOut()
                    }
                    return
                }

                if (details == null) {
                    self.loadingStatus.setData("error")
                    return
                }

                self.CheckForMessagesContinuously()

                // details is an XML DOM of user details
                let userInfo = details.getElementsByTagName("user")[0]

                let data = self.userDetails.data
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

                self.loadingStatus.setData("logged-in")
                const messages = userInfo
                    .getElementsByTagName("messages")[0]
                    .getElementsByTagName("received")[0]
                data.unreadMessages = parseInt(messages.getAttribute("unread"))
                data.totalMessages = parseInt(messages.getAttribute("count"))

                self.userDetails.ping()
                for (const action of self._onLoggedIn) {
                    action(self.userDetails.data)
                }
                self._onLoggedIn = []
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
        header?: Record<string, string | number>,
        content?: string,
        allowAnonymous: boolean = false
    ): Promise<string> {
        let connection: OSMAuthInstance = this.auth
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
                <any>{
                    method,
                    options: {
                        header,
                    },
                    content,
                    path: `/api/0.6/${path}`,
                },
                function (err, response) {
                    if (err !== null) {
                        error(err)
                    } else {
                        ok(response)
                    }
                }
            )
        })
    }

    public async post(
        path: string,
        content?: string,
        header?: Record<string, string | number>,
        allowAnonymous: boolean = false
    ): Promise<any> {
        return await this.interact(path, "POST", header, content, allowAnonymous)
    }

    public async put(
        path: string,
        content?: string,
        header?: Record<string, string | number>
    ): Promise<any> {
        return await this.interact(path, "PUT", header, content)
    }

    public async get(
        path: string,
        header?: Record<string, string | number>,
        allowAnonymous: boolean = false
    ): Promise<string> {
        return await this.interact(path, "GET", header, undefined, allowAnonymous)
    }

    public closeNote(id: number | string, text?: string): Promise<void> {
        let textSuffix = ""
        if ((text ?? "") !== "") {
            textSuffix = "?text=" + encodeURIComponent(text)
        }
        if (this._dryRun.data) {
            console.warn("Dryrun enabled - not actually closing note ", id, " with text ", text)
            return new Promise((ok) => {
                ok()
            })
        }
        return this.post(`notes/${id}/close${textSuffix}`)
    }

    public reopenNote(id: number | string, text?: string): Promise<void> {
        if (this._dryRun.data) {
            console.warn("Dryrun enabled - not actually reopening note ", id, " with text ", text)
            return new Promise((ok) => {
                ok()
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
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
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
            return new Promise<{ id: number }>((ok, error) => {
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
            visibility: options.visibility,
        }

        if (!contents.description) {
            throw "The description of a GPS-trace cannot be the empty string, undefined or null"
        }
        const extras = {
            file:
                '; filename="' +
                (options.filename ?? "gpx_track_mapcomplete_" + new Date().toISOString()) +
                '"\r\nContent-Type: application/gpx+xml',
        }

        const boundary = "987654"

        let body = ""
        for (const key in contents) {
            body += "--" + boundary + "\r\n"
            body += 'Content-Disposition: form-data; name="' + key + '"'
            if (extras[key] !== undefined) {
                body += extras[key]
            }
            body += "\r\n\r\n"
            body += contents[key] + "\r\n"
        }
        body += "--" + boundary + "--\r\n"

        const response = await this.post("gpx/create", body, {
            "Content-Type": "multipart/form-data; boundary=" + boundary,
            "Content-Length": body.length,
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

                    path: `/api/0.6/notes/${id}/comment?text=${encodeURIComponent(text)}`,
                },
                function (err, _) {
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
        this.auth.authenticate(function () {
            // Fully authed at this point
            console.log("Authentication successful!")
            const previousLocation = LocalStorageSource.Get("location_before_login")
            callback(previousLocation.data)
        })
    }

    private updateAuthObject() {
        let pwaStandAloneMode = false
        try {
            if (Utils.runningFromConsole) {
                pwaStandAloneMode = true
            } else if (
                window.matchMedia("(display-mode: standalone)").matches ||
                window.matchMedia("(display-mode: fullscreen)").matches
            ) {
                pwaStandAloneMode = true
            }
        } catch (e) {
            console.warn(
                "Detecting standalone mode failed",
                e,
                ". Assuming in browser and not worrying furhter"
            )
        }
        const standalone = this._iframeMode || pwaStandAloneMode || !this._singlePage

        // In standalone mode, we DON'T use single page login, as 'redirecting' opens a new window anyway...
        // Same for an iframe...

        this.auth = new osmAuth({
            client_id: this._oauth_config.oauth_client_id,
            url: this._oauth_config.url,
            scope: "read_prefs write_prefs write_api write_gpx write_notes openid",
            redirect_uri: Utils.runningFromConsole
                ? "https://mapcomplete.org/land.html"
                : window.location.protocol + "//" + window.location.host + "/land.html",
            singlepage: !standalone,
            auto: true,
        })
    }

    private CheckForMessagesContinuously() {
        const self = this
        if (this.isChecking) {
            return
        }
        this.isChecking = true
        Stores.Chronic(5 * 60 * 1000).addCallback((_) => {
            if (self.isLoggedIn.data) {
                self.AttemptLogin()
            }
        })
    }

    private UpdateCapabilities(): void {
        const self = this
        if (this.fakeUser) {
            return
        }
        this.FetchCapabilities().then(({ api, gpx }) => {
            self.apiIsOnline.setData(api)
            self.gpxServiceIsOnline.setData(gpx)
        })
    }

    private readonly _userInfoCache: Record<number, any> = {}
    public async getInformationAboutUser(id: number): Promise<{
        id: number
        display_name: string
        account_created: string
        description: string
        contributor_terms: { agreed: boolean }
        roles: []
        changesets: { count: number }
        traces: { count: number }
        blocks: { received: { count: number; active: number } }
    }> {
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
