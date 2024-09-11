import GeocodingProvider, { GeocodeResult } from "./GeocodingProvider"
import { Utils } from "../../Utils"
import { ImmutableStore, Store } from "../UIEventSource"

/**
 * A simple search-class which interprets possible locations
 */
export default class CoordinateSearch implements GeocodingProvider {
    private static readonly latLonRegexes: ReadonlyArray<RegExp> = [
        /^(-?[0-9]+\.[0-9]+)[ ,;/\\]+(-?[0-9]+\.[0-9]+)/,
        /lat[:=]? *['"]?(-?[0-9]+\.[0-9]+)['"]?[ ,;&]+lon[:=]? *['"]?(-?[0-9]+\.[0-9]+)['"]?/,
        /lat[:=]? *['"]?(-?[0-9]+\.[0-9]+)['"]?[ ,;&]+lng[:=]? *['"]?(-?[0-9]+\.[0-9]+)['"]?/,

        /https:\/\/www.openstreetmap.org\/.*#map=[0-9]+\/(-?[0-9]+\.[0-9]+)\/(-?[0-9]+\.[0-9]+)/,
        /https:\/\/www.google.com\/maps\/@(-?[0-9]+.[0-9]+),(-?[0-9]+.[0-9]+).*/
    ]

    private static readonly lonLatRegexes: ReadonlyArray<RegExp> = [
        /^(-?[0-9]+\.[0-9]+)[ ,;/\\]+(-?[0-9]+\.[0-9]+)/,
        /lon[:=]? *['"]?(-?[0-9]+\.[0-9]+)['"]?[ ,;&]+lat[:=]? *['"]?(-?[0-9]+\.[0-9]+)['"]?/,
        /lng[:=]? *['"]?(-?[0-9]+\.[0-9]+)['"]?[ ,;&]+lat[:=]? *['"]?(-?[0-9]+\.[0-9]+)['"]?/,

    ]

    /**
     *
     * const ls = new CoordinateSearch()
     * const results = ls.directSearch("https://www.openstreetmap.org/search?query=Brugge#map=11/51.2611/3.2217")
     * results.length // => 1
     * results[0] // => {lat: 51.2611, lon: 3.2217, display_name: "lon: 3.2217, lat: 51.2611",  "category": "coordinate","source": "coordinate:latlon"}
     *
     * const ls = new CoordinateSearch()
     * const results = ls.directSearch("https://www.openstreetmap.org/#map=11/51.2611/3.2217")
     * results.length // => 1
     * results[0] // => {lat: 51.2611, lon: 3.2217, display_name: "lon: 3.2217, lat: 51.2611",  "category": "coordinate","source": "coordinate:latlon"}
     *
     * const ls = new CoordinateSearch()
     * const results = ls.directSearch("51.2611 3.2217")
     * results.length // => 2
     * results[0] // => {lat: 51.2611, lon: 3.2217, display_name: "lon: 3.2217, lat: 51.2611",  "category": "coordinate", "source": "coordinate:latlon"}
     * results[1] // => {lon: 51.2611, lat: 3.2217, display_name: "lon: 51.2611, lat: 3.2217",  "category": "coordinate", "source": "coordinate:lonlat"}
     *
     * // Test format mentioned in 1599
     * const ls = new CoordinateSearch()
     * const results = ls.directSearch("51.2611/3.2217")
     * results.length // => 2
     * results[0] // => {lat: 51.2611, lon: 3.2217, display_name: "lon: 3.2217, lat: 51.2611",  "category": "coordinate", "source": "coordinate:latlon"}
     * results[1] // => {lon: 51.2611, lat: 3.2217, display_name: "lon: 51.2611, lat: 3.2217",  "category": "coordinate", "source": "coordinate:lonlat"}
     *
     * // test OSM-XML format
     * const ls = new CoordinateSearch()
     * const results = ls.directSearch('  lat="57.5802905" lon="12.7202538"')
     * results.length // => 1
     * results[0] // => {lat: 57.5802905, lon: 12.7202538, display_name: "lon: 12.7202538, lat: 57.5802905",  "category": "coordinate", "source": "coordinate:latlon"}
     *
     * // should work with negative coordinates
     * const ls = new CoordinateSearch()
     * const results = ls.directSearch('  lat="-57.5802905" lon="-12.7202538"')
     * results.length // => 1
     * results[0] // => {lat: -57.5802905, lon: -12.7202538, display_name: "lon: -12.7202538, lat: -57.5802905",  "category": "coordinate", "source": "coordinate:latlon"}
     */
    private directSearch(query: string): GeocodeResult[] {

        const matches = Utils.NoNull(CoordinateSearch.latLonRegexes.map(r => query.match(r))).map(m => <GeocodeResult>{
            lat: Number(m[1]),
            lon: Number(m[2]),
            display_name: "lon: " + m[2] + ", lat: " + m[1],
            source: "coordinate:latlon",
            category: "coordinate"
        })


        const matchesLonLat = Utils.NoNull(CoordinateSearch.lonLatRegexes.map(r => query.match(r)))
            .map(m => <GeocodeResult>{
                lat: Number(m[2]),
                lon: Number(m[1]),
                display_name: "lon: " + m[1] + ", lat: " + m[2],
                category: "coordinate",
                source: "coordinate:lonlat"
            })
        return matches.concat(matchesLonLat)
    }

    suggest(query: string): Store<GeocodeResult[]> {
        return new ImmutableStore(this.directSearch(query))
    }

    async search (query: string): Promise<GeocodeResult[]> {
        return this.directSearch(query)
    }

}
