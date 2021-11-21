import BackgroundMapSwitch from "./UI/BigComponents/BackgroundMapSwitch";
import {UIEventSource} from "./Logic/UIEventSource";
import Loc from "./Models/Loc";
import AvailableBaseLayersImplementation from "./Logic/Actors/AvailableBaseLayersImplementation";
import AvailableBaseLayers from "./Logic/Actors/AvailableBaseLayers";
import BaseLayer from "./Models/BaseLayer";
import {VariableUiElement} from "./UI/Base/VariableUIElement";

AvailableBaseLayers.implement(new AvailableBaseLayersImplementation())
const state = {
    currentBackground: new UIEventSource<BaseLayer>(AvailableBaseLayers.osmCarto),
    locationControl: new UIEventSource<Loc>({
        zoom: 19,
        lat: 51.2,
        lon: 3.2
    })
}
const actualBackground = new UIEventSource(AvailableBaseLayers.osmCarto)
new BackgroundMapSwitch(state,
    {
        currentBackground: actualBackground
    }).AttachTo("maindiv")

new VariableUiElement(actualBackground.map(bg => bg.id)).AttachTo("extradiv")