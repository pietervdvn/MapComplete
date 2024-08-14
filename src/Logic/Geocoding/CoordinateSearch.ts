import GeocodingProvider, { GeoCodeResult, GeocodingOptions } from "./GeocodingProvider"
import { Utils } from "../../Utils"

/**
 * A simple search-class which interprets possible locations
 */
export default class CoordinateSearch implements GeocodingProvider {
    private static readonly latLonRegexes: ReadonlyArray<RegExp> = [
        /([0-9]+\.[0-9]+)[ ,;]+([0-9]+\.[0-9]+)/,
        /lat:?[ ]*([0-9]+\.[0-9]+)[ ,;]+lon:?[ ]*([0-9]+\.[0-9]+)/,
        /https:\/\/www.openstreetmap.org\/.*#map=[0-9]+\/([0-9]+\.[0-9]+)\/([0-9]+\.[0-9]+)/,
        /https:\/\/www.google.com\/maps\/@([0-9]+.[0-9]+),([0-9]+.[0-9]+).*/
    ]

    private static readonly lonLatRegexes: ReadonlyArray<RegExp> = [
        /([0-9]+\.[0-9]+)[ ,;]+([0-9]+\.[0-9]+)/
    ]

    /**
     *
     * @param query
     * @param options
     *
     * const ls = new CoordinateSearch()
     * const results = await ls.search("https://www.openstreetmap.org/search?query=Brugge#map=11/51.2611/3.2217")
     * results.length // => 1
     * results[0] // => {lat: 51.2611, lon: 3.2217, display_name: "lon: 3.2217, lat: 51.2611"}
     *
     * const ls = new CoordinateSearch()
     * const results = await ls.search("https://www.openstreetmap.org/#map=11/51.2611/3.2217")
     * results.length // => 1
     * results[0] // => {lat: 51.2611, lon: 3.2217, display_name: "lon: 3.2217, lat: 51.2611"}
     *
     * const ls = new CoordinateSearch()
     * const results = await ls.search("51.2611 3.2217")
     * results.length // => 2
     * results[0] // => {lat: 51.2611, lon: 3.2217, display_name: "lon: 3.2217, lat: 51.2611"}
     * results[1] // => {lon: 51.2611, lat: 3.2217, display_name: "lon: 51.2611, lat: 3.2217"}
     *
     */
    async search(query: string, options?: GeocodingOptions): Promise<GeoCodeResult[]> {

        const matches = Utils.NoNull(CoordinateSearch.latLonRegexes.map(r => query.match(r))).map(m => <GeoCodeResult>{
            lat: Number(m[1]),
            lon: Number(m[2]),
            display_name: "lon: " + m[2] + ", lat: " + m[1],
            source: "coordinateSearch"
        })



        const matchesLonLat =  Utils.NoNull(CoordinateSearch.lonLatRegexes.map(r => query.match(r)))
            .map(m => <GeoCodeResult>{
                lat: Number(m[2]),
                lon: Number(m[1]),
                display_name: "lon: " + m[1] + ", lat: " + m[2],
                source: "coordinateSearch"
            })

        return matches.concat(matchesLonLat)
    }

    suggest(query: string, options?: GeocodingOptions): Promise<GeoCodeResult[]> {
        return this.search(query, options)
    }

}
