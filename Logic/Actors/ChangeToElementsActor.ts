// SPDX-FileCopyrightText: 2023 MapComplete  <https://mapcomplete.osm.be/>
//
// SPDX-License-Identifier: GPL-3.0-ONLY

import { Changes } from "../Osm/Changes"
import FeaturePropertiesStore from "../FeatureSource/Actors/FeaturePropertiesStore"

/**
 * Applies tag changes onto the featureStore
 */
export default class ChangeToElementsActor {
    constructor(changes: Changes, allElements: FeaturePropertiesStore) {
        changes.pendingChanges.addCallbackAndRun((changes) => {
            for (const change of changes) {
                const id = change.type + "/" + change.id
                if (!allElements.has(id)) {
                    continue // Ignored as the geometryFixer will introduce this
                }
                const src = allElements.getStore(id)

                let changed = false
                for (const kv of change.tags ?? []) {
                    // Apply tag changes and ping the consumers
                    const k = kv.k
                    let v = kv.v
                    if (v === "") {
                        v = undefined
                    }
                    if (src.data[k] === v) {
                        continue
                    }
                    changed = true
                    src.data[k] = v
                }
                if (changed) {
                    src.ping()
                }
            }
        })
    }
}
