import { FeatureSource } from "../FeatureSource"
import { Store, UIEventSource } from "../../UIEventSource"
import { Feature, Point } from "geojson"
import { GeoOperations } from "../../GeoOperations"
import { BBox } from "../../BBox"

export interface SnappingOptions {
    /**
     * If the distance to the line is bigger then this amount, don't snap.
     * In meter
     */
    maxDistance: number

    /**
     * If set to true, no value will be given if no snapping was made
     */
    allowUnsnapped?: false | boolean

    /**
     * The snapped-to way will be written into this
     */
    snappedTo?: UIEventSource<string>

    /**
     * The resulting snap coordinates will be written into this UIEventSource
     */
    snapLocation?: UIEventSource<{ lon: number; lat: number }>

    /**
     * If the projected point is within `reusePointWithin`-meter of an already existing point
     */
    reusePointWithin?: number
}

export default class SnappingFeatureSource
    implements FeatureSource<Feature<Point, { "snapped-to": string; dist: number }>>
{
    public readonly features: Store<[Feature<Point, { "snapped-to": string; dist: number }>]>
    /*Contains the id of the way it snapped to*/
    public readonly snappedTo: Store<string>
    private readonly _snappedTo: UIEventSource<string>

    constructor(
        snapTo: FeatureSource,
        location: Store<{ lon: number; lat: number }>,
        options: SnappingOptions
    ) {
        const maxDistance = options?.maxDistance
        this._snappedTo = options.snappedTo ?? new UIEventSource<string>(undefined)
        this.snappedTo = this._snappedTo
        const simplifiedFeatures = snapTo.features
            .mapD((features) =>
                features
                    .filter((feature) => feature.geometry.type !== "Point")
                    .map((f) => GeoOperations.forceLineString(<any>f))
            )
            .map(
                (features) => {
                    const { lon, lat } = location.data
                    const loc: [number, number] = [lon, lat]
                    return features.filter((f) => BBox.get(f).isNearby(loc, maxDistance))
                },
                [location]
            )

        this.features = location.mapD(
            ({ lon, lat }) => {
                const features = simplifiedFeatures.data
                const loc: [number, number] = [lon, lat]
                const maxDistance = (options?.maxDistance ?? 1000) / 1000
                let bestSnap: Feature<Point, { "snapped-to": string; dist: number }> = undefined
                for (const feature of features) {
                    if (feature.geometry.type !== "LineString") {
                        // TODO handle Polygons with holes
                        continue
                    }
                    const snapped = GeoOperations.nearestPoint(<any>feature, loc)
                    if (snapped.properties.dist > maxDistance) {
                        continue
                    }
                    if (
                        bestSnap === undefined ||
                        bestSnap.properties.dist > snapped.properties.dist
                    ) {
                        snapped.properties["snapped-to"] = feature.properties.id
                        bestSnap = <any>snapped
                    }
                }
                this._snappedTo.setData(bestSnap?.properties?.["snapped-to"])
                if (bestSnap === undefined && options?.allowUnsnapped) {
                    bestSnap = {
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: [lon, lat],
                        },
                        properties: {
                            "snapped-to": undefined,
                            dist: -1,
                        },
                    }
                }
                const c = bestSnap.geometry.coordinates
                options?.snapLocation?.setData({ lon: c[0], lat: c[1] })
                return [bestSnap]
            },
            [snapTo.features]
        )
    }
}
