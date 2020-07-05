import {UIEventSource} from "./UI/UIEventSource";
import {Changes} from "./Logic/Changes";
import {OsmConnection} from "./Logic/OsmConnection";
import {ElementStorage} from "./Logic/ElementStorage";
import {WikipediaLink} from "./Customizations/Questions/WikipediaLink";
import {OsmLink} from "./Customizations/Questions/OsmLink";

const tags = {name: "Test", 
    wikipedia: "nl:Pieter",
    id: "node/-1"};
const tagsES = new UIEventSource(tags);

const login = new OsmConnection(true);

const allElements = new ElementStorage();
allElements.addElementById(tags.id, tagsES);

const changes = new Changes("Test", login, allElements)


new OsmLink(tagsES, changes).AttachTo("maindiv");