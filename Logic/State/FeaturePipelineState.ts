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
import ScrollableFullScreen from "../../UI/Base/ScrollableFullScreen";
import Translations from "../../UI/i18n/Translations";
import SimpleAddUI from "../../UI/BigComponents/SimpleAddUI";
import StrayClickHandler from "../Actors/StrayClickHandler";

export default class FeaturePipelineState extends MapState {

    /**
     * The piece of code which fetches data from various sources and shows it on the background map
     */
    public readonly featurePipeline: FeaturePipeline;
    private readonly featureAggregator: TileHierarchyAggregator;

    constructor(layoutToUse: LayoutConfig) {
        super(layoutToUse);

        const clustering = layoutToUse.clustering
        this.featureAggregator = TileHierarchyAggregator.createHierarchy();
        const clusterCounter = this.featureAggregator
        const self = this;
        this.featurePipeline = new FeaturePipeline(
            source => {

                clusterCounter.addTile(source)

                // Do show features indicates if the 'showDataLayer' should be shown
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

                        if (!source.bbox.overlapsWith(bounds)) {
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
                    }, [this.currentBounds, source.layer.isDisplayed]
                )

                new ShowDataLayer(
                    {
                        features: source,
                        leafletMap: self.leafletMap,
                        layerToShow: source.layer.layerDef,
                        doShowLayer: doShowFeatures,
                        allElements: self.allElements,
                        selectedElement: self.selectedElement
                    }
                );
            }, this
        );
        new SelectedFeatureHandler(Hash.hash, this)
        
        this.AddClusteringToMap(this.leafletMap)

    }

    /**
     * Adds the cluster-tiles to the given map
     * @param leafletMap: a UIEventSource possible having a leaflet map
     * @constructor
     */
    public AddClusteringToMap(leafletMap: UIEventSource<any>) {
        const clustering = this.layoutToUse.clustering
        new ShowDataLayer({
            features: this.featureAggregator.getCountsForZoom(clustering, this.locationControl, clustering.minNeededElements),
            leafletMap: leafletMap,
            layerToShow: ShowTileInfo.styling,
            enablePopups: false,
        })
    }

    public setupClickDialogOnMap(filterViewIsOpened: UIEventSource<boolean>, leafletMap: UIEventSource<any>) {

        const self = this
        function setup(){
            let presetCount = 0;
            for (const layer of self.layoutToUse.layers) {
                for (const preset of layer.presets) {
                    presetCount++;
                }
            }
            if (presetCount == 0) {
                return;
            }

            const newPointDialogIsShown = new UIEventSource<boolean>(false);
            const addNewPoint = new ScrollableFullScreen(
                () => Translations.t.general.add.title.Clone(),
                () => new SimpleAddUI(newPointDialogIsShown, filterViewIsOpened, self),
                "new",
                newPointDialogIsShown
            );
            addNewPoint.isShown.addCallback((isShown) => {
                if (!isShown) {
                    self.LastClickLocation.setData(undefined);
                }
            });

            new StrayClickHandler(
                self.LastClickLocation,
                self.selectedElement,
                self.filteredLayers,
                leafletMap,
                addNewPoint
            );
        }

        this.featureSwitchAddNew.addCallbackAndRunD(addNewAllowed => {
            if (addNewAllowed) {
                setup()
                return true;
            }
        })

    }



}