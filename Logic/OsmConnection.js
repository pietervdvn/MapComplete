"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OsmConnection = exports.UserDetails = void 0;
// @ts-ignore
var osm_auth_1 = require("osm-auth");
var UIEventSource_1 = require("../UI/UIEventSource");
var UserDetails = /** @class */ (function () {
    function UserDetails() {
        this.loggedIn = false;
        this.name = "Not logged in";
        this.csCount = 0;
        this.unreadMessages = 0;
        this.totalMessages = 0;
    }
    return UserDetails;
}());
exports.UserDetails = UserDetails;
var OsmConnection = /** @class */ (function () {
    function OsmConnection(dryRun) {
        this.auth = new osm_auth_1.default({
            oauth_consumer_key: 'hivV7ec2o49Two8g9h8Is1VIiVOgxQ1iYexCbvem',
            oauth_secret: 'wDBRTCem0vxD7txrg1y6p5r8nvmz8tAhET7zDASI',
            auto: true // show a login form if the user is not authenticated and
            // you try to do a call
        });
        this.preferences = new UIEventSource_1.UIEventSource({});
        this.preferenceSources = {};
        this.userDetails = new UIEventSource_1.UIEventSource(new UserDetails());
        this.userDetails.data.osmConnection = this;
        this.userDetails.data.dryRun = dryRun;
        this._dryRun = dryRun;
        if (this.auth.authenticated()) {
            this.AttemptLogin(); // Also updates the user badge
        }
        else {
            console.log("Not authenticated");
        }
        if (dryRun) {
            console.log("DRYRUN ENABLED");
        }
    }
    OsmConnection.prototype.LogOut = function () {
        this.auth.logout();
        this.userDetails.data.loggedIn = false;
        this.userDetails.ping();
        console.log("Logged out");
    };
    OsmConnection.prototype.AttemptLogin = function () {
        var self = this;
        this.auth.xhr({
            method: 'GET',
            path: '/api/0.6/user/details'
        }, function (err, details) {
            var _a;
            if (err != null) {
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
            var userInfo = details.getElementsByTagName("user")[0];
            // let moreDetails = new DOMParser().parseFromString(userInfo.innerHTML, "text/xml");
            var data = self.userDetails.data;
            data.loggedIn = true;
            console.log("Login completed, userinfo is ", userInfo);
            data.name = userInfo.getAttribute('display_name');
            data.csCount = userInfo.getElementsByTagName("changesets")[0].getAttribute("count");
            data.img = undefined;
            var imgEl = userInfo.getElementsByTagName("img");
            if (imgEl !== undefined && imgEl[0] !== undefined) {
                data.img = imgEl[0].getAttribute("href");
            }
            data.img = (_a = data.img) !== null && _a !== void 0 ? _a : "./assets/osm-logo.svg";
            var homeEl = userInfo.getElementsByTagName("home");
            if (homeEl !== undefined && homeEl[0] !== undefined) {
                var lat = parseFloat(homeEl[0].getAttribute("lat"));
                var lon = parseFloat(homeEl[0].getAttribute("lon"));
                data.home = { lat: lat, lon: lon };
            }
            var messages = userInfo.getElementsByTagName("messages")[0].getElementsByTagName("received")[0];
            data.unreadMessages = parseInt(messages.getAttribute("unread"));
            data.totalMessages = parseInt(messages.getAttribute("count"));
            self.userDetails.ping();
        });
    };
    /**
     * All elements with class 'activate-osm-authentication' are loaded and get an 'onclick' to authenticate
     */
    OsmConnection.prototype.registerActivateOsmAUthenticationClass = function () {
        var self = this;
        var authElements = document.getElementsByClassName("activate-osm-authentication");
        for (var i = 0; i < authElements.length; i++) {
            var element = authElements.item(i);
            // @ts-ignore
            element.onclick = function () {
                self.AttemptLogin();
            };
        }
    };
    OsmConnection.prototype.GetPreference = function (key) {
        var _this = this;
        if (this.preferenceSources[key] !== undefined) {
            return this.preferenceSources[key];
        }
        if (this.userDetails.data.loggedIn) {
            this.UpdatePreferences();
        }
        var pref = new UIEventSource_1.UIEventSource(this.preferences.data[key]);
        pref.addCallback(function (v) {
            _this.SetPreference(key, v);
        });
        this.preferences.addCallback(function (prefs) {
            if (prefs[key] !== undefined) {
                pref.setData(prefs[key]);
            }
        });
        this.preferenceSources[key] = pref;
        return pref;
    };
    OsmConnection.prototype.UpdatePreferences = function () {
        var self = this;
        this.auth.xhr({
            method: 'GET',
            path: '/api/0.6/user/preferences'
        }, function (error, value) {
            if (error) {
                console.log("Could not load preferences", error);
                return;
            }
            var prefs = value.getElementsByTagName("preference");
            for (var i = 0; i < prefs.length; i++) {
                var pref = prefs[i];
                var k = pref.getAttribute("k");
                var v = pref.getAttribute("v");
                self.preferences.data[k] = v;
            }
            self.preferences.ping();
        });
    };
    OsmConnection.prototype.SetPreference = function (k, v) {
        if (!this.userDetails.data.loggedIn) {
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
            options: { header: { 'Content-Type': 'text/plain' } },
            content: v
        }, function (error, result) {
            if (error) {
                console.log("Could not set preference", error);
                return;
            }
            console.log("Preference written!", result == "" ? "OK" : result);
        });
    };
    OsmConnection.parseUploadChangesetResponse = function (response) {
        var nodes = response.getElementsByTagName("node");
        var mapping = {};
        // @ts-ignore
        for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
            var node = nodes_1[_i];
            var oldId = parseInt(node.attributes.old_id.value);
            var newId = parseInt(node.attributes.new_id.value);
            if (oldId !== undefined && newId !== undefined &&
                !isNaN(oldId) && !isNaN(newId)) {
                mapping["node/" + oldId] = "node/" + newId;
            }
        }
        return mapping;
    };
    OsmConnection.prototype.UploadChangeset = function (comment, generateChangeXML, handleMapping, continuation) {
        if (this._dryRun) {
            console.log("NOT UPLOADING as dryrun is true");
            var changesetXML = generateChangeXML("123456");
            console.log(changesetXML);
            continuation();
            return;
        }
        var self = this;
        this.OpenChangeset(comment, function (csId) {
            var changesetXML = generateChangeXML(csId);
            self.AddChange(csId, changesetXML, function (csId, mapping) {
                self.CloseChangeset(csId, continuation);
                handleMapping(mapping);
            });
        });
        this.userDetails.data.csCount++;
        this.userDetails.ping();
    };
    OsmConnection.prototype.OpenChangeset = function (comment, continuation) {
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
            }
            else {
                continuation(response);
            }
        });
    };
    OsmConnection.prototype.AddChange = function (changesetId, changesetXML, continuation) {
        this.auth.xhr({
            method: 'POST',
            options: { header: { 'Content-Type': 'text/xml' } },
            path: '/api/0.6/changeset/' + changesetId + '/upload',
            content: changesetXML
        }, function (err, response) {
            if (response == null) {
                console.log("err", err);
                return;
            }
            var mapping = OsmConnection.parseUploadChangesetResponse(response);
            console.log("Uplaoded changeset ", changesetId);
            continuation(changesetId, mapping);
        });
    };
    OsmConnection.prototype.CloseChangeset = function (changesetId, continuation) {
        console.log("closing");
        this.auth.xhr({
            method: 'PUT',
            path: '/api/0.6/changeset/' + changesetId + '/close',
        }, function (err, response) {
            if (response == null) {
                console.log("err", err);
            }
            console.log("Closed changeset ", changesetId);
            if (continuation !== undefined) {
                continuation();
            }
        });
    };
    return OsmConnection;
}());
exports.OsmConnection = OsmConnection;
