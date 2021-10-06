import * as turf from "@turf/turf";
import {TileRange, Tiles} from "../Models/TileRange";

export class BBox {

    readonly maxLat: number;
    readonly maxLon: number;
    readonly minLat: number;
    readonly minLon: number;
    static global: BBox = new BBox([[-180, -90], [180, 90]]);

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

    private check() {
        if (isNaN(this.maxLon) || isNaN(this.maxLat) || isNaN(this.minLon) || isNaN(this.minLat)) {
            console.log(this);
            throw  "BBOX has NAN";
        }
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

    pad(factor: number): BBox {
        const latDiff = this.maxLat - this.minLat
        const lat = (this.maxLat + this.minLat) / 2
        const lonDiff = this.maxLon - this.minLon
        const lon = (this.maxLon + this.minLon) / 2
        return new BBox([[
            lon - lonDiff * factor,
            lat - latDiff * factor
        ], [lon + lonDiff * factor,
            lat + latDiff * factor]])
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
}