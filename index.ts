import {OsmConnection} from "./Logic/OsmConnection";
import {Changes} from "./Logic/Changes";
import {ElementStorage} from "./Logic/ElementStorage";
import {UIEventSource} from "./UI/UIEventSource";
import {UserBadge} from "./UI/UserBadge";
import {Basemap} from "./Logic/Basemap";
import {PendingChanges} from "./UI/PendingChanges";
import {CenterMessageBox} from "./UI/CenterMessageBox";
import {Helpers} from "./Helpers";
import {Tag, TagUtils} from "./Logic/TagsFilter";
import {FilteredLayer} from "./Logic/FilteredLayer";
import {LayerUpdater} from "./Logic/LayerUpdater";
import {UIElement} from "./UI/UIElement";
import {FullScreenMessageBoxHandler} from "./UI/FullScreenMessageBoxHandler";
import {Overpass} from "./Logic/Overpass";
import {FeatureInfoBox} from "./UI/FeatureInfoBox";
import {GeoLocationHandler} from "./Logic/GeoLocationHandler";
import {StrayClickHandler} from "./Logic/StrayClickHandler";
import {SimpleAddUI} from "./UI/SimpleAddUI";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import {SearchAndGo} from "./UI/SearchAndGo";
import {CollapseButton} from "./UI/Base/CollapseButton";
import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";
import {All} from "./Customizations/Layouts/All";
import Translations from "./UI/i18n/Translations";
import Translation from "./UI/i18n/Translation";
import Locale from "./UI/i18n/Locale";
import {Layout, WelcomeMessage} from "./Customizations/Layout";
import {DropDown} from "./UI/Input/DropDown";
import {FixedInputElement} from "./UI/Input/FixedInputElement";
import {FixedUiElement} from "./UI/Base/FixedUiElement";
import ParkingType from "./Customizations/Questions/bike/ParkingType";


// --------------------- Read the URL parameters -----------------

// @ts-ignore
if (location.href.startsWith("http://buurtnatuur.be")) {
    // Reload the https version. This is important for the 'locate me' button
    window.location.replace("https://buurtnatuur.be");
}


let dryRun = false;

if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {

    // Set to true if testing and changes should NOT be saved
    dryRun = true;
    // If you have a testfile somewhere, enable this to spoof overpass
    // This should be hosted independantly, e.g. with `cd assets; webfsd -p 8080` + a CORS plugin to disable cors rules
    //Overpass.testUrl = "http://127.0.0.1:8080/streetwidths.geojson";
}


// ----------------- SELECT THE RIGHT QUESTSET -----------------


let defaultLayout = "buurtnatuur"


// Run over all questsets. If a part of the URL matches a searched-for part in the layout, it'll take that as the default
for (const k in AllKnownLayouts.allSets) {
    const layout = AllKnownLayouts.allSets[k];
    const possibleParts = layout.locationContains ?? [];
    for (const locationMatch of possibleParts) {
        if (locationMatch === "") {
            continue
        }
        if (window.location.href.toLowerCase().indexOf(locationMatch.toLowerCase()) >= 0) {
            defaultLayout = layout.name;
        }
    }
}

// Read the query string to grap settings
let paramDict: any = {};
if (window.location.search) {
    const params = window.location.search.substr(1).split("&");
    for (const param of params) {
        var kv = param.split("=");
        paramDict[kv[0]] = kv[1];
    }
}

if (paramDict.layout) {
    defaultLayout = paramDict.layout
}

if (paramDict.test) {
    dryRun = paramDict.test === "true";
}

const layoutToUse: Layout = AllKnownLayouts.allSets[defaultLayout];
console.log("Using layout: ", layoutToUse.name);

document.title = layoutToUse.title.InnerRender();
Locale.language.addCallback(e => {
    document.title = layoutToUse.title.InnerRender();
})


// ----------------- Setup a few event sources -------------


// const LanguageSelect = document.getElementById('language-select') as HTMLOptionElement
// eLanguageSelect.addEventListener('selectionchange')


// The message that should be shown at the center of the screen
const centerMessage = new UIEventSource<string>("");

// The countdown: if set to e.g. ten, it'll start counting down. When reaching zero, changes will be saved. NB: this is implemented later, not in the eventSource
const secondsTillChangesAreSaved = new UIEventSource<number>(0);

// const leftMessage = new UIEventSource<() => UIElement>(undefined);

// This message is shown full screen on mobile devices
const fullScreenMessage = new UIEventSource<UIElement>(undefined);

const selectedElement = new UIEventSource<any>(undefined);


const locationControl = new UIEventSource<{ lat: number, lon: number, zoom: number }>({
    zoom: layoutToUse.startzoom,
    lat: layoutToUse.startLat,
    lon: layoutToUse.startLon
});


