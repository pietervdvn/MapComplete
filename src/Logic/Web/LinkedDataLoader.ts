import type { Geometry } from "geojson"
import jsonld from "jsonld"
import { OH, OpeningHour } from "../../UI/OpeningHours/OpeningHours"
import { Utils } from "../../Utils"
import PhoneValidator from "../../UI/InputElement/Validators/PhoneValidator"
import EmailValidator from "../../UI/InputElement/Validators/EmailValidator"
import { Validator } from "../../UI/InputElement/Validator"
import UrlValidator from "../../UI/InputElement/Validators/UrlValidator"
import Constants from "../../Models/Constants"

interface JsonLdLoaderOptions {
    country?: string
}
export default class LinkedDataLoader {
    private static readonly COMPACTING_CONTEXT = {
        name: "http://schema.org/name",
        website: { "@id": "http://schema.org/url", "@type": "@id" },
        phone: { "@id": "http://schema.org/telephone" },
        email: { "@id": "http://schema.org/email" },
        image: { "@id": "http://schema.org/image", "@type": "@id" },
        opening_hours: { "@id": "http://schema.org/openingHoursSpecification" },
        openingHours: { "@id": "http://schema.org/openingHours", "@container": "@set" },

        geo: { "@id": "http://schema.org/geo" },
    }
    private static COMPACTING_CONTEXT_OH = {
        dayOfWeek: { "@id": "http://schema.org/dayOfWeek", "@container": "@set" },
        closes: { "@id": "http://schema.org/closes" },
        opens: { "@id": "http://schema.org/opens" },
    }
    private static formatters: Record<string, Validator> = {
        phone: new PhoneValidator(),
        email: new EmailValidator(),
        website: new UrlValidator(undefined, undefined, true),
    }
    private static ignoreKeys = [
        "http://schema.org/logo",
        "http://schema.org/address",
        "@type",
        "@id",
        "@base",
        "http://schema.org/contentUrl",
        "http://schema.org/datePublished",
        "http://schema.org/description",
        "http://schema.org/hasMap",
        "http://schema.org/priceRange",
        "http://schema.org/contactPoint",
    ]

    private static ignoreTypes = [
        "Breadcrumblist",
       "http://schema.org/SearchAction"
    ]

    static async geoToGeometry(geo): Promise<Geometry> {
        const context = {
            lat: {
                "@id": "http://schema.org/latitude",
            },
            lon: {
                "@id": "http://schema.org/longitude", // TODO formatting to decimal should be possible from this type?
            },
        }
        const flattened = await jsonld.compact(geo, context)

        return {
            type: "Point",
            coordinates: [Number(flattened.lon), Number(flattened.lat)],
        }
    }

    /**
     * Parses http://schema.org/openingHours
     *
     * // Weird data format from C&A
     * LinkedDataLoader.ohStringToOsmFormat("MO 09:30-18:00 TU 09:30-18:00 WE 09:30-18:00 TH 09:30-18:00 FR 09:30-18:00 SA 09:30-18:00") // => "Mo-Sa 09:30-18:00"
     */
    static ohStringToOsmFormat(oh: string) {
        oh = oh.toLowerCase()
        if (oh === "mo-su") {
            return "24/7"
        }
        const regex = /([a-z]+ [0-9:]+-[0-9:]+) (.*)/
        let match = oh.match(regex)
        let parts: string[] = []
        while (match) {
            parts.push(match[1])
            oh = match[2]
            match = oh?.match(regex)
        }
        parts.push(oh)

        // actually the same as OSM-oh
        return OH.simplify(parts.join(";"))
    }

    static async ohToOsmFormat(openingHoursSpecification): Promise<string> {
        const compacted = await jsonld.flatten(
            openingHoursSpecification,
            <any>LinkedDataLoader.COMPACTING_CONTEXT_OH
        )
        const spec: any = compacted["@graph"]
        let allRules: OpeningHour[] = []
        for (const rule of spec) {
            const dow: string[] = rule.dayOfWeek.map((dow) => dow.toLowerCase().substring(0, 2))
            const opens: string = rule.opens
            const closes: string = rule.closes === "23:59" ? "24:00" : rule.closes
            allRules.push(...OH.ParseRule(dow + " " + opens + "-" + closes))
        }

        return OH.ToString(OH.MergeTimes(allRules))
    }

    static async fetchJsonLdWithProxy(url: string, options?: JsonLdLoaderOptions): Promise<any> {
        const urlWithProxy = Constants.linkedDataProxy.replace("{url}", encodeURIComponent(url))
        return await this.fetchJsonLd(urlWithProxy, options)
    }

