import SelectedFeatureHandler from "../Actors/SelectedFeatureHandler"
import Hash from "../Web/Hash"
import MetaTagRecalculator from "../FeatureSource/Actors/MetaTagRecalculator"

export default class FeaturePipelineState {
    /**
     * The piece of code which fetches data from various sources and shows it on the background map
     */
    public readonly featurePipeline: FeaturePipeline
    private readonly metatagRecalculator: MetaTagRecalculator

    constructor() {
        this.metatagRecalculator = new MetaTagRecalculator(this, this.featurePipeline)
        this.metatagRecalculator.registerSource(this.currentView)
        new SelectedFeatureHandler(Hash.hash, this)
    }
}
