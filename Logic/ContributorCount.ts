/// Given a feature source, calculates a list of OSM-contributors who mapped the latest versions
import FeatureSource from "./FeatureSource/FeatureSource";
import {UIEventSource} from "./UIEventSource";
import FeaturePipeline from "./FeatureSource/FeaturePipeline";
import Loc from "../Models/Loc";
import State from "../State";
import {BBox} from "./GeoOperations";

export default class ContributorCount {

    public readonly Contributors: UIEventSource<Map<string, number>> = new UIEventSource<Map<string, number>>(new Map<string, number>());
    private readonly state: { featurePipeline: FeaturePipeline, currentBounds: UIEventSource<BBox>, locationControl: UIEventSource<Loc> };

    constructor(state: { featurePipeline: FeaturePipeline, currentBounds: UIEventSource<BBox>, locationControl: UIEventSource<Loc> }) {
        this.state = state;
        const self = this;
        state.currentBounds.map(bbox => {
            self.update(bbox)
        })
        state.featurePipeline.runningQuery.addCallbackAndRun(
            _ =>   self.update(state.currentBounds.data)
        )
      
    }

    private lastUpdate: Date = undefined;

    private update(bbox: BBox) {
        if(bbox === undefined){
            return;
        }
        const now = new Date();
        if (this.lastUpdate !== undefined && ((now.getTime() - this.lastUpdate.getTime()) < 1000 * 60)) {
            return;
        }
        console.log("Calculating contributors")
        const featuresList = this.state.featurePipeline.GetAllFeaturesWithin(bbox)
        const hist = new Map<string, number>();
        for (const list of featuresList) {
            for (const feature of list) {
                const contributor = feature.properties["_last_edit:contributor"]
                const count = hist.get(contributor) ?? 0;
                hist.set(contributor, count + 1)
            }
        }
        this.Contributors.setData(hist)
    }

}