import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"
import FeaturePipeline from "../FeatureSource/FeaturePipeline"
import { Tiles } from "../../Models/TileRange"
import SelectedFeatureHandler from "../Actors/SelectedFeatureHandler"
import Hash from "../Web/Hash"
import { BBox } from "../BBox"
import { FeatureSourceForLayer, Tiled } from "../FeatureSource/FeatureSource"
import MetaTagRecalculator from "../FeatureSource/Actors/MetaTagRecalculator"

export default class FeaturePipelineState {
    /**
     * The piece of code which fetches data from various sources and shows it on the background map
     */
    public readonly featurePipeline: FeaturePipeline
    private readonly metatagRecalculator: MetaTagRecalculator

    constructor(layoutToUse: LayoutConfig) {
        const clustering = layoutToUse?.clustering
        const clusterCounter = this.featureAggregator
        const self = this

        /**
         * We are a bit in a bind:
         * There is the featurePipeline, which creates some sources during construction
         * THere is the metatagger, which needs to have these sources registered AND which takes a FeaturePipeline as argument
         *
         * This is a bit of a catch-22 (except that it isn't)
         * The sources that are registered in the constructor are saved into 'registeredSources' temporary
         *
         */
        const sourcesToRegister = []

        function registerRaw(source: FeatureSourceForLayer & Tiled) {
            if (self.metatagRecalculator === undefined) {
                sourcesToRegister.push(source)
            } else {
                self.metatagRecalculator.registerSource(source)
            }
        }

        function registerSource(source: FeatureSourceForLayer & Tiled) {
            clusterCounter.addTile(source)
            const sourceBBox = source.features.map((allFeatures) =>
                BBox.bboxAroundAll(allFeatures.map(BBox.get))
            )

            // Do show features indicates if the respective 'showDataLayer' should be shown. It can be hidden by e.g. clustering
            source.features.map(
                (f) => {
                    const z = self.locationControl.data.zoom

                    if (!source.layer.isDisplayed.data) {
                        return false
                    }

                    const bounds = self.currentBounds.data
                    if (bounds === undefined) {
                        // Map is not yet displayed
                        return false
                    }

                    if (!sourceBBox.data.overlapsWith(bounds)) {
                        // Not within range -> features are hidden
                        return false
                    }

                    if (z < source.layer.layerDef.minzoom) {
                        // Layer is always hidden for this zoom level
                        return false
                    }

                    if (z > clustering.maxZoom) {
                        return true
                    }

                    if (f.length > clustering.minNeededElements) {
                        // This tile alone already has too much features
                        return false
                    }

                    let [tileZ, tileX, tileY] = Tiles.tile_from_index(source.tileIndex)
                    if (tileZ >= z) {
                        while (tileZ > z) {
                            tileZ--
                            tileX = Math.floor(tileX / 2)
                            tileY = Math.floor(tileY / 2)
                        }

                        if (
                            clusterCounter.getTile(Tiles.tile_index(tileZ, tileX, tileY))
                                ?.totalValue > clustering.minNeededElements
                        ) {
                            // To much elements
                            return false
                        }
                    }

                    return true
                },
                [self.currentBounds, source.layer.isDisplayed, sourceBBox]
            )
        }

        this.featurePipeline = new FeaturePipeline(registerSource, this, {
            handleRawFeatureSource: registerRaw,
        })
        this.metatagRecalculator = new MetaTagRecalculator(this, this.featurePipeline)
        this.metatagRecalculator.registerSource(this.currentView)

        sourcesToRegister.forEach((source) => self.metatagRecalculator.registerSource(source))

        new SelectedFeatureHandler(Hash.hash, this)
    }
}
