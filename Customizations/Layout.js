"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Layout = void 0;
/**
 * A layout is a collection of settings of the global view (thus: welcome text, title, selection of layers).
 */
var Layout = /** @class */ (function () {
    /**
     *
     * @param name: The name used in the query string. If in the query "quests=<name>" is defined, it will select this layout
     * @param title: Will be used in the <title> of the page
     * @param layers: The layers to show, a list of LayerDefinitions
     * @param startzoom: The initial starting zoom of the map
     * @param startLat:The initial starting latitude of the map
     * @param startLon: the initial starting longitude of the map
     * @param welcomeMessage: This message is shown in the collapsable box on the left
     * @param gettingStartedPlzLogin: This is shown below the welcomemessage and wrapped in a login link.
     * @param welcomeBackMessage: This is shown when the user is logged in
     * @param welcomeTail: This text is shown below the login message. It is ideal for extra help
     */
    function Layout(name, title, layers, startzoom, startLat, startLon, welcomeMessage, gettingStartedPlzLogin, welcomeBackMessage, welcomeTail) {
        if (gettingStartedPlzLogin === void 0) { gettingStartedPlzLogin = "Please login to get started"; }
        if (welcomeBackMessage === void 0) { welcomeBackMessage = "You are logged in. Welcome back!"; }
        if (welcomeTail === void 0) { welcomeTail = ""; }
        this.title = title;
        this.startLon = startLon;
        this.startLat = startLat;
        this.startzoom = startzoom;
        this.name = name;
        this.layers = layers;
        this.welcomeMessage = welcomeMessage;
        this.gettingStartedPlzLogin = gettingStartedPlzLogin;
        this.welcomeBackMessage = welcomeBackMessage;
        this.welcomeTail = welcomeTail;
    }
    return Layout;
}());
exports.Layout = Layout;
