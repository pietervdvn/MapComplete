/**
 * Every previously added point is remembered, but new points are added.
 * Data coming from upstream will always overwrite a previous value
 */
import FeatureSource, {Tiled} from "../FeatureSource";
import {UIEventSource} from "../../UIEventSource";
import {BBox} from "../../GeoOperations";

export default class RememberingSource implements FeatureSource , Tiled{

    public readonly features: UIEventSource<{ feature: any, freshness: Date }[]>;
    public readonly name;
    public readonly  tileIndex : number
    public  readonly  bbox : BBox
    
    constructor(source: FeatureSource & Tiled) {
        const self = this;
        this.name = "RememberingSource of " + source.name;
        this.tileIndex=  source.tileIndex
        this.bbox = source.bbox;
        
        const empty = [];
        this.features = source.features.map(features => {
            const oldFeatures = self.features?.data ?? empty;
            if (features === undefined) {
                return oldFeatures;
            }

            // Then new ids
            const ids = new Set<string>(features.map(f => f.feature.properties.id + f.feature.geometry.type));
            // the old data
            const oldData = oldFeatures.filter(old => !ids.has(old.feature.properties.id + old.feature.geometry.type))
            return [...features, ...oldData];
        })
    }

}