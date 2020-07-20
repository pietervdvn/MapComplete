import {UIEventSource} from "./UI/UIEventSource";
import {Changes} from "./Logic/Changes";
import {OsmConnection} from "./Logic/OsmConnection";
import {ElementStorage} from "./Logic/ElementStorage";
import {WikipediaLink} from "./Customizations/Questions/WikipediaLink";
import {OsmLink} from "./Customizations/Questions/OsmLink";
import {ConfirmDialog} from "./UI/ConfirmDialog";
import {Imgur} from "./Logic/Imgur";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import {CheckBox} from "./UI/Base/CheckBox";


const eventSource = new UIEventSource(false);
eventSource.addCallback(console.log)

new CheckBox(eventSource)
    .onClick(() => {
        eventSource.setData(!eventSource.data);
    })
    .AttachTo("maindiv");
