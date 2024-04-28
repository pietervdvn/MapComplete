import { GeoOperations } from "./GeoOperations"
import { Utils } from "../Utils"
import opening_hours from "opening_hours"
import Combine from "../UI/Base/Combine"
import BaseUIElement from "../UI/BaseUIElement"
import Title from "../UI/Base/Title"
import { FixedUiElement } from "../UI/Base/FixedUiElement"
import LayerConfig from "../Models/ThemeConfig/LayerConfig"
import { CountryCoder } from "latlon2country"
import Constants from "../Models/Constants"
import { TagUtils } from "./Tags/TagUtils"
import { Feature, LineString } from "geojson"
import { OsmTags } from "../Models/OsmFeature"
import { UIEventSource } from "./UIEventSource"
import LayoutConfig from "../Models/ThemeConfig/LayoutConfig"
import OsmObjectDownloader from "./Osm/OsmObjectDownloader"
import countryToCurrency from "country-to-currency"

/**
 * All elements that are needed to perform metatagging
 */
export interface MetataggingState {
    layout: LayoutConfig
    osmObjectDownloader: OsmObjectDownloader
}

export abstract class SimpleMetaTagger {
    public readonly keys: string[]
    public readonly doc: string
    public readonly isLazy: boolean
    public readonly includesDates: boolean

    /***
     * A function that adds some extra data to a feature
     * @param docs: what does this extra data do?
     */
    protected constructor(docs: {
        keys: string[]
        doc: string
        /**
         * Set this flag if the data is volatile or date-based.
         * It'll _won't_ be cached in this case
         */
        includesDates?: boolean
        isLazy?: boolean
        cleanupRetagger?: boolean
    }) {
        this.keys = docs.keys
        this.doc = docs.doc
        this.isLazy = docs.isLazy
        this.includesDates = docs.includesDates ?? false
        if (!docs.cleanupRetagger) {
            for (const key of docs.keys) {
                if (!key.startsWith("_") && key.toLowerCase().indexOf("theme") < 0) {
                    throw `Incorrect key for a calculated meta value '${key}': it should start with underscore (_)`
                }
            }
        }
    }

    /**
     * Applies the metatag-calculation, returns 'true' if the upstream source needs to be pinged
     * @param feature
     * @param layer
     * @param tagsStore
     * @param state
     */
    public abstract applyMetaTagsOnFeature(
        feature: any,
        layer: LayerConfig,
        tagsStore: UIEventSource<Record<string, string>>,
        state: MetataggingState
    ): boolean
}

export class ReferencingWaysMetaTagger extends SimpleMetaTagger {
    /**
     * Disable this metatagger, e.g. for caching or tests
     * This is a bit a work-around
     */
    public static enabled = true

    constructor() {
        super({
            keys: ["_referencing_ways"],
            isLazy: true,
            doc: "_referencing_ways contains - for a node - which ways use this node as point in their geometry. ",
        })
    }

    public applyMetaTagsOnFeature(feature, layer, tags, state) {
        if (!ReferencingWaysMetaTagger.enabled) {
            return false
        }
        //this function has some extra code to make it work in SimpleAddUI.ts to also work for newly added points
        const id = feature.properties.id
        if (!id.startsWith("node/")) {
            return false
        }

        Utils.AddLazyPropertyAsync(feature.properties, "_referencing_ways", async () => {
            const referencingWays = await state.osmObjectDownloader.DownloadReferencingWays(id)
            const wayIds = referencingWays.map((w) => "way/" + w.id)
            wayIds.sort()
            return wayIds.join(";")
        })

        return true
    }
}

class CountryTagger extends SimpleMetaTagger {
    private static readonly coder = new CountryCoder(
        Constants.countryCoderEndpoint,
        Utils.downloadJson
    )
    public runningTasks: Set<any> = new Set<any>()

    constructor() {
        super({
            keys: ["_country"],
            doc: "The country code of the property (with latlon2country)",
            includesDates: false,
        })
    }

