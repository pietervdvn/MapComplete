import {UIEventSource} from "./UI/UIEventSource";
import {Changes} from "./Logic/Changes";
import {OsmConnection} from "./Logic/OsmConnection";
import {ElementStorage} from "./Logic/ElementStorage";
import {WikipediaLink} from "./Customizations/Questions/WikipediaLink";
import {OsmLink} from "./Customizations/Questions/OsmLink";
import {ConfirmDialog} from "./UI/ConfirmDialog";


new ConfirmDialog(new UIEventSource<boolean>(true),
    "<img src='assets/delete.svg' alt='Afbeelding verwijderen' class='delete-image'>",
    "Deze afbeelding verwijderen",
    "Terug",

    () => {
        console.log("Verwijderen");
    },
    () => {
        console.log("terug")
    },
    'delete-image-confirm',
    'delete-image-cancel')
    .AttachTo("maindiv")