    /**
     *
     *
     * {
     *   "content": "{\"@context\":\"http://schema.org\",\"@type\":\"LocalBusiness\",\"@id\":\"http://stores.delhaize.be/nl/ad-delhaize-munsterbilzen\",\"name\":\"AD Delhaize Munsterbilzen\",\"url\":\"http://stores.delhaize.be/nl/ad-delhaize-munsterbilzen\",\"logo\":\"https://stores.delhaize.be/build/images/web/shop/delhaize-be/favicon.ico\",\"image\":\"http://stores.delhaize.be/image/mobilosoft-testing?apiPath=rehab/delhaize-be/images/location/ad%20delhaize%20image%20ge%CC%81ne%CC%81rale%20%281%29%201652787176865&imageSize=h_500\",\"email\":\"\",\"telephone\":\"+3289413520\",\"address\":{\"@type\":\"PostalAddress\",\"streetAddress\":\"Waterstraat, 18\",\"addressLocality\":\"Bilzen\",\"postalCode\":\"3740\",\"addressCountry\":\"BE\"},\"geo\":{\"@type\":\"GeoCoordinates\",\"latitude\":50.8906898,\"longitude\":5.5260586},\"openingHoursSpecification\":[{\"@type\":\"OpeningHoursSpecification\",\"dayOfWeek\":\"Tuesday\",\"opens\":\"08:00\",\"closes\":\"18:30\"},{\"@type\":\"OpeningHoursSpecification\",\"dayOfWeek\":\"Wednesday\",\"opens\":\"08:00\",\"closes\":\"18:30\"},{\"@type\":\"OpeningHoursSpecification\",\"dayOfWeek\":\"Thursday\",\"opens\":\"08:00\",\"closes\":\"18:30\"},{\"@type\":\"OpeningHoursSpecification\",\"dayOfWeek\":\"Friday\",\"opens\":\"08:00\",\"closes\":\"18:30\"},{\"@type\":\"OpeningHoursSpecification\",\"dayOfWeek\":\"Saturday\",\"opens\":\"08:00\",\"closes\":\"18:30\"},{\"@type\":\"OpeningHoursSpecification\",\"dayOfWeek\":\"Sunday\",\"opens\":\"08:00\",\"closes\":\"12:00\"},{\"@type\":\"OpeningHoursSpecification\",\"dayOfWeek\":\"Monday\",\"opens\":\"12:00\",\"closes\":\"18:30\"}],\"@base\":\"https://stores.delhaize.be/nl/ad-delhaize-munsterbilzen\"}"
     * }
     */
    private static async compact(data: any, options?: JsonLdLoaderOptions): Promise<any>{
        console.log("Compacting",data)
        if(Array.isArray(data)) {
            return await Promise.all(data.map(d => LinkedDataLoader.compact(d)))
        }
        const country = options?.country
        const compacted = await jsonld.compact(data, <any> LinkedDataLoader.COMPACTING_CONTEXT)
        compacted["opening_hours"] = await LinkedDataLoader.ohToOsmFormat(
            compacted["opening_hours"]
        )
        if (compacted["openingHours"]) {
            const ohspec: string[] = <any> compacted["openingHours"]
            compacted["opening_hours"] = OH.simplify(
                ohspec.map((r) => LinkedDataLoader.ohStringToOsmFormat(r)).join("; ")
            )
            delete compacted["openingHours"]
        }
        if (compacted["geo"]) {
            compacted["geo"] = <any>await LinkedDataLoader.geoToGeometry(compacted["geo"])
        }
        for (const k in compacted) {
            if (compacted[k] === "") {
                delete compacted[k]
                continue
            }
            if (this.ignoreKeys.indexOf(k) >= 0) {
                delete compacted[k]
                continue
            }
            const formatter = LinkedDataLoader.formatters[k]
            if (formatter) {
                if (country) {
                    compacted[k] = formatter.reformat(<string>compacted[k], () => country)
                } else {
                    compacted[k] = formatter.reformat(<string>compacted[k])
                }
            }
        }
        return <any>compacted

    }
    static async fetchJsonLd(url: string, options?: JsonLdLoaderOptions): Promise<any> {
        const data = await Utils.downloadJson(url)
        return await LinkedDataLoader.compact(data, options)
    }

    /**
     * Only returns different items
     * @param externalData
     * @param currentData
     */
    static removeDuplicateData(externalData: Record<string, string>, currentData: Record<string, string>) : Record<string, string>{
        const d = { ...externalData }
        delete d["@context"]
        for (const k in d) {
            const v = currentData[k]
            if (!v) {
                continue
            }
            if (k === "opening_hours") {
                const oh = [].concat(...v.split(";").map(r => OH.ParseRule(r) ?? []))
                const merged = OH.ToString(OH.MergeTimes(oh ?? []))
                if (merged === d[k]) {
                    delete d[k]
                    continue
                }
            }
            if (v === d[k]) {
                delete d[k]
            }
            delete d.geo
        }
        return d
    }
}