    applyMetaTagsOnFeature(feature, _, tagsSource) {
        let centerPoint: any = GeoOperations.centerpoint(feature)
        const runningTasks = this.runningTasks
        const lat = centerPoint.geometry.coordinates[1]
        const lon = centerPoint.geometry.coordinates[0]
        runningTasks.add(feature)
        CountryTagger.coder
            .GetCountryCodeAsync(lon, lat)
            .then((countries) => {
                if (!countries) {
                    console.warn("Country coder returned ", countries)
                    return
                }
                const oldCountry = feature.properties["_country"]
                const newCountry = countries[0].trim().toLowerCase()
                if (oldCountry !== newCountry) {
                    if (typeof window === undefined) {
                        tagsSource.data["_country"] = newCountry
                        tagsSource?.ping()
                    } else {
                        // We set, be we don't ping... this is for later
                        tagsSource.data["_country"] = newCountry

                        /**
                         * What is this weird construction?
                         *
                         * For a theme with a hundreds of items (e.g. shops)
                         * the country for all those shops will probably arrive at the same time.
                         *
                         * This means that all those stores will be pinged around the same time.
                         * Now, the country is pivotal in calculating the opening hours (because opening hours need the country to determine e.g. public holidays).
                         *
                         * In other words, when the country information becomes available, it'll start calculating the opening hours for hundreds of items at the same time.
                         * This will choke up the main thread for at least a few seconds, causing a very annoying hang.
                         *
                         * As such, we use 'requestIdleCallback' instead to gently spread out these calculations
                         */

                        window.requestIdleCallback(() => {
                            tagsSource?.ping()
                        })
                    }
                }
            })
            .catch((e) => {
                console.warn(e)
            })
            .finally(() => runningTasks.delete(feature))
        return false
    }
}

class InlineMetaTagger extends SimpleMetaTagger {
    public readonly applyMetaTagsOnFeature: (
        feature: any,
        layer: LayerConfig,
        tagsStore: UIEventSource<OsmTags>,
        state: MetataggingState
    ) => boolean

    constructor(
        docs: {
            keys: string[]
            doc: string
            /**
             * Set this flag if the data is volatile or date-based.
             * It'll _won't_ be cached in this case
             */
            includesDates?: boolean
            isLazy?: boolean
            cleanupRetagger?: boolean
        },
        f: (
            feature: any,
            layer: LayerConfig,
            tagsStore: UIEventSource<OsmTags>,
            state: MetataggingState
        ) => boolean
    ) {
        super(docs)
        this.applyMetaTagsOnFeature = f
    }
}

class RewriteMetaInfoTags extends SimpleMetaTagger {
    constructor() {
        super({
            keys: [
                "_last_edit:contributor",
                "_last_edit:contributor:uid",
                "_last_edit:changeset",
                "_last_edit:timestamp",
                "_version_number",
                "_backend",
            ],
            doc: "Information about the last edit of this object. This object will actually _rewrite_ some tags for features coming from overpass",
        })
    }

    applyMetaTagsOnFeature(feature: Feature): boolean {
        /*Note: also called by 'UpdateTagsFromOsmAPI'*/

        const tgs = feature.properties
        let movedSomething = false

        function move(src: string, target: string) {
            if (tgs[src] === undefined) {
                return
            }
            tgs[target] = tgs[src]
            delete tgs[src]
            movedSomething = true
        }

        move("user", "_last_edit:contributor")
        move("uid", "_last_edit:contributor:uid")
        move("changeset", "_last_edit:changeset")
        move("timestamp", "_last_edit:timestamp")
        move("version", "_version_number")
        feature.properties._backend = feature.properties._backend ?? "https://api.openstreetmap.org"
        return movedSomething
    }
}

