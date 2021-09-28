import {Tiles} from "./Models/TileRange";
import OsmFeatureSource from "./Logic/FeatureSource/TiledFeatureSource/OsmFeatureSource";
import {Utils} from "./Utils";
import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";
import LayerConfig from "./Models/ThemeConfig/LayerConfig";

const allLayers: LayerConfig[] = []
const seenIds = new Set<string>()
for (const layoutConfig of AllKnownLayouts.layoutsList) {
    if (layoutConfig.hideFromOverview) {
        continue
    }
    for (const layer of layoutConfig.layers) {
        if (seenIds.has(layer.id)) {
            continue
        }
        seenIds.add(layer.id)
        allLayers.push(layer)
    }
}

console.log("All layer ids", allLayers.map(l => l.id))

const src = new OsmFeatureSource({
    backend: "https://www.openstreetmap.org",
    handleTile: tile => console.log("Got tile", tile),
    allLayers: allLayers
})
src.LoadTile(16, 33354, 21875).then(geojson => {
    console.log("Got geojson", geojson);
    Utils.offerContentsAsDownloadableFile(JSON.stringify(geojson), "test.geojson", {
        mimetype: "application/vnd.geo+json"
    })
})
//*/