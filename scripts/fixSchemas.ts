import ScriptUtils from "./ScriptUtils"
import { readFileSync, writeFileSync } from "fs"
import { JsonSchema } from "../src/UI/Studio/jsonSchema"
import { ConfigMeta } from "../src/UI/Studio/configMeta"
import { Utils } from "../src/Utils"
import Validators from "../src/UI/InputElement/Validators"
import { AllKnownLayouts } from "../src/Customizations/AllKnownLayouts"
import { AllSharedLayers } from "../src/Customizations/AllSharedLayers"
import Constants from "../src/Models/Constants"

const metainfo = {
    type: "One of the inputValidator types",
    typeHelper: "Helper arguments for the type input, comma-separated. Same as 'args'",
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
    suggestions:
        'a javascript expression generating mappings; executed in an environment which has access to `layers: Map<string, LayerConfig>` and `themes: Map<string, ThemeConfig>`. Should return an array of type `{if: \'value=*\', then: string}[]`. Example: `return Array.from(layers.keys()).map(key => ({if: "value="+key, then: key+" - "+layers.get(key).description}))`. This code is executed at compile time, so no CSP is needed  ',
    title: "a title that is given to a MultiType",
    multianswer: "set to 'true' if multiple options should be selectable",
}

/**
 * Applies 'onEach' on every leaf of the JSONSchema
 * @param onEach
 * @param scheme
 * @param fullScheme
 * @param path
 * @param isHandlingReference
 * @param required
 * @constructor
 */
