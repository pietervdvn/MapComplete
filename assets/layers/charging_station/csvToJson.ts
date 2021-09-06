import {readFileSync, writeFileSync} from "fs";
import {Utils} from "../../../Utils";

// SMall script to output the properties of the types.csv as json to add in the tagRenderingGroup. Should be copied manually
function run(file, protojson) {
    const entries: string[] = Utils.NoNull(readFileSync(file, "utf8").split("\n").map(str => str.trim()))
    entries.shift()

    const result = []
    const questions = []

    for (const entry of entries) {
        const [key, image, description, whitelist] = entry.split(",").map(str => str.trim())
        if (key === "") {
            continue;
        }

        const json = {
            if: `${key}=1`,
            ifnot: `${key}=`,
            then: `<img style='width:3rem; margin-left: 1rem; margin-right: 1rem' src='./assets/layers/charging_station/${image}'/> ${description}`,
        
        }

        if (whitelist) {
            const countries = whitelist.split(";").map(country => "_country!=" + country) //HideInAnswer if it is in the wrong country
            json["hideInAnswer"] = {or:countries}
        }

        result.push(json)


        const indivQ = {

            question: {
                en: `How much plugs of type ${description} <img style='width:1rem; margin-left: 1rem; margin-right: 1rem' src='./assets/layers/charging_station/${image}'/> are available here?`
            },
            render: `There are <b>{${key}}</b>  <img style='width:1rem; margin-left: 1rem; margin-right: 1rem' src='./assets/layers/charging_station/${image}'/> plugs of type ${description} available here`,
            freeform: {
                key: key,
                type: "pnat"
            },
            condition: `${key}~*`

        }

        questions.push(indivQ)
    }

    const toggles = {
        "question": {
            "en": "Which charging stations are available here?"
        },
        "multiAnswer": true,
        "mappings": result
    }
    questions.unshift(toggles)

    const stringified = questions.map(q => JSON.stringify(q, null, "  "))
    console.log(stringified)
    let proto = readFileSync(protojson, "utf8")
    proto = proto.replace("$$$", stringified.join(",\n") + ",")
    writeFileSync("charging_station.json", proto)
}

try {
    run("types.csv","charging_station.protojson")
} catch (e) {
    console.error(e)
}
