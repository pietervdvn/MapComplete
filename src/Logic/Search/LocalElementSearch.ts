import GeocodingProvider, { SearchResult, GeocodingOptions } from "./GeocodingProvider"
import ThemeViewState from "../../Models/ThemeViewState"
import { Utils } from "../../Utils"
import { Feature } from "geojson"
import { GeoOperations } from "../GeoOperations"
import { ImmutableStore, Store, Stores } from "../UIEventSource"
import OpenStreetMapIdSearch from "./OpenStreetMapIdSearch"

type IntermediateResult = {
    feature: Feature,
    /**
     * Lon, lat
     */
    center: [number, number],
    levehnsteinD: number,
    physicalDistance: number,
    searchTerms: string[],
    description: string
}
export default class LocalElementSearch implements GeocodingProvider {
    private readonly _state: ThemeViewState
    private readonly _limit: number

    constructor(state: ThemeViewState, limit: number) {
        this._state = state
        this._limit = limit

    }

    async search(query: string, options?: GeocodingOptions): Promise<SearchResult[]> {
        return this.searchEntries(query, options, false).data
    }

    private getPartialResult(query: string, candidateId: string | undefined, matchStart: boolean, centerpoint: [number, number], features: Feature[]): IntermediateResult[] {
        const results: IntermediateResult [] = []

        for (const feature of features) {
            const props = feature.properties
            const searchTerms: string[] = Utils.NoNull([props.name, props.alt_name, props.local_name,
                (props["addr:street"] && props["addr:number"]) ?
                    props["addr:street"] + props["addr:number"] : undefined])

            let levehnsteinD: number
            if (candidateId === props.id) {
                levehnsteinD = 0
            } else {
                levehnsteinD = Math.min(...searchTerms.flatMap(entry => entry.split(/ /)).map(entry => {
                    let simplified = Utils.simplifyStringForSearch(entry)
                    if (matchStart) {
                        simplified = simplified.slice(0, query.length)
                    }
                    return Utils.levenshteinDistance(query, simplified)
                }))
            }
            const center = GeoOperations.centerpointCoordinates(feature)
            if ((levehnsteinD / query.length) <= 0.3) {

                let description = ""
                if (feature.properties["addr:street"]) {
                    description += "" + feature.properties["addr:street"]
                }
                if (feature.properties["addr:housenumber"]) {
                    description += " " + feature.properties["addr:housenumber"]
                }
                results.push({
                    feature,
                    center,
                    physicalDistance: GeoOperations.distanceBetween(centerpoint, center),
                    levehnsteinD,
                    searchTerms,
                    description: description !== "" ? description : undefined,
                })
            }
        }
        return results
    }

    searchEntries(query: string, options?: GeocodingOptions, matchStart?: boolean): Store<SearchResult[]> {
        if (query.length < 3) {
            return new ImmutableStore([])
        }
        const center: { lon: number; lat: number } = this._state.mapProperties.location.data
        const centerPoint: [number, number] = [center.lon, center.lat]
        const properties = this._state.perLayer
        const candidateId = OpenStreetMapIdSearch.extractId(query)
        query = Utils.simplifyStringForSearch(query)

        const partials: Store<IntermediateResult[]>[] = []

        for (const [_, geoIndexedStore] of properties) {
            const partialResult = geoIndexedStore.features.map(features => this.getPartialResult(query, candidateId, matchStart, centerPoint, features))
            partials.push(partialResult)
        }

        const listed: Store<IntermediateResult[]> = Stores.concat(partials).map(l => l.flatMap(x => x))
        return listed.mapD(results => {
            results.sort((a, b) => (a.physicalDistance + a.levehnsteinD * 25) - (b.physicalDistance + b.levehnsteinD * 25))
            if (this._limit) {
                results = results.slice(0, this._limit)
            }
            return results.map(entry => {
                const [osm_type, osm_id] = entry.feature.properties.id.split("/")
                return <SearchResult>{
                    lon: entry.center[0],
                    lat: entry.center[1],
                    osm_type,
                    osm_id,
                    display_name: entry.searchTerms[0],
                    source: "localElementSearch",
                    feature: entry.feature,
                    importance: 1,
                    description: entry.description,
                }
            })
        })


    }

    suggest(query: string, options?: GeocodingOptions): Store<SearchResult[]> {
        return this.searchEntries(query, options, true)
    }

}
