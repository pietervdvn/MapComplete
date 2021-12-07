import * as turf from "@turf/turf";
import {TileRange, Tiles} from "../Models/TileRange";
import {GeoOperations} from "./GeoOperations";

export class BBox {

    static global: BBox = new BBox([[-180, -90], [180, 90]]);
    readonly maxLat: number;
    readonly maxLon: number;
    readonly minLat: number;
    readonly minLon: number;

    /***
     * Coordinates should be [[lon, lat],[lon, lat]]
     * @param coordinates
     */
    constructor(coordinates) {
        this.maxLat = -90;
        this.maxLon = -180;
        this.minLat = 90;
        this.minLon = 180;


        for (const coordinate of coordinates) {
            this.maxLon = Math.max(this.maxLon, coordinate[0]);
            this.maxLat = Math.max(this.maxLat, coordinate[1]);
            this.minLon = Math.min(this.minLon, coordinate[0]);
            this.minLat = Math.min(this.minLat, coordinate[1]);
        }

        this.maxLon = Math.min(this.maxLon, 180)
        this.maxLat = Math.min(this.maxLat, 90)
        this.minLon = Math.max(this.minLon, -180)
        this.minLat = Math.max(this.minLat, -90)


        this.check();
    }

    static fromLeafletBounds(bounds) {
        return new BBox([[bounds.getWest(), bounds.getNorth()], [bounds.getEast(), bounds.getSouth()]])
    }

    static get(feature): BBox {
        if (feature.bbox?.overlapsWith === undefined) {
            const turfBbox: number[] = turf.bbox(feature)
            feature.bbox = new BBox([[turfBbox[0], turfBbox[1]], [turfBbox[2], turfBbox[3]]]);
        }
        return feature.bbox;
    }
    
    static bboxAroundAll(bboxes: BBox[]): BBox{
        let maxLat: number = -90;
        let maxLon: number= -180;
        let minLat: number= 80;
        let minLon: number= 180;

        for (const bbox of bboxes) {
            maxLat = Math.max(maxLat, bbox.maxLat)
            maxLon = Math.max(maxLon, bbox.maxLon)
            minLat = Math.min(minLat, bbox.minLat)
            minLon = Math.min(minLon, bbox.minLon)
        }
        return new BBox([[maxLon, maxLat],[minLon,minLat]])
    }

    static fromTile(z: number, x: number, y: number): BBox {
        return new BBox(Tiles.tile_bounds_lon_lat(z, x, y))
    }

    static fromTileIndex(i: number): BBox {
        if (i === 0) {
            return BBox.global
        }
        return BBox.fromTile(...Tiles.tile_from_index(i))
    }

    /**
     * Constructs a tilerange which fully contains this bbox (thus might be a bit larger)
     * @param zoomlevel
     */
    public containingTileRange(zoomlevel): TileRange {
        return Tiles.TileRangeBetween(zoomlevel, this.minLat, this.minLon, this.maxLat, this.maxLon)
    }

    public overlapsWith(other: BBox) {
        if (this.maxLon < other.minLon) {
            return false;
        }
        if (this.maxLat < other.minLat) {
            return false;
        }
        if (this.minLon > other.maxLon) {
            return false;
        }
        return this.minLat <= other.maxLat;

    }

    public isContainedIn(other: BBox) {
        if (this.maxLon > other.maxLon) {
            return false;
        }
        if (this.maxLat > other.maxLat) {
            return false;
        }
        if (this.minLon < other.minLon) {
            return false;
        }
        if (this.minLat < other.minLat) {
            return false
        }
        return true;
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
        return this.minLat <= lonLat[1] && lonLat[1] <= this.maxLat
            && this.minLon <= lonLat[0] && lonLat[0] <= this.maxLon
    }

    pad(factor: number, maxIncrease = 2): BBox {

        const latDiff = Math.min(maxIncrease / 2, Math.abs(this.maxLat - this.minLat) * factor)
        const lonDiff = Math.min(maxIncrease / 2, Math.abs(this.maxLon - this.minLon) * factor)
        return new BBox([[
            this.minLon - lonDiff,
            this.minLat - latDiff
        ], [this.maxLon + lonDiff,
            this.maxLat + latDiff]])
    }

    toLeaflet() {
        return [[this.minLat, this.minLon], [this.maxLat, this.maxLon]]
    }

    asGeoJson(properties: any): any {
        return {
            type: "Feature",
            properties: properties,
            geometry: {
                type: "Polygon",
                coordinates: [[

                    [this.minLon, this.minLat],
                    [this.maxLon, this.minLat],
                    [this.maxLon, this.maxLat],
                    [this.minLon, this.maxLat],
                    [this.minLon, this.minLat],

                ]]
            }
        }
    }

    /**
     * Expands the BBOx so that it contains complete tiles for the given zoomlevel
     * @param zoomlevel
     */
    expandToTileBounds(zoomlevel: number): BBox {
        const ul = Tiles.embedded_tile(this.minLat, this.minLon, zoomlevel)
        const lr = Tiles.embedded_tile(this.maxLat, this.maxLon, zoomlevel)
        const boundsul = Tiles.tile_bounds_lon_lat(ul.z, ul.x, ul.y)
        const boundslr = Tiles.tile_bounds_lon_lat(lr.z, lr.x, lr.y)
        return new BBox([].concat(boundsul, boundslr))
    }

    toMercator(): { minLat: number, maxLat: number, minLon: number, maxLon: number } {
        const [minLon, minLat] = GeoOperations.ConvertWgs84To900913([this.minLon, this.minLat])
        const [maxLon, maxLat] = GeoOperations.ConvertWgs84To900913([this.maxLon, this.maxLat])

        return {
            minLon, maxLon,
            minLat, maxLat
        }


    }

    private check() {
        if (isNaN(this.maxLon) || isNaN(this.maxLat) || isNaN(this.minLon) || isNaN(this.minLat)) {
            console.log(this);
            throw  "BBOX has NAN";
        }
    }
}