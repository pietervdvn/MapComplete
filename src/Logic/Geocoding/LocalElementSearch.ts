import GeocodingProvider, { GeoCodeResult, GeocodingOptions } from "./GeocodingProvider"
import ThemeViewState from "../../Models/ThemeViewState"
import { Utils } from "../../Utils"
import { Feature } from "geojson"
import { GeoOperations } from "../GeoOperations"
import { ImmutableStore, Store, Stores } from "../UIEventSource"

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

    async search(query: string, options?: GeocodingOptions): Promise<GeoCodeResult[]> {
        return this.searchEntries(query, options, false).data
    }

    private getPartialResult(query: string, matchStart: boolean, centerpoint: [number, number], features: Feature[]): IntermediateResult[] {
        const results: IntermediateResult [] = []

        for (const feature of features) {
            const props = feature.properties
            const searchTerms: string[] = Utils.NoNull([props.name, props.alt_name, props.local_name,
                (props["addr:street"] && props["addr:number"]) ?
                    props["addr:street"] + props["addr:number"] : undefined])


            const levehnsteinD = Math.min(...searchTerms.flatMap(entry => entry.split(/ /)).map(entry => {
                let simplified = Utils.simplifyStringForSearch(entry)
                if (matchStart) {
                    simplified = simplified.slice(0, query.length)
                }
                return Utils.levenshteinDistance(query, simplified)
            }))
            const center = GeoOperations.centerpointCoordinates(feature)
            if (levehnsteinD <= 2) {

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
                    description: description !== "" ? description : undefined
                })
            }
        }
        return results
    }

    searchEntries(query: string, options?: GeocodingOptions, matchStart?: boolean): Store<GeoCodeResult[]> {
        if (query.length < 3) {
            return new ImmutableStore([])
        }
        const center: { lon: number; lat: number } = this._state.mapProperties.location.data
        const centerPoint: [number, number] = [center.lon, center.lat]
        const properties = this._state.perLayer
        query = Utils.simplifyStringForSearch(query)

        const partials: Store<IntermediateResult[]>[] = []

        for (const [_, geoIndexedStore] of properties) {
            const partialResult = geoIndexedStore.features.map(features => this.getPartialResult(query, matchStart, centerPoint, features))
            partials.push(partialResult)
        }

        const listed: Store<IntermediateResult[]> = Stores.concat(partials)
        return listed.mapD(results => {
            results.sort((a, b) => (a.physicalDistance + a.levehnsteinD * 25) - (b.physicalDistance + b.levehnsteinD * 25))
            if (this._limit || options?.limit) {
                results = results.slice(0, Math.min(this._limit ?? options?.limit, options?.limit ?? this._limit))
            }
            return results.map(entry => {
                const id = entry.feature.properties.id.split("/")
                return <GeoCodeResult>{
                    lon: entry.center[0],
                    lat: entry.center[1],
                    osm_type: id[0],
                    osm_id: id[1],
                    display_name: entry.searchTerms[0],
                    source: "localElementSearch",
                    feature: entry.feature,
                    importance: 1,
                    description: entry.description
                }
            })
        })


    }

    suggest(query: string, options?: GeocodingOptions): Store<GeoCodeResult[]> {
        return this.searchEntries(query, options, true)
    }

}
