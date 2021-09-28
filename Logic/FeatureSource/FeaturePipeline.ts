import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import FilteringFeatureSource from "./Sources/FilteringFeatureSource";
import PerLayerFeatureSourceSplitter from "./PerLayerFeatureSourceSplitter";
import FeatureSource, {FeatureSourceForLayer, IndexedFeatureSource, Tiled} from "./FeatureSource";
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
import TiledFromLocalStorageSource from "./TiledFeatureSource/TiledFromLocalStorageSource";
import SaveTileToLocalStorageActor from "./Actors/SaveTileToLocalStorageActor";
import DynamicGeoJsonTileSource from "./TiledFeatureSource/DynamicGeoJsonTileSource";
import {TileHierarchyMerger} from "./TiledFeatureSource/TileHierarchyMerger";
import RelationsTracker from "../Osm/RelationsTracker";
import {NewGeometryFromChangesFeatureSource} from "./Sources/NewGeometryFromChangesFeatureSource";
import ChangeGeometryApplicator from "./Sources/ChangeGeometryApplicator";
import {BBox} from "../BBox";
import OsmFeatureSource from "./TiledFeatureSource/OsmFeatureSource";
import {OsmConnection} from "../Osm/OsmConnection";
import {Tiles} from "../../Models/TileRange";


export default class FeaturePipeline {

    public readonly sufficientlyZoomed: UIEventSource<boolean>;
    
    public readonly runningQuery: UIEventSource<boolean>;
    public readonly timeout: UIEventSource<number>;
    
    public readonly somethingLoaded: UIEventSource<boolean> = new UIEventSource<boolean>(false)
    public readonly newDataLoadedSignal: UIEventSource<FeatureSource> = new UIEventSource<FeatureSource>(undefined)

    private readonly overpassUpdater: OverpassFeatureSource
    private readonly relationTracker: RelationsTracker
    private readonly perLayerHierarchy: Map<string, TileHierarchyMerger>;

