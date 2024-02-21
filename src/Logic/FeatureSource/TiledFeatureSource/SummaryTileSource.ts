import DynamicTileSource from "./DynamicTileSource"
import { Store, UIEventSource } from "../../UIEventSource"
import { BBox } from "../../BBox"
import StaticFeatureSource from "../Sources/StaticFeatureSource"
import { Feature, Point } from "geojson"
import { Utils } from "../../../Utils"
import { Tiles } from "../../../Models/TileRange"
import { FeatureSource } from "../FeatureSource"
import FilteredLayer from "../../../Models/FilteredLayer"
import Constants from "../../../Models/Constants"

export class SummaryTileSourceRewriter implements FeatureSource {
    private readonly _features: UIEventSource<Feature[]> = new UIEventSource<Feature[]>([])
    private filteredLayers: FilteredLayer[]
    public readonly features: Store<Feature[]> = this._features
    private readonly _summarySource: SummaryTileSource
    private readonly _totalNumberOfFeatures: UIEventSource<number> = new UIEventSource<number>(
        undefined
    )
    public readonly totalNumberOfFeatures: Store<number> = this._totalNumberOfFeatures
    constructor(
        summarySource: SummaryTileSource,
        filteredLayers: ReadonlyMap<string, FilteredLayer>
    ) {
        this.filteredLayers = Array.from(filteredLayers.values()).filter(
            (l) =>
                Constants.priviliged_layers.indexOf(<any>l.layerDef.id) < 0 &&
                !l.layerDef.id.startsWith("note_import")
        )
        this._summarySource = summarySource
        filteredLayers.forEach((v, k) => {
            v.isDisplayed.addCallback((_) => this.update())
        })
        this._summarySource.features.addCallbackAndRunD((_) => this.update())
    }

    private update() {
        let fullTotal = 0
        const newFeatures: Feature[] = []
        const layersToCount = this.filteredLayers.filter((fl) => fl.isDisplayed.data)
        const bitmap = layersToCount.map((l) => (l.isDisplayed.data ? "1" : "0")).join("")
        const ids = layersToCount.map((l) => l.layerDef.id)
        for (const f of this._summarySource.features.data ?? []) {
            let newTotal = 0
            for (const id of ids) {
                newTotal += Number(f.properties[id] ?? 0)
            }
            newFeatures.push({
                ...f,
                properties: {
                    ...f.properties,
                    id: f.properties.id + bitmap,
                    total: newTotal,
                    total_metric: Utils.numberWithMetrixPrefix(newTotal),
                },
            })
            fullTotal += newTotal
        }
        this._features.setData(newFeatures)
        this._totalNumberOfFeatures.setData(fullTotal)
    }
}

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
                    const total = Number(counts["total"])
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
                                total_metric: Utils.numberWithMetrixPrefix(total),
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
