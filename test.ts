import SplitRoadWizard from "./UI/Popup/SplitRoadWizard";
import State from "./State";
import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";
import MinimapImplementation from "./UI/Base/MinimapImplementation";
import {UIEventSource} from "./Logic/UIEventSource";
import FilteredLayer from "./Models/FilteredLayer";
import {And} from "./Logic/Tags/And";
import ShowDataLayer from "./UI/ShowDataLayer/ShowDataLayer";
import ShowTileInfo from "./UI/ShowDataLayer/ShowTileInfo";
import StaticFeatureSource from "./Logic/FeatureSource/Sources/StaticFeatureSource";
import {BBox} from "./Logic/GeoOperations";
import Minimap from "./UI/Base/Minimap";

State.state = new State(undefined)

const leafletMap = new UIEventSource(undefined)
MinimapImplementation.initialize()
Minimap.createMiniMap({
    leafletMap: leafletMap,
}).SetStyle("height: 600px; width: 600px")
    .AttachTo("maindiv")

const bbox = BBox.fromTile(16,32754,21785).asGeoJson({
    count: 42,
    tileId: 42
})

console.log(bbox)
new ShowDataLayer({
    layerToShow: ShowTileInfo.styling,
    leafletMap: leafletMap,
    features: new StaticFeatureSource([ bbox], false)
})