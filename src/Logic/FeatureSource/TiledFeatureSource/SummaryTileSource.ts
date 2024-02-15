import DynamicTileSource from "./DynamicTileSource"
import { Store, UIEventSource } from "../../UIEventSource"
import { BBox } from "../../BBox"
import StaticFeatureSource from "../Sources/StaticFeatureSource"
import { Feature, Point } from "geojson"
import { Utils } from "../../../Utils"
import { Tiles } from "../../../Models/TileRange"

/**
 * Provides features summarizing the total amount of features at a given location
 */
export class SummaryTileSource extends DynamicTileSource {
    private static readonly empty = []
    constructor(
        cacheserver: string,
        layers: string[],
        zoomRounded: Store<number>,
        mapProperties: {
            bounds: Store<BBox>
            zoom: Store<number>
        },
        options?: {
            isActive?: Store<boolean>
        }
    ) {
        const layersSummed = layers.join("+")
        super(
            zoomRounded,
            0, // minzoom
            (tileIndex) => {
                const [z, x, y] = Tiles.tile_from_index(tileIndex)
                const coordinates = Tiles.centerPointOf(z, x, y)

                const count = UIEventSource.FromPromiseWithErr(
                    Utils.downloadJson(`${cacheserver}/${layersSummed}/${z}/${x}/${y}.json`)
                )
                const features: Store<Feature<Point>[]> = count.mapD((count) => {
                    if (count["error"] !== undefined) {
                        console.error(
                            "Could not download count for tile",
                            z,
                            x,
                            y,
                            "due to",
                            count["error"]
                        )
                        return SummaryTileSource.empty
                    }
                    const counts = count["success"]
                    if (counts === undefined || counts["total"] === 0) {
                        return SummaryTileSource.empty
                    }
                    return [
                        {
                            type: "Feature",
                            properties: {
                                id: "summary_" + tileIndex,
                                summary: "yes",
                                ...counts,
                                layers: layersSummed,
                            },
                            geometry: {
                                type: "Point",
                                coordinates,
                            },
                        },
                    ]
                })
                return new StaticFeatureSource(
                    features.map(
                        (f) => {
                            if (z !== zoomRounded.data) {
                                return SummaryTileSource.empty
                            }
                            return f
                        },
                        [zoomRounded]
                    )
                )
            },
            mapProperties,
            options
        )
    }
}
