import ScriptUtils from "./ScriptUtils"
import { readFileSync, writeFileSync } from "fs"
import { JsonSchema } from "../UI/Studio/jsonSchema"

function WalkScheme<T>(
    onEach: (schemePart: JsonSchema, path: string[]) => T,
    scheme: JsonSchema,
    fullScheme: JsonSchema & { definitions?: any } = undefined,
    path: string[] = [],
    isHandlingReference = [],
    required: string[]
): { path: string[]; required: boolean; t: T }[] {
    const results: { path: string[]; required: boolean; t: T }[] = []
    if (scheme === undefined) {
        return []
    }

    if (scheme["$ref"] !== undefined) {
        const ref = scheme["$ref"]
        const prefix = "#/definitions/"
        if (!ref.startsWith(prefix)) {
            throw "References is not relative!"
        }
        const definitionName = ref.substr(prefix.length)
        if (isHandlingReference.indexOf(definitionName) >= 0) {
            return []
        }
        const loadedScheme = fullScheme.definitions[definitionName]
        return WalkScheme(
            onEach,
            loadedScheme,
            fullScheme,
            path,
            [...isHandlingReference, definitionName],
            required
        )
    }

    fullScheme = fullScheme ?? scheme
    let t = onEach(scheme, path)
    if (t !== undefined) {
        const isRequired = required?.indexOf(path.at(-1)) >= 0
        results.push({
            path,
            required: isRequired,
            t,
        })
    }

    function walk(v: JsonSchema) {
        if (v === undefined) {
            return
        }
        results.push(...WalkScheme(onEach, v, fullScheme, path, isHandlingReference, v.required))
    }

    function walkEach(scheme: JsonSchema[]) {
        if (scheme === undefined) {
            return
        }

        scheme.forEach((v) => walk(v))
    }

    {
        walkEach(scheme.enum)
        walkEach(scheme.anyOf)
        walkEach(scheme.allOf)

        if (Array.isArray(scheme.items)) {
            walkEach(<any>scheme.items)
        } else {
            walk(<any>scheme.items)
        }

        for (const key in scheme.properties) {
            const prop = scheme.properties[key]
            results.push(
                ...WalkScheme(
                    onEach,
                    prop,
                    fullScheme,
                    [...path, key],
                    isHandlingReference,
                    scheme.required
                )
            )
        }
    }

    return results
}

function addMetafields(fieldnames: string[], fullSchema: JsonSchema) {
    const onEach = (schemePart, path) => {
        if (schemePart.description === undefined) {
            return
        }
        const type = schemePart.items?.anyOf ?? schemePart.type ?? schemePart.anyOf
        const hints = {}
        let description = schemePart.description.split("\n")
        for (const fieldname of fieldnames) {
            const hintIndex = description.findIndex((line) =>
                line
                    .trim()
                    .toLocaleLowerCase()
                    .startsWith(fieldname + ":")
            )
            if (hintIndex < 0) {
                continue
            }
            const hintLine = description[hintIndex].substring((fieldname + ":").length).trim()
            description.splice(hintIndex, 1)
            if (fieldname === "type") {
                hints["typehint"] = hintLine
            } else {
                hints[fieldname] = hintLine
            }
        }

        if (hints["types"]) {
            const numberOfExpectedSubtypes = hints["types"].split(";").length
            if (!Array.isArray(type)) {
                throw (
                    "At " +
                    path.join(".") +
                    "Invalid hint in the documentation: `types` indicates that there are " +
                    numberOfExpectedSubtypes +
                    " subtypes, but object does not support subtypes. Did you mean `type` instead?\n\tTypes are: " +
                    hints["types"]
                )
            }
            const numberOfActualTypes = type.length
            if (numberOfActualTypes !== numberOfExpectedSubtypes) {
                throw `At ${path.join(
                    "."
                )}\nInvalid hint in the documentation: \`types\` indicates that there are ${numberOfExpectedSubtypes} subtypes, but there are ${numberOfActualTypes} subtypes
\tTypes are: ${hints["types"]}`
            }
        }

        return { hints, type, description: description.join("\n") }
    }

    return WalkScheme(onEach, fullSchema, fullSchema, [], [], fullSchema.required)
}

function extractMeta(typename: string, path: string) {
    let themeSchema: JsonSchema = JSON.parse(
        readFileSync("./Docs/Schemas/" + typename + ".schema.json", { encoding: "utf8" })
    )

    const metainfo = {
        type: "One of the inputValidator types",
        types: "Is multiple types are allowed for this field, then first show a mapping to pick the appropriate subtype. `Types` should be `;`-separated and contain precisely the same amount of subtypes",
        group: "A kind of label. Items with the same group name will be placed in the same region",
        default: "The default value which is used if no value is specified",
        question: "The question to ask in the tagRenderingConfig",
        ifunset:
            "Only applicable if _not_ a required item. This will appear in the 'not set'-option as extra description",
        inline: "A text, containing `{value}`. This will be used as freeform rendering and will be included into the rendering",
    }
    const metakeys = Array.from(Object.keys(metainfo))

    const hints = addMetafields(metakeys, themeSchema)
    const paths = hints.map(({ path, required, t }) => ({ path, required, ...t }))

    writeFileSync("./assets/" + path + ".json", JSON.stringify(paths, null, "  "))
    console.log("Written meta to ./assets/" + path)
}

function main() {
    const allSchemas = ScriptUtils.readDirRecSync("./Docs/Schemas").filter((pth) =>
        pth.endsWith("JSC.ts")
    )
    for (const path of allSchemas) {
        const dir = path.substring(0, path.lastIndexOf("/"))
        const name = path.substring(path.lastIndexOf("/"), path.length - "JSC.ts".length)
        let content = readFileSync(path, { encoding: "utf8" })
        content = content.substring("export default ".length)
        let parsed = JSON.parse(content)
        parsed["additionalProperties"] = false

        for (const key in parsed.definitions) {
            const def = parsed.definitions[key]
            if (def.type === "object") {
                def["additionalProperties"] = false
            }
        }
        writeFileSync(dir + "/" + name + ".schema.json", JSON.stringify(parsed, null, "  "), {
            encoding: "utf8",
        })
    }
    extractMeta("LayerConfigJson", "layerconfigmeta")
    extractMeta("LayoutConfigJson", "layoutconfigmeta")
    extractMeta("TagRenderingConfigJson", "tagrenderingconfigmeta")
    extractMeta("QuestionableTagRenderingConfigJson", "questionabletagrenderingconfigmeta")
}

main()
