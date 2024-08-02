/**
 * Applies geometry changes from 'Changes' onto every feature of a featureSource
 */
import { Changes } from "../../Osm/Changes"
import { UIEventSource } from "../../UIEventSource"
import { FeatureSource, IndexedFeatureSource } from "../FeatureSource"
import { ChangeDescription, ChangeDescriptionTools } from "../../Osm/Actions/ChangeDescription"
import { Feature } from "geojson"
import { Utils } from "../../../Utils"

export default class ChangeGeometryApplicator implements FeatureSource {
    public readonly features: UIEventSource<Feature[]> = new UIEventSource<Feature[]>([])
    private readonly source: IndexedFeatureSource
    private readonly changes: Changes

    constructor(source: IndexedFeatureSource, changes: Changes) {
        this.source = source
        this.changes = changes

        this.features = new UIEventSource<Feature[]>(undefined)

        const self = this
        source.features.addCallbackAndRunD((_) => self.update())

        changes.allChanges.addCallbackAndRunD((_) => self.update())
    }

    private update() {
        const upstreamFeatures = this.source.features.data
        const upstreamIds = this.source.featuresById.data
        const changesToApply = this.changes.allChanges.data?.filter(
            (ch) =>
                // Does upstream have this element? If not, we skip
                upstreamIds.has(ch.type + "/" + ch.id) &&
                // Are any (geometry) changes defined?
                ch.changes !== undefined &&
                // Ignore new elements, they are handled by the NewGeometryFromChangesFeatureSource
                ch.id > 0
        )

        if (changesToApply === undefined || changesToApply.length === 0) {
            // No changes to apply!
            // Pass the original feature and lets continue our day
            this.features.setData(upstreamFeatures)
            return
        }

        const changesPerId = new Map<string, ChangeDescription[]>()
        for (const ch of changesToApply) {
            const key = ch.type + "/" + ch.id
            if (changesPerId.has(key)) {
                changesPerId.get(key).push(ch)
            } else {
                changesPerId.set(key, [ch])
            }
        }
        const newFeatures: Feature[] = []
        for (const feature of upstreamFeatures) {
            const changesForFeature = changesPerId.get(feature.properties.id)
            if (changesForFeature === undefined) {
                // No changes for this element - simply pass it along to downstream
                newFeatures.push(feature)
                continue
            }

            // Allright! We have a feature to rewrite!
            const copy = {
                ...feature,
            }
            // We only apply the last change as that one'll have the latest geometry
            const change = changesForFeature[changesForFeature.length - 1]
            copy.geometry = ChangeDescriptionTools.getGeojsonGeometry(change)
            if (Utils.SameObject(copy.geometry, feature.geometry)) {
                // No actual changes: pass along the original
                newFeatures.push(feature)
                continue
            }

            newFeatures.push(copy)
        }
        this.features.setData(newFeatures)
    }
}
