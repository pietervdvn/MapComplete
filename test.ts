import BackgroundMapSwitch from "./UI/BigComponents/BackgroundMapSwitch";
import {UIEventSource} from "./Logic/UIEventSource";
import Loc from "./Models/Loc";
import AvailableBaseLayersImplementation from "./Logic/Actors/AvailableBaseLayersImplementation";
import AvailableBaseLayers from "./Logic/Actors/AvailableBaseLayers";
AvailableBaseLayers.implement(new AvailableBaseLayersImplementation())

new BackgroundMapSwitch({
    locationControl: new UIEventSource<Loc>({
        zoom: 19,
        lat: 51.5,
        lon: 4.1
    })
}).AttachTo("maindiv")