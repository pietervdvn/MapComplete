import {readFileSync, writeFileSync} from "fs";
import {Utils} from "../../../Utils";
import ScriptUtils from "../../../scripts/ScriptUtils";
import {LayerConfigJson} from "../../../Models/ThemeConfig/Json/LayerConfigJson";
import FilterConfigJson from "../../../Models/ThemeConfig/Json/FilterConfigJson";
import {QuestionableTagRenderingConfigJson} from "../../../Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson";


function colonSplit(value: string): string[] {
    return value.split(";").map(v => v.replace(/"/g, '').trim()).filter(s => s !== "");
}

function loadCsv(file): {
    key: string,
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
            return undefined;
        }

        const v = {}
        const colonSeperated = ["commonVoltages", "commonOutputs", "commonCurrents", "countryWhiteList", "countryBlackList", "associatedVehicleTypes", "neverAssociatedWith"]
        const descriptionTranslations = new Map<string, string>()
        for (let j = 0; j < header.length; j++) {
            const key = header[j];
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
        return <any>v;
    }))
}

// SMall script to output the properties of the types.csv as json to add in the tagRenderingGroup. Should be copied manually
function run(file, protojson) {

    const overview_question_answers = []
    const questions: (QuestionableTagRenderingConfigJson & { "id": string })[] = []
    const technicalQuestions: (QuestionableTagRenderingConfigJson & { "id": string })[] = []
    const filterOptions: { question: any, osmTags?: string } [] = [
        {
            question: {
                en: "All connectors",
                nl: "Alle types"
            }
        }
    ]

    const entries = loadCsv(file)
    for (let i = 0; i < entries.length; i++) {
        const e = entries[i];
        const txt = {
            en: e.description.get("en"),
            nl: e.description.get("nl")
        }
        const json = {
            if: `${e.key}=1`,
            ifnot: `${e.key}=`,
            then: txt,
            icon:{
                path:"./assets/layers/charging_station/" + e.image,
                class:"medium"
            }
        }

        if (e.countryWhiteList.length > 0 && e.countryBlackList.length > 0) {
            throw "Error for type " + e.key + ": don't defined both a whitelist and a blacklist"
        }
        if (e.countryWhiteList.length > 0) {
            // This is a 'hideInAnswer', thus _reverse_ logic!
            const countries = e.countryWhiteList.map(country => "_country!=" + country) //HideInAnswer if it is in the wrong country
            json["hideInAnswer"] = {or: countries}
        } else if (e.countryBlackList.length > 0) {
            const countries = e.countryBlackList.map(country => "_country=" + country) //HideInAnswer if it is in the wrong country
            json["hideInAnswer"] = {or: countries}
        }

        if (e.associatedVehicleTypes?.length > 0 && e.associatedVehicleTypes.indexOf("*") < 0 && e.neverAssociatedWith?.length > 0) {
            // This plug only occurs if some vehicle specific vehicle type is present.
            // IF all of the needed vehicle types are explicitly NO, then we hide this type as well
            let associatedWith = {and: [].concat(...e.associatedVehicleTypes.map(neededVehicle => [neededVehicle + "=no"]))}

            // We also hide if:
            // - One of the neverAssociatedVehiclesTYpes is set to 'yes' AND none of the associated types are set/yes
            let neverAssociatedIsSet = {
                and: [{
                    or: e.neverAssociatedWith.map(vehicleType => vehicleType + "=yes")
                },
                    ...e.associatedVehicleTypes.map(associated => associated + "!=yes")
                ]
            }

            let conditions = [associatedWith, neverAssociatedIsSet]
            if (json["hideInAnswer"] !== undefined) {
                conditions.push(json["hideInAnswer"])
            }
            json["hideInAnswer"] = {or: conditions}

        }


        overview_question_answers.push(json)

        // We add a second time for any amount to trigger a visualisation; but this is not an answer option
        const no_ask_json = {
            if: {
                and:Utils.NoEmpty( [`${e.key}~*`, `${e.key}!=1`, ...e.extraVisualisationCondition.split(";")])
            },
            then: txt,
            hideInAnswer: true,
            icon:{
                path: `./assets/layers/charging_station/${e.image}`,
                class:"medium"
            }
        }
        overview_question_answers.push(no_ask_json)

        const descrWithImage_en = `<div style='display: inline-block'><b>${e.description.get("en")}</b> <img style='width:1rem; display: inline-block' src='./assets/layers/charging_station/${e.image}'/></div>`
        const descrWithImage_nl = `<div style='display: inline-block'><b>${e.description.get("nl")}</b> <img style='width:1rem; display: inline-block' src='./assets/layers/charging_station/${e.image}'/></div>`

        questions.push({
            "id": "plugs-" + i,
            question: {
                en: `How much plugs of type ${descrWithImage_en} are available here?`,
                nl: `Hoeveel stekkers van type  ${descrWithImage_nl} heeft dit oplaadpunt?`,
            },
            render: {
                en: `There are <b class='text-xl'>{${e.key}}</b> plugs of type ${descrWithImage_en} available here`,
                nl: `Hier zijn <b class='text-xl'>{${e.key}}</b> stekkers van het type ${descrWithImage_nl}`
            },
            freeform: {
                key: e.key,
                type: "pnat"
            },
            condition: {
                and: [`${e.key}~*`, `${e.key}!=0`]
            }
        })

        technicalQuestions.push({
            "id": "voltage-" + i,
            labels: ["technical"],
            question: {
                en: `What voltage do the plugs with ${descrWithImage_en} offer?`,
                nl: `Welke spanning levert de stekker van type ${descrWithImage_nl}`
            },
            render: {
                en: `${descrWithImage_en} outputs {${e.key}:voltage} volt`,
                nl: `${descrWithImage_nl} heeft een spanning van {${e.key}:voltage} volt`
            },
            freeform: {
                key: `${e.key}:voltage`,
                type: "pfloat"
            },
            mappings: e.commonVoltages.map(voltage => {
                return {
                    if: `${e.key}:voltage=${voltage} V`,
                    then: {
                        en: `${e.description.get("en")} outputs ${voltage} volt`,
                        nl: `${e.description.get("nl")} heeft een spanning van ${voltage} volt`
                    },
                    icon: {
                        path: `./assets/layers/charging_station/${e.image}`,
                        class:"medium"
                    }
                }
            }),
            condition: {
                and: [`${e.key}~*`, `${e.key}!=0`]
            }
        })


        technicalQuestions.push({
            "id": "current-" + i,
            labels:["technical"],
            question: {
                en: `What current do the plugs with ${descrWithImage_en} offer?`,
                nl: `Welke stroom levert de stekker van type ${descrWithImage_nl}?`,
            },
            render: {
                en: `${descrWithImage_en} outputs at most {${e.key}:current}A`,
                nl: `${descrWithImage_nl} levert een stroom van maximaal {${e.key}:current}A`
            },
            freeform: {
                key: `${e.key}:current`,
                type: "pfloat"
            },
            mappings: e.commonCurrents.map(current => {
                return {
                    if: `${e.key}:current=${current} A`,
                    then: {
                        en: `${e.description.get("en")} outputs at most ${current} A`,
                        nl: `${e.description.get("nl")} levert een stroom van maximaal ${current} A`
                    },
                    icon: {
                        path: `./assets/layers/charging_station/${e.image}`,
                        class:"medium"
                    }
                }
            }),
            condition: {
                and: [`${e.key}~*`, `${e.key}!=0`]
            }
        })


        technicalQuestions.push({
            "id": "power-output-" + i,
            labels:["technical"],
            question: {
                en: `What power output does a single plug of type ${descrWithImage_en} offer?`,
                nl: `Welk vermogen levert een enkele stekker van type ${descrWithImage_nl}?`,
            },
            render: {
                en: `${descrWithImage_en} outputs at most {${e.key}:output}`,
                nl: `${descrWithImage_nl} levert een vermogen van maximaal {${e.key}:output}`
            },
            freeform: {
                key: `${e.key}:output`,
                type: "pfloat"
            },
            mappings: e.commonOutputs.map(output => {
                return {
                    if: `${e.key}:output=${output}`,
                    then: {
                        en: `${e.description.get("en")} outputs at most ${output} A`,
                        nl: `${e.description.get("nl")} levert een vermogen van maximaal ${output} A`
                    },
                    icon: {
                        path: `./assets/layers/charging_station/${e.image}`,
                        class:"medium"
                    }
                }
            }),
            condition: {
                and: [`${e.key}~*`, `${e.key}!=0`]
            }
        })

        filterOptions.push({
            question: {
                en: `Has a ${descrWithImage_en} connector`,
                nl: `Heeft een ${descrWithImage_nl}`
            },
            osmTags: `${e.key}~*`
        })
    }

    const toggles = {
        "id": "Available_charging_stations (generated)",
        "question": {
            "en": "Which charging connections are available here?",
            "nl": "Welke aansluitingen zijn hier beschikbaar?"
        },
        "multiAnswer": true,
        "mappings": overview_question_answers
    }
    questions.unshift(toggles)
    questions.push(...technicalQuestions)

    const stringified = questions.map(q => JSON.stringify(q, null, "  "))
    let protoString = readFileSync(protojson, "utf8")

    protoString = protoString.replace(/{[ \t\n]*"id"[ \t\n]*:[ \t\n]*"\$\$\$"[ \t\n]*}/, stringified.join(",\n"))
    const proto = <LayerConfigJson>JSON.parse(protoString)
    if(typeof proto.filter === "string"){
        throw "Filters of a the protojson should be a list of FilterConfigJsons"
    }
    proto.filter = <FilterConfigJson[]> proto.filter;
    proto.tagRenderings.forEach(tr => {
        if (typeof tr === "string") {
            return;
        }
        if (tr["id"] === undefined || typeof tr["id"] !== "string") {
            console.error(tr)
            throw "Every tagrendering should have an id, acting as comment"
        }
    })

    proto.filter.push({
        id: "connection_type",
        options: filterOptions
    })


    const extraUnits = [
        {
            appliesToKey: entries.map(e => e.key + ":voltage"),
            applicableUnits: [{
                canonicalDenomination: 'V',
                alternativeDenomination: ["v", "volt", "voltage", 'V', 'Volt'],
                human: {
                    en: "Volts",
                    nl: "volt"
                }
            }],
            eraseInvalidValues: true
        },
        {
            appliesToKey: entries.map(e => e.key + ":current"),
            applicableUnits: [{
                canonicalDenomination: 'A',
                alternativeDenomination: ["a", "amp", "amperage", 'A'],
                human: {
                    en: "A",
                    nl: "A"
                }
            }],
            eraseInvalidValues: true
        },
        {
            appliesToKey: entries.map(e => e.key + ":output"),
            applicableUnits: [{
                canonicalDenomination: 'kW',
                alternativeDenomination: ["kilowatt"],
                human: {
                    en: "kilowatt",
                    nl: "kilowatt"
                }
            },
                {
                    canonicalDenomination: 'mW',
                    alternativeDenomination: ["megawatt"],
                    human: {
                        en: "megawatt",
                        nl: "megawatt"
                    }
                }],
            eraseInvalidValues: true
        },
    ];

    if (proto["units"] == undefined) {
        proto["units"] = []
    }
    proto["units"].push(...extraUnits)
    writeFileSync("charging_station.json", JSON.stringify(proto, undefined, "  "))
}


async function queryTagInfo(file, type, clean: ((s: string) => string)) {
    for (const e of loadCsv(file)) {
        const value = await ScriptUtils.TagInfoHistogram(e.key + ":" + type)
        const result = value.data
        const counts = new Map<string, number>()
        //  console.log(result)
        for (const r of result) {
            let key = r.value;
            key = clean(key)
            key.trim();
            if (key.indexOf('-') >= 0) {
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
            continue;
        }
        // @ts-ignore
        Utils.Merge(oldRendering, applicable)
    }
}

try {
    console.log("Generating the charging_station.json file")
    run("types.csv", "charging_station.protojson")
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
