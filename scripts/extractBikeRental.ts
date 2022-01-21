import * as fs from "fs";
import {OH} from "../UI/OpeningHours/OpeningHours";


function extractValue(vs: { __value }[]) {
    if(vs === undefined){
        return undefined
    }
    for (const v of vs) {
        if ((v.__value ?? "") === "") {
            continue
        }
        return v.__value;
    }
    return undefined
}


function extract_oh_block (days) : string{
    const oh = []
    for (const day of days.day) {
        const abbr = day.name.substr(0,2)
        const block = day.time_block[0]
        const from = block.time_from.substr(0,5)
        const to = block.time_until.substr(0,5)
        const by_appointment = block.by_appointment ? " \"by appointment\"" : ""
        oh.push(`${abbr} ${from}-${to}${by_appointment}`)
    }
    return oh.join("; ")
}
function extract_oh(opening_periods){
    const rules = []
    if(opening_periods === undefined){
        return undefined;
    }
    for (const openingPeriod of opening_periods.opening_period ?? []) {
        let rule = extract_oh_block(openingPeriod.days)
        if(openingPeriod.name.toLowerCase().indexOf("schoolvakantie") >= 0){
            rule = "SH "+rule
        }
        rules.push(rule)
    }
    return OH.simplify( rules.join(";"))
}
    
function rewrite(obj, key) {
    if (obj[key] === undefined) {
        return
    }
    obj[key] = extractValue(obj[key]["value"])
}

const stuff = fs.readFileSync("/home/pietervdvn/Documents/Freelance/ToerismeVlaanderen 2021-09/TeImporteren/allchannels-bike_rental.json", "UTF8")
const data: any[] = JSON.parse(stuff)

const results: {
    geometry: {
        type: "Point",
        coordinates: [number, number]
    },
    type: "Feature",
    properties: any

}[] = []
const skipped = []
console.log("[")
for (const item of data) {
    const metadata = item["metadata"]

    if (metadata.name === "Jommekeroute") {
        continue
    }

    const addr = item.location_info?.address
    if (addr === undefined) {
        skipped.push(item)
        continue
    }
    const toDelete = ["id", "uuid", "update_date", "creation_date",
        "deleted",
        "aborted",
        "partner_id",
        "business_product_id",
        "winref",
        "winref_uuid",
        "root_product_type",
        "parent"
    ]
    for (const key of toDelete) {
        delete metadata[key]
    }

    delete item["meeting_rooms_count"]
    delete item["facilities"]

    item.properties = metadata
    delete item["metadata"]

    const metadata_values = ["touristic_product_type", "root_product_type"]
    for (const key of metadata_values) {
        rewrite(metadata, key)
    }

    rewrite(item.contact_info, "commercial_name")

    const gl = addr.geolocation
    item.coordinates = [gl.lon, gl.lat]
    metadata["addr:street"] = addr.street
    metadata["addr:housenumber"] = addr.number
    metadata["phone"] = item.contact_info["telephone"] ?? item.contact_info["mobile"]
    metadata["email"] = item.contact_info["email_address"]
    
    const links = item.links?.link?.map(l => l.url) ?? []
    metadata["website"] = item.contact_info["website"] ?? links[0]

    delete item["links"]
    
    delete item.location_info
    delete item.contact_info
    delete item.promotional_info

    if (metadata["touristic_product_type"] === "Fietsverhuur") {
        metadata["amenity"] = "bicycle_rental"
        delete metadata["touristic_product_type"]
    } else {
        console.error("Unkown product type: ", metadata["touristic_product_type"])
    }

    const descriptions = item.descriptions?.description?.map(d => extractValue(d?.text?.value)) ?? []
    delete item.descriptions
    metadata["description"] = metadata["description"] ?? descriptions[0]
    if (item.price_info?.prices?.free == true) {
        metadata.fee = "no"
        delete item.price_info
    } else if (item.price_info?.prices?.free == false) {
        metadata.fee = "yes"
        metadata.charge = extractValue(item.price_info?.extra_information?.value)
        const methods = item.price_info?.payment_methods?.payment_method
        if(methods !== undefined){
            methods.map(v => extractValue(v.value)).forEach(method => {
                metadata["payment:" + method.toLowerCase()] = "yes"
            })
        }
        delete item.price_info
    }else if(item.price_info?.prices?.length === 0){
        delete item.price_info
    }
    
   
    try{
        
    if(item.labels_info?.labels_own?.label[0]?.code === "Billenkar"){
        metadata.rental = "quadricycle"
        delete item.labels_info
    }
    }catch(e){
        
    }
    delete item["publishing_channels"]


    try {
        metadata["image"] = item.media.file[0].url[0]
    } catch (e) {
        // No image!
    }
    delete item.media

 

    const time_info = item.time_info?.time_info_regular
    if(time_info?.permantly_open === true){
        metadata.opening_hours = "24/7"
    }else{
        metadata.opening_hours = extract_oh(time_info?.opening_periods)
    }
    delete item.time_info



    const properties = {}
    for (const key in metadata) {
        const v = metadata[key]
        if(v === null || v === undefined || v === ""){
            delete metadata[key]
            continue
        }
        properties[key] = v
    }
    results.push({
        geometry: {
            type: "Point",
            coordinates: item.coordinates
        },
        type: "Feature",
        properties
    })

    delete item.coordinates
    delete item.properties
    console.log(JSON.stringify(item, null, "  ") + ",")

}
console.log("]")
fs.writeFileSync("west-vlaanderen.geojson", JSON.stringify(
    {
        type: "FeatureCollection",
        features: results
    }
    , null, "  "
))