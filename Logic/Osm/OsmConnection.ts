// @ts-ignore
import osmAuth from "osm-auth";
import {UIEventSource} from "../UIEventSource";
import {State} from "../../State";
import {All} from "../../Customizations/Layouts/All";
import {OsmPreferences} from "./OsmPreferences";
import {ChangesetHandler} from "./ChangesetHandler";

export class UserDetails {

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

    public auth;
    public userDetails: UIEventSource<UserDetails>;
    private _dryRun: boolean;

    public preferencesHandler: OsmPreferences;
    public changesetHandler: ChangesetHandler;
    
    private _onLoggedIn : ((userDetails: UserDetails) => void)[] = [];

    constructor(dryRun: boolean, oauth_token: UIEventSource<string>, singlePage: boolean = true, useDevServer:boolean = false) {

        let pwaStandAloneMode = false;
        try {
            if (window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches) {
                pwaStandAloneMode = true;
            }
        } catch (e) {
            console.warn("Detecting standalone mode failed", e, ". Assuming in browser and not worrying furhter")
        }
        
        const iframeMode = window !== window.top;


        if ( iframeMode || pwaStandAloneMode || !singlePage) {
            // In standalone mode, we DON'T use single page login, as 'redirecting' opens a new window anyway...
            // Same for an iframe...
            this.auth = new osmAuth({
                oauth_consumer_key: 'hivV7ec2o49Two8g9h8Is1VIiVOgxQ1iYexCbvem',
                oauth_secret: 'wDBRTCem0vxD7txrg1y6p5r8nvmz8tAhET7zDASI',
                singlepage: false,
                auto: true,
                url: useDevServer ? "https://master.apis.dev.openstreetmap.org" : undefined
            });
        } else {

            this.auth = new osmAuth({
                oauth_consumer_key: 'hivV7ec2o49Two8g9h8Is1VIiVOgxQ1iYexCbvem',
                oauth_secret: 'wDBRTCem0vxD7txrg1y6p5r8nvmz8tAhET7zDASI',
                singlepage: true,
                landing: window.location.href,
                auto: true,
                url: useDevServer ? "https://master.apis.dev.openstreetmap.org" : undefined
            });
        }


        this.userDetails = new UIEventSource<UserDetails>(new UserDetails());
        this.userDetails.data.dryRun = dryRun;
        this._dryRun = dryRun;

        this.preferencesHandler = new OsmPreferences(this.auth, this);
        
        this.changesetHandler = new ChangesetHandler(dryRun, this, this.auth);
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


    public UploadChangeset(generateChangeXML: (csid: string) => string,
                           continuation: () => void) {
        this.changesetHandler.UploadChangeset(generateChangeXML, continuation);
    }

    public GetPreference(key: string, prefix: string = "mapcomplete-"): UIEventSource<string> {
        return this.preferencesHandler.GetPreference(key, prefix);
    }

    public GetLongPreference(key: string, prefix: string = "mapcomplete-"): UIEventSource<string> {
        return this.preferencesHandler.GetLongPreference(key, prefix);
    }

    public OnLoggedIn(action: (userDetails: UserDetails) => void){
        this._onLoggedIn.push(action);
    }
    
    public LogOut() {
        this.auth.logout();
        this.userDetails.data.loggedIn = false;
        this.userDetails.ping();
        console.log("Logged out")
    }

    public AttemptLogin() {
        const self = this;
        this.auth.xhr({
            method: 'GET',
            path: '/api/0.6/user/details'
        }, function (err, details) {
            if(err != null){
                console.log(err);
                self.auth.logout();
                self.userDetails.data.loggedIn = false;
                self.userDetails.ping();
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
            data.img = data.img ?? "./assets/osm-logo.svg";

            const homeEl = userInfo.getElementsByTagName("home");
            if (homeEl !== undefined && homeEl[0] !== undefined) {
                const lat = parseFloat(homeEl[0].getAttribute("lat"));
                const lon = parseFloat(homeEl[0].getAttribute("lon"));
                data.home = {lat: lat, lon: lon};
            }

            const messages = userInfo.getElementsByTagName("messages")[0].getElementsByTagName("received")[0];
            data.unreadMessages = parseInt(messages.getAttribute("unread"));
            data.totalMessages = parseInt(messages.getAttribute("count"));

            for (const action of self._onLoggedIn) {
                action(self.userDetails.data);
            }
          
            self.userDetails.ping();
        });
    }


    private CheckForMessagesContinuously() {
        const self = this;
        window.setTimeout(() => {
            if (self.userDetails.data.loggedIn) {
                console.log("Checking for messages")
                this.AttemptLogin();
            }
        },  5 * 60 * 1000);
    }


}