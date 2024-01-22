import { Store, UIEventSource } from "../../Logic/UIEventSource"
import { SpecialVisualization, SpecialVisualizationState } from "../SpecialVisualization"
import Histogram from "../BigComponents/Histogram"
import { Feature } from "geojson"

export class HistogramViz implements SpecialVisualization {
    funcName = "histogram"
    docs = "Create a histogram for a list of given values, read from the properties."
    needsUrls = []

    example =
        '`{histogram(\'some_key\')}` with properties being `{some_key: ["a","b","a","c"]} to create a histogram'
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

    structuredExamples(): { feature: Feature; args: string[] }[] {
        return [
            {
                feature: <Feature>{
                    type: "Feature",
                    properties: { values: `["a","b","a","b","b","b","c","c","c","d","d"]` },
                    geometry: {
                        type: "Point",
                        coordinates: [0, 0],
                    },
                },
                args: ["values"],
            },
        ]
    }

    constr(
        state: SpecialVisualizationState,
        tagSource: UIEventSource<Record<string, string>>,
        args: string[]
    ) {
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
        return new Histogram(listSource, args[1], args[2], {
            assignColor: assignColors,
        })
    }
}
