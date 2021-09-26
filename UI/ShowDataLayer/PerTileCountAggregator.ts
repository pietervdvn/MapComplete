import FeatureSource, {FeatureSourceForLayer, Tiled} from "../../Logic/FeatureSource/FeatureSource";
import {BBox} from "../../Logic/GeoOperations";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
import {UIEventSource} from "../../Logic/UIEventSource";
import {Tiles} from "../../Models/TileRange";


/**
 * A feature source containing meta features.
 * It will contain exactly one point for every tile of the specified (dynamic) zoom level
 */
export default class PerTileCountAggregator implements FeatureSource {
    public readonly features: UIEventSource<{ feature: any; freshness: Date }[]> = new UIEventSource<{ feature: any; freshness: Date }[]>([]);
    public readonly name: string = "PerTileCountAggregator"

    private readonly perTile: Map<number, SingleTileCounter> = new Map<number, SingleTileCounter>()
    private readonly _requestedZoomLevel: UIEventSource<number>;

    constructor(requestedZoomLevel: UIEventSource<number>) {
        this._requestedZoomLevel = requestedZoomLevel;
        const self = this;
        this._requestedZoomLevel.addCallbackAndRun(_ => self.update())
    }

    private update() {
        const now = new Date()
        const allCountsAsFeatures : {feature: any, freshness: Date}[] = []
        const aggregate = this.calculatePerTileCount()
        aggregate.forEach((totalsPerLayer, tileIndex) => {
            const totals = {}
            let totalCount = 0
            totalsPerLayer.forEach((total, layerId) => {
                totals[layerId] = total
                totalCount += total
            })
            totals["tileId"] = tileIndex
            totals["count"] = totalCount
            const feature = {
                "type": "Feature",
                "properties": totals,
                "geometry": {
                    "type": "Point",
                    "coordinates": Tiles.centerPointOf(...Tiles.tile_from_index(tileIndex))
                }
            }
            allCountsAsFeatures.push({feature: feature, freshness: now})

            const bbox=  BBox.fromTileIndex(tileIndex)
            const box = {
                "type": "Feature",
                "properties":totals,
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
            allCountsAsFeatures.push({feature:box, freshness: now})
        })
        this.features.setData(allCountsAsFeatures)
    }

    /**
     * Calculates an aggregate count per tile and per subtile
     * @private
     */
    private calculatePerTileCount() {
        const perTileCount = new Map<number, Map<string, number>>()
        const targetZoom = this._requestedZoomLevel.data;
        // We only search for tiles of the same zoomlevel or a higher zoomlevel, which is embedded
        for (const singleTileCounter of Array.from(this.perTile.values())) {

            let tileZ = singleTileCounter.z
            let tileX = singleTileCounter.x
            let tileY = singleTileCounter.y
            if (tileZ < targetZoom) {
                continue;
            }

            while (tileZ > targetZoom) {
                tileX = Math.floor(tileX / 2)
                tileY = Math.floor(tileY / 2)
                tileZ--
            }
            const tileI = Tiles.tile_index(tileZ, tileX, tileY)
            let counts = perTileCount.get(tileI)
            if (counts === undefined) {
                counts = new Map<string, number>()
                perTileCount.set(tileI, counts)
            }
            singleTileCounter.countsPerLayer.data.forEach((count, layerId) => {
                if (counts.has(layerId)) {
                    counts.set(layerId, count + counts.get(layerId))
                } else {
                    counts.set(layerId, count)
                }
            })
        }
        return perTileCount;
    }

    public addTile(tile: FeatureSourceForLayer & Tiled, shouldBeCounted: UIEventSource<boolean>) {
        let counter = this.perTile.get(tile.tileIndex)
        if (counter === undefined) {
            counter = new SingleTileCounter(tile.tileIndex)
            this.perTile.set(tile.tileIndex, counter)
            // We do **NOT** add a callback on the perTile index, even though we could! It'll update just fine without it
        }
        counter.addTileCount(tile, shouldBeCounted)
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

    public addTileCount(source: FeatureSourceForLayer, shouldBeCounted: UIEventSource<boolean>) {
        const layer = source.layer.layerDef
        this.registeredLayers.set(layer.id, layer)
        const self = this
        source.features.map(f => {
            /*if (!shouldBeCounted.data) {
                return;
            }*/
            self.countsPerLayer.data.set(layer.id, f.length)
            self.countsPerLayer.ping()
        }, [shouldBeCounted])
    }

}