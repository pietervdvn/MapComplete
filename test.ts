// The message that should be shown at the center of the screen
import {UIEventSource} from "./UI/UIEventSource";
import {UIElement} from "./UI/UIElement";
import {ElementStorage} from "./Logic/ElementStorage";
import {OsmConnection} from "./Logic/OsmConnection";
import {Changes} from "./Logic/Changes";
import {Basemap} from "./Logic/Basemap";
import {KnownSet} from "./Layers/KnownSet";
import {Overpass} from "./Logic/Overpass";
import {FeatureInfoBox} from "./UI/FeatureInfoBox";
import {TagMapping, TagMappingOptions} from "./UI/TagMapping";
import {CommonTagMappings} from "./Layers/CommonTagMappings";
import {ImageCarousel} from "./UI/Image/ImageCarousel";
import {WikimediaImage} from "./UI/Image/WikimediaImage";
import {OsmImageUploadHandler} from "./Logic/OsmImageUploadHandler";
import {DropDownUI} from "./UI/DropDownUI";

const centerMessage = new UIEventSource<string>("");

const dryRun = true;
// If you have a testfile somewhere, enable this to spoof overpass
// This should be hosted independantly, e.g. with `cd assets; webfsd -p 8080` + a CORS plugin to disable cors rules
Overpass.testUrl = "http://127.0.0.1:8080/test.json";
// The countdown: if set to e.g. ten, it'll start counting down. When reaching zero, changes will be saved. NB: this is implemented later, not in the eventSource
const secondsTillChangesAreSaved = new UIEventSource<number>(0);

const leftMessage = new UIEventSource<() => UIElement>(undefined);

const selectedElement = new UIEventSource<any>(undefined);

const questSetToRender = KnownSet.groen;

const locationControl = new UIEventSource({
    zoom: questSetToRender.startzoom,
    lat: questSetToRender.startLat,
    lon: questSetToRender.startLon
});


// ----------------- Prepare the important objects -----------------

const saveTimeout = 5000; // After this many milliseconds without changes, saves are sent of to OSM
const allElements = new ElementStorage();
const osmConnection = new OsmConnection(dryRun);
const changes = new Changes(
    "Beantwoorden van vragen met MapComplete voor vragenset #" + questSetToRender.name,
    osmConnection, allElements, centerMessage);


const layer = questSetToRender.layers[0];
const tags ={
    id: "way/123",
    // access: "yes",
    barrier: "fence",
    curator: "Arnout Zwaenepoel",
    description: "Heide en heischraal landschap met landduin en grote soortenverscheidenheid",
    dog: "no",
    email: "arnoutenregine@skynet.be",
    image: "https://natuurpuntbrugge.be/wp-content/uploads/2017/05/Schobbejakshoogte-schapen-PDG-1024x768.jpg",
    leisure: "nature_reserve",
    name: "Schobbejakshoogte",
    operator: "Natuurpunt Brugge",
    phone: "+32 50 82 26 97",
    website: "https://natuurpuntbrugge.be/schobbejakshoogte/",
   // wikidata: "Q4499623",
    wikipedia: "nl:Schobbejakshoogte",
};
const tagsES = allElements.addElement({properties: tags});


/*
new OsmImageUploadHandler(tagsES, osmConnection.userDetails, changes)
    .getUI().AttachTo("maindiv");

/*/

new FeatureInfoBox(
    tagsES,
    layer.elementsToShow,
    layer.questions,
    changes,
    osmConnection.userDetails
).AttachTo("maindiv").Activate();
//*/


