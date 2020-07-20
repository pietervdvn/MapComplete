"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserBadge = void 0;
var UIElement_1 = require("./UIElement");
var leaflet_1 = require("leaflet");
var FixedUiElement_1 = require("./Base/FixedUiElement");
var VariableUIElement_1 = require("./Base/VariableUIElement");
/**
 * Handles and updates the user badge
 */
var UserBadge = /** @class */ (function (_super) {
    __extends(UserBadge, _super);
    function UserBadge(userDetails, pendingChanges, basemap) {
        var _this = _super.call(this, userDetails) || this;
        _this._userDetails = userDetails;
        _this._pendingChanges = pendingChanges;
        _this._basemap = basemap;
        _this._logout = new FixedUiElement_1.FixedUiElement("<img src='assets/logout.svg' class='small-userbadge-icon' alt='logout'>")
            .onClick(function () {
            userDetails.data.osmConnection.LogOut();
        });
        userDetails.addCallback(function () {
            var profilePic = document.getElementById("profile-pic");
            if (profilePic) {
                profilePic.onload = function () {
                    profilePic.style.opacity = "1";
                };
            }
        });
        _this._homeButton = new VariableUIElement_1.VariableUiElement(userDetails.map(function (userinfo) {
            if (userinfo.home) {
                return "<img id='home' src='./assets/home.svg' alt='home' class='small-userbadge-icon'> ";
            }
            return "";
        })).onClick(function () {
            var _a;
            var home = (_a = userDetails.data) === null || _a === void 0 ? void 0 : _a.home;
            if (home === undefined) {
                return;
            }
            basemap.map.flyTo([home.lat, home.lon], 18);
        });
        return _this;
    }
    UserBadge.prototype.InnerRender = function () {
        var user = this._userDetails.data;
        if (!user.loggedIn) {
            return "<div class='activate-osm-authentication'>Klik hier om aan te melden bij OSM</div>";
        }
        var messageSpan = "<span id='messages'>" +
            "     <a href='https://www.openstreetmap.org/messages/inbox' target='_blank'><img class='small-userbadge-icon' src='./assets/envelope.svg' alt='msgs'>" +
            user.totalMessages +
            "</a></span>";
        if (user.unreadMessages > 0) {
            messageSpan = "<span id='messages' class='alert'>" +
                "     <a href='https://www.openstreetmap.org/messages/inbox' target='_blank'><img class='small-userbadge-icon' src='./assets/envelope.svg' alt='msgs'/>" +
                " " +
                "" +
                user.unreadMessages.toString() +
                "</a></span>";
        }
        var dryrun = "";
        if (user.dryRun) {
            dryrun = " <span class='alert'>TESTING</span>";
        }
        if (user.home !== undefined) {
            var icon = leaflet_1.default.icon({
                iconUrl: 'assets/home.svg',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            leaflet_1.default.marker([user.home.lat, user.home.lon], { icon: icon }).addTo(this._basemap.map);
        }
        var settings = "<a href='https://www.openstreetmap.org/user/" + encodeURIComponent(user.name) + "/account' target='_blank'>" +
            "<img class='small-userbadge-icon' src='./assets/gear.svg' alt='settings'>" +
            "</a> ";
        return "<a href='https://www.openstreetmap.org/user/" + encodeURIComponent(user.name) + "' target='_blank'>" +
            "<img id='profile-pic' src='" + user.img + "' alt='profile-pic'/> " +
            "</a>" +
            "<div id='usertext'>" +
            "<p id='username'>" +
            "<a href='https://www.openstreetmap.org/user/" + user.name + "' target='_blank'>" + user.name + "</a>" +
            dryrun +
            "</p> " +
            "<p id='userstats'>" +
            this._homeButton.Render() +
            settings +
            messageSpan +
            "<span id='csCount'> " +
            "   <a href='https://www.openstreetmap.org/user/" + user.name + "/history' target='_blank'><img class='small-userbadge-icon' src='./assets/star.svg' alt='star'/> " + user.csCount +
            "</a></span> " +
            this._logout.Render() +
            this._pendingChanges.Render() +
            "</p>" +
            "</div>";
    };
    return UserBadge;
}(UIElement_1.UIElement));
exports.UserBadge = UserBadge;
