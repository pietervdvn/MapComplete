import DynamicTileSource from "./DynamicTileSource"
import { ImmutableStore, Store } from "../../UIEventSource"
import { BBox } from "../../BBox"
import TileLocalStorage from "../Actors/TileLocalStorage"
import { Feature } from "geojson"
import StaticFeatureSource from "../Sources/StaticFeatureSource"
import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"

export default class LocalStorageFeatureSource extends DynamicTileSource {
    constructor(
        backend: string,
        layer: LayerConfig,
        zoomlevel: number,
        mapProperties: {
            bounds: Store<BBox>
            zoom: Store<number>
        },
        options?: {
            isActive?: Store<boolean>
            maxAge?: number // In seconds
        }
    ) {
        const layername = layer.id
        const storage = TileLocalStorage.construct<Feature[]>(
            backend,
            layername,
            options?.maxAge ?? 24 * 60 * 60
        )
        super(
            new ImmutableStore(zoomlevel),
            layer.minzoom,
            (tileIndex) =>
                new StaticFeatureSource(
                    storage.getTileSource(tileIndex).mapD((features) => {
                        if (features.length === undefined) {
                            console.trace("These are not features:", features)
                            storage.invalidate(tileIndex)
                            return []
                        }
                        return features.filter((f) => !f.properties.id.match(/(node|way)\/-[0-9]+/))
                    })
                ),
            mapProperties,
            options
        )
    }
}
