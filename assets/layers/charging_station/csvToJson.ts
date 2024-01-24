import { readFileSync, writeFileSync } from "fs"
import { Utils } from "../../../src/Utils"
import ScriptUtils from "../../../scripts/ScriptUtils"
import { LayerConfigJson } from "../../../src/Models/ThemeConfig/Json/LayerConfigJson"
import FilterConfigJson from "../../../src/Models/ThemeConfig/Json/FilterConfigJson"
import RewritableConfigJson from "../../../src/Models/ThemeConfig/Json/RewritableConfigJson"
import { TagRenderingConfigJson } from "../../../src/Models/ThemeConfig/Json/TagRenderingConfigJson"


function colonSplit(value: string): string[] {
    return value.split(";").map(v => v.replace(/"/g, "").trim()).filter(s => s !== "")
}

function loadCsv(file): {
    key: string,
    id: string,
    image: string,
    description: Map<string, string>,
    countryWhiteList?: string[],
    countryBlackList?: string[],
    commonVoltages?: number[],
    commonCurrents?: number[],
    commonOutputs?: string[],
    associatedVehicleTypes?: string[],
    neverAssociatedWith?: string[],
    extraVisualisationCondition: string
}[] {
    const entries: string[] = Utils.NoNull(readFileSync(file, "utf8").split("\n").map(str => str.trim()))
    const header = entries.shift().split(",")

    return Utils.NoNull(entries.map(entry => {
        const values = entry.split(",").map(str => str.trim())
        if (values[0] === undefined || values[0] === "") {
            return undefined
        }

        const v = {}
        const colonSeperated = ["commonVoltages", "commonOutputs", "commonCurrents", "countryWhiteList", "countryBlackList", "associatedVehicleTypes", "neverAssociatedWith"]
        const descriptionTranslations = new Map<string, string>()
        for (let j = 0; j < header.length; j++) {
            const key = header[j]
            if (key.startsWith("description")) {
                const language = key.substring("description:".length)
                descriptionTranslations.set(language, values[j])
            }

            if (colonSeperated.indexOf(key) >= 0) {
                v[key] = colonSplit(values[j])
            } else {
                v[key] = values[j]
            }
        }
        v["description"] = descriptionTranslations
        if (v["id"] === "") {
            v["id"] = v["key"]
        }
        return <any>v
    }))
}


// SMall script to output the properties of the types.csv as json to add in the tagRenderingGroup. Should be copied manually
function run(file, protojson) {

    const overview_question_answers = []
    const filterOptions: { question: any, osmTags?: string } [] = [
        {
            question: {
                en: "All connectors",
                nl: "Alle types",
            },
        },
    ]

    const entries = loadCsv(file)

    const protoString = readFileSync(protojson, "utf8")
    const proto = <LayerConfigJson>JSON.parse(protoString)

    {
        // Add the entities to the 'rewrite-able part'
        let specificQuestions: RewritableConfigJson<TagRenderingConfigJson> = <any>proto.tagRenderings.find(tr => tr["rewrite"] !== undefined && !(tr["rewrite"]["into"]?.length > 0))
        specificQuestions.rewrite.into = entries.map(e => [
            e.id,
            e.key,
            Utils.MapToObj(e.description, v => v),
            e.image,
            e.commonVoltages,
            e.commonCurrents,
            e.commonOutputs,
        ])
    }

    for (let i = 0; i < entries.length; i++) {
        const e = entries[i]
        const txt = {
            en: e.description.get("en"),
            nl: e.description.get("nl"),
        }
        const json = {
            if: `${e.key}=1`,
            ifnot: `${e.key}=`,
            then: txt,
            icon: {
                path: "./assets/layers/charging_station/" + e.image,
                class: "medium",
            },
        }

        if (e.countryWhiteList.length > 0 && e.countryBlackList.length > 0) {
            throw "Error for type " + e.key + ": don't defined both a whitelist and a blacklist"
        }
        if (e.countryWhiteList.length > 0) {
            // This is a 'hideInAnswer', thus _reverse_ logic!
            const countries = e.countryWhiteList.map(country => "_country!=" + country) //HideInAnswer if it is in the wrong country
            json["hideInAnswer"] = { and: countries } // Should be and, as we want to hide if it does not match any of the countries
        } else if (e.countryBlackList.length > 0) {
            const countries = e.countryBlackList.map(country => "_country=" + country) //HideInAnswer if it is in the wrong country
            json["hideInAnswer"] = { or: countries }
        }

        if (e.associatedVehicleTypes?.length > 0 && e.associatedVehicleTypes.indexOf("*") < 0 && e.neverAssociatedWith?.length > 0) {
            // This plug only occurs if some vehicle specific vehicle type is present.
            // IF all of the needed vehicle types are explicitly NO, then we hide this type as well
            let associatedWith = { and: [].concat(...e.associatedVehicleTypes.map(neededVehicle => [neededVehicle + "=no"])) }

            // We also hide if:
            // - One of the neverAssociatedVehiclesTYpes is set to 'yes' AND none of the associated types are set/yes
            let neverAssociatedIsSet = {
                and: [{
                    or: e.neverAssociatedWith.map(vehicleType => vehicleType + "=yes"),
                },
                    ...e.associatedVehicleTypes.map(associated => associated + "!=yes"),
                ],
            }

            let conditions = [associatedWith, neverAssociatedIsSet]
            if (json["hideInAnswer"] !== undefined) {
                conditions.push(json["hideInAnswer"])
            }
            json["hideInAnswer"] = { or: conditions }

        }


        overview_question_answers.push(json)

        // We add a second time for any amount to trigger a visualisation; but this is not an answer option
        const no_ask_json = {
            if: {
                and: Utils.NoEmpty([`${e.key}~*`, `${e.key}!=1`, ...e.extraVisualisationCondition.split(";")]),
            },
            then: txt,
            hideInAnswer: true,
            icon: {
                path: `./assets/layers/charging_station/${e.image}`,
                class: "medium",
            },
        }
        overview_question_answers.push(no_ask_json)

        const descrWithImage_en = `<div style='display: inline-block'><b>${e.description.get("en")}</b> <img style='width:1rem; display: inline-block' src='./assets/layers/charging_station/${e.image}'/></div>`
        const descrWithImage_nl = `<div style='display: inline-block'><b>${e.description.get("nl")}</b> <img style='width:1rem; display: inline-block' src='./assets/layers/charging_station/${e.image}'/></div>`

        filterOptions.push({
            question: {
                en: `Has a ${descrWithImage_en} connector`,
                nl: `Heeft een ${descrWithImage_nl}`,
            },
            osmTags: `${e.key}~*`,
        })
    }

    const toggles = {
        "id": "Available_charging_stations (generated)",
        "question": {
            "en": "Which charging connections are available here?",
            "nl": "Welke aansluitingen zijn hier beschikbaar?",
        },
        "multiAnswer": true,
        "mappings": overview_question_answers,
    }


    const insertQuestionsAt = proto.tagRenderings.findIndex(tr => tr["id"] === "$$$")
    proto.tagRenderings.splice(insertQuestionsAt, 1, toggles)

    if (typeof proto.filter === "string") {
        throw "Filters of a the protojson should be a list of FilterConfigJsons"
    }
    proto.filter = <FilterConfigJson[]>proto.filter
    proto.tagRenderings.forEach(tr => {
        if (typeof tr === "string") {
            return
        }
        if (tr["rewrite"]) {
            return
        }
        if (tr["id"] === undefined || typeof tr["id"] !== "string") {
            console.error(tr)
            throw "Every tagrendering should have an id, acting as comment"
        }
    })

    proto.filter.push({
        id: "connection_type",
        options: filterOptions,
    })

    const importedUnits = {}
    for (const entry of entries) {
        importedUnits[entry.key + ":voltage"] = "voltage"
        importedUnits[entry.key + ":current"] = "current"
        importedUnits[entry.key + ":output"] = { quantity: "power", "denominations": ["mW", "kW"] }
    }

    const extraUnits = [importedUnits,
    ]

    if (proto["units"] == undefined) {
        proto["units"] = []
    }
    proto["units"].push(...extraUnits)
    writeFileSync("charging_station.json", JSON.stringify(proto, undefined, "  "))
}


// noinspection JSUnusedLocalSymbols
async function queryTagInfo(file, type, clean: ((s: string) => string)) {
    for (const e of loadCsv(file)) {
        const value = await ScriptUtils.TagInfoHistogram(e.key + ":" + type)
        const result = value.data
        const counts = new Map<string, number>()
        for (const r of result) {
            let key = r.value
            key = clean(key)
            key.trim()
            if (key.indexOf("-") >= 0) {
                continue
            }
            if (r.fraction < 0.05) {
                continue
            }
            if (counts.has(key)) {
                counts.set(key, counts.get(key) + r.count)
            } else {
                counts.set(key, r.count)
            }
        }
        const countsArray = Array.from(counts.keys())
        countsArray.sort()
        console.log(`${e.key}:${type} = ${countsArray.join(";")}`)
    }
}

// noinspection JSUnusedLocalSymbols
/**
 * Adds the translations into the 'newConfig' object
 * @param origPath
 * @param newConfig
 */
function mergeTranslations(origPath, newConfig: LayerConfigJson) {
    const oldFile = <LayerConfigJson>JSON.parse(readFileSync(origPath, "utf-8"))
    const newFile = <LayerConfigJson>newConfig
    const renderingsOld = oldFile.tagRenderings
    delete oldFile.tagRenderings
    const newRenderings = newFile.tagRenderings
    Utils.Merge(oldFile, newFile)

    for (const oldRendering of renderingsOld) {

        const oldRenderingName = oldRendering["id"]
        if (oldRenderingName === undefined) {
            continue
        }
        const applicable = newRenderings.filter(r => r["id"] === oldRenderingName)[0]
        if (applicable === undefined) {
            continue
        }
        // @ts-ignore
        Utils.Merge(oldRendering, applicable)
    }
}

try {
    console.log("Generating the charging_station.json file")
    run("types.csv", "charging_station.proto.json")
    /*/
    queryTagInfo("types.csv","voltage", s => s.trim())
    queryTagInfo("types.csv", "current", s => s.trim())
    queryTagInfo("types.csv", "output", s => {
         if(s.endsWith("kW")){
             s = s.substring(0, s.length - 2)
         }
         s = s.trim()
         return s + " kW"
     })
     //*/

} catch (e) {
    console.error(e)
}
