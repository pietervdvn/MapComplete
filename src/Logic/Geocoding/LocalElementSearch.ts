import GeocodingProvider, { GeoCodeResult, GeocodingOptions } from "./GeocodingProvider"
import ThemeViewState from "../../Models/ThemeViewState"
import { Utils } from "../../Utils"
import { Feature } from "geojson"
import { GeoOperations } from "../GeoOperations"

export default class LocalElementSearch implements GeocodingProvider {
    private readonly _state: ThemeViewState

    constructor(state: ThemeViewState) {
        this._state = state

    }

    async search(query: string, options?: GeocodingOptions): Promise<GeoCodeResult[]> {
        return this.searchEntries(query, options, false)
    }

    searchEntries(query: string, options?: GeocodingOptions, matchStart?: boolean): GeoCodeResult[] {
        if (query.length < 3) {
            return []
        }
        const center: { lon: number; lat: number } = this._state.mapProperties.location.data
        const centerPoint: [number, number] = [center.lon, center.lat]
        let results: {
            feature: Feature,
            /**
             * Lon, lat
             */
            center: [number, number],
            levehnsteinD: number,
            physicalDistance: number,
            searchTerms: string[]
        }[] = []
        const properties = this._state.perLayer
        query = Utils.simplifyStringForSearch(query)
        for (const [_, geoIndexedStore] of properties) {
            for (const feature of geoIndexedStore.features.data) {
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
                    results.push({
                        feature,
                        center,
                        physicalDistance: GeoOperations.distanceBetween(centerPoint, center),
                        levehnsteinD,
                        searchTerms
                    })
                }
            }
        }
        results.sort((a, b) => (a.physicalDistance + a.levehnsteinD * 25) - (b.physicalDistance + b.levehnsteinD * 25))
        if (options?.limit) {
            results = results.slice(0, options.limit)
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
                feature: entry.feature
            }
        })
    }

    async suggest(query: string, options?: GeocodingOptions): Promise<GeoCodeResult[]> {
        return this.searchEntries(query, options, true)
    }

}
