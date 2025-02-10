import { TileRange, Tiles } from "../Models/TileRange"
import { GeoOperations } from "./GeoOperations"
import { Feature, Polygon } from "geojson"
import { bbox } from "@turf/bbox"

export class BBox {
    static global: BBox = new BBox([
        [-180, -90],
        [180, 90],
    ])
    readonly maxLat: number
    readonly maxLon: number
    readonly minLat: number
    readonly minLon: number

    /***
     * Coordinates should be [[lon, lat],[lon, lat]]
     * @param coordinates
     *
     * const bb = new BBox([[5,6]])
     * bb.minLat // => 6
     * bb.minLon // => 5
     * bb.maxLat // => 6
     * bb.maxLon // => 5
     *
     * const bb = new BBox([[-100,-100]])
     * bb.minLat // => -90
     * bb.minLon // => -100
     * bb.maxLat // => -90
     * bb.maxLon // => -100
     */
    constructor(coordinates: [number, number, number, number] | [number, number][]) {
        if (!Array.isArray(coordinates[0])) {
            // already the bbox coordinates
            const coors = <[number, number, number, number]>coordinates
            this.maxLon = Math.max(coors[0], coors[2])
            this.minLon = Math.min(coors[0], coors[2])
            this.maxLat = Math.max(coors[1], coors[3])
            this.minLat = Math.min(coors[1], coors[3])
            return
        }
        this.maxLat = -90
        this.maxLon = -180
        this.minLat = 90
        this.minLon = 180

        for (const coordinate of coordinates) {
            this.maxLon = Math.max(this.maxLon, coordinate[0])
            this.maxLat = Math.max(this.maxLat, coordinate[1])
            this.minLon = Math.min(this.minLon, coordinate[0])
            this.minLat = Math.min(this.minLat, coordinate[1])
        }

        this.maxLon = Math.min(this.maxLon, 180)
        this.maxLat = Math.min(this.maxLat, 90)
        this.minLon = Math.max(this.minLon, -180)
        this.minLat = Math.max(this.minLat, -90)

        this.check()
    }

    static fromLeafletBounds(bounds) {
        return new BBox([
            [bounds.getWest(), bounds.getNorth()],
            [bounds.getEast(), bounds.getSouth()],
        ])
    }

    /**
     * Gets the bbox from a feature and caches it (by monkeypatching) the relevant feature
     *
     *
     * const f = <Feature> {type:"Feature",properties: {}, geometry: {type: "Point", coordinates: [-100,45]}}
     * const bb = BBox.get(f)
     * bb.minLat // => 45
     * bb.minLon // => -100
     *
     */
    static get(feature: Feature): BBox {
        const f = feature
        if (f.bbox?.["minLat"] !== undefined) {
            delete f.bbox
        }
        if (!f.bbox) {
            f.bbox = <[number, number, number, number]>bbox(f)
        }
        return new BBox(<[number, number, number, number]>f.bbox)
    }

    static bboxAroundAll(bboxes: BBox[]): BBox {
        let maxLat: number = -90
        let maxLon: number = -180
        let minLat: number = 80
        let minLon: number = 180

        for (const bbox of bboxes) {
            maxLat = Math.max(maxLat, bbox.maxLat)
            maxLon = Math.max(maxLon, bbox.maxLon)
            minLat = Math.min(minLat, bbox.minLat)
            minLon = Math.min(minLon, bbox.minLon)
        }
        return new BBox([
            [maxLon, maxLat],
            [minLon, minLat],
        ])
    }

    /**
     * Calculates the BBox based on a slippy map tile number
     *
     *  const bbox = BBox.fromTile(16, 32754, 21785)
     *  bbox.minLon // => -0.076904296875
     *  bbox.maxLon // => -0.0714111328125
     *  bbox.minLat // => 51.5292513551899
     *  bbox.maxLat // => 51.53266860674158
     */
    static fromTile(z: number, x: number, y: number): BBox {
        return new BBox(Tiles.tile_bounds_lon_lat(z, x, y))
    }

    static fromTileIndex(i: number): BBox {
        if (i === 0) {
            return BBox.global
        }
        return BBox.fromTile(...Tiles.tile_from_index(i))
    }

    public unionWith(other: BBox) {
        return new BBox([
            [Math.max(this.maxLon, other.maxLon), Math.max(this.maxLat, other.maxLat)],
            [Math.min(this.minLon, other.minLon), Math.min(this.minLat, other.minLat)],
        ])
    }

    /**
     * Constructs a tilerange which fully contains this bbox (thus might be a bit larger)
     * @param zoomlevel
     */
    public containingTileRange(zoomlevel: number): TileRange {
        return Tiles.TileRangeBetween(zoomlevel, this.minLat, this.minLon, this.maxLat, this.maxLon)
    }

    public overlapsWith(other: BBox) {
        if (this.maxLon < other.minLon) {
            return false
        }
        if (this.maxLat < other.minLat) {
            return false
        }
        if (this.minLon > other.maxLon) {
            return false
        }
        return this.minLat <= other.maxLat
    }

    public isContainedIn(other: BBox) {
        if (this.maxLon > other.maxLon) {
            return false
        }
        if (this.maxLat > other.maxLat) {
            return false
        }
        if (this.minLon < other.minLon) {
            return false
        }
        if (this.minLat < other.minLat) {
            return false
        }
        return true
    }

