import {UIEventSource} from "../../Logic/UIEventSource";
import {GeoOperations} from "../../Logic/GeoOperations";

export class ImportUtils {
    public static partitionFeaturesIfNearby(toPartitionFeatureCollection: ({ features: any[] }), compareWith: UIEventSource<{ features: any[] }>, cutoffDistanceInMeters: UIEventSource<number>): UIEventSource<{ hasNearby: any[], noNearby: any[] }> {
        return compareWith.map(osmData => {
            if (osmData?.features === undefined) {
                return undefined
            }
            if(osmData.features.length === 0){
                return {noNearby: toPartitionFeatureCollection.features, hasNearby: []}
            }
            const maxDist = cutoffDistanceInMeters.data

            const hasNearby = []
            const noNearby = []
            for (const toImportElement of toPartitionFeatureCollection.features) {
                const hasNearbyFeature = osmData.features.some(f =>
                    maxDist >= GeoOperations.distanceBetween(toImportElement.geometry.coordinates, GeoOperations.centerpointCoordinates(f)))
                if (hasNearbyFeature) {
                    hasNearby.push(toImportElement)
                } else {
                    noNearby.push(toImportElement)
                }
            }

            return {hasNearby, noNearby}
        }, [cutoffDistanceInMeters]);
    }
}