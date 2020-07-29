import {OsmConnection} from "./Logic/OsmConnection";
import {Changes} from "./Logic/Changes";
import {ElementStorage} from "./Logic/ElementStorage";
import {UIEventSource} from "./UI/UIEventSource";
import {UserBadge} from "./UI/UserBadge";
import {Basemap, BaseLayers} from "./Logic/Basemap";
import {PendingChanges} from "./UI/PendingChanges";
import {CenterMessageBox} from "./UI/CenterMessageBox";
import {Helpers} from "./Helpers";
import {Tag, TagUtils} from "./Logic/TagsFilter";
import {FilteredLayer} from "./Logic/FilteredLayer";
import {LayerUpdater} from "./Logic/LayerUpdater";
import {UIElement} from "./UI/UIElement";
import {FullScreenMessageBoxHandler} from "./UI/FullScreenMessageBoxHandler";
import {FeatureInfoBox} from "./UI/FeatureInfoBox";
import {GeoLocationHandler} from "./Logic/GeoLocationHandler";
import {StrayClickHandler} from "./Logic/StrayClickHandler";
import {SimpleAddUI} from "./UI/SimpleAddUI";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import {SearchAndGo} from "./UI/SearchAndGo";
import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";
import {CheckBox} from "./UI/Input/CheckBox";
import Translations from "./UI/i18n/Translations";
import Locale from "./UI/i18n/Locale";
import {Layout, WelcomeMessage} from "./Customizations/Layout";
import {DropDown} from "./UI/Input/DropDown";
import {FixedUiElement} from "./UI/Base/FixedUiElement";
import {LayerSelection} from "./UI/LayerSelection";
import Combine from "./UI/Base/Combine";
import {Img} from "./UI/Img";
import {QueryParameters} from "./Logic/QueryParameters";
import {Utils} from "./Utils";
import {LocalStorageSource} from "./Logic/LocalStorageSource";
import {Button} from "./UI/Base/Button";
import {TabbedComponent} from "./UI/Base/TabbedComponent";
import {ShareScreen} from "./UI/ShareScreen";
import {InitUiElements} from "./InitUiElements";


// --------------------- Special actions based on the parameters -----------------

// @ts-ignore
if (location.href.startsWith("http://buurtnatuur.be")) {
    // Reload the https version. This is important for the 'locate me' button
    window.location.replace("https://buurtnatuur.be");
}

if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    // Set to true if testing and changes should NOT be saved
    const testing = QueryParameters.GetQueryParameter("test", "true");
    testing.setData(testing.data ?? "true")
    // If you have a testfile somewhere, enable this to spoof overpass
    // This should be hosted independantly, e.g. with `cd assets; webfsd -p 8080` + a CORS plugin to disable cors rules
    //Overpass.testUrl = "http://127.0.0.1:8080/streetwidths.geojson";
}


// ----------------- SELECT THE RIGHT QUESTSET -----------------

let defaultLayout = "bookcases"

const path = window.location.pathname.split("/").slice(-1)[0];
if (path !== "index.html") {
    defaultLayout = path.substr(0, path.length - 5);
    console.log("Using", defaultLayout)
}

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

defaultLayout = QueryParameters.GetQueryParameter("layout", defaultLayout).data;

const layoutToUse: Layout = AllKnownLayouts.allSets[defaultLayout] ?? AllKnownLayouts["all"];
console.log("Using layout: ", layoutToUse.name);
if(layoutToUse === undefined){
    console.log("Incorrect layout")
}


// ----------------- Setup a few event sources -------------


// The message that should be shown at the center of the screen
const centerMessage = new UIEventSource<string>("");

// The countdown: if set to e.g. ten, it'll start counting down. When reaching zero, changes will be saved. NB: this is implemented later, not in the eventSource
const secondsTillChangesAreSaved = new UIEventSource<number>(0);

// const leftMessage = new UIEventSource<() => UIElement>(undefined);

// This message is shown full screen on mobile devices
const fullScreenMessage = new UIEventSource<UIElement>(undefined);

// The latest element that was selected - used to generate the right UI at the right place
const selectedElement = new UIEventSource<{ feature: any }>(undefined);

const zoom = QueryParameters.GetQueryParameter("z", undefined)
    .syncWith(LocalStorageSource.Get("zoom"));
const lat = QueryParameters.GetQueryParameter("lat", undefined)
    .syncWith(LocalStorageSource.Get("lat"));
const lon = QueryParameters.GetQueryParameter("lon", undefined)
    .syncWith(LocalStorageSource.Get("lon"));

const featureSwitchUserbadge = QueryParameters.GetQueryParameter("fs-userbadge", ""+layoutToUse.enableUserBadge);
const featureSwitchSearch = QueryParameters.GetQueryParameter("fs-search", ""+layoutToUse.enableSearch);
const featureSwitchWelcomeMessage = QueryParameters.GetQueryParameter("fs-welcome-message", "true");
const featureSwitchLayers = QueryParameters.GetQueryParameter("fs-layers", ""+layoutToUse.enableLayers);
const featureSwitchAddNew = QueryParameters.GetQueryParameter("fs-add-new", ""+layoutToUse.enableAdd);
const featureSwitchIframe = QueryParameters.GetQueryParameter("fs-iframe", "false");


const locationControl = new UIEventSource<{ lat: number, lon: number, zoom: number }>({
    zoom: Utils.asFloat(zoom.data) ?? layoutToUse.startzoom,
    lat: Utils.asFloat(lat.data) ?? layoutToUse.startLat,
    lon: Utils.asFloat(lon.data) ?? layoutToUse.startLon
});