function WalkScheme<T>(
    onEach: (schemePart: JsonSchema, path: string[]) => T,
    scheme: JsonSchema,
    fullScheme: JsonSchema & { definitions?: any } = undefined,
    path: string[] = [],
    isHandlingReference = [],
    required: string[],
    skipRoot = false
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
        // The 'scheme' might contain some extra info, such as 'description'
        // This effectively overwrites properties from the loaded scheme
        const loadedScheme = fullScheme.definitions[definitionName]
        const syntheticScheme = { ...loadedScheme, ...scheme }
        syntheticScheme["child-description"] = loadedScheme.description
        delete syntheticScheme["$ref"]
        return WalkScheme(
            onEach,
            syntheticScheme,
            fullScheme,
            path,
            [...isHandlingReference, definitionName],
            required,
            skipRoot
        )
    }

    fullScheme = fullScheme ?? scheme
    if (!skipRoot) {
        let t = onEach(scheme, path)
        if (t !== undefined) {
            const isRequired = required?.indexOf(path.at(-1)) >= 0
            results.push({
                path,
                required: isRequired,
                t,
            })
        }
    }

    function walk(v: JsonSchema, skipRoot = false) {
        if (v === undefined) {
            return
        }
        results.push(
            ...WalkScheme(onEach, v, fullScheme, path, isHandlingReference, v.required, skipRoot)
        )
    }

    function walkEach(scheme: JsonSchema[], skipRoot: boolean = false) {
        if (scheme === undefined) {
            return
        }

        scheme.forEach((v) => walk(v, skipRoot))
    }

    {
        walkEach(scheme.enum)
        walkEach(scheme.anyOf, true)
        walkEach(scheme.allOf)

        if (Array.isArray(scheme.items)) {
            // walk and walkEach are local functions which push to the result array
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

function extractHintsFrom(
    description: string,
    fieldnames: string[],
    path: (string | number)[],
    type: any,
    schemepart: any
): Record<string, string> {
    if (!description) {
        return {}
    }
    const hints = {}
    const lines = description.split("\n")
    for (const fieldname of fieldnames) {
        const hintIndex = lines.findIndex((line) =>
            line
                .trim()
                .toLocaleLowerCase()
                .startsWith(fieldname + ":")
        )
        if (hintIndex < 0) {
            continue
        }
        const hintLine = lines[hintIndex].substring((fieldname + ":").length).trim()
        if (fieldname === "type") {
            hints["typehint"] = hintLine
        } else {
            hints[fieldname] = hintLine
        }
    }

    if (hints["types"]) {
        const notRequired = hints["ifunset"] !== undefined
        const numberOfExpectedSubtypes = hints["types"].replaceAll("|", ";").split(";").length
        if (!Array.isArray(type) && !notRequired) {
            throw (
                "At " +
                path.join(".") +
                "Invalid hint in the documentation: `types` indicates that there are " +
                numberOfExpectedSubtypes +
                " subtypes, but object does not support subtypes. Did you mean `type` instead?\n\tTypes are: " +
                hints["types"] +
                "\n: hints: " +
                JSON.stringify(hints) +
                " req:" +
                JSON.stringify(schemepart)
            )
        }
        const numberOfActualTypes = type.length
        if (
            numberOfActualTypes !== numberOfExpectedSubtypes &&
            notRequired &&
            numberOfActualTypes + 1 !== numberOfExpectedSubtypes
        ) {
            throw `At ${path.join(
                "."
            )}\nInvalid hint in the documentation: \`types\` indicates that there are ${numberOfExpectedSubtypes} subtypes, but there are ${numberOfActualTypes} subtypes
\tTypes are: ${hints["types"]}`
        }
    }

    if (hints["suggestions"]) {
        const suggestions = hints["suggestions"]
        const f = new Function("{ layers, themes, validators, Constants  }", suggestions)
        hints["suggestions"] = f({
            layers: AllSharedLayers.sharedLayers,
            themes: AllKnownLayouts.allKnownLayouts,
            validators: Validators,
            Constants: Constants,
        })
        if(hints["suggestions"]?.indexOf(null) >= 0){
            throw "A suggestion generated 'null' for "+path.join(".")+". Check the docstring, specifically 'suggestions'. Pay attention to double commas"
        }
    }
    return hints
}

/**
 * Extracts the 'configMeta' from the given schema, based on attributes in the description
 * @param fieldnames
 * @param fullSchema
 */
function addMetafields(fieldnames: string[], fullSchema: JsonSchema): ConfigMeta[] {
    const fieldNamesSet = new Set(fieldnames)
    const onEach = (schemePart, path) => {
        if (schemePart.description === undefined) {
            return
        }
        const type = schemePart.items?.anyOf ?? schemePart.type ?? schemePart.anyOf
        let description = schemePart.description

        let hints = extractHintsFrom(description, fieldnames, path, type, schemePart)
        const childDescription = schemePart["child-description"]
        if (childDescription) {
            const childHints = extractHintsFrom(
                childDescription,
                fieldnames,
                path,
                type,
                schemePart
            )
            hints = { ...childHints, ...hints }
            description = description ?? childDescription
        }

        const cleanedDescription: string[] = []
        for (const line of description.split("\n")) {
            const keyword = line.split(":").at(0).trim().toLowerCase()
            if (fieldNamesSet.has(keyword)) {
                continue
            }
            cleanedDescription.push(line)
        }
        return {
            hints,
            type,
            description: cleanedDescription.filter((l) => l !== "").join("\n"),
        }
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
            if (name.startsWith("{") || name.startsWith("Record<")) {
                continue
            }
            if (origSchema["definitions"]?.[name]) {
                path.type[i] = origSchema["definitions"]?.[name]
                continue
            }

            if (name === "DeleteConfigJson" || name === "TagRenderingConfigJson") {
                const target = allDefinitions[name]
                if (!target) {
                    throw "Cannot expand reference for type " + name + "; it does not exist "
                }
                path.type[i] = target
            }
        }
    }
}

function validateMeta(path: ConfigMeta): string | undefined {
    if (path.path.length == 0) {
        return
    }
    const ctx = "Definition for field '" + path.path.join(".") + "'"
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
        /* return (
    ctx +
    " does not have a question set. As such, MapComplete-studio users will not be able to set this property"
) //*/
    }

    return undefined
}

function extractMeta(
    typename: string,
    path: string,
    allDefinitions: Record<string, JsonSchema>
): string[] {
    const schema: JsonSchema = JSON.parse(
        readFileSync("./Docs/Schemas/" + typename + ".schema.json", { encoding: "utf8" })
    )

    const metakeys = Array.from(Object.keys(metainfo)).map((s) => s.toLowerCase())

    const paths = addMetafields(metakeys, schema)

    substituteReferences(paths, schema, allDefinitions)

    const fullPath = "./src/assets/schemas/" + path + ".json"
    writeFileSync(fullPath, JSON.stringify(paths, null, "  "))
    console.log("Written meta to " + fullPath)
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
    const errs: string[] = []
    errs.push(...extractMeta("LayerConfigJson", "layerconfigmeta", allDefinitions))
    errs.push(...extractMeta("LayoutConfigJson", "layoutconfigmeta", allDefinitions))
    errs.push(...extractMeta("TagRenderingConfigJson", "tagrenderingconfigmeta", allDefinitions))
    errs.push(
        ...extractMeta(
            "QuestionableTagRenderingConfigJson",
            "questionabletagrenderingconfigmeta",
            allDefinitions
        )
    )
    if (errs.length > 0) {
        for (const err of errs) {
            console.error(err)
        }
        console.log((errs.length < 25 ? "Only " : "") + errs.length + " errors to solve")
    }
}

main()
