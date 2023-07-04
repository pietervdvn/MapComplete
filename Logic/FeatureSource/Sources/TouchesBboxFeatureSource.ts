// SPDX-FileCopyrightText: 2023 MapComplete  <https://mapcomplete.osm.be/>
//
// SPDX-License-Identifier: GPL-3.0-ONLY

import { FeatureSource, FeatureSourceForLayer } from "../FeatureSource"
import StaticFeatureSource from "./StaticFeatureSource"
import { BBox } from "../../BBox"
import FilteredLayer from "../../../Models/FilteredLayer"
import { Store } from "../../UIEventSource"
import { Feature } from "geojson"

/**
 * Results in a feature source which has all the elements that touch the given features
 */
export default class BBoxFeatureSource<T extends Feature = Feature> extends StaticFeatureSource<T> {
    constructor(features: FeatureSource<T>, mustTouch: Store<BBox>) {
        super(
            features.features.mapD(
                (features) => {
                    if (mustTouch.data === undefined) {
                        return features
                    }
                    const box = mustTouch.data
                    return features.filter((feature) => {
                        if (feature.geometry.type === "Point") {
                            return box.contains(<[number, number]>feature.geometry.coordinates)
                        }
                        return box.overlapsWith(BBox.get(feature))
                    })
                },
                [mustTouch]
            )
        )
    }
}

export class BBoxFeatureSourceForLayer<T extends Feature = Feature>
    extends BBoxFeatureSource<T>
    implements FeatureSourceForLayer
{
    readonly layer: FilteredLayer

    constructor(features: FeatureSourceForLayer<T>, mustTouch: Store<BBox>) {
        super(features, mustTouch)
        this.layer = features.layer
    }
}
