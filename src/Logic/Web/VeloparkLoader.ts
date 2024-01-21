import { Feature, Geometry } from "geojson"
import { OH } from "../../UI/OpeningHours/OpeningHours"
import EmailValidator from "../../UI/InputElement/Validators/EmailValidator"
import PhoneValidator from "../../UI/InputElement/Validators/PhoneValidator"
import { CountryCoder } from "latlon2country"
import Constants from "../../Models/Constants"
import { Utils } from "../../Utils"

/**
 * Commissioned code, to be kept until 2030
 *
 * Reads a velopark-json, converts it to a geojson
 */
export default class VeloparkLoader {
    private static readonly emailReformatting = new EmailValidator()
    private static readonly phoneValidator = new PhoneValidator()

    private static readonly coder = new CountryCoder(
        Constants.countryCoderEndpoint,
        Utils.downloadJson
    )

    public static convert(veloparkData: VeloparkData): Feature {
        console.log("Converting", veloparkData)
        const properties: {
            "ref:velopark": string
            "operator:email"?: string
            "operator:phone"?: string
            fee?: string
            opening_hours?: string
            access?: string
            maxstay?: string
            operator?: string
        } = {
            "ref:velopark": veloparkData["id"] ?? veloparkData["@id"],
        }

        for (const k of ["_id", "url", "dateModified", "name", "address"]) {
            delete veloparkData[k]
        }

        VeloparkLoader.cleanup(veloparkData["properties"])
        VeloparkLoader.cleanupEmtpy(veloparkData)

        properties.operator = veloparkData.operatedBy?.companyName

        if (veloparkData.contactPoint?.email) {
            properties["operator:email"] = VeloparkLoader.emailReformatting.reformat(
                veloparkData.contactPoint?.email
            )
        }

        if (veloparkData.contactPoint?.telephone) {
            properties["operator:phone"] = VeloparkLoader.phoneValidator.reformat(
                veloparkData.contactPoint?.telephone,
                () => "be"
            )
        }

        veloparkData.photos?.forEach((p, i) => {
            if (i === 0) {
                properties["image"] = p.image
            } else {
                properties["image:" + i] = p.image
            }
        })

        let geometry = veloparkData.geometry
        for (const g of veloparkData["@graph"]) {
            VeloparkLoader.cleanup(g)
            VeloparkLoader.cleanupEmtpy(g)
            if (g.geo[0]) {
                geometry = { type: "Point", coordinates: [g.geo[0].longitude, g.geo[0].latitude] }
            }
            if (
                g.maximumParkingDuration?.endsWith("D") &&
                g.maximumParkingDuration?.startsWith("P")
            ) {
                const duration = g.maximumParkingDuration.substring(
                    1,
                    g.maximumParkingDuration.length - 1
                )
                properties.maxstay = duration + " days"
            }
            properties.access = g.publicAccess ?? "yes" ? "yes" : "no"
            const prefix = "http://schema.org/"
            if (g.openingHoursSpecification) {
                const oh = OH.simplify(
                    g.openingHoursSpecification
                        .map((spec) => {
                            const dayOfWeek = spec.dayOfWeek
                                .substring(prefix.length, prefix.length + 2)
                                .toLowerCase()
                            const startHour = spec.opens
                            const endHour = spec.closes === "23:59" ? "24:00" : spec.closes
                            const merged = OH.MergeTimes(
                                OH.ParseRule(dayOfWeek + " " + startHour + "-" + endHour)
                            )
                            return OH.ToString(merged)
                        })
                        .join("; ")
                )
                properties.opening_hours = oh
            }
            if (g.priceSpecification?.[0]) {
                properties.fee = g.priceSpecification[0].freeOfCharge ? "no" : "yes"
            }
            const types = {
                "https://data.velopark.be/openvelopark/terms#RegularBicycle": "_",
                "https://data.velopark.be/openvelopark/terms#ElectricBicycle":
                    "capacity:electric_bicycle",
                "https://data.velopark.be/openvelopark/terms#CargoBicycle": "capacity:cargo_bike",
            }
            let totalCapacity = 0
            for (let i = (g.allows ?? []).length - 1; i >= 0; i--) {
                const capacity = g.allows[i]
                const type: string = capacity["@type"]
                if (type === undefined) {
                    console.warn("No type found for", capacity.bicycleType)
                    continue
                }
                const count = capacity["amount"]
                if (!isNaN(count)) {
                    totalCapacity += Number(count)
                } else {
                    console.warn("Not a valid number while loading velopark data:", count)
                }
                if (type !== "_") {
                    //  properties[type] = count
                }
                g.allows.splice(i, 1)
            }
            if (totalCapacity > 0) {
                properties["capacity"] = totalCapacity
            }
        }

        console.log(JSON.stringify(properties, null, "  "))

        return { type: "Feature", properties, geometry }
    }

    private static cleanup(data: any) {
        if (!data?.attributes) {
            return
        }
        for (const k of ["NIS_CODE", "name_NL", "name_DE", "name_EN", "name_FR"]) {
            delete data.attributes[k]
        }
        VeloparkLoader.cleanupEmtpy(data)
    }

    private static cleanupEmtpy(data: any) {
        for (const key in data) {
            if (data[key] === null) {
                delete data[key]
                continue
            }
            if (Object.keys(data[key]).length === 0) {
                delete data[key]
            }
        }
    }
}

export interface VeloparkData {
    geometry?: Geometry
    "@context": any
    "@id": string // "https://data.velopark.be/data/NMBS_541",
    "@type": "BicycleParkingStation"
    dateModified: string
    identifier: number
    name: [
        {
            "@value": string
            "@language": "nl"
        }
    ]
    ownedBy: {
        "@id": string
        "@type": "BusinessEntity"
        companyName: string
    }
    operatedBy: {
        "@type": "BusinessEntity"
        companyName: string
    }
    address: any
    hasMap: any
    contactPoint: {
        "@type": "ContactPoint"
        email: string
        telephone: string
    }
    photos: {
        "@type": "Photograph"
        image: string
    }[]
    interactionService: {
        "@type": "WebSite"
        url: string
    }
    /**
     * Contains various extra pieces of data, e.g. services or opening hours
     */
    "@graph": [
        {
            "@type": "https://data.velopark.be/openvelopark/terms#PublicBicycleParking"
            openingHoursSpecification: {
                "@type": "OpeningHoursSpecification"
                /**
                 * Ends with 'Monday', 'Tuesday', ...
                 */
                dayOfWeek:
                    | "http://schema.org/Monday"
                    | "http://schema.org/Tuesday"
                    | "http://schema.org/Wednesday"
                    | "http://schema.org/Thursday"
                    | "http://schema.org/Friday"
                    | "http://schema.org/Saturday"
                    | "http://schema.org/Sunday"
                /**
                 * opens: 00:00 and closes 23:59 for the entire day
                 */
                opens: string
                closes: string
            }[]
            /**
             * P30D = 30 days
             */
            maximumParkingDuration: "P30D"
            publicAccess: true
            totalCapacity: 110
            allows: [
                {
                    "@type": "AllowedBicycle"
                    /* TODO is cargo bikes etc also available?*/
                    bicycleType:
                        | string
                        | "https://data.velopark.be/openvelopark/terms#RegularBicycle"
                    bicyclesAmount: number
                }
            ]
            geo: [
                {
                    "@type": "GeoCoordinates"
                    latitude: number
                    longitude: number
                }
            ]
            priceSpecification: [
                {
                    "@type": "PriceSpecification"
                    freeOfCharge: boolean
                }
            ]
        }
    ]
}