// ----------------- Prepare the important objects -----------------

const osmConnection = new OsmConnection(dryRun);


Locale.language.syncWith(osmConnection.GetPreference("language"));

// @ts-ignore
window.setLanguage = function (language: string) {
    Locale.language.setData(language)
}


const saveTimeout = 30000; // After this many milliseconds without changes, saves are sent of to OSM
const allElements = new ElementStorage();
const changes = new Changes(
    "Beantwoorden van vragen met #MapComplete voor vragenset #" + layoutToUse.name,
    osmConnection, allElements);
const bm = new Basemap("leafletDiv", locationControl, new VariableUiElement(
    locationControl.map((location) => {
        const mapComplete = "<a href='https://github.com/pietervdvn/MapComplete' target='_blank'>Mapcomple</a> " +
            " " +
            "<a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'><img src='./assets/bug.svg' alt='Report bug'  class='small-userbadge-icon'></a>";
        let editHere = "";
        if (location !== undefined) {
            editHere = " | " +
                "<a href='https://www.openstreetmap.org/edit?editor=id#map=" + location.zoom + "/" + location.lat + "/" + location.lon + "' target='_blank'>" +
                "<img src='./assets/pencil.svg' alt='edit here' class='small-userbadge-icon'>" +
                "</a>"
        }
        return mapComplete + editHere;

    })
));


// ------------- Setup the layers -------------------------------
const addButtons: {
    name: string,
    icon: string,
    tags: Tag[],
    layerToAddTo: FilteredLayer
}[]
    = [];

const flayers: FilteredLayer[] = []

let minZoom = 0;

for (const layer of layoutToUse.layers) {

    const generateInfo = (tagsES) => {

        return new FeatureInfoBox(
            tagsES,
            layer.title,
            layer.elementsToShow,
            changes,
            osmConnection.userDetails
        )
    };

    minZoom = Math.max(minZoom, layer.minzoom);

    const flayer = layer.asLayer(bm, allElements, changes, osmConnection.userDetails, selectedElement, generateInfo);

    const addButton = {
        name: layer.name,
        icon: layer.icon,
        tags: layer.newElementTags,
        layerToAddTo: flayer
    }
    addButtons.push(addButton);
    flayers.push(flayer);
}

const layerUpdater = new LayerUpdater(bm, minZoom, flayers);


// ------------------ Setup various UI elements ------------

let languagePicker = new DropDown(" ", layoutToUse.supportedLanguages.map(lang => {
        return {value: lang, shown: lang}
    }
), Locale.language).AttachTo("language-select");


new StrayClickHandler(bm, selectedElement, fullScreenMessage, () => {
        return new SimpleAddUI(bm.Location,
            bm.LastClickLocation,
            changes,
            selectedElement,
            layerUpdater.runningQuery,
            osmConnection.userDetails,
            addButtons);
    }
);

/**
 * Show the questions and information for the selected element on the fullScreen
 */
selectedElement.addCallback((data) => {
    // Which is the applicable set?
    for (const layer of layoutToUse.layers) {

        const applicable = layer.overpassFilter.matches(TagUtils.proprtiesToKV(data));
        if (applicable) {
            // This layer is the layer that gives the questions

            const featureBox = new FeatureInfoBox(
                allElements.getElement(data.id),
                layer.title,
                layer.elementsToShow,
                changes,
                osmConnection.userDetails
            );

            fullScreenMessage.setData(featureBox);
            break;
        }
    }
    }
);


const pendingChanges = new PendingChanges(
    changes, secondsTillChangesAreSaved,);

new UserBadge(osmConnection.userDetails,
    pendingChanges,
    new FixedUiElement(""),
    bm)
    .AttachTo('userbadge');

new SearchAndGo(bm).AttachTo("searchbox");

new CollapseButton("messagesbox")
    .AttachTo("collapseButton");
new WelcomeMessage(layoutToUse, osmConnection).AttachTo("messagesbox");
fullScreenMessage.setData(
    new WelcomeMessage(layoutToUse, osmConnection)
);


new FullScreenMessageBoxHandler(fullScreenMessage, () => {
    selectedElement.setData(undefined)
}).update();

// fullScreenMessage.setData(generateWelcomeMessage());


new CenterMessageBox(
    minZoom,
    centerMessage,
    osmConnection,
    locationControl,
    layerUpdater.runningQuery)
    .AttachTo("centermessage");


Helpers.SetupAutoSave(changes, secondsTillChangesAreSaved, saveTimeout);
Helpers.LastEffortSave(changes);

osmConnection.registerActivateOsmAUthenticationClass();


new GeoLocationHandler(bm).AttachTo("geolocate-button");


// --------------- Send a ping to start various action --------

locationControl.ping();


window.setTimeout(() => {Locale.language.setData("nl")}, 5000)