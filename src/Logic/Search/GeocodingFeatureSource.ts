import { SearchResult } from "./GeocodingProvider"
import { Store } from "../UIEventSource"
import { FeatureSource } from "../FeatureSource/FeatureSource"
import { Feature, Geometry } from "geojson"

export default class GeocodingFeatureSource implements FeatureSource {
    public features: Store<Feature<Geometry, Record<string, string>>[]>

    constructor(provider: Store<SearchResult[]>) {
        this.features = provider.map((geocoded) => {
            if (geocoded === undefined) {
                return []
            }
            const features: Feature[] = []

            for (const gc of geocoded) {
                if (gc.lat === undefined || gc.lon === undefined) {
                    continue
                }

                features.push({
                    type: "Feature",
                    properties: {
                        id: "search_result_" + gc.osm_type + "/" + gc.osm_id,
                        category: gc.category,
                        description: gc.description,
                        display_name: gc.display_name,
                        osm_id: gc.osm_type + "/" + gc.osm_id,
                        osm_key: gc.feature?.properties?.osm_key,
                        osm_value: gc.feature?.properties?.osm_value,
                        source: gc.source,
                    },
                    geometry: {
                        type: "Point",
                        coordinates: [gc.lon, gc.lat],
                    },
                })
            }

            return features
        })
    }
}
