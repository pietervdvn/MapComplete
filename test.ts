import MinimapImplementation from "./UI/Base/MinimapImplementation";
import Minimap from "./UI/Base/Minimap";
import ShowOverlayLayer from "./UI/ShowDataLayer/ShowOverlayLayer";
import TilesourceConfig from "./Models/ThemeConfig/TilesourceConfig";
import Loc from "./Models/Loc";
import {UIEventSource} from "./Logic/UIEventSource";

MinimapImplementation.initialize()

const map = Minimap.createMiniMap({
    location: new UIEventSource<Loc>({
        zoom: 19,
        lat: 51.51896,
        lon: -0.11267
    })

})
map.SetStyle("height: 50rem")
map.AttachTo("maindiv")

new ShowOverlayLayer(new TilesourceConfig({
    "source": "https://tiles.osmuk.org/PropertyBoundaries/{z}/{x}/{y}.png",
    "isOverlay": true,
    minZoom: 18,
    maxZoom: 20
}), map)