import { osmAuth } from "osm-auth"
import { Store, Stores, UIEventSource } from "../UIEventSource"
import { OsmPreferences } from "./OsmPreferences"
import { ChangesetHandler } from "./ChangesetHandler"
import { ElementStorage } from "../ElementStorage"
import { Utils } from "../../Utils"
import { OsmObject } from "./OsmObject"
import { Changes } from "./Changes"

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

    constructor(backend: string) {
        this.backend = backend
    }
}

export type OsmServiceState = "online" | "readonly" | "offline" | "unknown" | "unreachable"

export class OsmConnection {
    public static readonly oauth_configs = {
        osm: {
            oauth_consumer_key: "K93H1d8ve7p-tVLE1ZwsQ4lAFLQk8INx5vfTLMu5DWk",
            oauth_secret: "NBWGhWDrD3QDB35xtVuxv4aExnmIt4FA_WgeLtwxasg",
            url: "https://www.openstreetmap.org",
            // OAUTH 1.0 application
            // https://www.openstreetmap.org/user/Pieter%20Vander%20Vennet/oauth_clients/7404
        },
        "osm-test": {
            oauth_consumer_key: "Zgr7EoKb93uwPv2EOFkIlf3n9NLwj5wbyfjZMhz2",
            oauth_secret: "3am1i1sykHDMZ66SGq4wI2Z7cJMKgzneCHp3nctn",
            url: "https://master.apis.dev.openstreetmap.org",
        },
    }
    public auth
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
    public readonly _oauth_config: {
        oauth_consumer_key: string
        oauth_secret: string
        url: string
    }
    private readonly _dryRun: UIEventSource<boolean>
    private fakeUser: boolean
    private _onLoggedIn: ((userDetails: UserDetails) => void)[] = []
    private readonly _iframeMode: Boolean | boolean
    private readonly _singlePage: boolean
    private isChecking = false

    constructor(options?: {
        dryRun?: UIEventSource<boolean>
        fakeUser?: false | boolean
        oauth_token?: UIEventSource<string>
        // Used to keep multiple changesets open and to write to the correct changeset
        singlePage?: boolean
        osmConfiguration?: "osm" | "osm-test"
        attemptLogin?: true | boolean
    }) {
        options = options ?? {}
        this.fakeUser = options.fakeUser ?? false
        this._singlePage = options.singlePage ?? true
        this._oauth_config =
            OsmConnection.oauth_configs[options.osmConfiguration ?? "osm"] ??
            OsmConnection.oauth_configs.osm
        console.debug("Using backend", this._oauth_config.url)
        OsmObject.SetBackendUrl(this._oauth_config.url + "/")
        this._iframeMode = Utils.runningFromConsole ? false : window !== window.top

        this.userDetails = new UIEventSource<UserDetails>(
            new UserDetails(this._oauth_config.url),
            "userDetails"
        )
        if (options.fakeUser) {
            const ud = this.userDetails.data
            ud.csCount = 5678
            ud.loggedIn = true
            ud.unreadMessages = 0
            ud.name = "Fake user"
            ud.totalMessages = 42
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
            this.auth.bootstrapToken(
                options.oauth_token.data,
                (x) => {
                    console.log("Called back: ", x)
                    self.AttemptLogin()
                },
                this.auth
            )

            options.oauth_token.setData(undefined)
        }
        if (this.auth.authenticated() && options.attemptLogin !== false) {
            this.AttemptLogin() // Also updates the user badge
        } else {
            console.log("Not authenticated")
        }
    }