export default class SimpleMetaTaggers {
    /**
     * A simple metatagger which rewrites various metatags as needed
     */
    public static readonly objectMetaInfo = new RewriteMetaInfoTags()
    public static country = new CountryTagger()
    public static geometryType = new InlineMetaTagger(
        {
            keys: ["_geometry:type"],
            doc: "Adds the geometry type as property. This is identical to the GoeJson geometry type and is one of `Point`,`LineString`, `Polygon` and exceptionally `MultiPolygon` or `MultiLineString`",
        },
        (feature, _) => {
            const changed = feature.properties["_geometry:type"] === feature.geometry.type
            feature.properties["_geometry:type"] = feature.geometry.type
            return changed
        }
    )
    public static referencingWays = new ReferencingWaysMetaTagger()
    private static readonly cardinalDirections = {
        N: 0,
        NNE: 22.5,
        NE: 45,
        ENE: 67.5,
        E: 90,
        ESE: 112.5,
        SE: 135,
        SSE: 157.5,
        S: 180,
        SSW: 202.5,
        SW: 225,
        WSW: 247.5,
        W: 270,
        WNW: 292.5,
        NW: 315,
        NNW: 337.5,
    }
    private static latlon = new InlineMetaTagger(
        {
            keys: ["_lat", "_lon"],
            doc: "The latitude and longitude of the point (or centerpoint in the case of a way/area)",
        },
        (feature) => {
            const centerPoint = GeoOperations.centerpoint(feature)
            const lat = centerPoint.geometry.coordinates[1]
            const lon = centerPoint.geometry.coordinates[0]
            feature.properties["_lat"] = "" + lat
            feature.properties["_lon"] = "" + lon
            return true
        }
    )
    private static layerInfo = new InlineMetaTagger(
        {
            doc: "The layer-id to which this feature belongs. Note that this might be return any applicable if `passAllFeatures` is defined.",
            keys: ["_layer"],
            includesDates: false,
        },
        (feature, layer) => {
            if (feature.properties._layer === layer.id) {
                return false
            }
            feature.properties._layer = layer.id
            return true
        }
    )
    private static noBothButLeftRight = new InlineMetaTagger(
        {
            keys: [
                "sidewalk:left",
                "sidewalk:right",
                "generic_key:left:property",
                "generic_key:right:property",
            ],
            doc: "Rewrites tags from 'generic_key:both:property' as 'generic_key:left:property' and 'generic_key:right:property' (and similar for sidewalk tagging). Note that this rewritten tags _will be reuploaded on a change_. To prevent to much unrelated retagging, this is only enabled if the layer has at least some lineRenderings with offset defined",
            includesDates: false,
            cleanupRetagger: true,
        },
        (feature, layer) => {
            if (!layer.lineRendering.some((lr) => lr.leftRightSensitive)) {
                return
            }

            return SimpleMetaTaggers.removeBothTagging(feature.properties)
        }
    )
    private static surfaceArea = new InlineMetaTagger(
        {
            keys: ["_surface"],
            doc: "The surface area of the feature in square meters. Not set on points and ways",
            isLazy: true,
        },
        (feature) => {
            Utils.AddLazyProperty(feature.properties, "_surface", () => {
                return "" + GeoOperations.surfaceAreaInSqMeters(feature)
            })

            return true
        }
    )
    private static surfaceAreaHa = new InlineMetaTagger(
        {
            keys: ["_surface:ha"],
            doc: "The surface area of the feature in hectare. Not set on points and ways",
            isLazy: true,
        },
        (feature) => {
            Utils.AddLazyProperty(feature.properties, "_surface:ha", () => {
                const sqMeters = GeoOperations.surfaceAreaInSqMeters(feature)
                return "" + Math.floor(sqMeters / 1000) / 10
            })

            return true
        }
    )
    private static levels = new InlineMetaTagger(
        {
            doc: "Extract the 'level'-tag into a normalized, ';'-separated value called '_level' (which also includes 'repeat_on'). The `level` tag (without underscore) will be normalized with only the value of `level`.",
            keys: ["_level"],
        },
        (feature) => {
            let somethingChanged = false
            if (feature.properties["level"] !== undefined) {
                const l = feature.properties["level"]
                const newValue = TagUtils.LevelsParser(l).join(";")
                if (l !== newValue) {
                    feature.properties["level"] = newValue
                    somethingChanged = true
                }
            }

            if (feature.properties["repeat_on"] !== undefined) {
                const l = feature.properties["repeat_on"]
                const newValue = TagUtils.LevelsParser(l).join(";")
                if (l !== newValue) {
                    feature.properties["repeat_on"] = newValue
                    somethingChanged = true
                }
            }

            const combined = TagUtils.LevelsParser(
                (feature.properties.repeat_on ?? "") + ";" + (feature.properties.level ?? "")
            ).join(";")
            if (feature.properties["_level"] !== combined) {
                feature.properties["_level"] = combined
                somethingChanged = true
            }
            return somethingChanged
        }
    )
    private static canonicalize = new InlineMetaTagger(
        {
            doc: "If 'units' is defined in the layoutConfig, then this metatagger will rewrite the specified keys to have the canonical form (e.g. `1meter` will be rewritten to `1m`; `1` will be rewritten to `1m` as well)",
            keys: ["Theme-defined keys"],
        },
        (feature, _, __, state) => {
            const units = Utils.NoNull(
                [].concat(...(state?.layout?.layers?.map((layer) => layer.units) ?? []))
            )
            if (units.length == 0) {
                return
            }
            let rewritten = false
            for (const key in feature.properties) {
                if (!feature.properties.hasOwnProperty(key)) {
                    continue
                }
                for (const unit of units) {
                    if (unit === undefined) {
                        continue
                    }
                    if (unit.appliesToKeys === undefined) {
                        console.error("The unit ", unit, "has no appliesToKey defined")
                        continue
                    }
                    if (!unit.appliesToKeys.has(key)) {
                        continue
                    }
                    const value = feature.properties[key]
                    const denom = unit.findDenomination(value, () => feature.properties["_country"])
                    if (denom === undefined) {
                        // no valid value found
                        break
                    }
                    const [, denomination] = denom
                    const defaultDenom = unit.getDefaultDenomination(
                        () => feature.properties["_country"]
                    )
                    let canonical =
                        denomination?.canonicalValue(value, defaultDenom == denomination, unit.inverted) ??
                        undefined
                    if (canonical === value) {
                        break
                    }
                    console.log("Rewritten ", key, ` from '${value}' into '${canonical}'`)
                    if (canonical === undefined && !unit.eraseInvalid) {
                        break
                    }

                    feature.properties[key] = canonical
                    rewritten = true
                    break
                }
            }
            return rewritten
        }
    )
    private static lngth = new InlineMetaTagger(
        {
            keys: ["_length", "_length:km"],
            doc: "The total length of a feature in meters (and in kilometers, rounded to one decimal for '_length:km'). For a surface, the length of the perimeter",
        },
        (feature) => {
            const l = GeoOperations.lengthInMeters(feature)
            feature.properties["_length"] = "" + l
            const km = Math.floor(l / 1000)
            const kmRest = Math.round((l - km * 1000) / 100)
            feature.properties["_length:km"] = "" + km + "." + kmRest
            return true
        }
    )
    private static isOpen = new InlineMetaTagger(
        {
            keys: ["_isOpen"],
            doc: "If 'opening_hours' is present, it will add the current state of the feature (being 'yes' or 'no')",
            includesDates: true,
            isLazy: true,
        },
        (feature) => {
            if (Utils.runningFromConsole) {
                // We are running from console, thus probably creating a cache
                // isOpen is irrelevant
                return false
            }
            if (feature.properties.opening_hours === undefined) {
                return false
            }
            if (feature.properties.opening_hours === "24/7") {
                feature.properties._isOpen = "yes"
                return true
            }

            // _isOpen is calculated dynamically on every call
            Object.defineProperty(feature.properties, "_isOpen", {
                enumerable: false,
                configurable: true,
                get: () => {
                    const tags = feature.properties
                    if (tags.opening_hours === undefined) {
                        return
                    }
                    const country = tags._country
                    if (country === undefined) {
                        return
                    }

                    try {
                        const [lon, lat] = GeoOperations.centerpointCoordinates(feature)
                        const oh = new opening_hours(
                            tags["opening_hours"],
                            {
                                lat: lat,
                                lon: lon,
                                address: {
                                    country_code: tags._country.toLowerCase(),
                                    state: undefined,
                                },
                            },
                            <any>{ tag_key: "opening_hours" }
                        )

                        // Recalculate!
                        return oh.getState() ? "yes" : "no"
                    } catch (e) {
                        console.warn("Error while parsing opening hours of ", tags.id, e)
                        delete tags._isOpen
                        tags["_isOpen"] = "parse_error"
                    }
                },
            })
        }
    )
    private static directionSimplified = new InlineMetaTagger(
        {
            keys: ["_direction:numerical", "_direction:leftright"],
            doc: "_direction:numerical is a normalized, numerical direction based on 'camera:direction' or on 'direction'; it is only present if a valid direction is found (e.g. 38.5 or NE). _direction:leftright is either 'left' or 'right', which is left-looking on the map or 'right-looking' on the map",
        },
        (feature) => {
            const tags = feature.properties
            const direction = tags["camera:direction"] ?? tags["direction"]
            if (direction === undefined) {
                return false
            }
            const n = SimpleMetaTaggers.cardinalDirections[direction] ?? Number(direction)
            if (isNaN(n)) {
                return false
            }

            // The % operator has range (-360, 360). We apply a trick to get [0, 360).
            const normalized = ((n % 360) + 360) % 360

            tags["_direction:numerical"] = normalized
            tags["_direction:leftright"] = normalized <= 180 ? "right" : "left"
            return true
        }
    )
    private static directionCenterpoint = new InlineMetaTagger(
        {
            keys: ["_direction:centerpoint"],
            isLazy: true,
            doc: "_direction:centerpoint is the direction of the linestring (in degrees) if one were standing at the projected centerpoint.",
        },
        (feature: Feature) => {
            if (feature.geometry.type !== "LineString") {
                return false
            }

            const ls = <Feature<LineString>>feature

            Object.defineProperty(feature.properties, "_direction:centerpoint", {
                enumerable: false,
                configurable: true,
                get: () => {
                    const centroid = GeoOperations.centerpoint(feature)
                    const projected = GeoOperations.nearestPoint(
                        ls,
                        <[number, number]>centroid.geometry.coordinates
                    )
                    const nextPoint = ls.geometry.coordinates[projected.properties.index + 1]
                    const bearing = GeoOperations.bearing(projected.geometry.coordinates, nextPoint)
                    delete feature.properties["_direction:centerpoint"]
                    feature.properties["_direction:centerpoint"] = bearing
                    return bearing
                },
            })

            return true
        }
    )
    private static currentTime = new InlineMetaTagger(
        {
            keys: ["_now:date", "_now:datetime"],
            doc: "Adds the time that the data got loaded - pretty much the time of downloading from overpass. The format is YYYY-MM-DD hh:mm, aka 'sortable' aka ISO-8601-but-not-entirely",
            includesDates: true,
        },
        (feature) => {
            const now = new Date()

            function date(d: Date) {
                return d.toISOString().slice(0, 10)
            }

            function datetime(d: Date) {
                return d.toISOString().slice(0, -5).replace("T", " ")
            }

            feature.properties["_now:date"] = date(now)
            feature.properties["_now:datetime"] = datetime(now)
            return true
        }
    )

