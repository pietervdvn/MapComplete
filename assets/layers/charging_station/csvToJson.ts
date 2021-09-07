import {readFileSync, writeFileSync} from "fs";
import {Utils} from "../../../Utils";

// SMall script to output the properties of the types.csv as json to add in the tagRenderingGroup. Should be copied manually
function run(file, protojson) {
    const entries: string[] = Utils.NoNull(readFileSync(file, "utf8").split("\n").map(str => str.trim()))
    entries.shift()

    const overview_question_answers = []
    const questions = []
    const filterOptions: { question: string, osmTags?: string } [] = [
        {
            question: "All connectors"
        }
    ]

    for (const entry of entries) {
        const [key, image, description, whitelist] = entry.split(",").map(str => str.trim())
        if (key === "") {
            continue;
        }

        const txt = `<img style='width:3rem; margin-left: 1rem; margin-right: 1rem' src='./assets/layers/charging_station/${image}'/> ${description}`
        const json = {
            if: `${key}=1`,
            ifnot: `${key}=`,
            then: txt,
        }

        if (whitelist) {
            const countries = whitelist.replace(/"/g, '').split(",").map(country => "_country!=" + country) //HideInAnswer if it is in the wrong country
            json["hideInAnswer"] = {or: countries}
        }

        overview_question_answers.push(json)

        // We add a second time for any amount to trigger a visualisation; but this is not an answer option
        const no_ask_json = {
            if: {and: [`${key}~*`,`${key}!=1`]
            },
            then: txt,
            hideInAnswer: true
        }
        overview_question_answers.push(no_ask_json)
        
        const indivQ = {

            question: {
                en: `How much plugs of type ${description} <img style='width:1rem; margin-left: 1rem; margin-right: 1rem' src='./assets/layers/charging_station/${image}'/> are available here?`
            },
            render: `There are <b>{${key}}</b>  <img style='width:1rem' src='./assets/layers/charging_station/${image}'/> plugs of type ${description} available here`,
            freeform: {
                key: key,
                type: "pnat"
            },
            condition: `${key}~*`

        }

        questions.push(indivQ)

        filterOptions.push({
            question: `Has a ${description} <img style='width:1rem' src='./assets/layers/charging_station/${image}'/> connector`,
            osmTags: `${key}~*`
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
    console.log(stringified)
    let proto = readFileSync(protojson, "utf8")
    proto = proto.replace("$$$", stringified.join(",\n") + ",")
    proto = JSON.parse(proto)
    proto["filter"].push({
        options: filterOptions
    })
    writeFileSync("charging_station.json", JSON.stringify(proto, undefined, "  "))
}

try {
    run("types.csv", "charging_station.protojson")
} catch (e) {
    console.error(e)
}
