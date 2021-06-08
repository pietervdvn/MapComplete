// @ts-ignore
import osmAuth from "osm-auth";
import {UIEventSource} from "../UIEventSource";
import {OsmPreferences} from "./OsmPreferences";
import {ChangesetHandler} from "./ChangesetHandler";
import {ElementStorage} from "../ElementStorage";
import Svg from "../../Svg";
import LayoutConfig from "../../Customizations/JSON/LayoutConfig";
import Img from "../../UI/Base/Img";
import {Utils} from "../../Utils";

export default class UserDetails {

    public loggedIn = false;
    public name = "Not logged in";
    public csCount = 0;
    public img: string;
    public unreadMessages = 0;
    public totalMessages = 0;
    public dryRun: boolean;
    home: { lon: number; lat: number };
}

export class OsmConnection {

    public static readonly _oauth_configs = {
        "osm": {
            oauth_consumer_key: 'hivV7ec2o49Two8g9h8Is1VIiVOgxQ1iYexCbvem',
            oauth_secret: 'wDBRTCem0vxD7txrg1y6p5r8nvmz8tAhET7zDASI',
            url: "https://www.openstreetmap.org"
        },
        "osm-test": {
            oauth_consumer_key: 'Zgr7EoKb93uwPv2EOFkIlf3n9NLwj5wbyfjZMhz2',
            oauth_secret: '3am1i1sykHDMZ66SGq4wI2Z7cJMKgzneCHp3nctn',
            url: "https://master.apis.dev.openstreetmap.org"
        }


    }
    public auth;
    public userDetails: UIEventSource<UserDetails>;
    _dryRun: boolean;
    public preferencesHandler: OsmPreferences;
    public changesetHandler: ChangesetHandler;
    private _onLoggedIn: ((userDetails: UserDetails) => void)[] = [];
    private readonly _iframeMode: Boolean | boolean;
    private readonly _singlePage: boolean;
    private readonly _oauth_config: {
        oauth_consumer_key: string,
        oauth_secret: string,
        url: string
    };

    constructor(dryRun: boolean, oauth_token: UIEventSource<string>,
                // Used to keep multiple changesets open and to write to the correct changeset
                layoutName: string,
                singlePage: boolean = true,
                osmConfiguration: "osm" | "osm-test" = 'osm'
    ) {
        this._singlePage = singlePage;
        this._oauth_config = OsmConnection._oauth_configs[osmConfiguration] ?? OsmConnection._oauth_configs.osm;
        console.debug("Using backend", this._oauth_config.url)
        this._iframeMode = Utils.runningFromConsole ? false : window !== window.top;

        this.userDetails = new UIEventSource<UserDetails>(new UserDetails(), "userDetails");
        this.userDetails.data.dryRun = dryRun;
        this._dryRun = dryRun;

        this.updateAuthObject();

        this.preferencesHandler = new OsmPreferences(this.auth, this);

        this.changesetHandler = new ChangesetHandler(layoutName, dryRun, this, this.auth);
        if (oauth_token.data !== undefined) {
            console.log(oauth_token.data)
            const self = this;
            this.auth.bootstrapToken(oauth_token.data,
                (x) => {
                    console.log("Called back: ", x)
                    self.AttemptLogin();
                }, this.auth);

            oauth_token.setData(undefined);

        }
        if (this.auth.authenticated()) {
            this.AttemptLogin(); // Also updates the user badge
        } else {
            console.log("Not authenticated");
        }
    }

    public UploadChangeset(
        layout: LayoutConfig,
        allElements: ElementStorage,
        generateChangeXML: (csid: string) => string,
        continuation: () => void = () => {
        }) {
        this.changesetHandler.UploadChangeset(layout, allElements, generateChangeXML, continuation);
    }

    public GetPreference(key: string, prefix: string = "mapcomplete-"): UIEventSource<string> {
        return this.preferencesHandler.GetPreference(key, prefix);
    }