    private static timeSinceLastEdit = new InlineMetaTagger(
        {
            keys: ["_last_edit:passed_time"],
            doc: "Gives the number of seconds since the last edit. Note that this will _not_ update, but rather be the number of seconds elapsed at the moment this tag is read first",
            isLazy: true,
            includesDates: true,
        },
        (feature) => {
            Utils.AddLazyProperty(feature.properties, "_last_edit:passed_time", () => {
                const lastEditTimestamp = new Date(
                    feature.properties["_last_edit:timestamp"]
                ).getTime()
                const now: number = Date.now()
                const millisElapsed = now - lastEditTimestamp
                return "" + millisElapsed / 1000
            })
            return true
        }
    )

    private static currency = new InlineMetaTagger(
        {
            keys: ["_currency"],
            doc: "Adds the currency valid for the object, based on country or explicit tagging. Can be a single currency or a semicolon-separated list of currencies. Empty if no currency is found.",
            isLazy: true,
        },
        (feature: Feature, layer: LayerConfig, tagsStore: UIEventSource<OsmTags>) => {
            Utils.AddLazyPropertyAsync(feature.properties, "_currency", async () => {
                // Wait until _country is actually set
                const tags = await tagsStore.AsPromise((tags) => !!tags._country)

                const country = tags._country
                // Initialize a list of currencies
                const currencies = {}
                // Check if there are any currency:XXX tags, add them to the map
                for (const key in feature.properties) {
                    if (key.startsWith("currency:")) {
                        if (feature.properties[key] === "yes") {
                            currencies[key.slice(9)] = true
                        } else {
                            currencies[key.slice(9)] = false
                        }
                    }
                }

                // Determine the default currency for the country
                const defaultCurrency = countryToCurrency[country.toUpperCase()]

                // If the default currency is not in the list, add it
                if (defaultCurrency && !currencies[defaultCurrency]) {
                    currencies[defaultCurrency] = true
                }

                if (currencies) {
                    return Object.keys(currencies)
                        .filter((key) => currencies[key])
                        .join(";")
                }
                return ""
            })
            return true
        }
    )

