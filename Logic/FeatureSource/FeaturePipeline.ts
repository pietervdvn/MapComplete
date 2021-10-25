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
import TileFreshnessCalculator from "./TileFreshnessCalculator";


/**
 * The features pipeline ties together a myriad of various datasources:
 *
 * - The Overpass-API
 * - The OSM-API
 * - Third-party geojson files, either sliced or directly.
 *
 * In order to truly understand this class, please have a look at the following diagram: https://cdn-images-1.medium.com/fit/c/800/618/1*qTK1iCtyJUr4zOyw4IFD7A.jpeg
 *
 *
 */
export default class FeaturePipeline {

    public readonly sufficientlyZoomed: UIEventSource<boolean>;

    public readonly runningQuery: UIEventSource<boolean>;
    public readonly timeout: UIEventSource<number>;

    public readonly somethingLoaded: UIEventSource<boolean> = new UIEventSource<boolean>(false)
    public readonly newDataLoadedSignal: UIEventSource<FeatureSource> = new UIEventSource<FeatureSource>(undefined)

    private readonly overpassUpdater: OverpassFeatureSource
    private state: {
        readonly filteredLayers: UIEventSource<FilteredLayer[]>,
        readonly locationControl: UIEventSource<Loc>,
        readonly selectedElement: UIEventSource<any>,
        readonly changes: Changes,
        readonly layoutToUse: LayoutConfig,
        readonly leafletMap: any,
        readonly overpassUrl: UIEventSource<string[]>;
        readonly overpassTimeout: UIEventSource<number>;
        readonly overpassMaxZoom: UIEventSource<number>;
        readonly osmConnection: OsmConnection
        readonly currentBounds: UIEventSource<BBox>
    };
    private readonly relationTracker: RelationsTracker
    private readonly perLayerHierarchy: Map<string, TileHierarchyMerger>;

    private readonly freshnesses = new Map<string, TileFreshnessCalculator>();

    private readonly oldestAllowedDate: Date;
    private readonly osmSourceZoomLevel

    constructor(
        handleFeatureSource: (source: FeatureSourceForLayer & Tiled) => void,
        state: {
            readonly filteredLayers: UIEventSource<FilteredLayer[]>,
            readonly locationControl: UIEventSource<Loc>,
            readonly selectedElement: UIEventSource<any>,
            readonly changes: Changes,
            readonly layoutToUse: LayoutConfig,
            readonly leafletMap: any,
            readonly overpassUrl: UIEventSource<string[]>;
            readonly overpassTimeout: UIEventSource<number>;
            readonly overpassMaxZoom: UIEventSource<number>;
            readonly osmConnection: OsmConnection
            readonly currentBounds: UIEventSource<BBox>,
            readonly osmApiTileSize: UIEventSource<number>
        }) {
        this.state = state;

        const self = this
        const expiryInSeconds = Math.min(...state.layoutToUse.layers.map(l => l.maxAgeOfCache))
        for (const layer of state.layoutToUse.layers) {
            TiledFromLocalStorageSource.cleanCacheForLayer(layer)
        }
        this.oldestAllowedDate = new Date(new Date().getTime() - expiryInSeconds);
        this.osmSourceZoomLevel = state.osmApiTileSize.data;
        const useOsmApi = state.locationControl.map(l => l.zoom > (state.overpassMaxZoom.data ?? 12))
        this.relationTracker = new RelationsTracker()
        
        state.changes.allChanges.addCallbackAndRun(allChanges => {
            allChanges.filter(ch => ch.id < 0 && ch.changes !== undefined)
                .map(ch => ch.changes)
                .filter(coor => coor["lat"] !== undefined && coor["lon"] !== undefined)
                .forEach(coor => {
                    SaveTileToLocalStorageActor.poison(state.layoutToUse.layers.map(l => l.id), coor["lon"], coor["lat"])
                })
        })


        this.sufficientlyZoomed = state.locationControl.map(location => {
                if (location?.zoom === undefined) {
                    return false;
                }
                let minzoom = Math.min(...state.layoutToUse.layers.map(layer => layer.minzoom ?? 18));
                return location.zoom >= minzoom;
            }
        );

        const neededTilesFromOsm = this.getNeededTilesFromOsm(this.sufficientlyZoomed)

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
            // We do not mark as visited here, this is the responsability of the code near the actual loader (e.g. overpassLoader and OSMApiFeatureLoader)
        };


