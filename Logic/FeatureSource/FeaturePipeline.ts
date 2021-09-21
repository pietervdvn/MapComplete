import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import FilteringFeatureSource from "./Sources/FilteringFeatureSource";
import PerLayerFeatureSourceSplitter from "./PerLayerFeatureSourceSplitter";
import FeatureSource, {FeatureSourceForLayer, FeatureSourceState, Tiled} from "./FeatureSource";
import TiledFeatureSource from "./TiledFeatureSource/TiledFeatureSource";
import {UIEventSource} from "../UIEventSource";
import {TileHierarchyTools} from "./TiledFeatureSource/TileHierarchy";
import FilteredLayer from "../../Models/FilteredLayer";
import MetaTagging from "../MetaTagging";
import RememberingSource from "./Sources/RememberingSource";
import OverpassFeatureSource from "../Actors/OverpassFeatureSource";
import {Changes} from "../Osm/Changes";
import GeoJsonSource from "./Sources/GeoJsonSource";
import Loc from "../../Models/Loc";
import WayHandlingApplyingFeatureSource from "./Sources/WayHandlingApplyingFeatureSource";
import RegisteringAllFromFeatureSourceActor from "./Actors/RegisteringAllFromFeatureSourceActor";
import {Utils} from "../../Utils";
import TiledFromLocalStorageSource from "./TiledFeatureSource/TiledFromLocalStorageSource";
import LocalStorageSaverActor from "./Actors/LocalStorageSaverActor";
import DynamicGeoJsonTileSource from "./TiledFeatureSource/DynamicGeoJsonTileSource";
import {BBox} from "../GeoOperations";
import {TileHierarchyMerger} from "./TiledFeatureSource/TileHierarchyMerger";
import RelationsTracker from "../Osm/RelationsTracker";


export default class FeaturePipeline implements FeatureSourceState {

    public readonly sufficientlyZoomed: UIEventSource<boolean>;
    public readonly runningQuery: UIEventSource<boolean>;
    public readonly timeout: UIEventSource<number>;
    public readonly somethingLoaded: UIEventSource<boolean> = new UIEventSource<boolean>(false)

