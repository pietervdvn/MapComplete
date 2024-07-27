import Script from "../Script"
import { writeFileSync } from "fs"
import { Feature, Geometry } from "geojson"
import { OsmObject } from "../../src/Logic/Osm/OsmObject"
import OsmObjectDownloader from "../../src/Logic/Osm/OsmObjectDownloader"
import { Changes } from "../../src/Logic/Osm/Changes"
import { ImmutableStore } from "../../src/Logic/UIEventSource"
import { OsmConnection } from "../../src/Logic/Osm/OsmConnection"
import ChangeTagAction from "../../src/Logic/Osm/Actions/ChangeTagAction"
import { Tag } from "../../src/Logic/Tags/Tag"
import { ChangeDescription } from "../../src/Logic/Osm/Actions/ChangeDescription"
import { GeoOperations } from "../../src/Logic/GeoOperations"
import { Overpass } from "../../src/Logic/Osm/Overpass"
import { TagUtils } from "../../src/Logic/Tags/TagUtils"
import { BBox } from "../../src/Logic/BBox"

export default class CleanRepair extends Script {

    constructor() {
        super("Cleans 'repair'-tags for mass retagging")
    }


    async main(args: string[]) {
        const path = args[0]
        console.log("Loading", path)
        const criteria = TagUtils.Tag({
            and: [
                "repair~*",
                "repair!=no",
                "repair!=yes",
                "repair!=brand",
                "repair!=only",
                "repair!=only_sold",
                "repair!=assisted_self_service"
            ]
        })
        const overpass = new Overpass(criteria, [],
            "https://overpass-api.de/api/interpreter"
        )
        const data: Feature<Geometry, Record<string, string>> [] = (await overpass.queryGeoJson(BBox.global))[0].features
        console.log("Got", data.length, "features; sample", data[0])
        const changes = new Changes({
            dryRun: new ImmutableStore(true),
            osmConnection: new OsmConnection({
                dryRun: new ImmutableStore(true)
            })
        })

        const metakeys = ["id", "version", "changeset", "user", "uid", "timestamp"]

        const replace = {
            "phone": "mobile_phone",
            "phones": "mobile_phone",
            "mobile": "mobile_phone",
            "cellphone": "mobile_phone",
            "pc": "computers",
            "mobile_phones": "mobile_phone",
            "mobilephones": "mobile_phone",
            "mobilephone": "mobile_phone",
            "clocks": "clock",
            "elektronik": "electronics",
            "tires": "tyres",
            "welcome": "yes",
            "tyre": "tyres",
            "electronic_products": "electronics",
            "shoe": "shoes",
            "pc_repairs": "computer",
            "computers": "computer",
            "body_construction": "body_work",
            "body": "body_work",

            "body_repairer": "body_work",
            "instruments": "musical_instrument",
            "service": "yes",
            "punture": "tyres",
            "electricity": "electronics",
            "self_service": "assisted_self_repair",
            "paint": "bodywork",
            "paint shop": "bodywork",
            "paint_shop": "bodywork",
            "lawnmower": "lawn_mower",
            "aircon": "air_conditioning",
            "*": "yes",
            "ammeublement": "furniture",
            "all": "yes",
            "appliances": "appliance",
            "electronic": "electronics", "escooter": "electric_scooter",
            "aviation maintenance, repair, and_overhaul": "airplane",
            "aviation_maintenance": "airplanes",
            "bags": "bag",
            "boats": "boat",
            "boilers": "boiler",
            "breaks": "brakes",
            "car": "cars",
            "tv": "television",
            "clothing": "clothes",
            "coat_of_lacquer": "body_work",
            "cycle": "bicycle",
            "cars": "car",
            "blacharstwo": "tin", "lakiernictwo": "body_work",
            "tire": "tyres", "powder_coating": "body_work",
            "leather_products": "leather",
            "motocycle": "motorcycle",
            "motor": "motorcycle", "motoo": "motorcycle",
            "motorbike": "motorcycle", "motorcycle_repair": "motorcycle", "motorsports": "motorcycle",
            "printers": "printer",
            "tyres24": "tyres",
            "paintings": "painting",
            "paintwork": "body_work",
            "pumps": "pump",
            "shoes:yes": "shoes",
            "wheel": "tyres",
            "wheels": "tyres",
            "vacuum": "vacuum_cleaner",
            "glass": "car_glassj"
        }

        const brands = ["garage", "audi", "renault", "apple", "honda", "ducati", "ford", "mazda","garage_renault_aie"]

        const valid = ["train", "tv", "jewelry", "scooter", ...Object.values(replace), "watch", "oldtimer", "car", "bicycle", "boat", "windbreaker",
            "agricultural", "alternator", "antiques", "atv", "auto",
            "aviation maintenance", "bag", "bags",
            "battery", "bicyle", "borehole", "building",
            "camera", "car_glass", "caravan",
            "carpenter", "coffee_machine", "construction machinery", "cycle",
            "dentures", "ducati", "electric motor",
            "electric_bike", "electric_scooter", "espresso_machines", "exhaust",
            "fire_extinguishers", "fountain_pen", "fridge",
            "garden_machinery", "gas appliances", "generator",
            "glasses", "golfcart", "guitar",
            "hammock", "hardware", "heating pumps",
            "hifi", "hvac", "installation", "jewellery", "keys", "kick_scooter",
            "kitesurfing", "tools", "toys", "tractor",
            "trailer", "transformer", "truck",
            "typewriter", "sail", "sewing_machine", "ship", "picture", "pillow", "plastic",
            "cash_register", "cnc", "laptop",
            "laundry_machines",
            "photo_camera", "photocopier", "piano",
            "power_tools", "pressure_gauges", "printer",
            , "snowboard", "snowmobile", "starter", "machines", "mainframe",
            "outboard_motor",
            "video", "washing_machine", "ski", "radiator",
            "radio", "refrigerator",
            "rv", "ski", "window", "zipper", "weighing_scale",
            "small_electric_vehicle"

        ].map(s => s.replace(/ /g, "_"))


        const skip = ["yes", "no", "only", "brand", "assisted_self_repair", "only_sold"]
        const dloader = new OsmObjectDownloader()
        const rm = ["50243147100015", "81342677200048", "and overhaul", "repair", "unset", "сервисный_центр", "taller_de_michu", "quitandinha_g_&_a", "mechanika"].map(v => v.replace(/ /g, "_"))
        const objects: OsmObject[] = []
        const changesToMake: ChangeDescription [] = []
        const first = GeoOperations.centerpointCoordinates(data[0])
        for (const f of data) {
            if (GeoOperations.distanceBetween(first, GeoOperations.centerpointCoordinates(f)) > 2500000) {
                continue
            }
            let keyRaw = f.properties.repair
            keyRaw = replace[keyRaw] ?? keyRaw
            if (brands.some(br => keyRaw.toLowerCase().indexOf(br.trim()) >= 0)) {
                f.properties.repair = "brand"
            } if(skip.indexOf(keyRaw) >= 0){
                f.properties.repair = keyRaw
            } else {

                const r = keyRaw.replace(/\/|,/g, ";").split(";").map(k => k.trim().replace(/ /g, "_").toLowerCase())
                for (let key of r) {
                    key = replace[key] ?? key

                    if (rm.indexOf(key) >= 0) {
                        delete f.properties.repair
                        continue
                    }

                    f.properties[key + ":repair"] = "yes"
                    delete f.properties.repair

                }

            }
            if (f.properties.service === "repair") {
                delete f.properties.service
                f.properties.repair = "yes"
            }
            const id = f.properties["id"]
            const osm = await dloader.DownloadObjectAsync(id)
            if (osm === "deleted") {
                continue
            }
            objects.push(osm)
            for (const key in f.properties) {
                if (metakeys.indexOf(key) >= 0) {
                    continue
                }
                const value = f.properties[key]
                const ct = await new ChangeTagAction(id, new Tag(key, value), f.properties, {
                    changeType: "fix",
                    theme: "script"
                }).CreateChangeDescriptions()
                changesToMake.push(...ct)
                console.log(ct.map(cd => cd.tags))
                if (f.properties.repair === undefined) {
                    const ct = await new ChangeTagAction(id, new Tag("repair", ""), f.properties, {
                        changeType: "fix",
                        theme: "script"
                    }).CreateChangeDescriptions()
                    changesToMake.push(...ct)
                }
            }
        }

        const
            changedObjects = changes.CreateChangesetObjects(changesToMake, objects)

        const
            osc = Changes.createChangesetFor("", changedObjects)

        writeFileSync(
            "Cleanup.osc"
            ,
            osc
            ,
            "utf8"
        )

    }
}

new CleanRepair().run()
