import { UIEventSource } from "../../Logic/UIEventSource"

import { MapProperties } from "../../Models/MapProperties"
import WikidataSearchBox from "../Wikipedia/WikidataSearchBox"
import Wikidata from "../../Logic/Web/Wikidata"
import { Utils } from "../../Utils"
import Locale from "../i18n/Locale"
import { Feature } from "geojson"
import { GeoOperations } from "../../Logic/GeoOperations"

export interface InputHelperProperties {
    /**
     * Extra arguments which might be used by the helper component
     */
    args?: (string | number | boolean)[]

    /**
     * Used for map-based helpers, such as 'direction'
     */
    mapProperties?: Partial<MapProperties> & {
        readonly location: UIEventSource<{ lon: number; lat: number }>
    }
    /**
     * The feature that this question is about
     * Used by the wikidata-input to read properties, which in turn is used to read the name to pre-populate the text field.
     * Additionally, used for direction input to set the default location if no mapProperties with location are given
     */
    feature?: Feature
}

export default class InputHelpers {
    public static hideInputField: string[] = ["translation", "simple_tag", "tag"]

    // noinspection JSUnusedLocalSymbols
    /**
     * Constructs a mapProperties-object for the given properties.
     * Assumes that the first helper-args contains the desired zoom-level
     * @param properties
     * @private
     */
    public static constructMapProperties(
        properties: InputHelperProperties
    ): Partial<MapProperties> {
        let location = properties?.mapProperties?.location
        if (!location) {
            const [lon, lat] = GeoOperations.centerpointCoordinates(properties.feature)
            location = new UIEventSource<{ lon: number; lat: number }>({ lon, lat })
        }
        let mapProperties: Partial<MapProperties> = properties?.mapProperties ?? { location }
        if (!mapProperties.location) {
            mapProperties = { ...mapProperties, location }
        }
        let zoom = 17
        if (properties?.args?.[0] !== undefined) {
            zoom = Number(properties.args[0])
            if (isNaN(zoom)) {
                throw "Invalid zoom level for argument at 'length'-input"
            }
        }
        if (!mapProperties.zoom) {
            mapProperties = { ...mapProperties, zoom: new UIEventSource<number>(zoom) }
        }
        if (!mapProperties.rasterLayer) {
            /*     mapProperties = {
                ...mapProperties, rasterLayer: properties?.mapProperties?.rasterLayer
            }*/
        }
        return mapProperties
    }

    public static constructWikidataHelper(
        value: UIEventSource<string>,
        props: InputHelperProperties
    ) {
        const inputHelperOptions = props
        const args = inputHelperOptions.args ?? []
        const searchKey: string = <string>args[0] ?? "name"

        const searchFor: string =
            searchKey
                .split(";")
                .map((k) => inputHelperOptions.feature?.properties[k]?.toLowerCase())
                .find((foundValue) => !!foundValue) ?? ""

        let searchForValue: UIEventSource<string> = new UIEventSource(searchFor)
        const options: any = args[1]
        if (searchFor !== undefined && options !== undefined) {
            const prefixes = <string[] | Record<string, string[]>>options["removePrefixes"] ?? []
            const postfixes = <string[] | Record<string, string[]>>options["removePostfixes"] ?? []
            const defaultValueCandidate = Locale.language.map((lg) => {
                const prefixesUnrwapped: RegExp[] = (
                    Array.isArray(prefixes) ? prefixes : prefixes[lg] ?? []
                ).map((s) => new RegExp("^" + s, "i"))
                const postfixesUnwrapped: RegExp[] = (
                    Array.isArray(postfixes) ? postfixes : postfixes[lg] ?? []
                ).map((s) => new RegExp(s + "$", "i"))
                let clipped = searchFor

                for (const postfix of postfixesUnwrapped) {
                    const match = searchFor.match(postfix)
                    if (match !== null) {
                        clipped = searchFor.substring(0, searchFor.length - match[0].length)
                        break
                    }
                }

                for (const prefix of prefixesUnrwapped) {
                    const match = searchFor.match(prefix)
                    if (match !== null) {
                        clipped = searchFor.substring(match[0].length)
                        break
                    }
                }
                return clipped
            })

            defaultValueCandidate.addCallbackAndRun((clipped) => searchForValue.setData(clipped))
        }

        let instanceOf: number[] = Utils.NoNull(
            (options?.instanceOf ?? []).map((i) => Wikidata.QIdToNumber(i))
        )
        let notInstanceOf: number[] = Utils.NoNull(
            (options?.notInstanceOf ?? []).map((i) => Wikidata.QIdToNumber(i))
        )

        return new WikidataSearchBox({
            value,
            searchText: searchForValue,
            instanceOf,
            notInstanceOf,
        })
    }
}
