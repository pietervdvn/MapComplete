import { FeatureSource } from "../FeatureSource"
import { Feature, Polygon } from "geojson"
import StaticFeatureSource from "./StaticFeatureSource"
import { GeoOperations } from "../../GeoOperations"

/**
 * Returns a clipped version of the original geojson. Ways which partially intersect the given feature will be split up
 */
export default class ClippedFeatureSource extends StaticFeatureSource {
    constructor(features: FeatureSource, clipTo: Feature<Polygon>) {
        super(
            features.features.mapD((features) => {
                return [].concat(features.map((feature) => GeoOperations.clipWith(feature, clipTo)))
            })
        )
    }
}
