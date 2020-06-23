import {OsmConnection} from "./Logic/OsmConnection";
import {Changes} from "./Logic/Changes";
import {ElementStorage} from "./Logic/ElementStorage";
import {UIEventSource} from "./UI/UIEventSource";
import {UserBadge} from "./UI/UserBadge";
import {Basemap} from "./Logic/Basemap";
import {PendingChanges} from "./UI/PendingChanges";
import {FixedUiElement} from "./UI/FixedUiElement";
import {CenterMessageBox} from "./UI/CenterMessageBox";
import {Helpers} from "./Helpers";
import {KnownSet} from "./Layers/KnownSet";
import {AddButton} from "./UI/AddButton";
import {Tag} from "./Logic/TagsFilter";
import {FilteredLayer} from "./Logic/FilteredLayer";
import {LayerUpdater} from "./Logic/LayerUpdater";
import {Overpass} from "./Logic/Overpass";
import {LoginDependendMessage} from "./UI/LoginDependendMessage";


// Set to true if testing and changes should NOT be saved
const dryRun = false;
// Overpass.testUrl = "http://127.0.0.1:8080/test.json";


// ----------------- SELECT THE RIGHT QUESTSET -----------------

let questSetToRender = KnownSet.groen;
if (window.location.search) {
    const params = window.location.search.substr(1).split("&");
    const paramDict: any = {};
    for (const param of params) {
        var kv = param.split("=");
        paramDict[kv[0]] = kv[1];
    }

    if (paramDict.quests) {
        questSetToRender = KnownSet.allSets[paramDict.quests];
        console.log("Using quests: ", questSetToRender.name);
    }

}
document.title = questSetToRender.title;


// ----------------- Setup a few event sources -------------


// The message that should be shown at the center of the screen
const centerMessage = new UIEventSource<string>("");

// The countdown: if set to e.g. ten, it'll start counting down. When reaching zero, changes will be saved. NB: this is implemented later, not in the eventSource
const secondsTillChangesAreSaved = new UIEventSource<number>(0);

var locationControl = new UIEventSource({
    zoom: questSetToRender.startzoom,
    lat: questSetToRender.startLat,
    lon: questSetToRender.startLon
});


// ----------------- Prepare the important objects -----------------


const allElements = new ElementStorage();
const osmConnection = new OsmConnection(dryRun);
const changes = new Changes(osmConnection, allElements, centerMessage);
const bm = new Basemap("leafletDiv", locationControl);


// ------------- Setup the layers -------------------------------

const addButtons: {
    name: string,
    icon: string,
    tags: Tag[],
    layerToAddTo: FilteredLayer
}[]
    = [];

const flayers: FilteredLayer[] = []

for (const layer of questSetToRender.layers) {

    const flayer = layer.asLayer(bm, allElements, changes);

    const addButton = {
        name: layer.name,
        icon: layer.icon,
        tags: layer.newElementTags,
        layerToAddTo: flayer
    }
    addButtons.push(addButton);
    flayers.push(flayer);
}

const layerUpdater = new LayerUpdater(bm, questSetToRender.startzoom, flayers);


// ------------------ Setup various UI elements ------------


const addButton = new AddButton(bm, changes, addButtons);
addButton.AttachTo("bottomRight");
addButton.Update();


new UserBadge(osmConnection.userDetails)
    .AttachTo('userbadge');

new FixedUiElement(questSetToRender.welcomeMessage)
    .AttachTo("welcomeMessage");

new LoginDependendMessage(osmConnection.userDetails, questSetToRender.gettingStartedPlzLogin, questSetToRender.welcomeBackMessage)
    .AttachTo("gettingStartedBox");

new PendingChanges(changes, secondsTillChangesAreSaved)
    .AttachTo("pendingchangesbox");

new CenterMessageBox(
    questSetToRender.startzoom,
    centerMessage,
    osmConnection,
    locationControl,
    layerUpdater.runningQuery)
    .AttachTo("centermessage");


Helpers.SetupAutoSave(changes, secondsTillChangesAreSaved);
Helpers.LastEffortSave(changes);
Helpers.registerActivateOsmAUthenticationClass(osmConnection);


// --------------- Send a ping to start various action --------

locationControl.ping();
