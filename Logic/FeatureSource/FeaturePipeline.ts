import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import FilteringFeatureSource from "./Sources/FilteringFeatureSource";
import PerLayerFeatureSourceSplitter from "./PerLayerFeatureSourceSplitter";
import FeatureSource, {FeatureSourceForLayer, IndexedFeatureSource, Tiled} from "./FeatureSource";
import TiledFeatureSource from "./TiledFeatureSource/TiledFeatureSource";
import {UIEventSource} from "../UIEventSource";
import {TileHierarchyTools} from "./TiledFeatureSource/TileHierarchy";
import RememberingSource from "./Sources/RememberingSource";
import OverpassFeatureSource from "../Actors/OverpassFeatureSource";
import GeoJsonSource from "./Sources/GeoJsonSource";
import Loc from "../../Models/Loc";
import RegisteringAllFromFeatureSourceActor from "./Actors/RegisteringAllFromFeatureSourceActor";
import SaveTileToLocalStorageActor from "./Actors/SaveTileToLocalStorageActor";
import DynamicGeoJsonTileSource from "./TiledFeatureSource/DynamicGeoJsonTileSource";
import {TileHierarchyMerger} from "./TiledFeatureSource/TileHierarchyMerger";
import RelationsTracker from "../Osm/RelationsTracker";
import {NewGeometryFromChangesFeatureSource} from "./Sources/NewGeometryFromChangesFeatureSource";
import ChangeGeometryApplicator from "./Sources/ChangeGeometryApplicator";
import {BBox} from "../BBox";
import OsmFeatureSource from "./TiledFeatureSource/OsmFeatureSource";
import {Tiles} from "../../Models/TileRange";
import TileFreshnessCalculator from "./TileFreshnessCalculator";
import FullNodeDatabaseSource from "./TiledFeatureSource/FullNodeDatabaseSource";
import MapState from "../State/MapState";
import {ElementStorage} from "../ElementStorage";


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
    public readonly relationTracker: RelationsTracker
    /**
     * Keeps track of all raw OSM-nodes.
     * Only initialized if 'type_node' is defined as layer
     */
    public readonly fullNodeDatabase?: FullNodeDatabaseSource
    private readonly overpassUpdater: OverpassFeatureSource
    private state: MapState;
    private readonly perLayerHierarchy: Map<string, TileHierarchyMerger>;
    /**
     * Keeps track of the age of the loaded data.
     * Has one freshness-Calculator for every layer
     * @private
     */
    private readonly freshnesses = new Map<string, TileFreshnessCalculator>();
    private readonly oldestAllowedDate: Date;
    private readonly osmSourceZoomLevel
    private readonly localStorageSavers = new Map<string, SaveTileToLocalStorageActor>()

    constructor(
        handleFeatureSource: (source: FeatureSourceForLayer & Tiled) => void,
        state: MapState,
        options?: {
            /*Used for metatagging - will receive all the sources with changeGeometry applied but without filtering*/
            handleRawFeatureSource: (source: FeatureSourceForLayer) => void
        }
    ) {
        this.state = state;

        const self = this
        const expiryInSeconds = Math.min(...state.layoutToUse.layers.map(l => l.maxAgeOfCache))
        this.oldestAllowedDate = new Date(new Date().getTime() - expiryInSeconds);
        this.osmSourceZoomLevel = state.osmApiTileSize.data;
        const useOsmApi = state.locationControl.map(l => l.zoom > (state.overpassMaxZoom.data ?? 12))
        this.relationTracker = new RelationsTracker()

        state.changes.allChanges.addCallbackAndRun(allChanges => {
            allChanges.filter(ch => ch.id < 0 && ch.changes !== undefined)
                .map(ch => ch.changes)
                .filter(coor => coor["lat"] !== undefined && coor["lon"] !== undefined)
                .forEach(coor => {
                    state.layoutToUse.layers.forEach(l => self.localStorageSavers.get(l.id)?.poison(coor["lon"], coor["lat"]))
                })
        })


        this.sufficientlyZoomed = state.locationControl.map(location => {
                if (location?.zoom === undefined) {
                    return false;
                }
                let minzoom = Math.min(...state.filteredLayers.data.map(layer => layer.layerDef.minzoom ?? 18));
                return location.zoom >= minzoom;
            }
        );

        const neededTilesFromOsm = this.getNeededTilesFromOsm(this.sufficientlyZoomed)

        const perLayerHierarchy = new Map<string, TileHierarchyMerger>()
        this.perLayerHierarchy = perLayerHierarchy

        // Given a tile, wraps it and passes it on to render (handled by 'handleFeatureSource'
        function patchedHandleFeatureSource(src: FeatureSourceForLayer & IndexedFeatureSource & Tiled) {
            // This will already contain the merged features for this tile. In other words, this will only be triggered once for every tile
            const withChanges = new ChangeGeometryApplicator(src, state.changes);
            const srcFiltered = new FilteringFeatureSource(state, src.tileIndex, withChanges)

            handleFeatureSource(srcFiltered)
            if (options?.handleRawFeatureSource) {
                options.handleRawFeatureSource(withChanges)
            }
            self.somethingLoaded.setData(true)
            // We do not mark as visited here, this is the responsability of the code near the actual loader (e.g. overpassLoader and OSMApiFeatureLoader)
        }

        function handlePriviligedFeatureSource(src: FeatureSourceForLayer & Tiled) {
            // Passthrough to passed function, except that it registers as well
            handleFeatureSource(src)
            src.features.addCallbackAndRunD(fs => {
                fs.forEach(ff => state.allElements.addOrGetElement(ff.feature))
            })
        }


        for (const filteredLayer of state.filteredLayers.data) {
            const id = filteredLayer.layerDef.id
            const source = filteredLayer.layerDef.source

            const hierarchy = new TileHierarchyMerger(filteredLayer, (tile, _) => patchedHandleFeatureSource(tile))
            perLayerHierarchy.set(id, hierarchy)

            this.freshnesses.set(id, new TileFreshnessCalculator())

            if (id === "type_node") {

                this.fullNodeDatabase = new FullNodeDatabaseSource(
                    filteredLayer,
                    tile => {
                        new RegisteringAllFromFeatureSourceActor(tile, state.allElements)
                        perLayerHierarchy.get(tile.layer.layerDef.id).registerTile(tile)
                        tile.features.addCallbackAndRunD(_ => self.onNewDataLoaded(tile))
                    });
                continue;
            }

            if (id === "gps_location") {
                handlePriviligedFeatureSource(state.currentUserLocation)
                continue
            }

            if (id === "gps_location_history") {
                handlePriviligedFeatureSource(state.historicalUserLocations)
                continue
            }

            if (id === "gps_track") {
                handlePriviligedFeatureSource(state.historicalUserLocationsTrack)
                continue
            }

            if (id === "home_location") {
                handlePriviligedFeatureSource(state.homeLocation)
                continue
            }

            if (id === "current_view") {
                handlePriviligedFeatureSource(state.currentView)
                continue
            }

            const localTileSaver = new SaveTileToLocalStorageActor(filteredLayer)
            this.localStorageSavers.set(filteredLayer.layerDef.id, localTileSaver)

            if (source.geojsonSource === undefined) {
                // This is an OSM layer
                // We load the cached values and register them
                // Getting data from upstream happens a bit lower
                localTileSaver.LoadTilesFromDisk(
                    state.currentBounds, state.locationControl,
                    (tileIndex, freshness) => self.freshnesses.get(id).addTileLoad(tileIndex, freshness),
                    (tile) => {
                        console.debug("Loaded tile ", id, tile.tileIndex, "from local cache")
                        new RegisteringAllFromFeatureSourceActor(tile, state.allElements)
                        hierarchy.registerTile(tile);
                        tile.features.addCallbackAndRunD(_ => self.onNewDataLoaded(tile))
                    }
                )

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
                            new RegisteringAllFromFeatureSourceActor(tile, state.allElements)
                            perLayerHierarchy.get(id).registerTile(tile)
                            tile.features.addCallbackAndRunD(_ => self.onNewDataLoaded(tile))
                        }
                    })
                } else {
                    new RegisteringAllFromFeatureSourceActor(src, state.allElements)
                    perLayerHierarchy.get(id).registerTile(src)
                    src.features.addCallbackAndRunD(_ => self.onNewDataLoaded(src))
                }
            } else {
                new DynamicGeoJsonTileSource(
                    filteredLayer,
                    tile => {
                        new RegisteringAllFromFeatureSourceActor(tile, state.allElements)
                        perLayerHierarchy.get(id).registerTile(tile)
                        tile.features.addCallbackAndRunD(_ => self.onNewDataLoaded(tile))
                    },
                    state
                )
            }
        }


        const osmFeatureSource = new OsmFeatureSource({
            isActive: useOsmApi,
            neededTiles: neededTilesFromOsm,
            handleTile: tile => {
                new RegisteringAllFromFeatureSourceActor(tile, state.allElements)
                if (tile.layer.layerDef.maxAgeOfCache > 0) {
                    const saver = self.localStorageSavers.get(tile.layer.layerDef.id)
                    if (saver === undefined) {
                        console.error("No localStorageSaver found for layer ", tile.layer.layerDef.id)
                    }
                    saver?.addTile(tile)
                }
                perLayerHierarchy.get(tile.layer.layerDef.id).registerTile(tile)
                tile.features.addCallbackAndRunD(_ => self.onNewDataLoaded(tile))

            },
            state: state,
            markTileVisited: (tileId) =>
                state.filteredLayers.data.forEach(flayer => {
                    const layer = flayer.layerDef
                    if (layer.maxAgeOfCache > 0) {
                        const saver = self.localStorageSavers.get(layer.id)
                        if (saver === undefined) {
                            console.error("No local storage saver found for ", layer.id)
                        } else {
                            saver.MarkVisited(tileId, new Date())
                        }
                    }
                    self.freshnesses.get(layer.id).addTileLoad(tileId, new Date())
                })
        })

        if (this.fullNodeDatabase !== undefined) {
            osmFeatureSource.rawDataHandlers.push((osmJson, tileId) => this.fullNodeDatabase.handleOsmJson(osmJson, tileId))
        }


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
                    // We save the tile data for the given layer to local storage - data sourced from overpass
                    self.localStorageSavers.get(tile.layer.layerDef.id)?.addTile(tile)
                    perLayerHierarchy.get(source.layer.layerDef.id).registerTile(new RememberingSource(tile))
                    tile.features.addCallbackAndRunD(f => {
                        if (f.length === 0) {
                            return
                        }
                        self.onNewDataLoaded(tile)
                    })

                }
            }),
            updater,
            {
                handleLeftovers: (leftOvers) => {
                    console.warn("Overpass returned a few non-matched features:", leftOvers)
                }
            })


        // Also load points/lines that are newly added. 
        const newGeometry = new NewGeometryFromChangesFeatureSource(state.changes, state.allElements, state.osmConnection._oauth_config.url)
        newGeometry.features.addCallbackAndRun(geometries => {
            console.debug("New geometries are:", geometries)
        })

        new RegisteringAllFromFeatureSourceActor(newGeometry, state.allElements)
        // A NewGeometryFromChangesFeatureSource does not split per layer, so we do this next
        new PerLayerFeatureSourceSplitter(state.filteredLayers,
            (perLayer) => {
                // We don't bother to split them over tiles as it'll contain little features by default, so we simply add them like this
                perLayerHierarchy.get(perLayer.layer.layerDef.id).registerTile(perLayer)
                // AT last, we always apply the metatags whenever possible
                perLayer.features.addCallbackAndRunD(feats => {
                    self.onNewDataLoaded(perLayer);
                })

            },
            newGeometry,
            {
                handleLeftovers: (leftOvers) => {
                    console.warn("Got some leftovers from the filteredLayers: ", leftOvers)
                }
            }
        )

        this.runningQuery = updater.runningQuery.map(
            overpass => {
                console.log("FeaturePipeline: runningQuery state changed: Overpass", overpass ? "is querying," : "is idle,",
                    "osmFeatureSource is", osmFeatureSource.isRunning ? "is running and needs " + neededTilesFromOsm.data?.length + " tiles (already got " + osmFeatureSource.downloadedTiles.size + " tiles )" : "is idle")
                return overpass || osmFeatureSource.isRunning.data;
            }, [osmFeatureSource.isRunning]
        )

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

    private onNewDataLoaded(src: FeatureSource) {
        this.newDataLoadedSignal.setData(src)
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
            if (flayer.layerDef.maxAgeOfCache === 0) {
                return undefined;
            }
            const freshnessCalc = this.freshnesses.get(flayer.layerDef.id)
            if (freshnessCalc === undefined) {
                console.warn("No freshness tracker found for ", flayer.layerDef.id)
                return undefined
            }
            const freshness = freshnessCalc.freshnessFor(z, x, y)
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
        allElements: ElementStorage;
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
                console.debug("Disabling overpass source: no bbox")
                return false
            }
            let zoom = state.locationControl.data.zoom
            if (zoom < minzoom) {
                // We are zoomed out over the zoomlevel of any layer
                console.debug("Disabling overpass source: zoom < minzoom")
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
                freshnesses: this.freshnesses,
                onBboxLoaded: (bbox, date, downloadedLayers, paddedToZoomLevel) => {
                    Tiles.MapRange(bbox.containingTileRange(paddedToZoomLevel), (x, y) => {
                        const tileIndex = Tiles.tile_index(paddedToZoomLevel, x, y)
                        downloadedLayers.forEach(layer => {
                            self.freshnesses.get(layer.id).addTileLoad(tileIndex, date)
                            self.localStorageSavers.get(layer.id)?.MarkVisited(tileIndex, date)
                        })
                    })

                }
            });


        // Register everything in the state' 'AllElements'
        new RegisteringAllFromFeatureSourceActor(updater, state.allElements)
        return updater;
    }

}