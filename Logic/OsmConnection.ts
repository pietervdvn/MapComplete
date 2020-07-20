// @ts-ignore
import osmAuth from "osm-auth";
import {UIEventSource} from "../UI/UIEventSource";

export class UserDetails {

    public loggedIn = false;
    public name = "Not logged in";
    public csCount = 0;
    public img: string;
    public unreadMessages = 0;
    public totalMessages = 0;
    public osmConnection: OsmConnection;
    public dryRun: boolean;
    home: { lon: number; lat: number };
}

export class OsmConnection {


    private auth = new osmAuth({
        oauth_consumer_key: 'hivV7ec2o49Two8g9h8Is1VIiVOgxQ1iYexCbvem',
        oauth_secret: 'wDBRTCem0vxD7txrg1y6p5r8nvmz8tAhET7zDASI',
        auto: true // show a login form if the user is not authenticated and
                   // you try to do a call
    });
    public userDetails: UIEventSource<UserDetails>;
    private _dryRun: boolean;

    constructor(dryRun: boolean) {
        this.userDetails = new UIEventSource<UserDetails>(new UserDetails());
        this.userDetails.data.osmConnection = this;
        this.userDetails.data.dryRun = dryRun;
        this._dryRun = dryRun;

        if (this.auth.authenticated()) {
            this.AttemptLogin(); // Also updates the user badge
        }else{
            console.log("Not authenticated");
        }

        
        if(dryRun){
            console.log("DRYRUN ENABLED");
        }

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
            
            self.UpdatePreferences();
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
            self.userDetails.ping();
        });
    }

    /**
     * All elements with class 'activate-osm-authentication' are loaded and get an 'onclick' to authenticate
     */
    registerActivateOsmAUthenticationClass() {

        const self = this;
        const authElements = document.getElementsByClassName("activate-osm-authentication");
        for (let i = 0; i < authElements.length; i++) {
            let element = authElements.item(i);
            // @ts-ignore
            element.onclick = function () {
                self.AttemptLogin();
            }
        }
    }

    public preferences = new UIEventSource<any>({});
    public preferenceSources : any = {}
    
    public GetPreference(key: string) : UIEventSource<string>{
        key = "mapcomplete-"+key;
        if (this.preferenceSources[key] !== undefined) {
            return this.preferenceSources[key];
        }
        if (this.userDetails.data.loggedIn) {
            this.UpdatePreferences();
        }
        const pref = new UIEventSource<string>(this.preferences.data[key]);
        pref.addCallback((v) => {
            this.SetPreference(key, v);
        });

        this.preferences.addCallback((prefs) => {
            if (prefs[key] !== undefined) {
                pref.setData(prefs[key]);
            }
        });
        
        this.preferenceSources[key] = pref;
        return pref;
    }
    
    private UpdatePreferences() {
        const self = this;
        this.auth.xhr({
            method: 'GET',
            path: '/api/0.6/user/preferences'
        }, function (error, value: XMLDocument) {
            if(error){
                console.log("Could not load preferences", error);
                return;
            }
            const prefs = value.getElementsByTagName("preference");
            for (let i = 0; i < prefs.length; i++) {
                const pref = prefs[i];
                const k = pref.getAttribute("k");
                const v = pref.getAttribute("v");
                self.preferences.data[k] = v;
            }
            self.preferences.ping();
        });
    }
    
    private SetPreference(k:string, v:string) {
        if(!this.userDetails.data.loggedIn){
            console.log("Not saving preference: user not logged in");
            return;
        }

        if (this.preferences.data[k] === v) {
            console.log("Not updating preference", k, " to ", v, "not changed");
            return;
        }
        console.log("Updating preference", k, " to ", v);

        this.preferences.data[k] = v;
        this.preferences.ping();
        this.auth.xhr({
            method: 'PUT',
            path: '/api/0.6/user/preferences/' + k,
            options: {header: {'Content-Type': 'text/plain'}},
            content: v
        }, function (error, result) {
            if (error) {
                console.log("Could not set preference", error);
                return;
            }
            
            console.log("Preference written!", result == "" ? "OK" : result);
            
        });
    }

    private static parseUploadChangesetResponse(response: XMLDocument) {
        const nodes = response.getElementsByTagName("node");
        const mapping = {};
        // @ts-ignore
        for (const node of nodes) {
            const oldId = parseInt(node.attributes.old_id.value);
            const newId = parseInt(node.attributes.new_id.value);
            if (oldId !== undefined && newId !== undefined &&
                !isNaN(oldId) && !isNaN(newId)) {
                mapping["node/"+oldId] = "node/"+newId;
            }
        }
        return mapping;
    }


    public UploadChangeset(comment: string, generateChangeXML: ((csid: string) => string),
                           handleMapping: ((idMapping: any) => void),
                           continuation: (() => void)) {

        if (this._dryRun) {
            console.log("NOT UPLOADING as dryrun is true");
            var changesetXML = generateChangeXML("123456");
            console.log(changesetXML);
            continuation();
            return;
        }

        const self = this;
        this.OpenChangeset(comment,
            function (csId) {
                var changesetXML = generateChangeXML(csId);
                self.AddChange(csId, changesetXML,
                    function (csId, mapping) {
                        self.CloseChangeset(csId, continuation);
                        handleMapping(mapping);
                    }
                );

            }
        );
        
        this.userDetails.data.csCount++;
        this.userDetails.ping();
    }


    private OpenChangeset(comment: string, continuation: ((changesetId: string) => void)) {


        this.auth.xhr({
            method: 'PUT',
            path: '/api/0.6/changeset/create',
            options: { header: { 'Content-Type': 'text/xml' } },
            content: '<osm><changeset>' +
                '<tag k="created_by" v="MapComplete 0.0.0" />' +
                '<tag k="comment" v="' + comment + '"/>' +
                '</changeset></osm>'
        }, function (err, response) {
            if (response === undefined) {
                console.log("err", err);
                return;
            } else {
                continuation(response);
            }
        });
    }

    private AddChange(changesetId: string,
                      changesetXML: string,
                      continuation: ((changesetId: string, idMapping: any) => void)){
        this.auth.xhr({
            method: 'POST',
            options: { header: { 'Content-Type': 'text/xml' } },
            path: '/api/0.6/changeset/'+changesetId+'/upload',
            content: changesetXML
        }, function (err, response) {
            if (response == null) {
                console.log("err", err);
                return;
            }
            const mapping = OsmConnection.parseUploadChangesetResponse(response);
            console.log("Uplaoded changeset ", changesetId);
            continuation(changesetId, mapping);
        });
    }

    private CloseChangeset(changesetId: string, continuation : (() => void)) {
        console.log("closing");
        this.auth.xhr({
            method: 'PUT',
            path: '/api/0.6/changeset/'+changesetId+'/close',
        }, function (err, response) {
            if (response == null) {

                console.log("err", err);
            }
            console.log("Closed changeset ", changesetId);
            
            if(continuation !== undefined){
                continuation();
            }
        });
    }

}