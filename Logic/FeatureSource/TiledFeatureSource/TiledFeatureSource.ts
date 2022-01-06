import FeatureSource, {FeatureSourceForLayer, IndexedFeatureSource, Tiled} from "../FeatureSource";
import {UIEventSource} from "../../UIEventSource";
import FilteredLayer from "../../../Models/FilteredLayer";
import TileHierarchy from "./TileHierarchy";
import {Tiles} from "../../../Models/TileRange";
import {BBox} from "../../BBox";

/**
 * Contains all features in a tiled fashion.
 * The data will be automatically broken down into subtiles when there are too much features in a single tile or if the zoomlevel is too high
 */
export default class TiledFeatureSource implements Tiled, IndexedFeatureSource, FeatureSourceForLayer, TileHierarchy<IndexedFeatureSource & FeatureSourceForLayer & Tiled> {
    public readonly z: number;
    public readonly x: number;
    public readonly y: number;
    public readonly parent: TiledFeatureSource;
    public readonly root: TiledFeatureSource
    public readonly layer: FilteredLayer;
    /* An index of all known tiles. allTiles[z][x][y].get('layerid') will yield the corresponding tile.
    * Only defined on the root element!
     */
    public readonly loadedTiles: Map<number, TiledFeatureSource & FeatureSourceForLayer> = undefined;

    public readonly maxFeatureCount: number;
    public readonly name;
    public readonly features: UIEventSource<{ feature: any, freshness: Date }[]>
    public readonly containedIds: UIEventSource<Set<string>>

    public readonly bbox: BBox;
    public readonly tileIndex: number;
    private upper_left: TiledFeatureSource
    private upper_right: TiledFeatureSource
    private lower_left: TiledFeatureSource
    private lower_right: TiledFeatureSource
    private readonly maxzoom: number;
    private readonly options: TiledFeatureSourceOptions

    private constructor(z: number, x: number, y: number, parent: TiledFeatureSource, options?: TiledFeatureSourceOptions) {
        this.z = z;
        this.x = x;
        this.y = y;
        this.bbox = BBox.fromTile(z, x, y)
        this.tileIndex = Tiles.tile_index(z, x, y)
        this.name = `TiledFeatureSource(${z},${x},${y})`
        this.parent = parent;
        this.layer = options.layer
        options = options ?? {}
        this.maxFeatureCount = options?.maxFeatureCount ?? 250;
        this.maxzoom = options.maxZoomLevel ?? 18
        this.options = options;
        if (parent === undefined) {
            throw "Parent is not allowed to be undefined. Use null instead"
        }
        if (parent === null && z !== 0 && x !== 0 && y !== 0) {
            throw "Invalid root tile: z, x and y should all be null"
        }
        if (parent === null) {
            this.root = this;
            this.loadedTiles = new Map()
        } else {
            this.root = this.parent.root;
            this.loadedTiles = this.root.loadedTiles;
            const i = Tiles.tile_index(z, x, y)
            this.root.loadedTiles.set(i, this)
        }
        this.features = new UIEventSource<any[]>([])
        this.containedIds = this.features.map(features => {
            if (features === undefined) {
                return undefined;
            }
            return new Set(features.map(f => f.feature.properties.id))
        })

        // We register this tile, but only when there is some data in it
        if (this.options.registerTile !== undefined) {
            this.features.addCallbackAndRunD(features => {
                if (features.length === 0) {
                    return;
                }
                this.options.registerTile(this)
                return true;
            })
        }


    }

    public static createHierarchy(features: FeatureSource, options?: TiledFeatureSourceOptions): TiledFeatureSource {
        options = {
            ...options,
            layer: features["layer"] ?? options.layer
        }
        const root = new TiledFeatureSource(0, 0, 0, null, options)
        features.features?.addCallbackAndRunD(feats => root.addFeatures(feats))
        return root;
    }

