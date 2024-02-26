import { FeatureSourceForTile, UpdatableFeatureSource } from "../FeatureSource"
import { Store } from "../../UIEventSource"
import { BBox } from "../../BBox"
import { Utils } from "../../../Utils"
import { Feature, MultiLineString, Position } from "geojson"
import { GeoOperations } from "../../GeoOperations"
import { UpdatableDynamicTileSource } from "./DynamicTileSource"

/**
 * The PolygonSourceMerger receives various small pieces of bigger polygons and stitches them together.
 * This is used to reconstruct polygons of vector tiles
 */
export class LineSourceMerger extends UpdatableDynamicTileSource<
    FeatureSourceForTile & UpdatableFeatureSource
> {
    private readonly _zoomlevel: Store<number>

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
        this._zoomlevel = zoomlevel
    }

    protected addDataFromSources(sources: FeatureSourceForTile[]) {
        sources = Utils.NoNull(sources)
        const all: Map<string, Feature<MultiLineString>> = new Map()
        const currentZoom = this._zoomlevel?.data ?? 0
        for (const source of sources) {
            if (source.z != currentZoom) {
                continue
            }
            for (const f of source.features.data) {
                const id = f.properties.id
                const coordinates: Position[][] = []
                if (f.geometry.type === "LineString") {
                    coordinates.push(f.geometry.coordinates)
                } else if (f.geometry.type === "MultiLineString") {
                    coordinates.push(...f.geometry.coordinates)
                } else {
                    console.error("Invalid geometry type:", f.geometry.type)
                    continue
                }
                const oldV = all.get(id)
                if (!oldV) {
                    all.set(id, {
                        type: "Feature",
                        properties: f.properties,
                        geometry: {
                            type: "MultiLineString",
                            coordinates,
                        },
                    })
                    continue
                }
                oldV.geometry.coordinates.push(...coordinates)
            }
        }

        const keys = Array.from(all.keys())
        for (const key of keys) {
            all.set(
                key,
                <any>GeoOperations.attemptLinearize(<Feature<MultiLineString>>all.get(key))
            )
        }
        const newList = Array.from(all.values())
        this.features.setData(newList)
        this._featuresById.setData(all)
    }
}