    constructor(
        handleFeatureSource: (source: FeatureSourceForLayer & Tiled) => void,
        state: {
            readonly filteredLayers: UIEventSource<FilteredLayer[]>,
            readonly locationControl: UIEventSource<Loc>,
            readonly selectedElement: UIEventSource<any>,
            readonly changes: Changes,
            readonly  layoutToUse: LayoutConfig,
            readonly leafletMap: any,
            readonly overpassUrl: UIEventSource<string>;
            readonly overpassTimeout: UIEventSource<number>;
            readonly overpassMaxZoom: UIEventSource<number>;
            readonly osmConnection: OsmConnection
            readonly currentBounds: UIEventSource<BBox>
        }) {

        const self = this

        /**
         * Maps tileid onto last download moment
         */
        const tileFreshnesses = new Map<number, Date>()
        const osmSourceZoomLevel = 14
        const useOsmApi = state.locationControl.map(l => l.zoom > (state.overpassMaxZoom.data ?? 12))
        this.relationTracker = new RelationsTracker()

        const updater = new OverpassFeatureSource(state,
            {
                relationTracker: this.relationTracker,
                isActive: useOsmApi.map(b => !b),
                onUpdated: (bbox, freshness) => {
                    // This callback contains metadata of the overpass call
                    const range = bbox.containingTileRange(osmSourceZoomLevel)
                    Tiles.MapRange(range, (x, y) => {
                        tileFreshnesses.set(Tiles.tile_index(osmSourceZoomLevel, x, y), freshness)
                    })

                }
            });
        
        this.overpassUpdater = updater;
        this.sufficientlyZoomed = state.locationControl.map(location => {
                if (location?.zoom === undefined) {
                    return false;
                }
                let minzoom = Math.min(...state.layoutToUse.layers.map(layer => layer.minzoom ?? 18));
                return location.zoom >= minzoom;
            }
        );
        
        this.timeout = updater.timeout
        
        
        // Register everything in the state' 'AllElements'
        new RegisteringAllFromFeatureSourceActor(updater)


        const perLayerHierarchy = new Map<string, TileHierarchyMerger>()
        this.perLayerHierarchy = perLayerHierarchy

        const patchedHandleFeatureSource = function (src: FeatureSourceForLayer & IndexedFeatureSource & Tiled) {
            // This will already contain the merged features for this tile. In other words, this will only be triggered once for every tile
            const srcFiltered =
                new FilteringFeatureSource(state, src.tileIndex,
                    new WayHandlingApplyingFeatureSource(
                        new ChangeGeometryApplicator(src, state.changes)
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
                const localStorage = new TiledFromLocalStorageSource(filteredLayer,
                    (src) => {
                        new RegisteringAllFromFeatureSourceActor(src)
                        hierarchy.registerTile(src);
                        src.features.addCallbackAndRunD(_ => self.newDataLoadedSignal.setData(src))
                    }, state)

                localStorage.tileFreshness.forEach((value, key) => {
                    if (tileFreshnesses.has(key)) {
                        const previous = tileFreshnesses.get(key)
                        if (value < previous) {
                            tileFreshnesses.set(key, value)
                        }
                    } else {
                        tileFreshnesses.set(key, value)
                    }
                })


                continue
            }

            if (source.geojsonZoomLevel === undefined) {
                // This is a 'load everything at once' geojson layer
                // We split them up into tiles anyway
                const src = new GeoJsonSource(filteredLayer)
                TiledFeatureSource.createHierarchy(src, {
                    layer: src.layer,
                    minZoomLevel: 14,
                    dontEnforceMinZoom: true,
                    registerTile: (tile) => {
                        new RegisteringAllFromFeatureSourceActor(tile)
                        addToHierarchy(tile, id)
                        tile.features.addCallbackAndRunD(_ => self.newDataLoadedSignal.setData(tile))
                    }
                })
            } else {
                new DynamicGeoJsonTileSource(
                    filteredLayer,
                    tile => {
                        new RegisteringAllFromFeatureSourceActor(tile)
                        addToHierarchy(tile, id)
                        tile.features.addCallbackAndRunD(_ => self.newDataLoadedSignal.setData(tile))
                    },
                    state
                )
            }
        }

        console.log("Tilefreshnesses are", tileFreshnesses)
        const oldestAllowedDate = new Date(new Date().getTime() - (60 * 60 * 24 * 30 * 1000));

        const neededTilesFromOsm = state.currentBounds.map(bbox => {
            if (bbox === undefined) {
                return
            }
            const range = bbox.containingTileRange(osmSourceZoomLevel)
            const tileIndexes = []
            if (range.total > 100) {
                // Too much tiles!
                return []
            }
            Tiles.MapRange(range, (x, y) => {
                const i = Tiles.tile_index(osmSourceZoomLevel, x, y);
                if (tileFreshnesses.get(i) > oldestAllowedDate) {
                    console.debug("Skipping tile", osmSourceZoomLevel, x, y, "as a decently fresh one is available")
                    // The cached tiles contain decently fresh data
                    return;
                }
                tileIndexes.push(i)
            })
            return tileIndexes
        })

       const osmFeatureSource = new OsmFeatureSource({
            isActive: useOsmApi,
            neededTiles: neededTilesFromOsm,
            handleTile: tile => {
                new RegisteringAllFromFeatureSourceActor(tile)
                new SaveTileToLocalStorageActor(tile, tile.tileIndex)
                addToHierarchy(tile, tile.layer.layerDef.id),
                    tile.features.addCallbackAndRunD(_ => self.newDataLoadedSignal.setData(tile))

            },
            state: state
        })


        // Actually load data from the overpass source
        new PerLayerFeatureSourceSplitter(state.filteredLayers,
            (source) => TiledFeatureSource.createHierarchy(source, {
                layer: source.layer,
                minZoomLevel: 14,
                dontEnforceMinZoom: true,
                maxFeatureCount: state.layoutToUse.clustering.minNeededElements,
                maxZoomLevel: state.layoutToUse.clustering.maxZoom,
                registerTile: (tile) => {
                    // We save the tile data for the given layer to local storage
                    new SaveTileToLocalStorageActor(tile, tile.tileIndex)
                    addToHierarchy(new RememberingSource(tile), source.layer.layerDef.id);
                    tile.features.addCallbackAndRunD(_ => self.newDataLoadedSignal.setData(tile))

                }
            }),
            updater)


        // Also load points/lines that are newly added. 
        const newGeometry = new NewGeometryFromChangesFeatureSource(state.changes)
        new RegisteringAllFromFeatureSourceActor(newGeometry)
        // A NewGeometryFromChangesFeatureSource does not split per layer, so we do this next
        new PerLayerFeatureSourceSplitter(state.filteredLayers,
            (perLayer) => {
                // We don't bother to split them over tiles as it'll contain little features by default, so we simply add them like this
                addToHierarchy(perLayer, perLayer.layer.layerDef.id)
                // AT last, we always apply the metatags whenever possible
                perLayer.features.addCallbackAndRunD(_ => self.applyMetaTags(perLayer))
                perLayer.features.addCallbackAndRunD(_ => self.newDataLoadedSignal.setData(perLayer))

            },
            newGeometry
        )


        // Whenever fresh data comes in, we need to update the metatagging
        self.newDataLoadedSignal.stabilized(1000).addCallback(src => {
            self.updateAllMetaTagging()
        })


        this.runningQuery = updater.runningQuery.map(
            overpass => overpass || osmFeatureSource.isRunning.data, [osmFeatureSource.isRunning]
        )


    }

    private applyMetaTags(src: FeatureSourceForLayer) {
        const self = this
        console.debug("Applying metatagging onto ", src.name)
        window.setTimeout(
            () => {
                MetaTagging.addMetatags(
                    src.features.data,
                    {
                        memberships: this.relationTracker,
                        getFeaturesWithin: (layerId, bbox: BBox) => self.GetFeaturesWithin(layerId, bbox)
                    },
                    src.layer.layerDef,
                    {
                        includeDates: true,
                        // We assume that the non-dated metatags are already set by the cache generator
                        includeNonDates: !src.layer.layerDef.source.isOsmCacheLayer
                    }
                )
            },
            15
        )

    }

    private updateAllMetaTagging() {
        const self = this;
        console.log("Reupdating all metatagging")
        this.perLayerHierarchy.forEach(hierarchy => {
            hierarchy.loadedTiles.forEach(src => {
                self.applyMetaTags(src)
            })
        })

    }

    public GetAllFeaturesWithin(bbox: BBox): any[][] {
        const self = this
        const tiles = []
        Array.from(this.perLayerHierarchy.keys())
            .forEach(key => tiles.push(...self.GetFeaturesWithin(key, bbox)))
        return tiles;
    }

    public GetFeaturesWithin(layerId: string, bbox: BBox): any[][] {
        const requestedHierarchy = this.perLayerHierarchy.get(layerId)
        if (requestedHierarchy === undefined) {
            console.warn("Layer ", layerId, "is not defined. Try one of ", Array.from(this.perLayerHierarchy.keys()))
            return undefined;
        }
        return TileHierarchyTools.getTiles(requestedHierarchy, bbox)
            .filter(featureSource => featureSource.features?.data !== undefined)
            .map(featureSource => featureSource.features.data.map(fs => fs.feature))
    }

    public GetTilesPerLayerWithin(bbox: BBox, handleTile: (tile: FeatureSourceForLayer & Tiled) => void) {
        Array.from(this.perLayerHierarchy.values()).forEach(hierarchy => {
            TileHierarchyTools.getTiles(hierarchy, bbox).forEach(handleTile)
        })
    }

}