import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import FeaturePipeline from "../FeatureSource/FeaturePipeline";
import {Tiles} from "../../Models/TileRange";
import ShowDataLayer from "../../UI/ShowDataLayer/ShowDataLayer";
import {TileHierarchyAggregator} from "../../UI/ShowDataLayer/TileHierarchyAggregator";
import ShowTileInfo from "../../UI/ShowDataLayer/ShowTileInfo";
import {UIEventSource} from "../UIEventSource";
import MapState from "./MapState";
import SelectedFeatureHandler from "../Actors/SelectedFeatureHandler";
import Hash from "../Web/Hash";
import {BBox} from "../BBox";
import FeatureInfoBox from "../../UI/Popup/FeatureInfoBox";
import {FeatureSourceForLayer, Tiled} from "../FeatureSource/FeatureSource";
import MetaTagRecalculator from "../FeatureSource/Actors/MetaTagRecalculator";
import ScrollableFullScreen from "../../UI/Base/ScrollableFullScreen";
import BaseUIElement from "../../UI/BaseUIElement";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";

export default class FeaturePipelineState extends MapState {

    /**
     * The piece of code which fetches data from various sources and shows it on the background map
     */
    public readonly featurePipeline: FeaturePipeline;
    private readonly featureAggregator: TileHierarchyAggregator;
    private readonly metatagRecalculator: MetaTagRecalculator
    private readonly popups : Map<string, ScrollableFullScreen> = new Map<string, ScrollableFullScreen>();
    
    constructor(layoutToUse: LayoutConfig) {
        super(layoutToUse);

        const clustering = layoutToUse?.clustering
        this.featureAggregator = TileHierarchyAggregator.createHierarchy(this);
        const clusterCounter = this.featureAggregator
        const self = this;

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
            const sourceBBox = source.features.map(allFeatures => BBox.bboxAroundAll(allFeatures.map(f => BBox.get(f.feature))))

            // Do show features indicates if the respective 'showDataLayer' should be shown. It can be hidden by e.g. clustering
            const doShowFeatures = source.features.map(
                f => {
                    const z = self.locationControl.data.zoom

                    if (!source.layer.isDisplayed.data) {
                        return false;
                    }

                    const bounds = self.currentBounds.data
                    if (bounds === undefined) {
                        // Map is not yet displayed
                        return false;
                    }

                    if (!sourceBBox.data.overlapsWith(bounds)) {
                        // Not within range -> features are hidden
                        return false
                    }


                    if (z < source.layer.layerDef.minzoom) {
                        // Layer is always hidden for this zoom level
                        return false;
                    }

                    if (z > clustering.maxZoom) {
                        return true
                    }

                    if (f.length > clustering.minNeededElements) {
                        // This tile alone already has too much features
                        return false
                    }

                    let [tileZ, tileX, tileY] = Tiles.tile_from_index(source.tileIndex);
                    if (tileZ >= z) {

                        while (tileZ > z) {
                            tileZ--
                            tileX = Math.floor(tileX / 2)
                            tileY = Math.floor(tileY / 2)
                        }

                        if (clusterCounter.getTile(Tiles.tile_index(tileZ, tileX, tileY))?.totalValue > clustering.minNeededElements) {
                            // To much elements
                            return false
                        }
                    }


                    return true
                }, [self.currentBounds, source.layer.isDisplayed, sourceBBox]
            )

            new ShowDataLayer(
                {
                    features: source,
                    leafletMap: self.leafletMap,
                    layerToShow: source.layer.layerDef,
                    doShowLayer: doShowFeatures,
                    selectedElement: self.selectedElement,
                    state: self,
                    popup: (tags, layer) => self.CreatePopup(tags, layer)
                }
            )
        }


        this.featurePipeline = new FeaturePipeline(registerSource, this, {handleRawFeatureSource: registerRaw});
        this.metatagRecalculator = new MetaTagRecalculator(this, this.featurePipeline)
        this.metatagRecalculator.registerSource(this.currentView, true)

        sourcesToRegister.forEach(source => self.metatagRecalculator.registerSource(source))

        new SelectedFeatureHandler(Hash.hash, this)

        this.AddClusteringToMap(this.leafletMap)

    }
    
    public CreatePopup(tags:UIEventSource<any> , layer: LayerConfig): ScrollableFullScreen{
        if(this.popups.has(tags.data.id)){
           return this.popups.get(tags.data.id)
        }
        const popup = new FeatureInfoBox(tags, layer, this)
        this.popups.set(tags.data.id, popup)
        return popup
    }

    /**
     * Adds the cluster-tiles to the given map
     * @param leafletMap: a UIEventSource possible having a leaflet map
     * @constructor
     */
    public AddClusteringToMap(leafletMap: UIEventSource<any>) {
        const clustering = this.layoutToUse.clustering
        const self = this;
        new ShowDataLayer({
            features: this.featureAggregator.getCountsForZoom(clustering, this.locationControl, clustering.minNeededElements),
            leafletMap: leafletMap,
            layerToShow: ShowTileInfo.styling,
            popup: this.featureSwitchIsDebugging.data ? (tags, layer) => new FeatureInfoBox(tags, layer, self) : undefined,
            state: this
        })
    }


}