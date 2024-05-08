import type { Feature, GeoJSON, Geometry, Polygon } from "geojson"
import jsonld from "jsonld"
import { OH, OpeningHour } from "../../UI/OpeningHours/OpeningHours"
import { Utils } from "../../Utils"
import PhoneValidator from "../../UI/InputElement/Validators/PhoneValidator"
import EmailValidator from "../../UI/InputElement/Validators/EmailValidator"
import { Validator } from "../../UI/InputElement/Validator"
import UrlValidator from "../../UI/InputElement/Validators/UrlValidator"
import Constants from "../../Models/Constants"
import TypedSparql, { default as S, SparqlResult } from "./TypedSparql"

interface JsonLdLoaderOptions {
    country?: string
}

type PropertiesSpec<T extends string> = Partial<
    Record<T, string | string[] | Partial<Record<T, string>>>
>

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
        alt_name: { "@id": "http://schema.org/alternateName" }
    }
    private static COMPACTING_CONTEXT_OH = {
        dayOfWeek: { "@id": "http://schema.org/dayOfWeek", "@container": "@set" },
        closes: {
            "@id": "http://schema.org/closes",
            "@type": "http://www.w3.org/2001/XMLSchema#time"
        },
        opens: {
            "@id": "http://schema.org/opens",
            "@type": "http://www.w3.org/2001/XMLSchema#time"
        }
    }
    private static formatters: Record<"phone" | "email" | "website", Validator> = {
        phone: new PhoneValidator(),
        email: new EmailValidator(),
        website: new UrlValidator(undefined, undefined, true)
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
        "http://schema.org/contactPoint"
    ]

    private static shapeToPolygon(str: string): Polygon {
        const polygon = str.substring("POLYGON ((".length, str.length - 2)
        return <Polygon>{
            type: "Polygon",
            coordinates: [
                polygon.split(",").map((coors) =>
                    coors
                        .trim()
                        .split(" ")
                        .map((n) => Number(n))
                )
            ]
        }
    }

    private static async geoToGeometry(geo): Promise<Geometry> {
        if (Array.isArray(geo)) {
            const features = await Promise.all(geo.map((g) => LinkedDataLoader.geoToGeometry(g)))
            const polygon = features.find((f) => f.type === "Polygon")
            if (polygon) {
                return polygon
            }
            const ls = features.find((f) => f.type === "LineString")
            if (ls) {
                return ls
            }
            return features[0]
        }

        if (geo["@type"] === "http://schema.org/GeoCoordinates") {
            const context = {
                lat: {
                    "@id": "http://schema.org/latitude",
                    "@type": "http://www.w3.org/2001/XMLSchema#double"
                },
                lon: {
                    "@id": "http://schema.org/longitude",
                    "@type": "http://www.w3.org/2001/XMLSchema#double"
                }
            }
            const flattened = await jsonld.compact(geo, context)

            return {
                type: "Point",
                coordinates: [Number(flattened.lon), Number(flattened.lat)]
            }
        }

        if (
            geo["@type"] === "http://schema.org/GeoShape" &&
            geo["http://schema.org/polygon"] !== undefined
        ) {
            const str = geo["http://schema.org/polygon"]["@value"]
            LinkedDataLoader.shapeToPolygon(str)
        }

        throw "Unsupported geo type: " + geo["@type"]
    }

    /**
     * Parses http://schema.org/openingHours
     *
     * // Weird data format from C&A
     * LinkedDataLoader.ohStringToOsmFormat("MO 09:30-18:00 TU 09:30-18:00 WE 09:30-18:00 TH 09:30-18:00 FR 09:30-18:00 SA 09:30-18:00") // => "Mo-Sa 09:30-18:00"
     * LinkedDataLoader.ohStringToOsmFormat("MO 09:30-18:00 TU 09:30-18:00 WE 09:30-18:00 TH 09:30-18:00 FR 09:30-18:00 SA 09:30-18:00 SU 09:30-18:00") // => "09:30-18:00"
     *
     */
    static ohStringToOsmFormat(oh: string) {
        oh = oh.toLowerCase()
        if (oh === "mo-su") {
            return "24/7"
        }
        const regex = /([a-z]+ [0-9:]+-[0-9:]+) (.*)/
        let match = oh.match(regex)
        const parts: string[] = []
        while (match) {
            parts.push(match[1])
            oh = match[2]
            match = oh?.match(regex)
        }
        parts.push(oh)

        // actually the same as OSM-oh
        return OH.simplify(parts.join(";"))
    }

    static async ohToOsmFormat(openingHoursSpecification): Promise<string | undefined> {
        if (typeof openingHoursSpecification === "string") {
            return openingHoursSpecification
        }
        const compacted = await jsonld.compact(
            openingHoursSpecification,
            <any>LinkedDataLoader.COMPACTING_CONTEXT_OH
        )
        const spec: object = compacted["@graph"]
        if (!spec) {
            return undefined
        }
        const allRules: OpeningHour[] = []
        for (const rule of spec) {
            const dow: string[] = rule.dayOfWeek.map((dow) => {
                if (typeof dow !== "string") {
                    dow = dow["@id"]
                }
                if (dow.startsWith("http://schema.org/")) {
                    dow = dow.substring("http://schema.org/".length)
                }
                return dow.toLowerCase().substring(0, 2)
            })
            const opens: string = rule.opens
            const closes: string = rule.closes === "23:59" ? "24:00" : rule.closes
            allRules.push(...OH.ParseRule(dow + " " + opens + "-" + closes))
        }

        return OH.ToString(OH.MergeTimes(allRules))
    }

    static async compact(data: object, options?: JsonLdLoaderOptions): Promise<object> {
        if (Array.isArray(data)) {
            return await Promise.all(data.map((point) => LinkedDataLoader.compact(point, options)))
        }

        const country = options?.country
        const compacted = await jsonld.compact(data, <any>LinkedDataLoader.COMPACTING_CONTEXT)

        compacted["opening_hours"] = await LinkedDataLoader.ohToOsmFormat(
            compacted["opening_hours"]
        )
        if (compacted["openingHours"]) {
            const ohspec: string[] = <any>compacted["openingHours"]
            compacted["opening_hours"] = OH.simplify(
                ohspec.map((r) => LinkedDataLoader.ohStringToOsmFormat(r)).join("; ")
            )
            delete compacted["openingHours"]
        }
        if (compacted["opening_hours"] === undefined) {
            delete compacted["opening_hours"]
        }
        if (compacted["geo"]) {
            compacted["geo"] = <any>await LinkedDataLoader.geoToGeometry(compacted["geo"])
        }

        if (compacted["alt_name"]) {
            if (compacted["alt_name"] === compacted["name"]) {
                delete compacted["alt_name"]
            }
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
        return compacted
    }

    static async fetchJsonLd(
        url: string,
        options?: JsonLdLoaderOptions,
        useProxy: boolean = false
    ): Promise<object> {
        if (useProxy) {
            url = Constants.linkedDataProxy.replace("{url}", encodeURIComponent(url))
        }
        const data = await Utils.downloadJson(url)
        return await LinkedDataLoader.compact(data, options)
    }

    /**
     * Only returns different items
     * @param externalData
     * @param currentData
     */
    static removeDuplicateData(
        externalData: Record<string, string>,
        currentData: Record<string, string>
    ): Record<string, string> {
        const d = { ...externalData }
        delete d["@context"]
        for (const k in d) {
            const v = currentData[k]
            if (!v) {
                continue
            }
            if (k === "opening_hours") {
                const oh = [].concat(...v.split(";").map((r) => OH.ParseRule(r) ?? []))
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

    static asGeojson(linkedData: Record<string, string[]>): Feature {
        delete linkedData["@context"]
        const properties: Record<string, string> = {}
        for (const k in linkedData) {
            if (linkedData[k].length > 1) {
                throw (
                    "Found multiple values in properties for " + k + ": " + linkedData[k].join("; ")
                )
            }
            properties[k] = linkedData[k].join("; ")
        }
        let geometry: Geometry = undefined

        if (properties["latitude"] && properties["longitude"]) {
            geometry = {
                type: "Point",
                coordinates: [Number(properties["longitude"]), Number(properties["latitude"])]
            }
            delete properties["latitude"]
            delete properties["longitude"]
        }
        if (properties["shape"]) {
            geometry = LinkedDataLoader.shapeToPolygon(properties["shape"])
        }

        const geo: GeoJSON = {
            type: "Feature",
            properties,
            geometry
        }
        delete linkedData.geo
        delete properties.shape
        delete properties.type
        delete properties.parking
        delete properties.g
        delete properties.section

        return geo
    }

    private static patchVeloparkProperties(
        input: Record<string, Set<string>>
    ): Record<string, string[]> {
        const output: Record<string, string[]> = {}
        console.log("Input for patchVelopark:", input)
        for (const k in input) {
            output[k] = Array.from(input[k])
        }

        if (output["type"][0] === "https://data.velopark.be/openvelopark/terms#BicycleLocker") {
            output["bicycle_parking"] = ["lockers"]
        }
        delete output["type"]

        function on(key: string, applyF: (s: string) => string) {
            if (!output[key]) {
                return
            }
            output[key] = output[key].map((v) => applyF(v))
            if (!output[key].some(v => v !== undefined)) {
                delete output[key]
            }
        }

        function asBoolean(key: string, invert: boolean = false) {
            on(key, (str) => {
                const isTrue = "" + str === "true" || str === "True" || str === "yes"
                if (isTrue != invert) {
                    return "yes"
                }
                return "no"
            })
        }

        on("maxstay", (maxstay) => {
            const match = maxstay.match(/P([0-9]+)D/)
            if (match) {
                const days = Number(match[1])
                if (days === 1) {
                    return "1 day"
                }
                return days + " days"
            }
            return maxstay
        })

        function rename(source: string, target: string) {
            if (output[source] === undefined || output[source] === null) {
                return
            }
            output[target] = output[source]
            delete output[source]
        }

        on("phone", (p) => this.formatters["phone"].reformat(p, () => "be"))

        for (const attribute in LinkedDataLoader.formatters) {
            on(attribute, (p) => LinkedDataLoader.formatters[attribute].reformat(p))
        }
        rename("phone", "operator:phone")
        rename("email", "operator:email")
        rename("website", "operator:website")

        on("charge", (p) => {
            if (Number(p) === 0) {
                output["fee"] = ["no"]
                return undefined
            }
            return "€" + Number(p)
        })

        if (output["charge"] && output["timeUnit"]) {
            const duration =
                Number(output["chargeEnd"] ?? "1") - Number(output["chargeStart"] ?? "0")
            const unit = output["timeUnit"][0]
            let durationStr = ""
            if (duration !== 1) {
                durationStr = duration + ""
            }
            output["charge"] = output["charge"].map((c) => c + "/" + (durationStr + unit))
        }
        delete output["chargeEnd"]
        delete output["chargeStart"]
        delete output["timeUnit"]

        asBoolean("covered")
        asBoolean("fee", true)
        asBoolean("publicAccess")

        output["images"]?.forEach((p, i) => {
            if (i === 0) {
                output["image"] = [p]
            } else {
                output["image:" + i] = [p]
            }
        })
        delete output["images"]

        on("access", (audience) => {
            if (
                [
                    "brede publiek",
                    "iedereen",
                    "bezoekers",
                    "iedereen - vooral bezoekers gemeentehuis of bibliotheek."
                ].indexOf(audience.toLowerCase()) >= 0
            ) {
                return "yes"
            }
            if (audience.toLowerCase().startsWith("bezoekers")) {
                return "yes"
            }
            if (["abonnees"].indexOf(audience.toLowerCase()) >= 0) {
                return "members"
            }
            if (audience.indexOf("Blue-locker app") >= 0) {
                return "members"
            }
            if (["buurtbewoners"].indexOf(audience.toLowerCase()) >= 0) {
                return "permissive"
                //   return "members"
            }
            if (
                audience.toLowerCase().startsWith("klanten") ||
                audience.toLowerCase().startsWith("werknemers") ||
                audience.toLowerCase().startsWith("personeel")
            ) {
                return "customers"
            }

            console.warn(
                "Suspicious 'access'-tag:",
                audience,
                "for",
                input["ref:velopark"],
                " assuming yes"
            )
            return "yes"
        })

        if (output["publicAccess"]?.[0] == "no") {
            output["access"] = ["private"]
        }
        delete output["publicAccess"]

        if (
            output["restrictions"]?.[0] ===
            "Geen bromfietsen, noch andere gemotoriseerde voertuigen"
        ) {
            output["motor_vehicle"] = ["no"]
            delete output["restrictions"]
        }

        if (output["cargoBikeType"]) {
            output["cargo_bike"] = ["yes"]
            delete output["cargoBikeType"]
        }
        rename("capacityCargobike", "capacity:cargo_bike")

        if (output["tandemBikeType"]) {
            output["tandem"] = ["yes"]
            delete output["tandemBikeType"]
        }
        rename("capacityTandem", "capacity:tandem")

        if (output["electricBikeType"]) {
            output["electric_bicycle"] = ["yes"]
            delete output["electricBikeType"]
        }
        rename("capacityElectric", "capacity:electric_bicycle")

        delete output["numberOfLevels"]

        return output
    }

    private static async fetchVeloparkProperty<T extends string, G extends T>(
        url: string,
        property: string,
        variable?: string
    ): Promise<SparqlResult<T, G>> {
        const results = await new TypedSparql().typedSparql<T, G>(
            {
                schema: "http://schema.org/",
                mv: "http://schema.mobivoc.org/",
                gr: "http://purl.org/goodrelations/v1#",
                vp: "https://data.velopark.be/openvelopark/vocabulary#",
                vpt: "https://data.velopark.be/openvelopark/terms#"
            },
            [url],
            undefined,
            "  ?parking a <http://schema.mobivoc.org/BicycleParkingStation>",
            "?parking " + property + " " + (variable ?? "")
        )
        console.log("Fetching a velopark property gave", property, results)
        return results
    }

    private static async fetchVeloparkGraphProperty<T extends string>(
        url: string,
        property: string,
        subExpr?: string
    ): Promise<SparqlResult<T, "g">> {
        return await new TypedSparql().typedSparql<T, "g">(
            {
                schema: "http://schema.org/",
                mv: "http://schema.mobivoc.org/",
                gr: "http://purl.org/goodrelations/v1#",
                vp: "https://data.velopark.be/openvelopark/vocabulary#",
                vpt: "https://data.velopark.be/openvelopark/terms#"
            },
            [url],
            "g",
            "  ?parking a <http://schema.mobivoc.org/BicycleParkingStation>",

            S.graph("g", "?section " + property + " " + (subExpr ?? ""), "?section a ?type")
        )
    }

    /**
     * Merges many subresults into one result
     * THis is a workaround for 'optional' not working decently
     * @param r0
     */
    public static mergeResults(
        ...r0: SparqlResult<string, string>[]
    ): SparqlResult<string, string> {
        const r: SparqlResult<string> = { default: {} }
        for (const subResult of r0) {
            if (Object.keys(subResult).length === 0) {
                continue
            }
            for (const sectionKey in subResult) {
                if (!r[sectionKey]) {
                    r[sectionKey] = {}
                }
                const section = subResult[sectionKey]
                for (const key in section) {
                    r[sectionKey][key] ??= section[key]
                }
            }
        }

        if (r["default"] !== undefined && Object.keys(r).length > 1) {
            for (const section in r) {
                if (section === "default") {
                    continue
                }
                for (const k in r.default) {
                    r[section][k] ??= r.default[k]
                }
            }
            delete r.default
        }
        return r
    }

    public static async fetchEntry<T extends string>(
        directUrl: string,
        propertiesWithoutGraph: PropertiesSpec<T>,
        propertiesInGraph: PropertiesSpec<T>,
        extra?: string[]
    ): Promise<SparqlResult<T, string>> {
        const allPartialResults: SparqlResult<T, string>[] = []
        for (const propertyName in propertiesWithoutGraph) {
            const e = propertiesWithoutGraph[propertyName]
            if (typeof e === "string") {
                const variableName = e
                const result = await this.fetchVeloparkProperty(
                    directUrl,
                    propertyName,
                    "?" + variableName
                )
                allPartialResults.push(result)
            } else {
                for (const subProperty in e) {
                    const variableName = e[subProperty]
                    const result = await this.fetchVeloparkProperty(
                        directUrl,
                        propertyName,
                        `[${subProperty} ?${variableName}]    `
                    )
                    allPartialResults.push(result)
                }
            }
        }

        for (const propertyName in propertiesInGraph ?? {}) {
            const e = propertiesInGraph[propertyName]
            if (Array.isArray(e)) {
                for (const subquery of e) {
                    let variableName = subquery
                    if (variableName.match(/[a-zA-Z_]+/)) {
                        variableName = "?" + subquery
                    }
                    const result = await this.fetchVeloparkGraphProperty(
                        directUrl,
                        propertyName,
                        variableName
                    )
                    allPartialResults.push(result)
                }
            } else if (typeof e === "string") {
                let variableName = e
                if (variableName.match(/[a-zA-Z_]+/)) {
                    variableName = "?" + e
                }
                const result = await this.fetchVeloparkGraphProperty(
                    directUrl,
                    propertyName,
                    variableName
                )
                allPartialResults.push(result)
            } else {
                for (const subProperty in e) {
                    const variableName = e[subProperty]
                    const result = await this.fetchVeloparkGraphProperty(
                        directUrl,
                        propertyName,
                        `[${subProperty} ?${variableName}]    `
                    )
                    allPartialResults.push(result)
                }
            }
        }

        for (const e of extra) {
            const r = await this.fetchVeloparkGraphProperty(directUrl, e)
            allPartialResults.push(r)
        }

        return this.mergeResults(...allPartialResults)
    }

    private static veloparkCache: Record<string, Feature[]> = {}

    /**
     * Fetches all data relevant to velopark.
     * The id will be saved as `ref:velopark`
     * @param url
     */
    public static async fetchVeloparkEntry(url: string, includeExtras: boolean = false): Promise<Feature[]> {
        const cacheKey = includeExtras + url
        if (this.veloparkCache[cacheKey]) {
            return this.veloparkCache[cacheKey]
        }
        const withProxyUrl = Constants.linkedDataProxy.replace("{url}", encodeURIComponent(url))
        const optionalPaths: Record<string, string | Record<string, string>> = {
            "schema:interactionService": {
                "schema:url": "website"
            },
            "mv:operatedBy": {
                "gr:legalName": "operator"
            },
            "schema:contactPoint": {
                "schema:email": "email",
                "schema:telephone": "phone"
            },
            "schema:dateModified": "_last_edit_timestamp"
        }
        if (includeExtras) {
            optionalPaths["schema:address"] = {
                "schema:streetAddress": "addr"
            }
            optionalPaths["schema:name"] = "name"
            optionalPaths["schema:description"] = "description"
        }

        const graphOptionalPaths = {
            a: "type",
            "vp:covered": "covered",
            "vp:maximumParkingDuration": "maxstay",
            "mv:totalCapacity": "capacity",
            "schema:publicAccess": "publicAccess",
            "schema:photos": "images",
            "mv:numberOfLevels": "numberOfLevels",
            "vp:intendedAudience": "access",
            "schema:geo": {
                "schema:latitude": "latitude",
                "schema:longitude": "longitude",
                "schema:polygon": "shape"
            },
            "schema:priceSpecification": {
                "mv:freeOfCharge": "fee",
                "schema:price": "charge"
            }
        }

        const extra = [
            "schema:priceSpecification [ mv:dueForTime [ mv:timeStartValue ?chargeStart; mv:timeEndValue ?chargeEnd; mv:timeUnit ?timeUnit ]  ]",
            "vp:allows [vp:bicycleType <https://data.velopark.be/openvelopark/terms#CargoBicycle>; vp:bicyclesAmount ?capacityCargobike; vp:bicycleType ?cargoBikeType]",
            "vp:allows [vp:bicycleType <https://data.velopark.be/openvelopark/terms#ElectricBicycle>; vp:bicyclesAmount ?capacityElectric; vp:bicycleType ?electricBikeType]",
            "vp:allows [vp:bicycleType <https://data.velopark.be/openvelopark/terms#TandemBicycle>; vp:bicyclesAmount ?capacityTandem; vp:bicycleType ?tandemBikeType]"
        ]

        const unpatched = await this.fetchEntry(
            withProxyUrl,
            optionalPaths,
            graphOptionalPaths,
            extra
        )
        const patched: Feature[] = []
        for (const section in unpatched) {
            const p = LinkedDataLoader.patchVeloparkProperties(unpatched[section])
            p["ref:velopark"] = [section]
            patched.push(LinkedDataLoader.asGeojson(p))
        }
        this.veloparkCache[cacheKey] = patched
        return patched
    }
}
