"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var OsmConnection_1 = require("./Logic/OsmConnection");
var Changes_1 = require("./Logic/Changes");
var ElementStorage_1 = require("./Logic/ElementStorage");
var UIEventSource_1 = require("./UI/UIEventSource");
var UserBadge_1 = require("./UI/UserBadge");
var Basemap_1 = require("./Logic/Basemap");
var PendingChanges_1 = require("./UI/PendingChanges");
var CenterMessageBox_1 = require("./UI/CenterMessageBox");
var Helpers_1 = require("./Helpers");
var TagsFilter_1 = require("./Logic/TagsFilter");
var LayerUpdater_1 = require("./Logic/LayerUpdater");
var MessageBoxHandler_1 = require("./UI/MessageBoxHandler");
var FeatureInfoBox_1 = require("./UI/FeatureInfoBox");
var GeoLocationHandler_1 = require("./Logic/GeoLocationHandler");
var StrayClickHandler_1 = require("./Logic/StrayClickHandler");
var SimpleAddUI_1 = require("./UI/SimpleAddUI");
var VariableUIElement_1 = require("./UI/Base/VariableUIElement");
var SearchAndGo_1 = require("./UI/SearchAndGo");
var CollapseButton_1 = require("./UI/Base/CollapseButton");
var AllKnownLayouts_1 = require("./Customizations/AllKnownLayouts");
// --------------------- Read the URL parameters -----------------
// @ts-ignore
if (location.href.startsWith("http://buurtnatuur.be")) {
    // Reload the https version. This is important for the 'locate me' button
    window.location.replace("https://buurtnatuur.be");
}
var dryRun = false;
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    // Set to true if testing and changes should NOT be saved
    dryRun = true;
    // If you have a testfile somewhere, enable this to spoof overpass
    // This should be hosted independantly, e.g. with `cd assets; webfsd -p 8080` + a CORS plugin to disable cors rules
    //Overpass.testUrl = "http://127.0.0.1:8080/streetwidths.geojson";
}
// ----------------- SELECT THE RIGHT QUESTSET -----------------
var defaultLayout = "buurtnatuur";
// Run over all questsets. If a part of the URL matches a searched-for part in the layout, it'll take that as the default
for (var k in AllKnownLayouts_1.AllKnownLayouts.allSets) {
    var layout = AllKnownLayouts_1.AllKnownLayouts.allSets[k];
    var possibleParts = (_a = layout.locationContains) !== null && _a !== void 0 ? _a : [];
    for (var _i = 0, possibleParts_1 = possibleParts; _i < possibleParts_1.length; _i++) {
        var locationMatch = possibleParts_1[_i];
        if (locationMatch === "") {
            continue;
        }
        if (window.location.href.toLowerCase().indexOf(locationMatch.toLowerCase()) >= 0) {
            defaultLayout = layout.name;
        }
    }
}
// Read the query string to grap settings
var paramDict = {};
if (window.location.search) {
    var params = window.location.search.substr(1).split("&");
    for (var _b = 0, params_1 = params; _b < params_1.length; _b++) {
        var param = params_1[_b];
        var kv = param.split("=");
        paramDict[kv[0]] = kv[1];
    }
}
if (paramDict.layout) {
    defaultLayout = paramDict.layout;
}
if (paramDict.test) {
    dryRun = paramDict.test === "true";
}
var layoutToUse = AllKnownLayouts_1.AllKnownLayouts.allSets[defaultLayout];
console.log("Using layout: ", layoutToUse.name);
document.title = layoutToUse.title;
// ----------------- Setup a few event sources -------------
// The message that should be shown at the center of the screen
var centerMessage = new UIEventSource_1.UIEventSource("");
// The countdown: if set to e.g. ten, it'll start counting down. When reaching zero, changes will be saved. NB: this is implemented later, not in the eventSource
var secondsTillChangesAreSaved = new UIEventSource_1.UIEventSource(0);
var leftMessage = new UIEventSource_1.UIEventSource(undefined);
var selectedElement = new UIEventSource_1.UIEventSource(undefined);
var locationControl = new UIEventSource_1.UIEventSource({
    zoom: layoutToUse.startzoom,
    lat: layoutToUse.startLat,
    lon: layoutToUse.startLon
});
// ----------------- Prepare the important objects -----------------
var saveTimeout = 30000; // After this many milliseconds without changes, saves are sent of to OSM
var allElements = new ElementStorage_1.ElementStorage();
var osmConnection = new OsmConnection_1.OsmConnection(dryRun);
var changes = new Changes_1.Changes("Beantwoorden van vragen met #MapComplete voor vragenset #" + layoutToUse.name, osmConnection, allElements);
var bm = new Basemap_1.Basemap("leafletDiv", locationControl, new VariableUIElement_1.VariableUiElement(locationControl.map(function (location) {
    var mapComplete = "<a href='https://github.com/pietervdvn/MapComplete' target='_blank'>Mapcomple</a> " +
        " " +
        "<a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'><img src='./assets/bug.svg' alt='Report bug'  class='small-userbadge-icon'></a>";
    var editHere = "";
    if (location !== undefined) {
        editHere = " | " +
            "<a href='https://www.openstreetmap.org/edit?editor=id#map=" + location.zoom + "/" + location.lat + "/" + location.lon + "' target='_blank'>" +
            "<img src='./assets/pencil.svg' alt='edit here' class='small-userbadge-icon'>" +
            "</a>";
    }
    return mapComplete + editHere;
})));
// ------------- Setup the layers -------------------------------
var controls = {};
var addButtons = [];
var flayers = [];
var minZoom = 0;
var _loop_1 = function (layer) {
    var generateInfo = function (tagsES) {
        return new FeatureInfoBox_1.FeatureInfoBox(tagsES, layer.title, layer.elementsToShow, changes, osmConnection.userDetails);
    };
    minZoom = Math.max(minZoom, layer.minzoom);
    var flayer = layer.asLayer(bm, allElements, changes, osmConnection.userDetails, selectedElement, generateInfo);
    controls[layer.name] = flayer.isDisplayed;
    var addButton = {
        name: layer.name,
        icon: layer.icon,
        tags: layer.newElementTags,
        layerToAddTo: flayer
    };
    addButtons.push(addButton);
    flayers.push(flayer);
};
for (var _c = 0, _d = layoutToUse.layers; _c < _d.length; _c++) {
    var layer = _d[_c];
    _loop_1(layer);
}
var layerUpdater = new LayerUpdater_1.LayerUpdater(bm, minZoom, flayers);
// ------------------ Setup various UI elements ------------
new StrayClickHandler_1.StrayClickHandler(bm, selectedElement, leftMessage, function () {
    return new SimpleAddUI_1.SimpleAddUI(bm.Location, bm.LastClickLocation, changes, selectedElement, layerUpdater.runningQuery, osmConnection.userDetails, addButtons);
});
/**
 * Show the questions and information for the selected element on the leftMessage
 */
