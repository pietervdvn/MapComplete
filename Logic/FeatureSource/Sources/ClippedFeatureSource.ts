// SPDX-FileCopyrightText: 2023 MapComplete  <https://mapcomplete.osm.be/>
//
// SPDX-License-Identifier: GPL-3.0-ONLY

import { FeatureSource } from "../FeatureSource"
import { Feature, Polygon } from "geojson"
import StaticFeatureSource from "./StaticFeatureSource"
import { GeoOperations } from "../../GeoOperations"

/**
 * Returns a clipped version of the original geojson. Ways which partially intersect the given feature will be split up
 *
 * Also @see: GeoOperations.spreadIntoBboxes
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
