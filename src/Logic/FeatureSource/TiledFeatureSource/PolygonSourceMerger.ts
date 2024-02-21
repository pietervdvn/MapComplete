import { FeatureSourceForTile, UpdatableFeatureSource } from "../FeatureSource"
import { Store } from "../../UIEventSource"
import { BBox } from "../../BBox"
import { Utils } from "../../../Utils"
import { Feature } from "geojson"
import { GeoOperations } from "../../GeoOperations"
import DynamicTileSource, { UpdatableDynamicTileSource } from "./DynamicTileSource"

/**
 * The PolygonSourceMerger receives various small pieces of bigger polygons and stitches them together.
 * This is used to reconstruct polygons of vector tiles
 */
export class PolygonSourceMerger extends UpdatableDynamicTileSource<
    FeatureSourceForTile & UpdatableFeatureSource
> {
    constructor(
        zoomlevel: Store<number>,
        minzoom: number,
        constructSource: (tileIndex: number) => FeatureSourceForTile & UpdatableFeatureSource,
        mapProperties: {
            bounds: Store<BBox>
            zoom: Store<number>
        },
        options?: {
            isActive?: Store<boolean>
        }
    ) {
        super(zoomlevel, minzoom, constructSource, mapProperties, options)
    }

    protected addDataFromSources(sources: FeatureSourceForTile[]) {
        sources = Utils.NoNull(sources)
        const all: Map<string, Feature> = new Map()
        const zooms: Map<string, number> = new Map()

        for (const source of sources) {
            let z = source.z
            for (const f of source.features.data) {
                const id = f.properties.id
                if (id.endsWith("146616907")) {
                    console.log("Horeca totaal")
                }
                if (!all.has(id)) {
                    // No other parts of this polygon have been seen before, simply add it
                    all.set(id, f)
                    zooms.set(id, z)
                    continue
                }

                // A part of this object has been seen before, eventually from a different zoom level
                const oldV = all.get(id)
                const oldZ = zooms.get(id)
                if (oldZ > z) {
                    // The store contains more detailed information, so we ignore this part which has a lower accuraccy
                    continue
                }
                if (oldZ < z) {
                    // The old value has worse accuracy then what we receive now, we throw it away
                    all.set(id, f)
                    zooms.set(id, z)
                    continue
                }
                const merged = GeoOperations.union(f, oldV)
                merged.properties = oldV.properties
                all.set(id, merged)
                zooms.set(id, z)
            }
        }

        const newList = Array.from(all.values())
        this.features.setData(newList)
        this._featuresById.setData(all)
    }
}