locationControl.addCallback((latlonz) => {
    zoom.setData(latlonz.zoom.toString());
    lat.setData(latlonz.lat.toString().substr(0, 6));
    lon.setData(latlonz.lon.toString().substr(0, 6));
})


// ----------------- Prepare the important objects -----------------
const osmConnection: OsmConnection =  new OsmConnection(
    QueryParameters.GetQueryParameter("test", "false").data === "true",
    QueryParameters.GetQueryParameter("oauth_token", undefined)
);


Locale.language.syncWith(osmConnection.GetPreference("language"));

// @ts-ignore
window.setLanguage = function (language: string) {
    Locale.language.setData(language)
}

Locale.language.addCallback((currentLanguage) => {
    console.log("REsetting languate to", layoutToUse.supportedLanguages[0])
    if (layoutToUse.supportedLanguages.indexOf(currentLanguage) < 0) {
        // The current language is not supported -> switch to a supported one
        Locale.language.setData(layoutToUse.supportedLanguages[0]);
    }
}).ping()


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
    name: string | UIElement,
    description: string | UIElement,
    icon: string,
    tags: Tag[],
    layerToAddTo: FilteredLayer
}[]
    = [];

const flayers: FilteredLayer[] = []

let minZoom = 0;

for (const layer of layoutToUse.layers) {

    const generateInfo = (tagsES, feature) => {

        return new FeatureInfoBox(
            feature,
            tagsES,
            layer.title,
            layer.elementsToShow,
            changes,
            osmConnection.userDetails
        )
    };

    minZoom = Math.max(minZoom, layer.minzoom);

    const flayer = FilteredLayer.fromDefinition(layer, bm, allElements, changes, osmConnection.userDetails, selectedElement, generateInfo);

    for (const preset of layer.presets ?? []) {

        if (preset.icon === undefined) {
            const tags = {};
            for (const tag of preset.tags) {
                const k = tag.key;
                if (typeof (k) === "string") {
                    tags[k] = tag.value;
                }
            }
            preset.icon = layer.style(tags)?.icon?.iconUrl;
        }

        const addButton = {
            name: preset.title,
            description: preset.description,
            icon: preset.icon,
            tags: preset.tags,
            layerToAddTo: flayer
        }
        addButtons.push(addButton);
    }
    flayers.push(flayer);
}

const layerUpdater = new LayerUpdater(bm, minZoom, flayers);


// --------------- Setting up layer selection ui --------

const closedFilterButton = `<button id="filter__button" class="filter__button shadow">${Img.closedFilterButton}</button>`;

const openFilterButton = `
<button id="filter__button" class="filter__button">${Img.openFilterButton}</button>`;

let baseLayerOptions =  BaseLayers.baseLayers.map((layer) => {return {value: layer, shown: layer.name}});
const backgroundMapPicker = new Combine([new DropDown(`Background map`, baseLayerOptions, bm.CurrentLayer), openFilterButton]);
const layerSelection = new Combine([`<p class="filter__label">Maplayers</p>`, new LayerSelection(flayers)]);
let layerControl = backgroundMapPicker;
if (flayers.length > 1) {
    layerControl = new Combine([layerSelection, backgroundMapPicker]);
}

InitUiElements.OnlyIf(featureSwitchLayers, () => {

    const checkbox = new CheckBox(layerControl, closedFilterButton);
    checkbox.AttachTo("filter__selection");
    bm.Location.addCallback(() => {
        checkbox.isEnabled.setData(false);
    });
    
});


// ------------------ Setup various other UI elements ------------

document.title = Translations.W(layoutToUse.title).InnerRender();

Locale.language.addCallback(e => {
    document.title = Translations.W(layoutToUse.title).InnerRender();
})


InitUiElements.OnlyIf(featureSwitchAddNew, () => {
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
});


/**
 * Show the questions and information for the selected element
 * This is given to the div which renders fullscreen on mobile devices
 */
selectedElement.addCallback((feature) => {
    if (feature?.feature?.properties === undefined) {
        return;
    }
    const data = feature.feature.properties;
    // Which is the applicable set?
    for (const layer of layoutToUse.layers) {

        const applicable = layer.overpassFilter.matches(TagUtils.proprtiesToKV(data));
        if (applicable) {
            // This layer is the layer that gives the questions

            const featureBox = new FeatureInfoBox(
                feature.feature,
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


const pendingChanges = new PendingChanges(changes, secondsTillChangesAreSaved,);

InitUiElements.OnlyIf(featureSwitchUserbadge, () => {

    new UserBadge(osmConnection.userDetails,
        pendingChanges,
        Locale.CreateLanguagePicker(layoutToUse),
        bm)
        .AttachTo('userbadge');
});

InitUiElements.OnlyIf((featureSwitchSearch), () => {
    new SearchAndGo(bm).AttachTo("searchbox");
});

new FullScreenMessageBoxHandler(fullScreenMessage, () => {
    selectedElement.setData(undefined)
}).update();

InitUiElements.OnlyIf(featureSwitchWelcomeMessage, () => {
    InitUiElements.InitWelcomeMessage(layoutToUse, osmConnection, bm, fullScreenMessage)
});

if ((window != window.top && featureSwitchWelcomeMessage.data === "false") || featureSwitchIframe.data !== "false") {
    console.log("WELCOME? ",featureSwitchWelcomeMessage.data)
    new FixedUiElement(`<a href='${window.location}' target='_blank'><span class='iframe-escape'><img src='assets/pop-out.svg'></span></a>`).AttachTo("top-right")
}


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


locationControl.ping()

