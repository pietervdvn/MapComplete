import FeatureSource, {Tiled} from "../../Logic/FeatureSource/FeatureSource";
import {UIEventSource} from "../../Logic/UIEventSource";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
import ShowDataLayer from "./ShowDataLayer";
import StaticFeatureSource from "../../Logic/FeatureSource/Sources/StaticFeatureSource";
import {GeoOperations} from "../../Logic/GeoOperations";
import {Tiles} from "../../Models/TileRange";
import * as clusterstyle from "../../assets/layers/cluster_style/cluster_style.json"

export default class ShowTileInfo {
    public static readonly styling = new LayerConfig(clusterstyle, "ShowTileInfo", true)

    constructor(options: {
        source: FeatureSource & Tiled, leafletMap: UIEventSource<any>, layer?: LayerConfig,
        doShowLayer?: UIEventSource<boolean>
    }) {


        const source = options.source
        const metaFeature: UIEventSource<any[]> =
            source.features.map(features => {
                const bbox = source.bbox
                const [z, x, y] = Tiles.tile_from_index(source.tileIndex)
                const box = {
                    "type": "Feature",
                    "properties": {
                        "z": z,
                        "x": x,
                        "y": y,
                        "tileIndex": source.tileIndex,
                        "source": source.name,
                        "count": features.length,
                        tileId: source.name + "/" + source.tileIndex
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [
                            [
                                [bbox.minLon, bbox.minLat],
                                [bbox.minLon, bbox.maxLat],
                                [bbox.maxLon, bbox.maxLat],
                                [bbox.maxLon, bbox.minLat],
                                [bbox.minLon, bbox.minLat]
                            ]
                        ]
                    }
                }
                const center = GeoOperations.centerpoint(box)
                return [box, center]
            })

        new ShowDataLayer({
            layerToShow: ShowTileInfo.styling,
            features: new StaticFeatureSource(metaFeature, false),
            leafletMap: options.leafletMap,
            doShowLayer: options.doShowLayer
        })

    }

}