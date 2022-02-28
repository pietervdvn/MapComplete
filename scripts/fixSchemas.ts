import ScriptUtils from "./ScriptUtils";
import {readFileSync, writeFileSync} from "fs";


interface JsonSchema {
    description?: string,
    type?: string,
    properties?: any,
    items?: JsonSchema,
    anyOf: JsonSchema[],
    enum: JsonSchema[],
    "$ref": string
}

function WalkScheme<T>(
    onEach: (schemePart: JsonSchema) => T,
    scheme: JsonSchema,
    fullScheme: JsonSchema & { definitions?: any } = undefined,
    path: string[] = [],
    isHandlingReference = []
): { path: string[], t: T }[] {
    const results: { path: string[], t: T } [] = []
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
            return;
        }
        const loadedScheme = fullScheme.definitions[definitionName]
        return WalkScheme(onEach, loadedScheme, fullScheme, path, [...isHandlingReference, definitionName]);
    }

    fullScheme = fullScheme ?? scheme
    var t = onEach(scheme)
    if (t !== undefined) {
        results.push({
            path,
            t
        })
    }


    function walk(v: JsonSchema) {
        if (v === undefined) {
            return
        }
        results.push(...WalkScheme(onEach, v, fullScheme, path, isHandlingReference))
    }

    function walkEach(scheme: JsonSchema[]) {
        if (scheme === undefined) {
            return
        }
      
        scheme.forEach(v => walk(v))
       
    }


    {
        walkEach(scheme.enum)
        walkEach(scheme.anyOf)
        if (Array.isArray(scheme.items)) {
            walkEach(<any>scheme.items)
        } else {
            walk(<any>scheme.items)
        }

        for (const key in scheme.properties) {
            const prop = scheme.properties[key]
            results.push(...WalkScheme(onEach, prop, fullScheme, [...path, key], isHandlingReference))
        }
    }

    return results
}

function extractMeta(typename: string, path: string) {
    const themeSchema = JSON.parse(readFileSync("./Docs/Schemas/" + typename + ".schema.json", "UTF-8"))
    const withTypes = WalkScheme((schemePart) => {
        if (schemePart.description === undefined) {
            return;
        }
        const typeHint = schemePart.description.split("\n")
            .find(line => line.trim().toLocaleLowerCase().startsWith("type:"))
            ?.substr("type:".length)?.trim()
        const type = schemePart.items?.anyOf ?? schemePart.type ?? schemePart.anyOf;
        return {typeHint, type}
    }, themeSchema)

    const paths = withTypes.map(({
                                     path,
                                     t
                                 }) => ({path, ...t}))
    writeFileSync("./assets/" + path + ".json", JSON.stringify(paths, null, "  "))
    console.log("Written meta to ./assets/" + path)
}


function main() {

    const allSchemas = ScriptUtils.readDirRecSync("./Docs/Schemas").filter(pth => pth.endsWith("JSC.ts"))
    for (const path of allSchemas) {
        const dir = path.substring(0, path.lastIndexOf("/"))
        const name = path.substring(path.lastIndexOf("/"), path.length - "JSC.ts".length)
        let content = readFileSync(path, "UTF-8")
        content = content.substring("export default ".length)
        let parsed = JSON.parse(content)
        parsed["additionalProperties"] = false

        for (const key in parsed.definitions) {
            const def = parsed.definitions[key]
            console.log("Patching ", key)
            if (def.type === "object") {
                def["additionalProperties"] = false
            }
        }
        writeFileSync(dir + "/" + name + ".schema.json", JSON.stringify(parsed, null, "  "), "UTF8")
    }

    extractMeta("LayoutConfigJson", "layoutconfigmeta")
    extractMeta("TagRenderingConfigJson", "tagrenderingconfigmeta")
    extractMeta("QuestionableTagRenderingConfigJson", "questionabletagrenderingconfigmeta")

}

main()
