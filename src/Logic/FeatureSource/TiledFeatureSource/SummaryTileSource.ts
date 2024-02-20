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
        const zDiff = 2
        super(
            zoomRounded,
            0, // minzoom
            (tileIndex) => {
                const [z, x, y] = Tiles.tile_from_index(tileIndex)
                let coordinates = Tiles.centerPointOf(z, x, y)
                const url = `${cacheserver}/${layersSummed}/${z}/${x}/${y}.json`
                const count = UIEventSource.FromPromiseWithErr(Utils.downloadJson(url))
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
                    const lat = counts["lat"]
                    const lon = counts["lon"]
                    const total = Utils.numberWithMetrixPrefix(Number(counts["total"]))
                    const tileBbox = new BBox(Tiles.tile_bounds_lon_lat(z, x, y))
                    if (!tileBbox.contains([lon, lat])) {
                        console.error(
                            "Average coordinate is outside of bbox!?",
                            lon,
                            lat,
                            tileBbox,
                            counts,
                            url
                        )
                    } else {
                        coordinates = [lon, lat]
                    }
                    return [
                        {
                            type: "Feature",
                            properties: {
                                id: "summary_" + tileIndex,
                                summary: "yes",
                                ...counts,
                                total,
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
                            if (z - zDiff !== zoomRounded.data) {
                                return SummaryTileSource.empty
                            }
                            return f
                        },
                        [zoomRounded]
                    )
                )
            },
            mapProperties,
            { ...options, zDiff }
        )
    }
}