    public static metatags: SimpleMetaTagger[] = [
        SimpleMetaTaggers.latlon,
        SimpleMetaTaggers.layerInfo,
        SimpleMetaTaggers.surfaceArea,
        SimpleMetaTaggers.surfaceAreaHa,
        SimpleMetaTaggers.lngth,
        SimpleMetaTaggers.canonicalize,
        SimpleMetaTaggers.country,
        SimpleMetaTaggers.isOpen,
        SimpleMetaTaggers.directionSimplified,
        SimpleMetaTaggers.directionCenterpoint,
        SimpleMetaTaggers.currentTime,
        SimpleMetaTaggers.objectMetaInfo,
        SimpleMetaTaggers.noBothButLeftRight,
        SimpleMetaTaggers.geometryType,
        SimpleMetaTaggers.levels,
        SimpleMetaTaggers.referencingWays,
        SimpleMetaTaggers.timeSinceLastEdit,
        SimpleMetaTaggers.currency,
    ]

    /**
     * Edits the given object to rewrite 'both'-tagging into a 'left-right' tagging scheme.
     * These changes are performed in-place.
     *
     * Returns 'true' is at least one change has been made
     * @param tags
     */
    public static removeBothTagging(tags: any): boolean {
        let somethingChanged = false

        /**
         * Sets the key onto the properties (but doesn't overwrite if already existing)
         */
        function set(k, value) {
            if (tags[k] === undefined || tags[k] === "") {
                tags[k] = value
                somethingChanged = true
            }
        }

        if (tags["sidewalk"]) {
            const v = tags["sidewalk"]
            switch (v) {
                case "none":
                case "no":
                    set("sidewalk:left", "no")
                    set("sidewalk:right", "no")
                    break
                case "both":
                    set("sidewalk:left", "yes")
                    set("sidewalk:right", "yes")
                    break
                case "left":
                    set("sidewalk:left", "yes")
                    set("sidewalk:right", "no")
                    break
                case "right":
                    set("sidewalk:left", "no")
                    set("sidewalk:right", "yes")
                    break
                default:
                    set("sidewalk:left", v)
                    set("sidewalk:right", v)
                    break
            }
            delete tags["sidewalk"]
            somethingChanged = true
        }

        const regex = /\([^:]*\):both:\(.*\)/
        for (const key in tags) {
            const v = tags[key]
            if (key.endsWith(":both")) {
                const strippedKey = key.substring(0, key.length - ":both".length)
                set(strippedKey + ":left", v)
                set(strippedKey + ":right", v)
                delete tags[key]
                continue
            }

            const match = key.match(regex)
            if (match !== null) {
                const strippedKey = match[1]
                const property = match[1]
                set(strippedKey + ":left:" + property, v)
                set(strippedKey + ":right:" + property, v)
                console.log("Left-right rewritten " + key)
                delete tags[key]
            }
        }

        return somethingChanged
    }

    public static HelpText(): BaseUIElement {
        const subElements: (string | BaseUIElement)[] = [
            new Combine([
                "Metatags are extra tags available, in order to display more data or to give better questions.",
                "They are calculated automatically on every feature when the data arrives in the webbrowser. This document gives an overview of the available metatags.",
                "**Hint:** when using metatags, add the [query parameter](URL_Parameters.md) `debug=true` to the URL. This will include a box in the popup for features which shows all the properties of the object",
            ]).SetClass("flex-col"),
        ]

        subElements.push(new Title("Metatags calculated by MapComplete", 2))
        subElements.push(
            new FixedUiElement(
                "The following values are always calculated, by default, by MapComplete and are available automatically on all elements in every theme"
            )
        )
        for (const metatag of SimpleMetaTaggers.metatags) {
            subElements.push(
                new Title(metatag.keys.join(", "), 3),
                metatag.doc,
                metatag.isLazy ? "This is a lazy metatag and is only calculated when needed" : ""
            )
        }

        return new Combine(subElements).SetClass("flex-col")
    }
}
