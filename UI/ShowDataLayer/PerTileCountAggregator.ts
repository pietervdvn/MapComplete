import FeatureSource, {FeatureSourceForLayer, Tiled} from "../../Logic/FeatureSource/FeatureSource";
import {BBox} from "../../Logic/GeoOperations";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
import {UIEventSource} from "../../Logic/UIEventSource";
import {Tiles} from "../../Models/TileRange";
import StaticFeatureSource from "../../Logic/FeatureSource/Sources/StaticFeatureSource";

export class TileHierarchyAggregator implements FeatureSource {
    private _parent: TileHierarchyAggregator;
    private _root: TileHierarchyAggregator;
    private _z: number;
    private _x: number;
    private _y: number;
    private _tileIndex: number
    private _counter: SingleTileCounter

    private _subtiles: [TileHierarchyAggregator, TileHierarchyAggregator, TileHierarchyAggregator, TileHierarchyAggregator] = [undefined, undefined, undefined, undefined]
    public totalValue: number = 0

    private static readonly empty = []
    public readonly features = new UIEventSource<{ feature: any, freshness: Date }[]>(TileHierarchyAggregator.empty)
    public readonly name;

    private readonly featuresStatic = []
    private readonly featureProperties: { count: number, tileId: number };

    private constructor(parent: TileHierarchyAggregator, z: number, x: number, y: number) {
        this._parent = parent;
        this._root = parent?._root ?? this
        this._z = z;
        this._x = x;
        this._y = y;
        this._tileIndex = Tiles.tile_index(z, x, y)
        this.name = "Count(" + this._tileIndex + ")"

        const totals = {
            tileId: this._tileIndex,
            count: 0
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

    private update() {
        const newMap = new Map<string, number>()
        let total = 0
        this?._counter?.countsPerLayer?.data?.forEach((count, layerId) => {
            newMap.set(layerId, count)
            total += count
        })

        for (const tile of this._subtiles) {
            if (tile === undefined) {
                continue;
            }
            total += tile.totalValue
        }
        this.totalValue = total
        this._parent?.update()
        
        if (total === 0) {
            this.features.setData(TileHierarchyAggregator.empty)
        } else {
            this.featureProperties.count = total;
            this.features.data = this.featuresStatic
            this.features.ping()
        }
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
                this._subtiles[subtileIndex] = new TileHierarchyAggregator(this, tileZ, tileX, tileY)
            }
            this._subtiles[subtileIndex].addTile(source)
        }

    }

    public static createHierarchy() {
        return new TileHierarchyAggregator(undefined, 0, 0, 0)
    }


    private visitSubTiles(f : (aggr: TileHierarchyAggregator) => boolean){
        const visitFurther = f(this)
        if(visitFurther){
            this._subtiles.forEach(tile => tile?.visitSubTiles(f))
        }
    }
    
    getCountsForZoom(locationControl: UIEventSource<{ zoom : number }>, cutoff: number) : FeatureSource{
        const self = this
        return new StaticFeatureSource(
            locationControl.map(loc => {
                const features = []
                const targetZoom = loc.zoom
                self.visitSubTiles(aggr => {
                    if(aggr.totalValue < cutoff) {
                        return false
                    }
                    if(aggr._z === targetZoom){
                        features.push(...aggr.features.data)
                        return false
                    }
                    return aggr._z <= targetZoom;
                    
                })
                
                return features
            })
            , true);
    }
}

/**
 * Keeps track of a single tile
 */
class SingleTileCounter implements Tiled {
    public readonly bbox: BBox;
    public readonly tileIndex: number;
    public readonly countsPerLayer: UIEventSource<Map<string, number>> = new UIEventSource<Map<string, number>>(new Map<string, number>())
    private readonly registeredLayers: Map<string, LayerConfig> = new Map<string, LayerConfig>();
    public readonly z: number
    public readonly x: number
    public readonly y: number


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
            self.countsPerLayer.data.set(layer.id, f.length)
            self.countsPerLayer.ping()
        })

    }

}