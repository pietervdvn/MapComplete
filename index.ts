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
import {CollapseButton} from "./UI/Base/CollapseButton";
import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";
import {CheckBox} from "./UI/Base/CheckBox";
import Translations from "./UI/i18n/Translations";
import Locale from "./UI/i18n/Locale";
import {Layout, WelcomeMessage} from "./Customizations/Layout";
import {DropDown} from "./UI/Input/DropDown";
import {FixedUiElement} from "./UI/Base/FixedUiElement";
import {LayerSelection} from "./UI/LayerSelection";
import Combine from "./UI/Base/Combine";


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


let defaultLayout = "walkbybrussels"


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

// The latest element that was selected - used to generate the right UI at the right place
const selectedElement = new UIEventSource<{feature: any}>(undefined);


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
    name: UIElement,
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

    const flayer = layer.asLayer(bm, allElements, changes, osmConnection.userDetails, selectedElement, generateInfo);

    const addButton = {
        name: Translations.W(layer.name),
        icon: layer.icon,
        tags: layer.newElementTags,
        layerToAddTo: flayer
    }
    addButtons.push(addButton);
    flayers.push(flayer);

    console.log(flayers);
    
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
selectedElement.addCallback((feature) => {
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

// --------------- Setting up filter ui --------

const closedFilterButton = `
    <button id="filter__button" class="filter__button filter__button--shadow">
        <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M26.5353 8.13481C26.4422 8.35428 26.2683 8.47598 26.0632 8.58537C21.9977 10.7452 17.935 12.9085 13.8758 15.0799C13.6475 15.2016 13.4831 15.1962 13.2568 15.0751C9.19822 12.903 5.13484 10.7404 1.07215 8.5758C0.490599 8.26608 0.448478 7.52562 0.991303 7.13796C1.0803 7.07438 1.17813 7.0231 1.2746 6.97045C5.15862 4.86462 9.04536 2.7629 12.9246 0.648187C13.3805 0.399316 13.7779 0.406837 14.2311 0.65434C18.0954 2.76153 21.9658 4.85779 25.8383 6.94926C26.1569 7.12155 26.411 7.32872 26.5353 7.67604C26.5353 7.82919 26.5353 7.98166 26.5353 8.13481Z" fill="#003B8B"/>
        <path d="M13.318 26.535C12.1576 25.9046 10.9972 25.2736 9.83614 24.6439C6.96644 23.0877 4.09674 21.533 1.22704 19.9762C0.694401 19.6876 0.466129 19.2343 0.669943 18.7722C0.759621 18.5691 0.931505 18.3653 1.11969 18.2512C1.66659 17.9182 2.23727 17.6228 2.80863 17.3329C2.89423 17.2892 3.04981 17.3206 3.14493 17.3712C6.40799 19.1031 9.66969 20.837 12.9239 22.5845C13.3703 22.8238 13.7609 22.83 14.208 22.59C17.4554 20.8472 20.7117 19.1202 23.9605 17.3801C24.1493 17.2789 24.2838 17.283 24.4632 17.3876C24.8926 17.6386 25.3301 17.8772 25.7751 18.1001C26.11 18.2683 26.3838 18.4857 26.5346 18.8385C26.5346 18.9916 26.5346 19.1441 26.5346 19.2972C26.4049 19.6528 26.1399 19.8613 25.8152 20.0363C22.9964 21.5549 20.1831 23.0829 17.3684 24.609C16.1863 25.2496 15.0055 25.893 13.8248 26.535C13.6556 26.535 13.4865 26.535 13.318 26.535Z" fill="#003B8B"/>
        <path d="M26.3988 13.7412C26.2956 13.9661 26.1026 14.081 25.8927 14.1924C21.8198 16.3577 17.749 18.5258 13.6815 20.7013C13.492 20.8025 13.3602 20.7902 13.1795 20.6938C9.09638 18.5114 5.01059 16.3359 0.924798 14.1582C0.399637 13.8786 0.307921 13.2646 0.735251 12.838C0.829005 12.7443 0.947217 12.6705 1.06407 12.6055C1.56545 12.3279 2.07635 12.0654 2.57297 11.7789C2.74214 11.6812 2.86579 11.6921 3.03291 11.7817C6.27492 13.5155 9.52303 15.2378 12.761 16.9792C13.2352 17.2343 13.6394 17.2322 14.1129 16.9772C17.3509 15.2358 20.5996 13.5142 23.8416 11.7796C24.0095 11.69 24.1338 11.6818 24.3016 11.7789C24.7384 12.0339 25.1821 12.2794 25.6352 12.5037C25.9701 12.6691 26.2426 12.8831 26.3995 13.2304C26.3988 13.4014 26.3988 13.5716 26.3988 13.7412Z" fill="#003B8B"/>
        </svg>            
    </button>
`;

const openFilterButton = `
<button id="filter__button" class="filter__button">
<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20 2L2 20M20 20L2 2" stroke="#003B8B" stroke-width="4"/>
</svg>        
</button>`;

new CheckBox(new Combine([new LayerSelection(flayers), openFilterButton]), closedFilterButton).AttachTo("filter__selection")

// --------------- Setting up basemap dropdown --------

let baseLayerOptions = [];

Object.entries(BaseLayers.baseLayers).forEach(([key, value], i) => {
console.log(key, value, i);
    baseLayerOptions.push({value: {name: key, layer: value}, shown: key});
});

console.log(bm.CurrentLayer.data);


new DropDown(`label`, baseLayerOptions, bm.CurrentLayer).AttachTo("filter__selection");
