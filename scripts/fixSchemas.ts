import ScriptUtils from "./ScriptUtils"
import { readFileSync, writeFileSync } from "fs"
import { JsonSchema } from "../UI/Studio/jsonSchema"
import { AllSharedLayers } from "../Customizations/AllSharedLayers"
import { AllKnownLayouts } from "../Customizations/AllKnownLayouts"
import { ConfigMeta } from "../UI/Studio/configMeta"
import { Utils } from "../Utils"

const metainfo = {
    type: "One of the inputValidator types",
    types: "Is multiple types are allowed for this field, then first show a mapping to pick the appropriate subtype. `Types` should be `;`-separated and contain precisely the same amount of subtypes",
    typesdefault: "Works in conjuction with `types`: this type will be selected by default",
    group: "A kind of label. Items with the same group name will be placed in the same region",
    default: "The default value which is used if no value is specified",
    question: "The question to ask in the tagRenderingConfig",
    iftrue: "For booleans only - text to show with 'yes'",
    iffalse: "For booleans only - text to show with 'no'",
    ifunset:
        "Only applicable if _not_ a required item. This will appear in the 'not set'-option as extra description",
    inline: "A text, containing `{value}`. This will be used as freeform rendering and will be included into the rendering",
    suggestions: "a javascript expression generating mappings",
}

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
            // We abort here to avoid infinite recursion
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

function addMetafields(fieldnames: string[], fullSchema: JsonSchema): ConfigMeta[] {
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

        if (hints["suggestions"]) {
            const suggestions = hints["suggestions"]
            console.log("Creating suggestions for expression", suggestions)
            const f = new Function("{ layers, themes  }", suggestions)
            hints["suggestions"] = f({
                layers: AllSharedLayers.sharedLayers,
                themes: AllKnownLayouts.allKnownLayouts,
            })
        }

        return { hints, type, description: description.join("\n") }
    }

    return WalkScheme(onEach, fullSchema, fullSchema, [], [], fullSchema.required).map(
        ({ path, required, t }) => ({ path, required, ...t })
    )
}

function substituteReferences(
    paths: ConfigMeta[],
    origSchema: JsonSchema,
    allDefinitions: Record<string, JsonSchema>
) {
    for (const path of paths) {
        if (!Array.isArray(path.type)) {
            continue
        }
        for (let i = 0; i < path.type.length; i++) {
            const typeElement = path.type[i]
            const ref = typeElement["$ref"]
            if (!ref) {
                continue
            }
            const name = ref.substring("#/definitions/".length)
            if (name === "TagRenderingConfigJson") {
                continue
            }
            if (name.startsWith("{") || name.startsWith("Record<")) {
                continue
            }
            if (origSchema["definitions"]?.[name]) {
                path.type[i] = origSchema["definitions"]?.[name]
                continue
            }

            if (name === "DeleteConfigJson") {
                const target = allDefinitions[name]
                if (!target) {
                    throw "Cannot expand reference for type " + name + "; it does not exist "
                }
                path.type[i] = target
                continue
            }

            console.log("Expanding " + name)
        }
    }
}

function validateMeta(path: ConfigMeta): string | undefined {
    if (path.path.length == 0) {
        return
    }
    const ctx = "Definition for field in " + path.path.join(".")
    if (path.hints.group === undefined && path.path.length == 1) {
        return (
            ctx +
            " does not have a group set (but it is a top-level element which should have a group) "
        )
    }
    if (path.hints.group === "hidden") {
        return undefined
    }
    if (path.hints.typehint === "tag") {
        return undefined
    }
    if (path.path[0] == "mapRendering" || path.path[0] == "tagRenderings") {
        return undefined
    }
    if (path.hints.question === undefined && !Array.isArray(path.type)) {
        return (
            ctx +
            " does not have a question set. As such, MapComplete-studio users will not be able to set this property"
        )
    }

    return undefined
}

function extractMeta(
    typename: string,
    path: string,
    allDefinitions: Record<string, JsonSchema>
): string[] {
    let themeSchema: JsonSchema = JSON.parse(
        readFileSync("./Docs/Schemas/" + typename + ".schema.json", { encoding: "utf8" })
    )

    const metakeys = Array.from(Object.keys(metainfo))

    const paths = addMetafields(metakeys, themeSchema)

    substituteReferences(paths, themeSchema, allDefinitions)

    writeFileSync("./assets/" + path + ".json", JSON.stringify(paths, null, "  "))
    console.log("Written meta to ./assets/" + path)
    return Utils.NoNull(paths.map((p) => validateMeta(p)))
}

function main() {
    const allSchemas = ScriptUtils.readDirRecSync("./Docs/Schemas").filter((pth) =>
        pth.endsWith("JSC.ts")
    )
    const allDefinitions: Record<string, JsonSchema> = {}
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

        allDefinitions[name.substring(1)] = parsed
        writeFileSync(dir + "/" + name + ".schema.json", JSON.stringify(parsed, null, "  "), {
            encoding: "utf8",
        })
    }
    const errs = extractMeta("LayerConfigJson", "layerconfigmeta", allDefinitions)
    extractMeta("LayoutConfigJson", "layoutconfigmeta", allDefinitions)
    extractMeta("TagRenderingConfigJson", "tagrenderingconfigmeta", allDefinitions)
    extractMeta(
        "QuestionableTagRenderingConfigJson",
        "questionabletagrenderingconfigmeta",
        allDefinitions
    )

    if (errs.length > 0) {
        for (const err of errs) {
            console.error(err)
        }
        console.log((errs.length < 25 ? "Only " : "") + errs.length + " errors to solve")
    }
}

main()