        for (const filteredLayer of state.filteredLayers.data) {
            const id = filteredLayer.layerDef.id
            const source = filteredLayer.layerDef.source

            const hierarchy = new TileHierarchyMerger(filteredLayer, (tile, _) => patchedHandleFeatureSource(tile))
            perLayerHierarchy.set(id, hierarchy)

            this.freshnesses.set(id, new TileFreshnessCalculator())

            if (source.geojsonSource === undefined) {
                // This is an OSM layer
                // We load the cached values and register them
                // Getting data from upstream happens a bit lower
                new TiledFromLocalStorageSource(filteredLayer,
                    (src) => {
                        new RegisteringAllFromFeatureSourceActor(src)
                        hierarchy.registerTile(src);
                        src.features.addCallbackAndRunD(_ => self.newDataLoadedSignal.setData(src))
                    }, state)

                TiledFromLocalStorageSource.GetFreshnesses(id).forEach((value, key) => {
                    self.freshnesses.get(id).addTileLoad(key, value)
                })

                continue
            }

            if (source.geojsonZoomLevel === undefined) {
                // This is a 'load everything at once' geojson layer
                const src = new GeoJsonSource(filteredLayer)

                if (source.isOsmCacheLayer) {
                    // We split them up into tiles anyway as it is an OSM source
                    TiledFeatureSource.createHierarchy(src, {
                        layer: src.layer,
                        minZoomLevel: this.osmSourceZoomLevel,
                        dontEnforceMinZoom: true,
                        registerTile: (tile) => {
                            new RegisteringAllFromFeatureSourceActor(tile)
                            perLayerHierarchy.get(id).registerTile(tile)
                            tile.features.addCallbackAndRunD(_ => self.newDataLoadedSignal.setData(tile))
                        }
                    })
                } else {
                    new RegisteringAllFromFeatureSourceActor(src)
                    perLayerHierarchy.get(id).registerTile(src)
                    src.features.addCallbackAndRunD(_ => self.newDataLoadedSignal.setData(src))
                }
            } else {
                new DynamicGeoJsonTileSource(
                    filteredLayer,
                    tile => {
                        new RegisteringAllFromFeatureSourceActor(tile)
                        perLayerHierarchy.get(id).registerTile(tile)
                        tile.features.addCallbackAndRunD(_ => self.newDataLoadedSignal.setData(tile))
                    },
                    state
                )
            }
        }


        const osmFeatureSource = new OsmFeatureSource({
            isActive: useOsmApi,
            neededTiles: neededTilesFromOsm,
            handleTile: tile => {
                new RegisteringAllFromFeatureSourceActor(tile)
                new SaveTileToLocalStorageActor(tile, tile.tileIndex)
                perLayerHierarchy.get(tile.layer.layerDef.id).registerTile(tile)
                tile.features.addCallbackAndRunD(_ => self.newDataLoadedSignal.setData(tile))

            },
            state: state,
            markTileVisited: (tileId) =>
                state.filteredLayers.data.forEach(flayer => {
                    SaveTileToLocalStorageActor.MarkVisited(flayer.layerDef.id, tileId, new Date())
                    self.freshnesses.get(flayer.layerDef.id).addTileLoad(tileId, new Date())
                })
        })


        const updater = this.initOverpassUpdater(state, useOsmApi)
        this.overpassUpdater = updater;
        this.timeout = updater.timeout

