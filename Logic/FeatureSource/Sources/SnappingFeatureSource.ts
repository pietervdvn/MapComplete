import FeatureSource from "../FeatureSource"
import { Store } from "../../UIEventSource"
import { Feature, Point } from "geojson"
import { GeoOperations } from "../../GeoOperations"

export interface SnappingOptions {
    /**
     * If the distance is bigger then this amount, don't snap.
     * In meter
     */
    maxDistance?: number
}

export default class SnappingFeatureSource implements FeatureSource {
    public readonly features: Store<Feature<Point>[]>

    constructor(
        snapTo: FeatureSource,
        location: Store<{ lon: number; lat: number }>,
        options?: SnappingOptions
    ) {
        const simplifiedFeatures = snapTo.features.mapD((features) =>
            features
                .filter((feature) => feature.geometry.type !== "Point")
                .map((f) => GeoOperations.forceLineString(<any>f))
        )

        location.mapD(
            ({ lon, lat }) => {
                const features = snapTo.features.data
                const loc: [number, number] = [lon, lat]
                const maxDistance = (options?.maxDistance ?? 1000) * 1000
                let bestSnap: Feature<Point, { "snapped-to": string; dist: number }> = undefined
                for (const feature of features) {
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
                return bestSnap
            },
            [snapTo.features]
        )
    }
}