selectedElement.addCallback(function (data) {
    var _loop_2 = function (layer) {
        var applicable = layer.overpassFilter.matches(TagsFilter_1.TagUtils.proprtiesToKV(data));
        if (applicable) {
            // This layer is the layer that gives the questions
            leftMessage.setData(function () {
                return new FeatureInfoBox_1.FeatureInfoBox(allElements.getElement(data.id), layer.title, layer.elementsToShow, changes, osmConnection.userDetails);
            });
            return "break";
        }
    };
    // Which is the applicable set?
    for (var _i = 0, _a = layoutToUse.layers; _i < _a.length; _i++) {
        var layer = _a[_i];
        var state_1 = _loop_2(layer);
        if (state_1 === "break")
            break;
    }
});
var pendingChanges = new PendingChanges_1.PendingChanges(changes, secondsTillChangesAreSaved);
new UserBadge_1.UserBadge(osmConnection.userDetails, pendingChanges, bm)
    .AttachTo('userbadge');
new SearchAndGo_1.SearchAndGo(bm).AttachTo("searchbox");
new CollapseButton_1.CollapseButton("messagesbox")
    .AttachTo("collapseButton");
var welcomeMessage = function () {
    return new VariableUIElement_1.VariableUiElement(osmConnection.userDetails.map(function (userdetails) {
        var login = layoutToUse.gettingStartedPlzLogin;
        if (userdetails.loggedIn) {
            login = layoutToUse.welcomeBackMessage;
        }
        return "<div id='welcomeMessage'>" +
            layoutToUse.welcomeMessage + login + layoutToUse.welcomeTail +
            "</div>";
    }), function () {
        osmConnection.registerActivateOsmAUthenticationClass();
    });
};
leftMessage.setData(welcomeMessage);
welcomeMessage().AttachTo("messagesbox");
var messageBox = new MessageBoxHandler_1.MessageBoxHandler(leftMessage, function () {
    selectedElement.setData(undefined);
});
new CenterMessageBox_1.CenterMessageBox(minZoom, centerMessage, osmConnection, locationControl, layerUpdater.runningQuery)
    .AttachTo("centermessage");
Helpers_1.Helpers.SetupAutoSave(changes, secondsTillChangesAreSaved, saveTimeout);
Helpers_1.Helpers.LastEffortSave(changes);
osmConnection.registerActivateOsmAUthenticationClass();
new GeoLocationHandler_1.GeoLocationHandler(bm).AttachTo("geolocate-button");
// --------------- Send a ping to start various action --------
locationControl.ping();
messageBox.update();
