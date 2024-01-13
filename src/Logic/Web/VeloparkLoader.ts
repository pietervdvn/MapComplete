import { Feature, Point } from "geojson"
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

    public static convert(veloparkData: VeloparkData): Feature<Point> {

        const properties: {
            "operator:email"?: string,
            "operator:phone"?: string,
            fee?: string,
            opening_hours?: string
            access?: string
            maxstay?: string
            operator?: string
        } = {}

        properties.operator = veloparkData.operatedBy?.companyName

        if (veloparkData.contactPoint?.email) {
            properties["operator:email"] = VeloparkLoader.emailReformatting.reformat(veloparkData.contactPoint?.email)
        }


        if (veloparkData.contactPoint?.telephone) {
            properties["operator:phone"] = VeloparkLoader.phoneValidator.reformat(veloparkData.contactPoint?.telephone, () => "be")
        }

        veloparkData.photos.forEach((p, i) => {
            if (i === 0) {
                properties["image"] = p.image
            } else {
                properties["image:" + i] = p.image

            }
        })

        let coordinates: [number, number] = undefined
        for (const g of veloparkData["@graph"]) {
            coordinates = [g.geo[0].longitude, g.geo[0].latitude]
            if (g.maximumParkingDuration?.endsWith("D") && g.maximumParkingDuration?.startsWith("P")) {
                const duration = g.maximumParkingDuration.substring(1, g.maximumParkingDuration.length - 1)
                properties.maxstay = duration + " days"
            }
            properties.access = g.publicAccess ? "yes" : "no"
            const prefix = "http://schema.org/"
            const oh = OH.simplify(g.openingHoursSpecification.map(spec => {
                const dayOfWeek = spec.dayOfWeek.substring(prefix.length, prefix.length + 2).toLowerCase()
                const startHour = spec.opens
                const endHour = spec.closes === "23:59" ? "24:00" : spec.closes
                const merged = OH.MergeTimes(OH.ParseRule(dayOfWeek + " " + startHour + "-" + endHour))
                return OH.ToString(merged)
            }).join("; "))
            properties.opening_hours = oh

            if (g.priceSpecification[0]) {
                properties.fee = g.priceSpecification[0].freeOfCharge ? "no" : "yes"
            }
        }


        return { type: "Feature", properties, geometry: { type: "Point", coordinates } }
    }

}

interface VeloparkData {
    "@context": any,
    "@id": string // "https://data.velopark.be/data/NMBS_541",
    "@type": "BicycleParkingStation",
    "dateModified": string,
    "identifier": number,
    "name": [
        {
            "@value": string,
            "@language": "nl"
        }
    ],
    "ownedBy": {
        "@id": string,
        "@type": "BusinessEntity",
        "companyName": string
    },
    "operatedBy": {
        "@type": "BusinessEntity",
        "companyName": string
    },
    "address": any,
    "hasMap": any,
    "contactPoint": {
        "@type": "ContactPoint",
        "email": string,
        "telephone": string
    },
    "photos": {
        "@type": "Photograph",
        "image": string
    }[],
    "interactionService": {
        "@type": "WebSite",
        "url": string
    },
    /**
     * Contains various extra pieces of data, e.g. services or opening hours
     */
    "@graph": [
        {
            "@type": "https://data.velopark.be/openvelopark/terms#PublicBicycleParking",
            "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                /**
                 * Ends with 'Monday', 'Tuesday', ...
                 */
                "dayOfWeek": "http://schema.org/Monday"
                    | "http://schema.org/Tuesday"
                    | "http://schema.org/Wednesday"
                    | "http://schema.org/Thursday"
                    | "http://schema.org/Friday"
                    | "http://schema.org/Saturday"
                    | "http://schema.org/Sunday",
                /**
                 * opens: 00:00 and closes 23:59 for the entire day
                 */
                "opens": string,
                "closes": string
            }[],
            /**
             * P30D = 30 days
             */
            "maximumParkingDuration": "P30D",
            "publicAccess": true,
            "totalCapacity": 110,
            "allows": [
                {
                    "@type": "AllowedBicycle",
                    /* TODO is cargo bikes etc also available?*/
                    "bicycleType": "https://data.velopark.be/openvelopark/terms#RegularBicycle",
                    "bicyclesAmount": number
                }
            ],
            "geo": [
                {
                    "@type": "GeoCoordinates",
                    "latitude": number,
                    "longitude": number
                }
            ],
            "priceSpecification": [
                {
                    "@type": "PriceSpecification",
                    "freeOfCharge": boolean
                }
            ]
        }
    ]

}
