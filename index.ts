import {ElementStorage} from "./Logic/ElementStorage";
import {UIEventSource} from "./UI/UIEventSource";
import {UserBadge} from "./UI/UserBadge";
import {PendingChanges} from "./UI/PendingChanges";
import {CenterMessageBox} from "./UI/CenterMessageBox";
import {Helpers} from "./Helpers";
import {TagUtils} from "./Logic/TagsFilter";
import {LayerUpdater} from "./Logic/LayerUpdater";
import {UIElement} from "./UI/UIElement";
import {FullScreenMessageBoxHandler} from "./UI/FullScreenMessageBoxHandler";
import {FeatureInfoBox} from "./UI/FeatureInfoBox";
import {SimpleAddUI} from "./UI/SimpleAddUI";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import {SearchAndGo} from "./UI/SearchAndGo";
import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";
import {CheckBox} from "./UI/Input/CheckBox";
import Translations from "./UI/i18n/Translations";
import Locale from "./UI/i18n/Locale";
import {Layout} from "./Customizations/Layout";
import {DropDown} from "./UI/Input/DropDown";
import {FixedUiElement} from "./UI/Base/FixedUiElement";
import {LayerSelection} from "./UI/LayerSelection";
import Combine from "./UI/Base/Combine";
import {Img} from "./UI/Img";
import {QueryParameters} from "./Logic/QueryParameters";
import {Utils} from "./Utils";
import {LocalStorageSource} from "./Logic/LocalStorageSource";
import {InitUiElements} from "./InitUiElements";
import {StrayClickHandler} from "./Logic/Leaflet/StrayClickHandler";
import {BaseLayers, Basemap} from "./Logic/Leaflet/Basemap";
import {GeoLocationHandler} from "./Logic/Leaflet/GeoLocationHandler";
import {OsmConnection} from "./Logic/Osm/OsmConnection";
import {Changes} from "./Logic/Osm/Changes";
import {State} from "./State";


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
if (layoutToUse === undefined) {
    console.log("Incorrect layout")
}

// Setup the global state
State.state = new State(layoutToUse);
const state = State.state;


// ----------------- Prepare the important objects -----------------
state.osmConnection = new OsmConnection(
    QueryParameters.GetQueryParameter("test", "false").data === "true",
    QueryParameters.GetQueryParameter("oauth_token", undefined)
);


Locale.language.syncWith(state.osmConnection.GetPreference("language"));

// @ts-ignore
window.setLanguage = function (language: string) {
    Locale.language.setData(language)
}

Locale.language.addCallback((currentLanguage) => {
    if (layoutToUse.supportedLanguages.indexOf(currentLanguage) < 0) {
        console.log("Resetting languate to", layoutToUse.supportedLanguages[0], "as", currentLanguage, " is unsupported")
        // The current language is not supported -> switch to a supported one
        Locale.language.setData(layoutToUse.supportedLanguages[0]);
    }
}).ping()


state.allElements = new ElementStorage();
state.changes = new Changes(
    "Beantwoorden van vragen met #MapComplete voor vragenset #" + state.layoutToUse.data.name,
    state.osmConnection, state.allElements);
state.bm = new Basemap("leafletDiv", state.locationControl, new VariableUiElement(
    state.locationControl.map((location) => {
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

const layerSetup = InitUiElements.InitLayers();

const layerUpdater = new LayerUpdater(layerSetup.minZoom, layoutToUse.widenFactor, layerSetup.flayers);


// --------------- Setting up layer selection ui --------

const closedFilterButton = `<button id="filter__button" class="filter__button shadow">${Img.closedFilterButton}</button>`;

const openFilterButton = `
<button id="filter__button" class="filter__button">${Img.openFilterButton}</button>`;

let baseLayerOptions = BaseLayers.baseLayers.map((layer) => {
    return {value: layer, shown: layer.name}
});
const backgroundMapPicker = new Combine([new DropDown(`Background map`, baseLayerOptions, State.state.bm.CurrentLayer), openFilterButton]);
const layerSelection = new Combine([`<p class="filter__label">Maplayers</p>`, new LayerSelection(layerSetup.flayers)]);
let layerControl = backgroundMapPicker;
if (layerSetup.flayers.length > 1) {
    layerControl = new Combine([layerSelection, backgroundMapPicker]);
}

InitUiElements.OnlyIf(State.state.featureSwitchLayers, () => {

    const checkbox = new CheckBox(layerControl, closedFilterButton);
    checkbox.AttachTo("filter__selection");
    State.state.bm.Location.addCallback(() => {
        checkbox.isEnabled.setData(false);
    });

});


// ------------------ Setup various other UI elements ------------

document.title = Translations.W(layoutToUse.title).InnerRender();

Locale.language.addCallback(e => {
    document.title = Translations.W(layoutToUse.title).InnerRender();
})


InitUiElements.OnlyIf(State.state.featureSwitchAddNew, () => {
    new StrayClickHandler(() => {
            return new SimpleAddUI(
                layerUpdater.runningQuery,
                layerSetup.presets);
        }
    );
});


/**
 * Show the questions and information for the selected element
 * This is given to the div which renders fullscreen on mobile devices
 */
State.state.selectedElement.addCallback((feature) => {
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
                State.state.allElements.getElement(data.id),
                layer.title,
                layer.elementsToShow,
            );

            State.state.fullScreenMessage.setData(featureBox);
            break;
        }
    }
    }
);

console.log("Enable new:",State.state.featureSwitchAddNew.data,"deafult", layoutToUse.enableAdd)
InitUiElements.OnlyIf(State.state.featureSwitchUserbadge, () => {
    new UserBadge().AttachTo('userbadge');
});

InitUiElements.OnlyIf((State.state.featureSwitchSearch), () => {
    new SearchAndGo().AttachTo("searchbox");
});

new FullScreenMessageBoxHandler(() => {
    State.state.selectedElement.setData(undefined)
}).update();

InitUiElements.OnlyIf(State.state.featureSwitchWelcomeMessage, () => {
    InitUiElements.InitWelcomeMessage()
});

if ((window != window.top && !State.state.featureSwitchWelcomeMessage) || State.state.featureSwitchIframe.data) {
    new FixedUiElement(`<a href='${window.location}' target='_blank'><span class='iframe-escape'><img src='assets/pop-out.svg'></span></a>`).AttachTo("top-right")
}


new CenterMessageBox(
    layerSetup.minZoom,
    layerUpdater.runningQuery)
    .AttachTo("centermessage");


Helpers.SetupAutoSave();
Helpers.LastEffortSave();



new GeoLocationHandler().AttachTo("geolocate-button");


State.state.osmConnection.registerActivateOsmAUthenticationClass();
State.state.locationControl.ping()

