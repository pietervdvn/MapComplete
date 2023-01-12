import { Store } from "../../Logic/UIEventSource"
import { GeoOperations } from "../../Logic/GeoOperations"
import { Feature, Point } from "geojson"

export class ImportUtils {
    public static partitionFeaturesIfNearby(
        toPartitionFeatureCollection: { features: Feature[] },
        compareWith: Store<{ features: Feature[] }>,
        cutoffDistanceInMeters: Store<number>
    ): Store<{ hasNearby: Feature[]; noNearby: Feature[] }> {
        return compareWith.map(
            (osmData) => {
                if (osmData?.features === undefined) {
                    return undefined
                }
                if (osmData.features.length === 0) {
                    return { noNearby: toPartitionFeatureCollection.features, hasNearby: [] }
                }
                const maxDist = cutoffDistanceInMeters.data

                const hasNearby = []
                const noNearby = []
                for (const toImportElement of toPartitionFeatureCollection.features) {
                    const hasNearbyFeature = osmData.features.some(
                        (f) =>
                            maxDist >=
                            GeoOperations.distanceBetween(
                                <any>(<Point>toImportElement.geometry).coordinates,
                                GeoOperations.centerpointCoordinates(f)
                            )
                    )
                    if (hasNearbyFeature) {
                        hasNearby.push(toImportElement)
                    } else {
                        noNearby.push(toImportElement)
                    }
                }

                return { hasNearby, noNearby }
            },
            [cutoffDistanceInMeters]
        )
    }
}
