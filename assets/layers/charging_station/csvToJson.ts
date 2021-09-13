import {readFileSync, writeFileSync} from "fs";
import {Utils} from "../../../Utils";
import {TagRenderingConfigJson} from "../../../Models/ThemeConfig/Json/TagRenderingConfigJson";
import ScriptUtils from "../../../scripts/ScriptUtils";


function colonSplit(value: string): string[] {
    return value.split(";").map(v => v.replace(/"/g, '').trim().toLowerCase()).filter(s => s !== "");
}

function loadCsv(file): {
    key: string,
    image: string,
    description: Map<string, string>,
    countryWhiteList?: string[],
    commonVoltages?: number[],
    commonCurrents?: number[],
    commonOutputs?: string[]
}[] {
    const entries: string[] = Utils.NoNull(readFileSync(file, "utf8").split("\n").map(str => str.trim()))
    const header = entries.shift().split(",")

    return Utils.NoNull(entries.map(entry => {
        const values = entry.split(",").map(str => str.trim())
        if (values[0] === undefined || values[0] === "") {
            return undefined;
        }

        const v = {}
        const colonSeperated = ["commonVoltages", "commonOutputs", "commonCurrents", "countryWhiteList"]
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
    const questions: TagRenderingConfigJson[] = []
    const filterOptions: { question: any, osmTags?: string } [] = [
        {
            question: {
                en: "All connectors",
                nl: "Alle types"
            }
        }
    ]

    const entries = loadCsv(file)
    for (const e of entries) {
        const txt = {
            en: `<img style='width:3rem; margin-left: 1rem; margin-right: 1rem' src='./assets/layers/charging_station/${e.image}'/> ${e.description.get("en")}`,
            nl: `<img style='width:3rem; margin-left: 1rem; margin-right: 1rem' src='./assets/layers/charging_station/${e.image}'/> ${e.description.get("nl")}`
        }
        const json = {
            if: `${e.key}=1`,
            ifnot: `${e.key}=`,
            then: txt,
        }

        if (e.countryWhiteList !== undefined && e.countryWhiteList.length > 0) {
            const countries = e.countryWhiteList.map(country => "_country!=" + country) //HideInAnswer if it is in the wrong country
            json["hideInAnswer"] = {or: countries}
        }

        overview_question_answers.push(json)

        // We add a second time for any amount to trigger a visualisation; but this is not an answer option
        const no_ask_json = {
            if: {
                and: [`${e.key}~*`, `${e.key}!=1`]
            },
            then: txt,
            hideInAnswer: true
        }
        overview_question_answers.push(no_ask_json)

        const descrWithImage_en = `<b>${e.description.get("en")}</b> <img style='width:1rem;' src='./assets/layers/charging_station/${e.image}'/>`
        const descrWithImage_nl = `<b>${e.description.get("nl")}</b> <img style='width:1rem;' src='./assets/layers/charging_station/${e.image}'/>`

        questions.push({
            question: {
                en: `How much plugs of type ${descrWithImage_en} are available here?`,
                nl: `Hoeveel stekkers van type  ${descrWithImage_nl} heeft dit oplaadpunt?`,
            },
            render: {
                en: `There are ${descrWithImage_en} plugs of type ${e.description.get("en")} available here`,
                nl: `Hier zijn ${descrWithImage_nl} stekkers van het type ${e.description.get("nl")}`
            },
            freeform: {
                key: e.key,
                type: "pnat"
            },
            condition: {
                and: [`${e.key}~*`, `${e.key}!=0`]
            }
        })

        questions.push({
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
                    if: `socket:${e.key}:voltage=${voltage} V`,
                    then: {
                        en: `${descrWithImage_en} outputs ${voltage} volt`,
                        nl: `${descrWithImage_nl} heeft een spanning van ${voltage} volt`
                    }
                }
            }),
            condition: {
                and: [`${e.key}~*`, `${e.key}!=0`]
            }
        })


        questions.push({
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
                    if: `socket:${e.key}:current=${current} A`,
                    then: {
                        en: `${descrWithImage_en} outputs at most ${current} A`,
                        nl: `${descrWithImage_nl} levert een stroom van maximaal ${current} A`
                    }
                }
            }),
            condition: {
                and: [`${e.key}~*`, `${e.key}!=0`]
            }
        })


        questions.push({
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
                    if: `socket:${e.key}:output=${output}`,
                    then: {
                        en: `${descrWithImage_en} outputs at most ${output}`,
                        nl: `${descrWithImage_nl} levert een vermogen van maximaal ${output}`
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
        "question": {
            "en": "Which charging stations are available here?"
        },
        "multiAnswer": true,
        "mappings": overview_question_answers
    }
    questions.unshift(toggles)

    const stringified = questions.map(q => JSON.stringify(q, null, "  "))
    let proto = readFileSync(protojson, "utf8")
    proto = proto.replace("$$$", stringified.join(",\n") + ",")
    proto = JSON.parse(proto)
    proto["filter"].push({
        options: filterOptions
    })

  
    
    const extraUnits = [
        {
            appliesToKey: entries.map(e => e.key + ":voltage"),
            applicableUnits: [{
                canonicalDenomination: 'V',
                alternativeDenomination: ["v", "volt", "voltage",'V','Volt'],
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
                alternativeDenomination: ["a", "amp", "amperage",'A'],
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

    if(proto["units"] == undefined){
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
        //    console.log(`${e.key}:${type} = ${countsArray.join(";")}`)
        console.log(`${countsArray.join(";")}`)
    }
}

try {
    run("types.csv", "charging_station.protojson")
    // queryTagInfo("types.csv","voltage", true)
    // queryTagInfo("types.csv", "current", true)
    /* queryTagInfo("types.csv", "output", s => {
         if(s.endsWith("kW")){
             s = s.substring(0, s.length - 2)
         }
         s = s.trim()
         return s + " kW"
     })*/

} catch (e) {
    console.error(e)
}
