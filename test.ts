import {State} from "./State";
import Cyclofix from "./Customizations/Layouts/Cyclofix";
import {CustomLayersPanel} from "./Logic/CustomLayersPanel";

State.state= new State(new Cyclofix());

new CustomLayersPanel().AttachTo("maindiv");

State.state.osmConnection.GetPreference("mapcomplete-custom-layer-count").addCallback((count) => console.log("Count: ", count))
    
State.state.favourteLayers.addCallback(console.log)