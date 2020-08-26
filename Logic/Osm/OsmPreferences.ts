import {UIEventSource} from "../UIEventSource";
import {OsmConnection, UserDetails} from "./OsmConnection";
import {All} from "../../Customizations/Layouts/All";
import {Utils} from "../../Utils";

export class OsmPreferences {

    private auth: any;
    private userDetails: UIEventSource<UserDetails>;

    public preferences = new UIEventSource<any>({});
    public preferenceSources: any = {}

    constructor(auth, osmConnection: OsmConnection) {
        this.auth = auth;
        this.userDetails = osmConnection.userDetails;
        const self = this;
        osmConnection.OnLoggedIn(() => self.UpdatePreferences());
    }

    /**
     * OSM preferences can be at most 255 chars
     * @param key
     * @param prefix
     * @constructor
     */
    public GetLongPreference(key: string, prefix: string = "mapcomplete-"): UIEventSource<string> {
        const source = new UIEventSource<string>(undefined);

        const allStartWith = prefix + key + "-combined";
        // Gives the number of combined preferences
        const length = this.GetPreference(allStartWith + "-length", "");

        console.log("Getting long pref " + prefix + key);
        const self = this;
        source.addCallback(str => {
            if (str === undefined) {
                for (const prefKey in self.preferenceSources) {
                    if (prefKey.startsWith(allStartWith)) {
                        self.GetPreference(prefKey, "").setData(undefined);
                    }
                }
                return;
            }

            let i = 0;
            while (str !== "") {
                self.GetPreference(allStartWith + "-" + i, "").setData(str.substr(0, 255));
                str = str.substr(255);
                i++;
            }
            length.setData("" + i);
        });


        function updateData(l: number) {
            if (l === undefined) {
                source.setData(undefined);
                return;
            }
            const length = Number(l);
            let str = "";
            for (let i = 0; i < length; i++) {
                str += self.GetPreference(allStartWith + "-" + i, "").data;
            }
            source.setData(str);
            source.ping();
            console.log("Long preference ", key, " has ", str.length, " chars");
        }

        length.addCallback(l => {
            updateData(Number(l));
        });
        updateData(Number(length.data));

        return source;
    }

    public GetPreference(key: string, prefix: string = "mapcomplete-"): UIEventSource<string> {
        key = prefix + key;
        if(key.length >= 255){
            throw "Preferences: key length to big";
        }
        if (this.preferenceSources[key] !== undefined) {
            return this.preferenceSources[key];
        }
        if (this.userDetails.data.loggedIn && this.preferences.data[key] === undefined) {
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
            if (error) {
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

    private SetPreference(k: string, v: string) {
        if (!this.userDetails.data.loggedIn) {
            console.log("Not saving preference: user not logged in");
            return;
        }

        if (this.preferences.data[k] === v) {
            console.log("Not updating preference", k, " to ", v, "not changed");
            return;
        }
        console.log("Updating preference", k, " to ", Utils.EllipsesAfter(v, 15));

        this.preferences.data[k] = v;
        this.preferences.ping();

        if (v === "") {
            this.auth.xhr({
                method: 'DELETE',
                path: '/api/0.6/user/preferences/' + k,
                options: {header: {'Content-Type': 'text/plain'}},
            }, function (error, result) {
                if (error) {
                    console.log("Could not remove preference", error);
                    return;
                }

                console.log("Preference removed!", result == "" ? "OK" : result);

            });
            return;
        }


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


}