    public CreateChangesetHandler(allElements: ElementStorage, changes: Changes) {
        return new ChangesetHandler(
            this._dryRun,
            <any>/*casting is needed to make the tests work*/ this,
            allElements,
            changes,
            this.auth
        )
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
        this.loadingStatus.setData("loading")
        if (this.fakeUser) {
            this.loadingStatus.setData("logged-in")
            console.log("AttemptLogin called, but ignored as fakeUser is set")
            return
        }
        const self = this
        console.log("Trying to log in...")
        this.updateAuthObject()
        this.auth.xhr(
            {
                method: "GET",
                path: "/api/0.6/user/details",
            },
            function (err, details) {
                if (err != null) {
                    console.log(err)
                    self.loadingStatus.setData("error")
                    if (err.status == 401) {
                        console.log("Clearing tokens...")
                        // Not authorized - our token probably got revoked
                        // Reset all the tokens
                        const tokens = [
                            "https://www.openstreetmap.orgoauth_request_token_secret",
                            "https://www.openstreetmap.orgoauth_token",
                            "https://www.openstreetmap.orgoauth_token_secret",
                        ]
                        tokens.forEach((token) => localStorage.removeItem(token))
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

                // let moreDetails = new DOMParser().parseFromString(userInfo.innerHTML, "text/xml");

                let data = self.userDetails.data
                data.loggedIn = true
                console.log("Login completed, userinfo is ", userInfo)
                data.name = userInfo.getAttribute("display_name")
                data.account_created = userInfo.getAttribute("account_created")
                data.uid = Number(userInfo.getAttribute("id"))
                data.csCount = Number.parseInt(
                    userInfo.getElementsByTagName("changesets")[0].getAttribute("count") ?? 0
                )
                data.tracesCount = Number.parseInt(
                    userInfo.getElementsByTagName("changesets")[0].getAttribute("count") ?? 0
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
        return new Promise((ok, error) => {
            this.auth.xhr(
                {
                    method: "POST",
                    path: `/api/0.6/notes/${id}/close${textSuffix}`,
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
        return new Promise((ok, error) => {
            this.auth.xhr(
                {
                    method: "POST",
                    path: `/api/0.6/notes/${id}/reopen${textSuffix}`,
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

    public openNote(lat: number, lon: number, text: string): Promise<{ id: number }> {
        if (this._dryRun.data) {
            console.warn("Dryrun enabled - not actually opening note with text ", text)
            return new Promise<{ id: number }>((ok) => {
                window.setTimeout(
                    () => ok({ id: Math.floor(Math.random() * 1000) }),
                    Math.random() * 5000
                )
            })
        }
        const auth = this.auth
        const content = { lat, lon, text }
        return new Promise((ok, error) => {
            auth.xhr(
                {
                    method: "POST",
                    path: `/api/0.6/notes.json`,
                    options: {
                        header: { "Content-Type": "application/json" },
                    },
                    content: JSON.stringify(content),
                },
                function (err, response: string) {
                    console.log("RESPONSE IS", response)
                    if (err !== null) {
                        error(err)
                    } else {
                        const parsed = JSON.parse(response)
                        const id = parsed.properties.id
                        console.log("OPENED NOTE", id)
                        ok({ id })
                    }
                }
            )
        })
    }

    public async uploadGpxTrack(
        gpx: string,
        options: {
            description: string
            visibility: "private" | "public" | "trackable" | "identifiable"
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
            description: options.description ?? "",
            tags: options.labels?.join(",") ?? "",
            visibility: options.visibility,
        }

        const extras = {
            file:
                '; filename="' +
                (options.filename ?? "gpx_track_mapcomplete_" + new Date().toISOString()) +
                '"\r\nContent-Type: application/gpx+xml',
        }

        const auth = this.auth
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

        return new Promise((ok, error) => {
            auth.xhr(
                {
                    method: "POST",
                    path: `/api/0.6/gpx/create`,
                    options: {
                        header: {
                            "Content-Type": "multipart/form-data; boundary=" + boundary,
                            "Content-Length": body.length,
                        },
                    },
                    content: body,
                },
                function (err, response: string) {
                    console.log("RESPONSE IS", response)
                    if (err !== null) {
                        error(err)
                    } else {
                        const parsed = JSON.parse(response)
                        console.log("Uploaded GPX track", parsed)
                        ok({ id: parsed })
                    }
                }
            )
        })
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

        this.auth = new osmAuth(<any> {
            oauth_consumer_key: this._oauth_config.oauth_consumer_key,
            oauth_secret: this._oauth_config.oauth_secret,
            url: this._oauth_config.url,
            landing: standalone ? undefined : window.location.href,
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
                console.log("Checking for messages")
                self.AttemptLogin()
            }
        })
    }

    private UpdateCapabilities(): void {
        const self = this
        this.FetchCapabilities().then(({ api, gpx }) => {
            self.apiIsOnline.setData(api)
            self.gpxServiceIsOnline.setData(gpx)
        })
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
