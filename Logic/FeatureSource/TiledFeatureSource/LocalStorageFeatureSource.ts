import DynamicTileSource from "./DynamicTileSource"
import { Store } from "../../UIEventSource"
import { BBox } from "../../BBox"
import TileLocalStorage from "../Actors/TileLocalStorage"
import { Feature } from "geojson"
import StaticFeatureSource from "../Sources/StaticFeatureSource"

export default class LocalStorageFeatureSource extends DynamicTileSource {
    constructor(
        backend: string,
        layername: string,
        zoomlevel: number,
        mapProperties: {
            bounds: Store<BBox>
            zoom: Store<number>
        },
        options?: {
            isActive?: Store<boolean>
        }
    ) {
        const storage = TileLocalStorage.construct<Feature[]>(backend, layername)
        super(
            zoomlevel,
            (tileIndex) =>
                new StaticFeatureSource(
                    storage
                        .getTileSource(tileIndex)
                        .map((features) =>
                            features?.filter((f) => !f.properties.id.match(/(node|way)\/-[0-9]+/))
                        )
                ),
            mapProperties,
            options
        )
    }
}
