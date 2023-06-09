import fs from "fs"
import {OH} from "../../UI/OpeningHours/OpeningHours";

const cashpunten = JSON.parse(fs.readFileSync("/home/pietervdvn/Downloads/cash_punten.json", "utf8")).data

const features: any[] = []
const weekdays = [
    "MO",
    "TU",
    "WE",
    "TH",
    "FR",
    "SA",
    "SU"
]
for (const atm of cashpunten) {
    const properties = {
        "amenity": "atm",
        "addr:street": atm.adr_street,
        "addr:housenumber": atm.adr_street_number,
        "phone": <string>atm.phone_number,
        "operator": "Batopin",
        network: "CASH",
        fee: "no",
        "speech_output": "yes",
        "brand": "CASH",
        website: "https://batopin.be",
        "source": "https://batopin.be",
        "brand:wikidata": "Q112875867",
        "operator:wikidata": "Q97142699",
        "currency:EUR": "yes"
    }
    features.push({
        geometry: {type: "Point", coordinates: [atm.adr_longitude, atm.adr_latitude]},
        properties: {
            tags: properties
        }
    })

    switch (atm.accessibility) {
        case "Green":
            properties["wheelchair"] = "yes";
            break;
        case "Orange":
            properties["wheelchair"] = "limited";
            break;
        case "Red":
            properties["wheelchair"] = "no";
            break;
        default:
            break;
    }
    delete atm.accessibility

    if (atm.deposit_cash) {
        properties["cash_in"] = atm.deposit_cash === "1" ? "yes" : "no"
        delete atm.deposit_cash
    }

    if (!weekdays.some(wd => atm.regular_hours[wd] !== "00:00-00:00")) {
        properties["opening_hours"] = "24/7"
        delete atm.regular_hours
    } else {
        const rules = weekdays.filter(wd => atm.regular_hours[wd] !== undefined).map(wd => wd[0] + wd.toLowerCase()[1] + " " + atm.regular_hours[wd]).join(";")
        properties["opening_hours"] = OH.ToString(OH.MergeTimes(OH.Parse(rules)))
        delete atm.regular_hours
    }

    delete atm.special_hours // Only one data point has this


    delete atm.location_language
    delete atm.location_name
    delete atm.shop_code
    delete atm.id
    delete atm.adr_longitude
    delete atm.adr_latitude
    delete atm.adr_street_number
    delete atm.adr_street
    delete atm.adr_zipcode
    delete atm.adr_city
    delete atm.adr_country
    delete atm.phone_number
    if (Object.keys(atm).length == 0) {
        continue
    }
    console.log(atm, properties)
    break
}


fs.writeFileSync("atms.geojson", JSON.stringify({type: "FeatureCollection", features}))
