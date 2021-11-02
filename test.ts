import ShowDataLayer from "./UI/ShowDataLayer/ShowDataLayer";
import AllKnownLayers from "./Customizations/AllKnownLayers";
import Minimap from "./UI/Base/Minimap";
import StaticFeatureSource from "./Logic/FeatureSource/Sources/StaticFeatureSource";
import MinimapImplementation from "./UI/Base/MinimapImplementation";
import AvailableBaseLayers from "./Logic/Actors/AvailableBaseLayers";
import BaseLayer from "./Models/BaseLayer";
import {UIEventSource} from "./Logic/UIEventSource";
import AvailableBaseLayersImplementation from "./Logic/Actors/AvailableBaseLayersImplementation";
MinimapImplementation.initialize()
AvailableBaseLayers.implement(new AvailableBaseLayersImplementation())
const confirmationMap = Minimap.createMiniMap({
    background: new UIEventSource<BaseLayer>(AvailableBaseLayers.osmCarto)
})
const features = [{"feature":{"type":"Feature","properties":{"move":"yes","osm-id":1728823483},"geometry":{"type":"LineString","coordinates":[[3.216693,51.2147409],[3.2166930000000225,51.214740500000055]]}},"freshness":"2021-11-02T20:06:53.088Z"},{"feature":{"type":"Feature","properties":{"move":"yes","osm-id":1728823481},"geometry":{"type":"LineString","coordinates":[[3.2167247,51.2146969],[3.21671060000004,51.2147159000002]]}},"freshness":"2021-11-02T20:06:53.088Z"},{"feature":{"type":"Feature","properties":{"move":"yes","osm-id":1728823481},"geometry":{"type":"LineString","coordinates":[[3.2167247,51.2146969],[3.2167241999999976,51.214696799999714]]}},"freshness":"2021-11-02T20:06:53.088Z"},{"feature":{"type":"Feature","properties":{"move":"yes","osm-id":1728823549},"geometry":{"type":"LineString","coordinates":[[3.2168871,51.2147399],[3.2168876999999547,51.21474009999989]]}},"freshness":"2021-11-02T20:06:53.088Z"},{"feature":{"type":"Feature","properties":{"move":"yes","osm-id":4978289383},"geometry":{"type":"LineString","coordinates":[[3.2169973,51.2147676],[3.2169969000000034,51.21476780000005]]}},"freshness":"2021-11-02T20:06:53.088Z"},{"feature":{"type":"Feature","properties":{"move":"yes","osm-id":4978289388},"geometry":{"type":"LineString","coordinates":[[3.2169829,51.2147884],[3.2169673999999895,51.21481170000002]]}},"freshness":"2021-11-02T20:06:53.088Z"},{"feature":{"type":"Feature","properties":{"move":"yes","osm-id":4978289388},"geometry":{"type":"LineString","coordinates":[[3.2169829,51.2147884],[3.216949899999979,51.214808000000225]]}},"freshness":"2021-11-02T20:06:53.088Z"},{"feature":{"type":"Feature","properties":{"move":"yes","osm-id":4978289388},"geometry":{"type":"LineString","coordinates":[[3.2169829,51.2147884],[3.2169306,51.21480400000028]]}},"freshness":"2021-11-02T20:06:53.088Z"},{"feature":{"type":"Feature","properties":{"move":"yes","osm-id":4978289388},"geometry":{"type":"LineString","coordinates":[[3.2169829,51.2147884],[3.2169465999999756,51.214779199999825]]}},"freshness":"2021-11-02T20:06:53.088Z"},{"feature":{"type":"Feature","properties":{"move":"yes","osm-id":4978288381},"geometry":{"type":"LineString","coordinates":[[3.2168856,51.2147638],[3.216885599999961,51.214763799999986]]}},"freshness":"2021-11-02T20:06:53.088Z"},{"feature":{"type":"Feature","properties":{"move":"yes","osm-id":4978289386},"geometry":{"type":"LineString","coordinates":[[3.2168815,51.2147718],[3.216881100000038,51.21477160000009]]}},"freshness":"2021-11-02T20:06:53.088Z"},{"feature":{"type":"Feature","properties":{"move":"yes","osm-id":4978289384},"geometry":{"type":"LineString","coordinates":[[3.2168674,51.2147683],[3.216867399999983,51.214768400000224]]}},"freshness":"2021-11-02T20:06:53.088Z"},{"feature":{"type":"Feature","properties":{"move":"yes","osm-id":1728823514},"geometry":{"type":"LineString","coordinates":[[3.2168551,51.2147863],[3.2168551000000436,51.21478629999984]]}},"freshness":"2021-11-02T20:06:53.088Z"},{"feature":{"type":"Feature","properties":{"move":"yes","osm-id":1728823483},"geometry":{"type":"LineString","coordinates":[[3.216693,51.2147409],[3.2166930000000225,51.214740500000055]]}},"freshness":"2021-11-02T20:06:53.088Z"}]
const changePreview = new StaticFeatureSource(features.map(f => f.feature), false)
console.log("ChangePreview", changePreview.features.data)
new ShowDataLayer({
    leafletMap: confirmationMap.leafletMap,
    enablePopups: false,
    zoomToFeatures: true,
    features: changePreview,
    layerToShow: AllKnownLayers.sharedLayers.get("conflation")
})
            
confirmationMap.SetStyle("height: 20rem").SetClass("w-full").AttachTo("maindiv")