import ScriptUtils from "./ScriptUtils";
import {readFileSync, writeFileSync} from "fs";


interface JsonSchema {
    description?: string,
    type?: string,
    properties?: any,
    items?: JsonSchema | JsonSchema[],
    anyOf: JsonSchema[],
    enum: JsonSchema[],
    "$ref": string
}

function WalkScheme<T>(
    onEach: (schemePart: JsonSchema) => T,
    scheme: JsonSchema,
    registerSchemePath = false,
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
        return WalkScheme(onEach, loadedScheme, registerSchemePath, fullScheme, path, [...isHandlingReference, definitionName]);
    }

    fullScheme = fullScheme ?? scheme
    var t = onEach(scheme)
    if (t !== undefined) {
        results.push({
            path: [...path],
            t
        })
    }
    
    
    function walk(v: JsonSchema, pathPart: string) {
        if (v === undefined) {
            return
        }
        if (registerSchemePath) {
            path.push("" + pathPart)
        }
        results.push(...WalkScheme(onEach, v, registerSchemePath, fullScheme, path, isHandlingReference))
        if (registerSchemePath) {
            path.pop()
        }
    }

    function walkEach(scheme: JsonSchema[], pathPart: string) {
        if (scheme === undefined) {
            return
        }
        if (registerSchemePath) {
            path.push("" + pathPart)
        }
        scheme.forEach((v, i) => walk(v, "" + i))
        if (registerSchemePath) {
            path.pop()
        }
    }

  

    {
        walkEach(scheme.enum, "enum")
        walkEach(scheme.anyOf, "anyOf")
        if (scheme.items !== undefined) {

            if (scheme.items["forEach"] !== undefined) {
                walkEach(<any>scheme.items, "items")
            } else {
                walk(<any>scheme.items, "items")
            }
        }

        if (registerSchemePath) {
            path.push("properties")
        }
        for (const key in scheme.properties) {
            const prop = scheme.properties[key]
            path.push(key)
            results.push(...WalkScheme(onEach, prop, registerSchemePath, fullScheme, path, isHandlingReference))
            path.pop()
        }
        if (registerSchemePath) {
            path.pop()
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
        const type = schemePart.type ?? schemePart.anyOf;
        return {typeHint, type}
    }, themeSchema)

    writeFileSync("./assets/" + path + ".json", JSON.stringify(withTypes.map(({
                                                                                  path,
                                                                                  t
                                                                              }) => ({path, ...t})), null, "  "))
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

}

main()
