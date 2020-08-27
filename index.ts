import {TagRendering} from "./Customizations/TagRendering";
import {UserBadge} from "./UI/UserBadge";
import {CenterMessageBox} from "./UI/CenterMessageBox";
import {TagUtils} from "./Logic/TagsFilter";
import {FullScreenMessageBoxHandler} from "./UI/FullScreenMessageBoxHandler";
import {FeatureInfoBox} from "./UI/FeatureInfoBox";
import {SimpleAddUI} from "./UI/SimpleAddUI";
import {SearchAndGo} from "./UI/SearchAndGo";
import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";
import {Layout} from "./Customizations/Layout";
import {FixedUiElement} from "./UI/Base/FixedUiElement";
import {InitUiElements} from "./InitUiElements";
import {StrayClickHandler} from "./Logic/Leaflet/StrayClickHandler";
import {GeoLocationHandler} from "./Logic/Leaflet/GeoLocationHandler";
import {State} from "./State";
import {CustomLayoutFromJSON} from "./Customizations/JSON/CustomLayoutFromJSON";
import {QueryParameters} from "./Logic/Web/QueryParameters";
import {LocalStorageSource} from "./Logic/Web/LocalStorageSource";
import {PersonalLayout} from "./Logic/PersonalLayout";
import {OsmConnection} from "./Logic/Osm/OsmConnection";

TagRendering.injectFunction();


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
let hash = window.location.hash;

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

let layoutToUse: Layout = AllKnownLayouts.allSets[defaultLayout] ?? AllKnownLayouts["all"];


const userLayoutParam = QueryParameters.GetQueryParameter("userlayout", "false");
const layoutFromBase64 = userLayoutParam.data;
if (layoutFromBase64 !== "false") {
    try {
        // layoutFromBase64 contains the name of the theme. This is partly to do tracking with goat counter

        const dedicatedHashFromLocalStorage = LocalStorageSource.Get("user-layout-" + layoutFromBase64.replace(" ", "_"));
        if(dedicatedHashFromLocalStorage.data?.length < 10){
            dedicatedHashFromLocalStorage.setData(undefined);
        }
        
        const hashFromLocalStorage = LocalStorageSource.Get("last-loaded-user-layout");
        if (hash.length < 10) {
            hash = dedicatedHashFromLocalStorage.data ?? hashFromLocalStorage.data;
        } else {
            console.log("Saving hash to local storage")
            hashFromLocalStorage.setData(hash);
            dedicatedHashFromLocalStorage.setData(hash);
        }
        layoutToUse = CustomLayoutFromJSON.FromQueryParam(hash.substr(1));
        userLayoutParam.setData(layoutToUse.name);
    } catch (e) {
        new FixedUiElement("Error: could not parse the custom layout:<br/> "+e).AttachTo("centermessage");
        throw e;
    }
}


if (layoutToUse === undefined) {
    console.log("Incorrect layout")
    new FixedUiElement("Error: incorrect layout <i>" + defaultLayout + "</i><br/><a href='https://pietervdvn.github.io/MapComplete/index.html'>Go back</a>").AttachTo("centermessage").onClick(() => {
    });
    throw "Incorrect layout"
}

console.log("Using layout: ", layoutToUse.name);

State.state = new State(layoutToUse);
if (layoutFromBase64 !== "false") {
    State.state.layoutDefinition = hash.substr(1);
    State.state.osmConnection.OnLoggedIn(() => {
        State.state.osmConnection.GetLongPreference("installed-theme-"+layoutToUse.name).setData(State.state.layoutDefinition);
    })
}
InitUiElements.InitBaseMap();

new FixedUiElement("").AttachTo("decoration"); // Remove the decoration

function setupAllLayerElements() {

    // ------------- Setup the layers -------------------------------

    InitUiElements.InitLayers();
    InitUiElements.InitLayerSelection();


    // ------------------ Setup various other UI elements ------------


    InitUiElements.OnlyIf(State.state.featureSwitchAddNew, () => {

        let presetCount = 0;
        for (const layer of State.state.filteredLayers.data) {
            for (const preset of layer.layerDef.presets) {
                presetCount++;
            }
        }
        if (presetCount == 0) {
            return;
        }


        new StrayClickHandler(() => {
                return new SimpleAddUI();
            }
        );
    });

    new CenterMessageBox().AttachTo("centermessage");

}

setupAllLayerElements();


function updateFavs() {
    const favs = State.state.favouriteLayers.data ?? [];

    layoutToUse.layers = [];
    for (const fav of favs) {
        const layer = AllKnownLayouts.allLayers[fav];
        if (!!layer) {
            layoutToUse.layers.push(layer);
        }

        for (const layouts of State.state.installedThemes.data) {
            for (const layer of layouts.layout.layers) {
                if (layer.id === fav) {
                    layoutToUse.layers.push(layer);
                }
            }
        }
    }

    setupAllLayerElements();
    State.state.layerUpdater.ForceRefresh();
    State.state.locationControl.ping();
}

if (layoutToUse === AllKnownLayouts.allSets[PersonalLayout.NAME]) {

    State.state.favouriteLayers.addCallback(updateFavs);
    State.state.installedThemes.addCallback(updateFavs);
}


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

if ((window != window.top && !State.state.featureSwitchWelcomeMessage.data) || State.state.featureSwitchIframe.data) {
    const currentLocation = State.state.locationControl;
    const url = `${window.location.origin}${window.location.pathname}?z=${currentLocation.data.zoom}&lat=${currentLocation.data.lat}&lon=${currentLocation.data.lon}`;
    const content = `<a href='${url}' target='_blank'><span class='iframe-escape'><img src='assets/pop-out.svg'></span></a>`;
    new FixedUiElement(content).AttachTo("messagesbox");
    new FixedUiElement(content).AttachTo("help-button-mobile")
}



new GeoLocationHandler().AttachTo("geolocate-button");
State.state.locationControl.ping();