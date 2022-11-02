import { Store, UIEventSource } from "../../Logic/UIEventSource"
import { FixedUiElement } from "../Base/FixedUiElement"
// import Histogram from "../BigComponents/Histogram";
// import {SpecialVisualization} from "../SpecialVisualization";

export class HistogramViz {
    funcName = "histogram"
    docs = "Create a histogram for a list of given values, read from the properties."
    example =
        "`{histogram('some_key')}` with properties being `{some_key: ['a','b','a','c']} to create a histogram"
    args = [
        {
            name: "key",
            doc: "The key to be read and to generate a histogram from",
            required: true,
        },
        {
            name: "title",
            doc: "This text will be placed above the texts (in the first column of the visulasition)",
            defaultValue: "",
        },
        {
            name: "countHeader",
            doc: "This text will be placed above the bars",
            defaultValue: "",
        },
        {
            name: "colors*",
            doc: "(Matches all resting arguments - optional) Matches a regex onto a color value, e.g. `3[a-zA-Z+-]*:#33cc33`",
        },
    ]

    constr(state, tagSource: UIEventSource<any>, args: string[]) {
        let assignColors = undefined
        if (args.length >= 3) {
            const colors = [...args]
            colors.splice(0, 3)
            const mapping = colors.map((c) => {
                const splitted = c.split(":")
                const value = splitted.pop()
                const regex = splitted.join(":")
                return { regex: "^" + regex + "$", color: value }
            })
            assignColors = (key) => {
                for (const kv of mapping) {
                    if (key.match(kv.regex) !== null) {
                        return kv.color
                    }
                }
                return undefined
            }
        }

        const listSource: Store<string[]> = tagSource.map((tags) => {
            try {
                const value = tags[args[0]]
                if (value === "" || value === undefined) {
                    return undefined
                }
                return JSON.parse(value)
            } catch (e) {
                console.error("Could not load histogram: parsing  of the list failed: ", e)
                return undefined
            }
        })
        return new FixedUiElement("HISTORGRAM")
        /*
        return new Histogram(listSource, args[1], args[2], {
            assignColor: assignColors,
        })*/
    }
}
