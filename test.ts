import {UIEventSource} from "./UI/UIEventSource";
import {Changes} from "./Logic/Changes";
import {OsmConnection} from "./Logic/OsmConnection";
import {ElementStorage} from "./Logic/ElementStorage";
import {WikipediaLink} from "./Customizations/Questions/WikipediaLink";
import {OsmLink} from "./Customizations/Questions/OsmLink";
import {ConfirmDialog} from "./UI/ConfirmDialog";
import {Imgur} from "./Logic/Imgur";

console.log("Hello world")

Imgur.getDescriptionOfImage("https://i.imgur.com/pJfQYsj.jpg",
    (info) => {
        console.log(info)
    })