    public GetLongPreference(key: string, prefix: string = "mapcomplete-"): UIEventSource<string> {
        return this.preferencesHandler.GetLongPreference(key, prefix);
    }

    public OnLoggedIn(action: (userDetails: UserDetails) => void) {
        this._onLoggedIn.push(action);
    }

    public LogOut() {
        this.auth.logout();
        this.userDetails.data.loggedIn = false;
        this.userDetails.data.csCount = 0;
        this.userDetails.data.name = "";
        this.userDetails.ping();
        console.log("Logged out")
    }

    public AttemptLogin() {
        const self = this;
        console.log("Trying to log in...");
        this.updateAuthObject();
        this.auth.xhr({
            method: 'GET',
            path: '/api/0.6/user/details'
        }, function (err, details) {
            if (err != null) {
                console.log(err);
                if (err.status == 401) {
                    console.log("Clearing tokens...")
                    // Not authorized - our token probably got revoked
                    // Reset all the tokens
                    const tokens = [
                        "https://www.openstreetmap.orgoauth_request_token_secret",
                        "https://www.openstreetmap.orgoauth_token",
                        "https://www.openstreetmap.orgoauth_token_secret"]
                    tokens.forEach(token => localStorage.removeItem(token))
                }
                return;
            }

            if (details == null) {
                return;
            }

            self.CheckForMessagesContinuously();

            // details is an XML DOM of user details
            let userInfo = details.getElementsByTagName("user")[0];

            // let moreDetails = new DOMParser().parseFromString(userInfo.innerHTML, "text/xml");

            let data = self.userDetails.data;
            data.loggedIn = true;
            console.log("Login completed, userinfo is ", userInfo);
            data.name = userInfo.getAttribute('display_name');
            data.csCount = userInfo.getElementsByTagName("changesets")[0].getAttribute("count");

            data.img = undefined;
            const imgEl = userInfo.getElementsByTagName("img");
            if (imgEl !== undefined && imgEl[0] !== undefined) {
                data.img = imgEl[0].getAttribute("href");
            }
            data.img = data.img ?? Img.AsData(Svg.osm_logo);

            const homeEl = userInfo.getElementsByTagName("home");
            if (homeEl !== undefined && homeEl[0] !== undefined) {
                const lat = parseFloat(homeEl[0].getAttribute("lat"));
                const lon = parseFloat(homeEl[0].getAttribute("lon"));
                data.home = {lat: lat, lon: lon};
            }

            const messages = userInfo.getElementsByTagName("messages")[0].getElementsByTagName("received")[0];
            data.unreadMessages = parseInt(messages.getAttribute("unread"));
            data.totalMessages = parseInt(messages.getAttribute("count"));

            self.userDetails.ping();
            for (const action of self._onLoggedIn) {
                action(self.userDetails.data);
            }
            self._onLoggedIn = [];

        });
    }

    private updateAuthObject() {
        let pwaStandAloneMode = false;
        try {
            if (Utils.runningFromConsole) {
                pwaStandAloneMode = true
            } else if (window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches) {
                pwaStandAloneMode = true;
            }
        } catch (e) {
            console.warn("Detecting standalone mode failed", e, ". Assuming in browser and not worrying furhter")
        }
        const standalone = this._iframeMode || pwaStandAloneMode || !this._singlePage;

        // In standalone mode, we DON'T use single page login, as 'redirecting' opens a new window anyway...
        // Same for an iframe...


        this.auth = new osmAuth({
            oauth_consumer_key: this._oauth_config.oauth_consumer_key,
            oauth_secret: this._oauth_config.oauth_secret,
            url: this._oauth_config.url,
            landing: standalone ? undefined : window.location.href,
            singlepage: !standalone,
            auto: true,

        });
    }

    private CheckForMessagesContinuously() {
        const self = this;
        window.setTimeout(() => {
            if (self.userDetails.data.loggedIn) {
                console.log("Checking for messages")
                this.AttemptLogin();
            }
        }, 5 * 60 * 1000);
    }


}