    squarify(): BBox {
        const w = this.maxLon - this.minLon
        const h = this.maxLat - this.minLat
        const s = Math.sqrt(w * h)
        const lon = (this.maxLon + this.minLon) / 2
        const lat = (this.maxLat + this.minLat) / 2
        // we want to have a more-or-less equal surface, so the new side 's' should be
        // w * h = s * s
        // The ratio for w is:

        return new BBox([
            [lon - s / 2, lat - s / 2],
            [lon + s / 2, lat + s / 2],
        ])
    }

    isNearby(location: [number, number], maxRange: number): boolean {
        if (this.contains(location)) {
            return true
        }
        const [lon, lat] = location
        // We 'project' the point onto the near edges. If they are close to a horizontal _and_ vertical edge, it is nearby
        // Vertically nearby: either wihtin minLat range or at most maxRange away
        const nearbyVertical =
            (this.minLat <= lat &&
                this.maxLat >= lat &&
                GeoOperations.distanceBetween(location, [lon, this.minLat]) <= maxRange) ||
            GeoOperations.distanceBetween(location, [lon, this.maxLat]) <= maxRange
        if (!nearbyVertical) {
            return false
        }
        const nearbyHorizontal =
            (this.minLon <= lon &&
                this.maxLon >= lon &&
                GeoOperations.distanceBetween(location, [this.minLon, lat]) <= maxRange) ||
            GeoOperations.distanceBetween(location, [this.maxLon, lat]) <= maxRange
        return nearbyHorizontal
    }

    getEast() {
        return this.maxLon
    }

    getNorth() {
        return this.maxLat
    }

    getWest() {
        return this.minLon
    }

    getSouth() {
        return this.minLat
    }

    contains(lonLat: [number, number]) {
        return (
            this.minLat <= lonLat[1] &&
            lonLat[1] <= this.maxLat &&
            this.minLon <= lonLat[0] &&
            lonLat[0] <= this.maxLon
        )
    }

    pad(factor: number, maxIncrease = 2): BBox {
        const latDiff = Math.min(maxIncrease / 2, Math.abs(this.maxLat - this.minLat) * factor)
        const lonDiff = Math.min(maxIncrease / 2, Math.abs(this.maxLon - this.minLon) * factor)
        return new BBox([
            [this.minLon - lonDiff, this.minLat - latDiff],
            [this.maxLon + lonDiff, this.maxLat + latDiff],
        ])
    }

    padAbsolute(degrees: number): BBox {
        return new BBox([
            [this.minLon - degrees, this.minLat - degrees],
            [this.maxLon + degrees, this.maxLat + degrees],
        ])
    }

    toLngLat(): [[number, number], [number, number]] {
        return [
            [this.minLon, this.minLat],
            [this.maxLon, this.maxLat],
        ]
    }

    toLngLatFlat(): [number, number, number, number] {
        return [this.minLon, this.minLat, this.maxLon, this.maxLat]
    }

    public asGeojsonCached() {
        if (this["geojsonCache"] === undefined) {
            this["geojsonCache"] = this.asGeoJson({})
        }
        return this["geojsonCache"]
    }

    public asGeoJson<T = Record<string, string>>(properties?: T): Feature<Polygon, T> {
        return {
            type: "Feature",
            properties: properties,
            geometry: this.asGeometry(),
        }
    }

    public asGeometry(): Polygon {
        return {
            type: "Polygon",
            coordinates: [
                [
                    [this.minLon, this.minLat],
                    [this.maxLon, this.minLat],
                    [this.maxLon, this.maxLat],
                    [this.minLon, this.maxLat],
                    [this.minLon, this.minLat],
                ],
            ],
        }
    }

    /**
     * Expands the BBox until it contains complete tiles for the given zoomlevel
     * @param zoomlevel
     * const bbox = new BBox([3.7140459, 51.071849, 3.7140459, 51.071849])
     * const expanded = bbox.expandToTileBounds(15)
     * !isNaN(expanded.minLat) // => true
     */
    expandToTileBounds(zoomlevel: number): BBox {
        if (zoomlevel === undefined) {
            return this
        }
        const ul = Tiles.embedded_tile(this.minLat, this.minLon, zoomlevel)
        const lr = Tiles.embedded_tile(this.maxLat, this.maxLon, zoomlevel)
        const boundsul = Tiles.tile_bounds_lon_lat(ul.z, ul.x, ul.y)
        const boundslr = Tiles.tile_bounds_lon_lat(lr.z, lr.x, lr.y)
        return new BBox([].concat(boundsul, boundslr))
    }

    toMercator(): { minLat: number; maxLat: number; minLon: number; maxLon: number } {
        const [minLon, minLat] = GeoOperations.ConvertWgs84To900913([this.minLon, this.minLat])
        const [maxLon, maxLat] = GeoOperations.ConvertWgs84To900913([this.maxLon, this.maxLat])

        return {
            minLon,
            maxLon,
            minLat,
            maxLat,
        }
    }

    private check() {
        if (isNaN(this.maxLon) || isNaN(this.maxLat) || isNaN(this.minLon) || isNaN(this.minLat)) {
            console.trace("BBox with NaN detected:", this)
            throw "BBOX has NAN"
        }
    }

    public overlapsWithFeature(f: Feature) {
        return GeoOperations.calculateOverlap(this.asGeoJson({}), [f]).length > 0
    }

    center() {
        return [(this.minLon + this.maxLon) / 2, (this.minLat + this.maxLat) / 2]
    }
}
