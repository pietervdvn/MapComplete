import GeocodingProvider, { GeocodeResult } from "./GeocodingProvider"
import { Utils } from "../../Utils"
import { ImmutableStore, Store } from "../UIEventSource"
import CoordinateParser from "coordinate-parser"

/**
 * A simple search-class which interprets possible locations
 */
export default class CoordinateSearch implements GeocodingProvider {
    public readonly name = "CoordinateSearch"
    private static readonly latLonRegexes: ReadonlyArray<RegExp> = [
        /^ *(-?[0-9]+\.[0-9]+)[ ,;/\\]+(-?[0-9]+\.[0-9]+)/,
        /^ *(-?[0-9]+,[0-9]+)[ ;/\\]+(-?[0-9]+,[0-9]+)/,

        /lat[:=]? *['"]?(-?[0-9]+\.[0-9]+)['"]?[ ,;&]+lon[:=]? *['"]?(-?[0-9]+\.[0-9]+)['"]?/,
        /lat[:=]? *['"]?(-?[0-9]+\.[0-9]+)['"]?[ ,;&]+lng[:=]? *['"]?(-?[0-9]+\.[0-9]+)['"]?/,

        /https:\/\/www.openstreetmap.org\/.*#map=[0-9]+\/(-?[0-9]+\.[0-9]+)\/(-?[0-9]+\.[0-9]+)/,
        /https:\/\/www.google.com\/maps\/@(-?[0-9]+.[0-9]+),(-?[0-9]+.[0-9]+).*/,
    ]

    private static readonly lonLatRegexes: ReadonlyArray<RegExp> = [
        /^(-?[0-9]+\.[0-9]+)[ ,;/\\]+(-?[0-9]+\.[0-9]+)/,
        /^ *(-?[0-9]+,[0-9]+)[ ;/\\]+(-?[0-9]+,[0-9]+)/,

        /lon[:=]? *['"]?(-?[0-9]+\.[0-9]+)['"]?[ ,;&]+lat[:=]? *['"]?(-?[0-9]+\.[0-9]+)['"]?/,
        /lng[:=]? *['"]?(-?[0-9]+\.[0-9]+)['"]?[ ,;&]+lat[:=]? *['"]?(-?[0-9]+\.[0-9]+)['"]?/,
    ]

    /**
     *
     * const ls = new CoordinateSearch()
     * const results = ls.directSearch("https://www.openstreetmap.org/search?query=Brugge#map=11/51.2611/3.2217")
     * results.length // => 1
     * results[0] // => {lat: 51.2611, lon: 3.2217, display_name: "lon: 3.2217, lat: 51.2611",  "category": "coordinate", "osm_id": "3.2217/51.2611","source": "coordinate:latlon"}
     *
     * const ls = new CoordinateSearch()
     * const results = ls.directSearch("https://www.openstreetmap.org/#map=11/51.2611/3.2217")
     * results.length // => 1
     * results[0] // => {lat: 51.2611, lon: 3.2217, display_name: "lon: 3.2217, lat: 51.2611",  "category": "coordinate","osm_id": "3.2217/51.2611","source": "coordinate:latlon"}
     *
     * const ls = new CoordinateSearch()
     * const results = ls.directSearch("51.2611 3.2217")
     * results.length // => 2
     * results[0] // => {lat: 51.2611, lon: 3.2217, display_name: "lon: 3.2217, lat: 51.2611",  "category": "coordinate",  "osm_id": "3.2217/51.2611","source": "coordinate:latlon"}
     * results[1] // => {lon: 51.2611, lat: 3.2217, display_name: "lon: 51.2611, lat: 3.2217",  "category": "coordinate",  "osm_id": "51.2611/3.2217","source": "coordinate:lonlat"}
     *
     * // Test format mentioned in 1599
     * const ls = new CoordinateSearch()
     * const results = ls.directSearch("51.2611/3.2217")
     * results.length // => 2
     * results[0] // => {lat: 51.2611, lon: 3.2217, display_name: "lon: 3.2217, lat: 51.2611",  "category": "coordinate", "source": "coordinate:latlon", "osm_id": "3.2217/51.2611",}
     * results[1] // => {lon: 51.2611, lat: 3.2217, display_name: "lon: 51.2611, lat: 3.2217",  "category": "coordinate",  "osm_id": "51.2611/3.2217","source": "coordinate:lonlat"}
     *
     * // test OSM-XML format
     * const ls = new CoordinateSearch()
     * const results = ls.directSearch('  lat="57.5802905" lon="12.7202538"')
     * results.length // => 1
     * results[0] // => {lat: 57.5802905, lon: 12.7202538,  "display_name": "lon: 12.720254, lat: 57.580291",  "category": "coordinate",  "osm_id": "12.720254/57.580291","source": "coordinate:latlon"}
     *
     * // should work with negative coordinates
     * const ls = new CoordinateSearch()
     * const results = ls.directSearch('  lat="-57.5802905" lon="-12.7202538"')
     * results.length // => 1
     * results[0] // => {lat: -57.5802905, lon: -12.7202538, "display_name": "lon: -12.720254, lat: -57.58029",  "category": "coordinate","osm_id": "-12.720254/-57.58029", "source": "coordinate:latlon"}
     *
     * // Should work with commas
     * const ls = new CoordinateSearch()
     * const results = ls.directSearch('51,047977 3,51184')
     * results.length // => 2
     * results[0] // => {lat: 51.047977, lon: 3.51184, "display_name": "lon: 3.51184, lat: 51.047977",  "category": "coordinate","osm_id": "3.51184/51.047977", "source": "coordinate:latlon"}
     */
    private directSearch(query: string): GeocodeResult[] {
        const matches = Utils.NoNull(CoordinateSearch.latLonRegexes.map((r) => query.match(r))).map(
            (m) => CoordinateSearch.asResult(m[2], m[1], "latlon")
        )

        const matchesLonLat = Utils.NoNull(
            CoordinateSearch.lonLatRegexes.map((r) => query.match(r))
        ).map((m) => CoordinateSearch.asResult(m[1], m[2], "lonlat"))
        const init = matches.concat(matchesLonLat)
        if (init.length > 0) {
            return init
        }

        try {
            const c = new CoordinateParser(query)
            return [
                CoordinateSearch.asResult(
                    "" + c.getLongitude(),
                    "" + c.getLatitude(),
                    "coordinateParser"
                ),
            ]
        } catch {
            return []
        }
    }

    private static round6(n: number): string {
        return "" + Math.round(n * 1000000) / 1000000
    }

    private static asResult(lonIn: string, latIn: string, source: string): GeocodeResult {
        lonIn = lonIn.replaceAll(",", ".")
        latIn = latIn.replaceAll(",", ".")

        const lon = Number(lonIn)
        const lat = Number(latIn)
        const lonStr = CoordinateSearch.round6(lon)
        const latStr = CoordinateSearch.round6(lat)
        return {
            lat,
            lon,
            display_name: "lon: " + lonStr + ", lat: " + latStr,
            category: "coordinate",
            source: "coordinate:" + source,
            osm_id: lonStr + "/" + latStr,
        }
    }

    suggest(query: string): Store<GeocodeResult[]> {
        return new ImmutableStore(this.directSearch(query))
    }

    async search(query: string): Promise<GeocodeResult[]> {
        return this.directSearch(query)
    }
}
