import FeatureSource, {FeatureSourceForLayer, Tiled} from "../../Logic/FeatureSource/FeatureSource";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
import {UIEventSource} from "../../Logic/UIEventSource";
import {Tiles} from "../../Models/TileRange";
import StaticFeatureSource from "../../Logic/FeatureSource/Sources/StaticFeatureSource";
import {BBox} from "../../Logic/BBox";
import FilteredLayer from "../../Models/FilteredLayer";

/**
 * A feature source containing but a single feature, which keeps stats about a tile
 */
export class TileHierarchyAggregator implements FeatureSource {
    private static readonly empty = []
    public totalValue: number = 0
    public showCount: number = 0
    public hiddenCount: number = 0
    public readonly features = new UIEventSource<{ feature: any, freshness: Date }[]>(TileHierarchyAggregator.empty)
    public readonly name;
    private _parent: TileHierarchyAggregator;
    private _root: TileHierarchyAggregator;
    private _z: number;
    private _x: number;
    private _y: number;
    private _tileIndex: number
    private _counter: SingleTileCounter
    private _subtiles: [TileHierarchyAggregator, TileHierarchyAggregator, TileHierarchyAggregator, TileHierarchyAggregator] = [undefined, undefined, undefined, undefined]
    private readonly featuresStatic = []
    private readonly featureProperties: { count: string, kilocount: string, tileId: string, id: string, showCount: string, totalCount: string };
    private readonly _state: { filteredLayers: UIEventSource<FilteredLayer[]> };
    private readonly updateSignal = new UIEventSource<any>(undefined)

