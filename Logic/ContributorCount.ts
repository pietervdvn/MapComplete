/// Given a feature source, calculates a list of OSM-contributors who mapped the latest versions
import FeatureSource from "./FeatureSource/FeatureSource";
import {UIEventSource} from "./UIEventSource";

export default class ContributorCount {

    public readonly Contributors: UIEventSource<Map<string, number>>;

    constructor(featureSource: FeatureSource) {
        this.Contributors = featureSource.features.map(features => {
            const hist = new Map<string, number>();
            for (const feature of features) {
                const contributor = feature.feature.properties["_last_edit:contributor"]
                const count = hist.get(contributor) ?? 0;
                hist.set(contributor, count + 1)
            }
            return hist;
        })
    }

}