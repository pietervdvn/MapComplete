export interface TileRange {
    xstart: number,
    ystart: number,
    xend: number,
    yend: number,
    total: number,
    zoomlevel: number
}

export class Tiles {

    public static MapRange<T>(tileRange: TileRange, f: (x: number, y: number) => T): T[] {
        const result: T[] = []
        for (let x = tileRange.xstart; x <= tileRange.xend; x++) {
            for (let y = tileRange.ystart; y <= tileRange.yend; y++) {
                const t = f(x, y);
                result.push(t)
            }
        }
        return result;
    }


    private static tile2long(x, z) {
        return (x / Math.pow(2, z) * 360 - 180);
    }

    private static tile2lat(y, z) {
        const n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
        return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
    }

    private static lon2tile(lon, zoom) {
        return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
    }

    private static lat2tile(lat, zoom) {
        return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));
    }
    
    /**
     * Calculates the tile bounds of the
     * @param z
     * @param x
     * @param y
     * @returns [[maxlat, minlon], [minlat, maxlon]]
     */
    static tile_bounds(z: number, x: number, y: number): [[number, number], [number, number]] {
        return [[Tiles.tile2lat(y, z), Tiles.tile2long(x, z)], [Tiles.tile2lat(y + 1, z), Tiles.tile2long(x + 1, z)]]
    }


    static tile_bounds_lon_lat(z: number, x: number, y: number): [[number, number], [number, number]] {
        return [[Tiles.tile2long(x, z), Tiles.tile2lat(y, z)], [Tiles.tile2long(x + 1, z), Tiles.tile2lat(y + 1, z)]]
    }

    /**
     * Returns the centerpoint [lon, lat] of the specified tile
     * @param z
     * @param x
     * @param y
     */
    static centerPointOf(z: number, x: number, y: number): [number, number]{
        return [(Tiles.tile2long(x, z) + Tiles.tile2long(x+1, z)) / 2, (Tiles.tile2lat(y, z) + Tiles.tile2lat(y+1, z)) / 2]
    }
    
    static tile_index(z: number, x: number, y: number): number {
        return ((x * (2 << z)) + y) * 100 + z
    }
    /**
     * Given a tile index number, returns [z, x, y]
     * @param index
     * @returns 'zxy'
     */
    static tile_from_index(index: number): [number, number, number] {
        const z = index % 100;
        const factor = 2 << z
        index = Math.floor(index / 100)
        const x = Math.floor(index / factor)
        return [z, x, index % factor]
    }

    /**
     * Return x, y of the tile containing (lat, lon) on the given zoom level
     */
    static embedded_tile(lat: number, lon: number, z: number): { x: number, y: number, z: number } {
        return {x: Tiles.lon2tile(lon, z), y: Tiles.lat2tile(lat, z), z: z}
    }

    static TileRangeBetween(zoomlevel: number, lat0: number, lon0: number, lat1: number, lon1: number): TileRange {
        const t0 = Tiles.embedded_tile(lat0, lon0, zoomlevel)
        const t1 = Tiles.embedded_tile(lat1, lon1, zoomlevel)

        const xstart = Math.min(t0.x, t1.x)
        const xend = Math.max(t0.x, t1.x)
        const ystart = Math.min(t0.y, t1.y)
        const yend = Math.max(t0.y, t1.y)
        const total = (1 + xend - xstart) * (1 + yend - ystart)

        return {
            xstart: xstart,
            xend: xend,
            ystart: ystart,
            yend: yend,
            total: total,
            zoomlevel: zoomlevel
        }
    }

}