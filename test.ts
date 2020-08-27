import {OsmConnection} from "./Logic/Osm/OsmConnection";
import {UIEventSource} from "./Logic/UIEventSource";
import {ChangesetHandler} from "./Logic/Osm/ChangesetHandler";
import {State} from "./State";
import {LayerDefinition} from "./Customizations/LayerDefinition";
import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";
import {Tag} from "./Logic/TagsFilter";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
const bookcases = AllKnownLayouts.layoutsList[5];
State.state = new State(bookcases);

new VariableUiElement(
    State.state.osmConnection.changesetHandler.currentChangeset
).AttachTo("maindiv");

window.setTimeout(() => {
   
    State.state.osmConnection.changesetHandler.CloseChangeset("89995035")
}, 1000)