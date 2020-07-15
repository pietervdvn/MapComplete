import {UIEventSource} from "./UI/UIEventSource";
import {Changes} from "./Logic/Changes";
import {OsmConnection} from "./Logic/OsmConnection";
import {ElementStorage} from "./Logic/ElementStorage";
import {WikipediaLink} from "./Customizations/Questions/WikipediaLink";
import {OsmLink} from "./Customizations/Questions/OsmLink";
import {ConfirmDialog} from "./UI/ConfirmDialog";
import {Imgur} from "./Logic/Imgur";
import {VariableUiElement} from "./UI/Base/VariableUIElement";


const html = new UIEventSource<string>("Some text");

const uielement = new VariableUiElement(html);
uielement.AttachTo("maindiv")

window.setTimeout(() => {html.setData("Different text")}, 1000)