        // Actually load data from the overpass source
        new PerLayerFeatureSourceSplitter(state.filteredLayers,
            (source) => TiledFeatureSource.createHierarchy(source, {
                layer: source.layer,
                minZoomLevel: source.layer.layerDef.minzoom,
                dontEnforceMinZoom: true,
                maxFeatureCount: state.layoutToUse.clustering.minNeededElements,
                maxZoomLevel: state.layoutToUse.clustering.maxZoom,
                registerTile: (tile) => {
                    // We save the tile data for the given layer to local storage
                    if (source.layer.layerDef.source.geojsonSource === undefined || source.layer.layerDef.source.isOsmCacheLayer == true) {
                        new SaveTileToLocalStorageActor(tile, tile.tileIndex)
                    }
                    perLayerHierarchy.get(source.layer.layerDef.id).registerTile(new RememberingSource(tile))
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
                perLayerHierarchy.get(perLayer.layer.layerDef.id).registerTile(perLayer)
                // AT last, we always apply the metatags whenever possible
                perLayer.features.addCallbackAndRunD(_ => self.applyMetaTags(perLayer))
                perLayer.features.addCallbackAndRunD(_ => self.newDataLoadedSignal.setData(perLayer))

            },
            newGeometry
        )


        // Whenever fresh data comes in, we need to update the metatagging
        self.newDataLoadedSignal.stabilized(1000).addCallback(_ => {
            self.updateAllMetaTagging()
        })


        this.runningQuery = updater.runningQuery.map(
            overpass => {
                console.log("FeaturePipeline: runningQuery state changed. Overpass", overpass ? "is querying," : "is idle,",
                    "osmFeatureSource is", osmFeatureSource.isRunning ? "is running and needs " + neededTilesFromOsm.data?.length + " tiles (already got " + osmFeatureSource.downloadedTiles.size + " tiles )" : "is idle")
                return overpass || osmFeatureSource.isRunning.data;
            }, [osmFeatureSource.isRunning]
        )


    }

    private freshnessForVisibleLayers(z: number, x: number, y: number): Date {
        let oldestDate = undefined;
        for (const flayer of this.state.filteredLayers.data) {
            if (!flayer.isDisplayed.data) {
                continue
            }
            if (this.state.locationControl.data.zoom < flayer.layerDef.minzoom) {
                continue;
            }
            const freshness = this.freshnesses.get(flayer.layerDef.id).freshnessFor(z, x, y)
            if (freshness === undefined) {
                // SOmething is undefined --> we return undefined as we have to download
                return undefined
            }
            if (oldestDate === undefined || oldestDate > freshness) {
                oldestDate = freshness
            }
        }
        return oldestDate
    }

    private getNeededTilesFromOsm(isSufficientlyZoomed: UIEventSource<boolean>): UIEventSource<number[]> {
        const self = this
        return this.state.currentBounds.map(bbox => {
            if (bbox === undefined) {
                return []
            }
            if (!isSufficientlyZoomed.data) {
                return [];
            }
            const osmSourceZoomLevel = self.osmSourceZoomLevel
            const range = bbox.containingTileRange(osmSourceZoomLevel)
            const tileIndexes = []
            if (range.total >= 100) {
                // Too much tiles!
                return undefined
            }
            Tiles.MapRange(range, (x, y) => {
                const i = Tiles.tile_index(osmSourceZoomLevel, x, y);
                const oldestDate = self.freshnessForVisibleLayers(osmSourceZoomLevel, x, y)
                if (oldestDate !== undefined && oldestDate > this.oldestAllowedDate) {
                    console.debug("Skipping tile", osmSourceZoomLevel, x, y, "as a decently fresh one is available")
                    // The cached tiles contain decently fresh data
                    return undefined;
                }
                tileIndexes.push(i)
            })
            return tileIndexes
        }, [isSufficientlyZoomed])
    }

    private initOverpassUpdater(state: {
        layoutToUse: LayoutConfig,
        currentBounds: UIEventSource<BBox>,
        locationControl: UIEventSource<Loc>,
        readonly overpassUrl: UIEventSource<string[]>;
        readonly overpassTimeout: UIEventSource<number>;
        readonly overpassMaxZoom: UIEventSource<number>,
    }, useOsmApi: UIEventSource<boolean>): OverpassFeatureSource {
        const minzoom = Math.min(...state.layoutToUse.layers.map(layer => layer.minzoom))
        const overpassIsActive = state.currentBounds.map(bbox => {
            if (bbox === undefined) {
                return false
            }
            let zoom = state.locationControl.data.zoom
            if (zoom < minzoom) {
                // We are zoomed out over the zoomlevel of any layer
                return false;
            }

            const range = bbox.containingTileRange(zoom)
            if (range.total >= 5000) {
                // Let's assume we don't have so much data cached
                return true
            }
            const self = this;
            const allFreshnesses = Tiles.MapRange(range, (x, y) => self.freshnessForVisibleLayers(zoom, x, y))
            return allFreshnesses.some(freshness => freshness === undefined || freshness < this.oldestAllowedDate)
        }, [state.locationControl])

        const self = this;
        const updater = new OverpassFeatureSource(state,
            {
                padToTiles: state.locationControl.map(l => Math.min(15, l.zoom + 1)),
                relationTracker: this.relationTracker,
                isActive: useOsmApi.map(b => !b && overpassIsActive.data, [overpassIsActive]),
                onBboxLoaded: (bbox, date, downloadedLayers, paddedToZoomLevel) => {
                    Tiles.MapRange(bbox.containingTileRange(paddedToZoomLevel), (x, y) => {
                        const tileIndex = Tiles.tile_index(paddedToZoomLevel, x, y)
                        downloadedLayers.forEach(layer => {
                            self.freshnesses.get(layer.id).addTileLoad(tileIndex, date)
                            SaveTileToLocalStorageActor.MarkVisited(layer.id, tileIndex, date)
                        })
                    })

                }
            });


        // Register everything in the state' 'AllElements'
        new RegisteringAllFromFeatureSourceActor(updater)
        return updater;
    }

    private applyMetaTags(src: FeatureSourceForLayer) {
        const self = this
        window.setTimeout(
            () => {
                const layerDef = src.layer.layerDef;
                MetaTagging.addMetatags(
                    src.features.data,
                    {
                        memberships: this.relationTracker,
                        getFeaturesWithin: (layerId, bbox: BBox) => self.GetFeaturesWithin(layerId, bbox)
                    },
                    layerDef,
                    {
                        includeDates: true,
                        // We assume that the non-dated metatags are already set by the cache generator
                        includeNonDates: layerDef.source.geojsonSource === undefined || !layerDef.source.isOsmCacheLayer
                    }
                )
            },
            15
        )

    }

    private updateAllMetaTagging() {
        const self = this;
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
        if (layerId === "*") {
            return this.GetAllFeaturesWithin(bbox)
        }
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