    private isSplitNeeded(featureCount: number) {
        if (this.upper_left !== undefined) {
            // This tile has been split previously, so we keep on splitting
            return true;
        }
        if (this.z >= this.maxzoom) {
            // We are not allowed to split any further
            return false
        }
        if (this.options.minZoomLevel !== undefined && this.z < this.options.minZoomLevel) {
            // We must have at least this zoom level before we are allowed to start splitting
            return true
        }

        // To much features - we split
        return featureCount > this.maxFeatureCount

    }

    /***
     * Adds the list of features to this hierarchy.
     * If there are too much features, the list will be broken down and distributed over the subtiles (only retaining features that don't fit a subtile on this level)
     * @param features
     * @private
     */
    private addFeatures(features: { feature: any, freshness: Date }[]) {
        if (features === undefined || features.length === 0) {
            return;
        }

        if (!this.isSplitNeeded(features.length)) {
            this.features.setData(features)
            return;
        }

        if (this.upper_left === undefined) {
            this.upper_left = new TiledFeatureSource(this.z + 1, this.x * 2, this.y * 2, this, this.options)
            this.upper_right = new TiledFeatureSource(this.z + 1, this.x * 2 + 1, this.y * 2, this, this.options)
            this.lower_left = new TiledFeatureSource(this.z + 1, this.x * 2, this.y * 2 + 1, this, this.options)
            this.lower_right = new TiledFeatureSource(this.z + 1, this.x * 2 + 1, this.y * 2 + 1, this, this.options)
        }

        const ulf = []
        const urf = []
        const llf = []
        const lrf = []
        const overlapsboundary = []

        for (const feature of features) {
            const bbox = BBox.get(feature.feature)

            if (this.options.dontEnforceMinZoom) {
                if (bbox.overlapsWith(this.upper_left.bbox)) {
                    ulf.push(feature)
                } else if (bbox.overlapsWith(this.upper_right.bbox)) {
                    urf.push(feature)
                } else if (bbox.overlapsWith(this.lower_left.bbox)) {
                    llf.push(feature)
                } else if (bbox.overlapsWith(this.lower_right.bbox)) {
                    lrf.push(feature)
                } else {
                    overlapsboundary.push(feature)
                }
            } else if (this.options.minZoomLevel === undefined) {
                if (bbox.isContainedIn(this.upper_left.bbox)) {
                    ulf.push(feature)
                } else if (bbox.isContainedIn(this.upper_right.bbox)) {
                    urf.push(feature)
                } else if (bbox.isContainedIn(this.lower_left.bbox)) {
                    llf.push(feature)
                } else if (bbox.isContainedIn(this.lower_right.bbox)) {
                    lrf.push(feature)
                } else {
                    overlapsboundary.push(feature)
                }
            } else {
                // We duplicate a feature on a boundary into every tile as we need to get to the minZoomLevel
                if (bbox.overlapsWith(this.upper_left.bbox)) {
                    ulf.push(feature)
                }
                if (bbox.overlapsWith(this.upper_right.bbox)) {
                    urf.push(feature)
                }
                if (bbox.overlapsWith(this.lower_left.bbox)) {
                    llf.push(feature)
                }
                if (bbox.overlapsWith(this.lower_right.bbox)) {
                    lrf.push(feature)
                }
            }
        }
        this.upper_left.addFeatures(ulf)
        this.upper_right.addFeatures(urf)
        this.lower_left.addFeatures(llf)
        this.lower_right.addFeatures(lrf)
        this.features.setData(overlapsboundary)

    }
}

export interface TiledFeatureSourceOptions {
    readonly maxFeatureCount?: number,
    readonly maxZoomLevel?: number,
    readonly minZoomLevel?: number,
    /**
     * IF minZoomLevel is set, and if a feature runs through a tile boundary, it would normally be duplicated.
     * Setting 'dontEnforceMinZoomLevel' will still allow bigger zoom levels for those features.
     * If 'pick_first' is set, the feature will not be duplicated but set to some tile
     */
    readonly dontEnforceMinZoom?: boolean | "pick_first",
    readonly registerTile?: (tile: TiledFeatureSource & FeatureSourceForLayer & Tiled) => void,
    readonly layer?: FilteredLayer
}