    private readonly overpassUpdater: OverpassFeatureSource
    private readonly relationTracker: RelationsTracker
    private readonly perLayerHierarchy: Map<string, TileHierarchyMerger>;
    constructor(
        handleFeatureSource: (source: FeatureSourceForLayer) => void,
        state: {
            filteredLayers: UIEventSource<FilteredLayer[]>,
            locationControl: UIEventSource<Loc>,
            selectedElement: UIEventSource<any>,
            changes: Changes,
            layoutToUse: UIEventSource<LayoutConfig>,
            leafletMap: any,
            readonly overpassUrl: UIEventSource<string>;
            readonly overpassTimeout: UIEventSource<number>;
            readonly overpassMaxZoom: UIEventSource<number>;
        }) {

        const self = this
        const updater = new OverpassFeatureSource(state);
        this.overpassUpdater = updater;
        this.sufficientlyZoomed = updater.sufficientlyZoomed
        this.runningQuery = updater.runningQuery
        this.timeout = updater.timeout
        this.relationTracker = updater.relationsTracker
        // Register everything in the state' 'AllElements'
        new RegisteringAllFromFeatureSourceActor(updater)

        const perLayerHierarchy = new Map<string, TileHierarchyMerger>()
        this.perLayerHierarchy = perLayerHierarchy

        const patchedHandleFeatureSource = function (src: FeatureSourceForLayer) {
            // This will already contain the merged features for this tile. In other words, this will only be triggered once for every tile
            const srcFiltered =
                new FilteringFeatureSource(state,
                    new WayHandlingApplyingFeatureSource(
                        src,
                    )
                )
            handleFeatureSource(srcFiltered)
            self.somethingLoaded.setData(true)
        };

        function addToHierarchy(src: FeatureSource & Tiled, layerId: string) {
            perLayerHierarchy.get(layerId).registerTile(src)
        }

        for (const filteredLayer of state.filteredLayers.data) {
            const hierarchy = new TileHierarchyMerger(filteredLayer, (tile, _) => patchedHandleFeatureSource(tile))
            const id = filteredLayer.layerDef.id
            perLayerHierarchy.set(id, hierarchy)
            const source = filteredLayer.layerDef.source

            if (source.geojsonSource === undefined) {
                // This is an OSM layer
                // We load the cached values and register them
                // Getting data from upstream happens a bit lower
                new TiledFromLocalStorageSource(filteredLayer,
                    (src) => {
                        new RegisteringAllFromFeatureSourceActor(src)
                        hierarchy.registerTile(src);
                    }, state)
                continue
            }

            if (source.geojsonZoomLevel === undefined) {
                // This is a 'load everything at once' geojson layer
                // We split them up into tiles
                const src = new GeoJsonSource(filteredLayer)
                TiledFeatureSource.createHierarchy(src, {
                    layer: src.layer,
                    registerTile: (tile) => {
                        new RegisteringAllFromFeatureSourceActor(tile)
                        addToHierarchy(tile, id)
                    }
                })
            } else {
                new DynamicGeoJsonTileSource(
                    filteredLayer,
                    src => TiledFeatureSource.createHierarchy(src, {
                        layer: src.layer,
                        registerTile: (tile) => {
                            new RegisteringAllFromFeatureSourceActor(tile)
                            addToHierarchy(tile, id)
                        }
                    }),
                    state
                )
            }

        }

        // Actually load data from the overpass source

        new PerLayerFeatureSourceSplitter(state.filteredLayers,
            (source) => TiledFeatureSource.createHierarchy(source, {
                layer: source.layer,
                registerTile: (tile) => {
                    // We save the tile data for the given layer to local storage
                    const [z, x, y] = Utils.tile_from_index(tile.tileIndex)
                    new LocalStorageSaverActor(tile, x, y, z)
                    addToHierarchy(tile, source.layer.layerDef.id);
                }
            }), new RememberingSource(updater))


        // Whenever fresh data comes in, we need to update the metatagging
        updater.features.addCallback(_ => {
            self.updateAllMetaTagging()
        })

    }

    private updateAllMetaTagging() {
        console.log("Updating the meta tagging")
        const self = this;
        this.perLayerHierarchy.forEach(hierarchy => {
            hierarchy.loadedTiles.forEach(src => {
                MetaTagging.addMetatags(
                    src.features.data,
                    {
                        memberships: this.relationTracker,
                        getFeaturesWithin: (layerId, bbox: BBox) => self.GetFeaturesWithin(layerId, bbox)
                    },
                    src.layer.layerDef
                )
            })
        })

    }
    
    public GetAllFeaturesWithin(bbox: BBox): any[][]{
        const self = this
        const tiles = []
        Array.from(this.perLayerHierarchy.keys())
            .forEach(key => tiles.push(...self.GetFeaturesWithin(key, bbox)))
        return tiles;
    }
    
    public GetFeaturesWithin(layerId: string, bbox: BBox): any[][]{
        const requestedHierarchy = this.perLayerHierarchy.get(layerId)
        if (requestedHierarchy === undefined) {
            return undefined;
        }
        return TileHierarchyTools.getTiles(requestedHierarchy, bbox)
            .filter(featureSource => featureSource.features?.data !== undefined)
            .map(featureSource => featureSource.features.data.map(fs => fs.feature))
    }
    
    public GetTilesPerLayerWithin(bbox: BBox, handleTile: (tile:  FeatureSourceForLayer & Tiled) => void){
       Array.from(this.perLayerHierarchy.values()).forEach(hierarchy => {
            TileHierarchyTools.getTiles(hierarchy, bbox).forEach(handleTile)
        })
    }

    public ForceRefresh() {
        this.overpassUpdater.ForceRefresh()
    }
}