    private constructor(parent: TileHierarchyAggregator,
                        state: {
                            filteredLayers: UIEventSource<FilteredLayer[]>
                        },
                        z: number, x: number, y: number) {
        this._parent = parent;
        this._state = state;
        this._root = parent?._root ?? this
        this._z = z;
        this._x = x;
        this._y = y;
        this._tileIndex = Tiles.tile_index(z, x, y)
        this.name = "Count(" + this._tileIndex + ")"

        const totals = {
            id: "" + this._tileIndex,
            tileId: "" + this._tileIndex,
            count: `0`,
            kilocount: "0",
            showCount: "0",
            totalCount: "0"
        }
        this.featureProperties = totals

        const now = new Date()
        const feature = {
            "type": "Feature",
            "properties": totals,
            "geometry": {
                "type": "Point",
                "coordinates": Tiles.centerPointOf(z, x, y)
            }
        }
        this.featuresStatic.push({feature: feature, freshness: now})

        const bbox = BBox.fromTile(z, x, y)
        const box = {
            "type": "Feature",
            "properties": totals,
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [bbox.minLon, bbox.minLat],
                        [bbox.minLon, bbox.maxLat],
                        [bbox.maxLon, bbox.maxLat],
                        [bbox.maxLon, bbox.minLat],
                        [bbox.minLon, bbox.minLat]
                    ]
                ]
            }
        }
        this.featuresStatic.push({feature: box, freshness: now})
    }

    public static createHierarchy(state: { filteredLayers: UIEventSource<FilteredLayer[]> }) {
        return new TileHierarchyAggregator(undefined, state, 0, 0, 0)
    }

    public getTile(tileIndex): TileHierarchyAggregator {
        if (tileIndex === this._tileIndex) {
            return this;
        }
        let [tileZ, tileX, tileY] = Tiles.tile_from_index(tileIndex)
        while (tileZ - 1 > this._z) {
            tileX = Math.floor(tileX / 2)
            tileY = Math.floor(tileY / 2)
            tileZ--
        }
        const xDiff = tileX - (2 * this._x)
        const yDiff = tileY - (2 * this._y)
        const subtileIndex = yDiff * 2 + xDiff;
        return this._subtiles[subtileIndex]?.getTile(tileIndex)
    }

    public addTile(source: FeatureSourceForLayer & Tiled) {
        const self = this;
        if (source.tileIndex === this._tileIndex) {
            if (this._counter === undefined) {
                this._counter = new SingleTileCounter(this._tileIndex)
                this._counter.countsPerLayer.addCallbackAndRun(_ => self.update())
            }
            this._counter.addTileCount(source)
        } else {

            // We have to give it to one of the subtiles
            let [tileZ, tileX, tileY] = Tiles.tile_from_index(source.tileIndex)
            while (tileZ - 1 > this._z) {
                tileX = Math.floor(tileX / 2)
                tileY = Math.floor(tileY / 2)
                tileZ--
            }
            const xDiff = tileX - (2 * this._x)
            const yDiff = tileY - (2 * this._y)

            const subtileIndex = yDiff * 2 + xDiff;
            if (this._subtiles[subtileIndex] === undefined) {
                this._subtiles[subtileIndex] = new TileHierarchyAggregator(this, this._state, tileZ, tileX, tileY)
            }
            this._subtiles[subtileIndex].addTile(source)
        }
        this.updateSignal.setData(source)
    }

    getCountsForZoom(clusteringConfig: { maxZoom: number }, locationControl: UIEventSource<{ zoom: number }>, cutoff: number = 0): FeatureSource {
        const self = this
        const empty = []
        const features = locationControl.map(loc => loc.zoom).map(targetZoom => {
            if (targetZoom - 1 > clusteringConfig.maxZoom) {
                return empty
            }

            const features = []
            self.visitSubTiles(aggr => {
                if (aggr.showCount < cutoff) {
                    return false
                }
                if (aggr._z === targetZoom) {
                    features.push(...aggr.features.data)
                    return false
                }
                return aggr._z <= targetZoom;
            })

            return features
        }, [this.updateSignal.stabilized(500)])

        return new StaticFeatureSource(features, true);
    }

    private update() {
        const newMap = new Map<string, number>()
        let total = 0
        let hiddenCount = 0
        let showCount = 0
        let isShown: Map<string, FilteredLayer> = new Map<string, FilteredLayer>()
        for (const filteredLayer of this._state.filteredLayers.data) {
            isShown.set(filteredLayer.layerDef.id, filteredLayer)
        }
        this?._counter?.countsPerLayer?.data?.forEach((count, layerId) => {
            newMap.set("layer:" + layerId, count)
            total += count
            this.featureProperties["direct_layer:" + layerId] = count
            const flayer = isShown.get(layerId)
            if (flayer.isDisplayed.data && this._z >= flayer.layerDef.minzoom) {
                showCount += count
            } else {
                hiddenCount += count;
            }
        })


        for (const tile of this._subtiles) {
            if (tile === undefined) {
                continue;
            }
            total += tile.totalValue

            showCount += tile.showCount
            hiddenCount += tile.hiddenCount

            for (const key in tile.featureProperties) {
                if (key.startsWith("layer:")) {
                    newMap.set(key, (newMap.get(key) ?? 0) + Number(tile.featureProperties[key] ?? 0))
                }
            }
        }

        this.totalValue = total
        this.showCount = showCount
        this.hiddenCount = hiddenCount
        this._parent?.update()

        if (total === 0) {
            this.features.setData(TileHierarchyAggregator.empty)
        } else {
            this.featureProperties.count = "" + total;
            this.featureProperties.kilocount = "" + Math.floor(total / 1000);
            this.featureProperties.showCount = "" + showCount
            this.featureProperties.totalCount = "" + total
            newMap.forEach((value, key) => {
                this.featureProperties[key] = "" + value
            })

            this.features.data = this.featuresStatic
            this.features.ping()
        }
    }

    private visitSubTiles(f: (aggr: TileHierarchyAggregator) => boolean) {
        const visitFurther = f(this)
        if (visitFurther) {
            this._subtiles.forEach(tile => tile?.visitSubTiles(f))
        }
    }
}

/**
 * Keeps track of a single tile
 */
class SingleTileCounter implements Tiled {
    public readonly bbox: BBox;
    public readonly tileIndex: number;
    public readonly countsPerLayer: UIEventSource<Map<string, number>> = new UIEventSource<Map<string, number>>(new Map<string, number>())
    public readonly z: number
    public readonly x: number
    public readonly y: number
    private readonly registeredLayers: Map<string, LayerConfig> = new Map<string, LayerConfig>();

    constructor(tileIndex: number) {
        this.tileIndex = tileIndex
        this.bbox = BBox.fromTileIndex(tileIndex)
        const [z, x, y] = Tiles.tile_from_index(tileIndex)
        this.z = z;
        this.x = x;
        this.y = y
    }

    public addTileCount(source: FeatureSourceForLayer) {
        const layer = source.layer.layerDef
        this.registeredLayers.set(layer.id, layer)
        const self = this
        source.features.map(f => {
            const isDisplayed = source.layer.isDisplayed.data
            self.countsPerLayer.data.set(layer.id, isDisplayed ? f.length : 0)
            self.countsPerLayer.ping()
        }, [source.layer.isDisplayed])
    }

}