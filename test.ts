import {SelectOneNearbyImage} from "./UI/Popup/NearbyImages";
import Minimap from "./UI/Base/Minimap";
import MinimapImplementation from "./UI/Base/MinimapImplementation";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import Loc from "./Models/Loc";
import {UIEventSource} from "./Logic/UIEventSource";

MinimapImplementation.initialize()
const map = Minimap.createMiniMap({
    location: new UIEventSource<Loc>({
        lon: 3.22457,
        lat: 51.20876,
        zoom: 18
    })
})
map.AttachTo("extradiv")
map.SetStyle("height: 500px")

new VariableUiElement(map.location.map( loc =>  new SelectOneNearbyImage( {...loc, radius: 50}))).AttachTo("maindiv")