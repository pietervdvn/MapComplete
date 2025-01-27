import { Utils } from "../../Utils"
import type { FeatureCollection } from "geojson"
import ScriptUtils from "../../../scripts/ScriptUtils"

export interface TagInfoStats {
    /**
     * The total number of entries in the data array, **not** the total number of objects known in OSM!
     *
     * Use `data.find(item => item.type==="all").count` for this
     * @deprecated: you probably want to use data.find(item => item.type==="all").count
     */
    total: number
    data: {
        type: "all" | "nodes" | "ways" | "relations"
        // Absolute number
        count: number
        // Relative, percentage
        count_fraction: number
    }[]
}

interface GeofabrikCountryProperties {
    id: string
    parent: string | "europe" | "asia"
    urls: string[]
    name: string
    "iso3166-1:alpha2": string[]
}

export default class TagInfo {
    public static readonly global = new TagInfo()
    private readonly _backend: string
    private static _geofabrikCountries = undefined

    constructor(backend = "https://taginfo.openstreetmap.org/") {
        this._backend = backend
    }

    public async getStats(key: string, value?: string): Promise<TagInfoStats> {
        let url: string
        if (value) {
            url = `${this._backend}api/4/tag/stats?key=${encodeURIComponent(
                key
            )}&value=${encodeURIComponent(value)}`
        } else {
            url = `${this._backend}api/4/key/stats?key=${encodeURIComponent(key)}`
        }
        return await Utils.downloadJsonCached<TagInfoStats>(url, 1000 * 60 * 60 * 24)
    }

    /**
     * Creates the URL to the webpage containing more information
     * @param k
     * @param v
     */
    webUrl(k: string, v: string) {
        if (v) {
            return `${this._backend}/tags/${k}=${v}#overview`
        } else {
            return `${this._backend}/keys/${k}#overview`
        }
    }

    /**
     * Does not work in the browser due to some resources not being CORS-accessible
     */
    public static async geofabrikCountries(): Promise<GeofabrikCountryProperties[]> {
        if (TagInfo._geofabrikCountries) {
            return TagInfo._geofabrikCountries
        }
        const countriesFC: FeatureCollection = await Utils.downloadJsonCached<FeatureCollection>(
            "https://download.geofabrik.de/index-v1-nogeom.json",
            24 * 1000 * 60 * 60
        )
        TagInfo._geofabrikCountries = countriesFC.features.map(
            (f) => <GeofabrikCountryProperties>f.properties
        )
        return TagInfo._geofabrikCountries
    }

    /**
     * Creates a TagInfo-api-object for geofabrik for the given country.
     * Returns undefined if geofabrik does not have such a country
     *
     * Does not work in the browser due to some resources not being CORS-accessible
     * @param countryCode: an iso3166-1:alpha2 code
     */
    public static async getInstanceFor(countryCode: string) {
        const countries = await this.geofabrikCountries()
        countryCode = countryCode.toUpperCase()
        const country = countries.find((c) => c["iso3166-1:alpha2"]?.indexOf(countryCode) >= 0)
        if (!country || !country?.parent || !country?.id) {
            return undefined
        }
        const url = `https://taginfo.geofabrik.de/${country.parent}:${country.id}/`
        return new TagInfo(url)
    }

    private static async getDistributionsFor(
        countryCode: string,
        key: string,
        value?: string
    ): Promise<TagInfoStats> {
        if (!countryCode) {
            return undefined
        }
        const ti = await TagInfo.getInstanceFor(countryCode)
        if (!ti) {
            return undefined
        }
        try {
            return await ti.getStats(key, value)
        } catch (e) {
            console.warn(
                "Could not fetch info from taginfo for",
                countryCode,
                key,
                value,
                "due to",
                e,
                "Taginfo country specific instance is ",
                ti._backend
            )
            return undefined
        }
    }

    private static readonly blacklist = ["VI", "GF", "PR"]

    /**
     * Get a taginfo object for every supportedCountry. This statistic is handled by 'f' and written into the passed in object
     * @param writeInto
     * @param f
     * @param key
     * @param value
     */
    public static async getGlobalDistributionsFor<T>(
        writeInto: Record<string, T>,
        f: (stats: TagInfoStats) => T,
        key: string,
        value?: string
    ): Promise<number> {
        const countriesAll = await this.geofabrikCountries()
        const countries = countriesAll
            .map((c) => c["iso3166-1:alpha2"]?.[0])
            .filter((c) => !!c && TagInfo.blacklist.indexOf(c) < 0)

        let downloaded = 0
        for (const country of countries) {
            if (writeInto[country] !== undefined) {
                continue
            }
            const r = await TagInfo.getDistributionsFor(country, key, value)
            if (r === undefined) {
                continue
            }
            downloaded++
            writeInto[country] = f(r)
        }
        return downloaded
    }
}
