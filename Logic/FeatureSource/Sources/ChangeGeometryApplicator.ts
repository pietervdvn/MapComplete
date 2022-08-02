/**
 * Applies geometry changes from 'Changes' onto every feature of a featureSource
 */
import {Changes} from "../../Osm/Changes";
import {UIEventSource} from "../../UIEventSource";
import {FeatureSourceForLayer, IndexedFeatureSource} from "../FeatureSource";
import FilteredLayer from "../../../Models/FilteredLayer";
import {ChangeDescription, ChangeDescriptionTools} from "../../Osm/Actions/ChangeDescription";


export default class ChangeGeometryApplicator implements FeatureSourceForLayer {
    public readonly features: UIEventSource<{ feature: any; freshness: Date }[]> = new UIEventSource<{ feature: any; freshness: Date }[]>([]);
    public readonly name: string;
    public readonly layer: FilteredLayer
    private readonly source: IndexedFeatureSource;
    private readonly changes: Changes;

    constructor(source: (IndexedFeatureSource & FeatureSourceForLayer), changes: Changes) {
        this.source = source;
        this.changes = changes;
        this.layer = source.layer

        this.name = "ChangesApplied(" + source.name + ")"
        this.features = new UIEventSource<{ feature: any; freshness: Date }[]>(undefined)

        const self = this;
        source.features.addCallbackAndRunD(_ => self.update())

        changes.allChanges.addCallbackAndRunD(_ => self.update())

    }

    private update() {
        const upstreamFeatures = this.source.features.data
        const upstreamIds = this.source.containedIds.data
        const changesToApply = this.changes.allChanges.data
            ?.filter(ch =>
                // Does upsteram have this element? If not, we skip
                upstreamIds.has(ch.type + "/" + ch.id) &&
                // Are any (geometry) changes defined?
                ch.changes !== undefined &&
                // Ignore new elements, they are handled by the NewGeometryFromChangesFeatureSource
                ch.id > 0)

        if (changesToApply === undefined || changesToApply.length === 0) {
            // No changes to apply!
            // Pass the original feature and lets continue our day
            this.features.setData(upstreamFeatures);
            return;
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
        const newFeatures: { feature: any, freshness: Date }[] = []
        for (const feature of upstreamFeatures) {
            const changesForFeature = changesPerId.get(feature.feature.properties.id)
            if (changesForFeature === undefined) {
                // No changes for this element
                newFeatures.push(feature)
                continue;
            }

            // Allright! We have a feature to rewrite!
            const copy = {
                ...feature
            }
            // We only apply the last change as that one'll have the latest geometry
            const change = changesForFeature[changesForFeature.length - 1]
            copy.feature.geometry = ChangeDescriptionTools.getGeojsonGeometry(change)
            console.log("Applying a geometry change onto:", feature,"The change is:", change,"which becomes:", copy)
            newFeatures.push(copy)
        }
        this.features.setData(newFeatures)

    }

}