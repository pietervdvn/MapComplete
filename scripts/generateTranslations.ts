import * as fs from "fs"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { Utils } from "../src/Utils"
import ScriptUtils from "./ScriptUtils"
import Script from "./Script"

const knownLanguages = ["en", "nl", "de", "fr", "es", "gl", "ca"]
const ignoreTerms = ["searchTerms"]
class TranslationPart {
    contents: Map<string, TranslationPart | string> = new Map<string, TranslationPart | string>()

    static fromDirectory(path): TranslationPart {
        const files = ScriptUtils.readDirRecSync(path, 1).filter((file) => file.endsWith(".json"))
        const rootTranslation = new TranslationPart()
        for (const file of files) {
            const content = JSON.parse(readFileSync(file, { encoding: "utf8" }))
            rootTranslation.addTranslation(file.substr(0, file.length - ".json".length), content)
        }
        return rootTranslation
    }

    /**
     * Add a leaf object
     * @param language
     * @param obj
     */
    add(language: string, obj: any) {
        for (const key in obj) {
            const v = obj[key]
            if (!this.contents.has(key)) {
                this.contents.set(key, new TranslationPart())
            }
            const subpart = this.contents.get(key) as TranslationPart

            if (typeof v === "string") {
                subpart.contents.set(language, v)
            } else {
                subpart.add(language, v)
            }
        }
    }

    addTranslationObject(translations: any, context?: string) {
        if (translations["#"] === "no-translations") {
            console.log("Ignoring object at ", context, "which has '#':'no-translations'")
            return
        }
        for (const translationsKey in translations) {
            if (!translations.hasOwnProperty(translationsKey)) {
                continue
            }

            const v = translations[translationsKey]
            if (typeof v != "string") {
                console.error(
                    `Non-string object at ${context} in translation while trying to add the translation ` +
                        JSON.stringify(v) +
                        ` to '` +
                        translationsKey +
                        "'. The offending object which _should_ be a translation is: ",
                    v,
                    "\n\nThe current object is (only showing en):",
                    this.toJson(),
                    "and has translations for",
                    Array.from(this.contents.keys())
                )
                throw (
                    "Error in an object depicting a translation: a non-string object was found. (" +
                    context +
                    ")\n    You probably put some other section accidentally in the translation"
                )
            }
            this.contents.set(translationsKey, v)
        }
    }

    recursiveAdd(object: any, context: string) {
        const isProbablyTranslationObject = knownLanguages.some((l) => object.hasOwnProperty(l)) // TODO FIXME ID
        if (isProbablyTranslationObject) {
            this.addTranslationObject(object, context)
            return
        }

        let dontTranslateKeys: string[] = undefined
        {
            const noTranslate = <string | string[]>object["#dont-translate"]

            if (noTranslate === "*") {
                console.log("Ignoring translations for " + context)
                return
            } else if (typeof noTranslate === "string") {
                dontTranslateKeys = [noTranslate]
            } else {
                dontTranslateKeys = noTranslate
            }
            if (noTranslate !== undefined) {
                console.log(
                    "Ignoring some translations for " +
                        context +
                        ": " +
                        dontTranslateKeys.join(", ")
                )
            }
        }

        for (let key in object) {
            if (!object.hasOwnProperty(key)) {
                continue
            }
            if (ignoreTerms.indexOf(key) >= 0) {
                continue
            }

            if (dontTranslateKeys?.indexOf(key) >= 0) {
                continue
            }
            const v = object[key]

            if (v == null) {
                continue
            }
            if (typeof v !== "object") {
                continue
            }

            if (context.endsWith(".tagRenderings")) {
                if (v["id"] === undefined) {
                    if (v["builtin"] !== undefined && typeof v["builtin"] === "string") {
                        key = v["builtin"]
                    } else {
                        throw (
                            "At " +
                            context +
                            ": every object within a tagRenderings-list should have an id. " +
                            JSON.stringify(v) +
                            " has no id"
                        )
                    }
                } else {
                    // We use the embedded id as key instead of the index as this is more stable
                    // Note: indonesian is shortened as 'id' as well!
                    if (v["en"] !== undefined || v["nl"] !== undefined) {
                        // This is probably a translation already!
                        // pass
                    } else {
                        key = v["id"]
                        if (typeof key !== "string") {
                            throw "Panic: found a non-string ID at" + context
                        }
                    }
                }
            }

            if (!this.contents.get(key)) {
                this.contents.set(key, new TranslationPart())
            }

            ;(this.contents.get(key) as TranslationPart).recursiveAdd(v, context + "." + key)
        }
    }

    knownLanguages(): string[] {
        const languages = []
        for (let key of Array.from(this.contents.keys())) {
            const value = this.contents.get(key)

            if (typeof value === "string") {
                if (key === "#") {
                    continue
                }
                languages.push(key)
            } else {
                languages.push(...(value as TranslationPart).knownLanguages())
            }
        }
        return Utils.Dedup(languages)
    }

    toJson(neededLanguage?: string): string {
        const parts = []
        let keys = Array.from(this.contents.keys())
        keys = keys.sort()
        for (let key of keys) {
            let value = this.contents.get(key)

            if (typeof value === "string") {
                value = value.replace(/"/g, '\\"').replace(/\n/g, "\\n")
                if (neededLanguage === undefined) {
                    parts.push(`\"${key}\": \"${value}\"`)
                } else if (key === neededLanguage) {
                    return `"${value}"`
                }
            } else {
                const sub = (value as TranslationPart).toJson(neededLanguage)
                if (sub !== "") {
                    parts.push(`\"${key}\": ${sub}`)
                }
            }
        }
        if (parts.length === 0) {
            return ""
        }
        return `{${parts.join(",")}}`
    }

    validateStrict(ctx?: string): void {
        const errors = this.validate()
        for (const err of errors) {
            console.error(
                "ERROR in " + (ctx ?? "") + " " + err.path.join(".") + "\n   " + err.error
            )
        }
        if (errors.length > 0) {
            throw ctx + " has " + errors.length + " inconsistencies in the translation"
        }
    }

    /**
     * Checks the leaf objects: special values must be present and identical in every leaf
     */
    validate(path = []): { error: string; path: string[] }[] {
        const errors: { error: string; path: string[] }[] = []
        const neededSubparts = new Set<{ part: string; usedByLanguage: string }>()

        let isLeaf: boolean = undefined
        this.contents.forEach((value, key) => {
            if (typeof value !== "string") {
                const recErrors = value.validate([...path, key])
                errors.push(...recErrors)
                return
            }
            if (isLeaf === undefined) {
                isLeaf = true
            } else if (!isLeaf) {
                errors.push({
                    error: "Mixed node: non-leaf node has translation strings",
                    path: path,
                })
            }

            let subparts: string[] = value.match(/{[^}]*}/g)
            if (subparts !== null) {
                let [_, __, weblatepart, lang] = key.split("/")
                if (lang === undefined) {
                    // This is a core translation, it has one less path segment
                    lang = weblatepart
                }
                subparts = subparts.map((p) => p.split(/\(.*\)/)[0])
                for (const subpart of subparts) {
                    neededSubparts.add({ part: subpart, usedByLanguage: lang })
                }
            }
        })

        // Actually check for the needed sub-parts, e.g. that {key} isn't translated into {sleutel}
        this.contents.forEach((value, key) => {
            neededSubparts.forEach(({ part, usedByLanguage }) => {
                if (typeof value !== "string") {
                    return
                }
                let [_, __, weblatepart, lang] = key.split("/")
                if (lang === undefined) {
                    // This is a core translation, it has one less path segment
                    lang = weblatepart
                    weblatepart = "core"
                }
                const fixLink = `Fix it on https://hosted.weblate.org/translate/mapcomplete/${weblatepart}/${lang}/?offset=1&q=context%3A%3D%22${encodeURIComponent(
                    path.join(".")
                )}%22`
                let subparts: string[] = value.match(/{[^}]*}/g)
                if (subparts === null) {
                    if (neededSubparts.size > 0) {
                        errors.push({
                            error:
                                "The translation for " +
                                key +
                                " does not have any subparts, but expected " +
                                Array.from(neededSubparts)
                                    .map(
                                        (part) =>
                                            part.part + " (used in " + part.usedByLanguage + ")"
                                    )
                                    .join(",") +
                                " . The full translation is " +
                                value +
                                "\n" +
                                fixLink,
                            path: path,
                        })
                    }
                    return
                }
                subparts = subparts.map((p) => p.split(/\(.*\)/)[0])
                if (subparts.indexOf(part) < 0) {
                    if (lang === "en" || usedByLanguage === "en") {
                        errors.push({
                            error: `The translation for ${key} does not have the required subpart ${part} (in ${usedByLanguage}).
    \tThe full translation is ${value}
    \t${fixLink}`,
                            path: path,
                        })
                    }
                }
            })
        })

        return errors
    }

    /**
     * Recursively adds a translation object, the inverse of 'toJson'
     * @param language
     * @param object
     * @private
     */
    private addTranslation(language: string, object: any) {
        for (const key in object) {
            const v = object[key]
            if (v === "") {
                delete object[key]
                continue
            }
            let subpart = <TranslationPart>this.contents.get(key)
            if (subpart === undefined) {
                subpart = new TranslationPart()
                this.contents.set(key, subpart)
            }
            if (typeof v === "string") {
                subpart.contents.set(language, v)
            } else {
                subpart.addTranslation(language, v)
            }
        }
    }
}

/**
 * Checks that the given object only contains string-values
 * @param tr
 */
function isTranslation(tr: any): boolean {
    if (tr["#"] === "no-translations") {
        return false
    }
    if (tr["special"]) {
        return false
    }
    for (const key in tr) {
        if (typeof tr[key] !== "string") {
            return false
        }
    }
    return true
}

/**
 * Converts a translation object into something that can be added to the 'generated translations'.
 *
 * To debug the 'compiledTranslations', add a languageWhiteList to only generate a single language
 */
function transformTranslation(
    obj: any,
    path: string[] = [],
    languageWhitelist: string[] = undefined
) {
    if (isTranslation(obj)) {
        return `new Translation( ${JSON.stringify(obj)} )`
    }

    let values: string[] = []
    const spaces = Utils.Times((_) => "  ", path.length + 1)

    for (const key in obj) {
        if (key === "#") {
            continue
        }

        if (key.match("^[a-zA-Z0-9_]*$") === null) {
            throw "Invalid character in key: " + key
        }
        let value = obj[key]

        if (isTranslation(value)) {
            if (languageWhitelist !== undefined) {
                const nv = {}
                for (const ln of languageWhitelist) {
                    nv[ln] = value[ln]
                }
                value = nv
            }

            if (value["en"] === undefined) {
                throw `At ${path.join(".")}: Missing 'en' translation at path ${path.join(
                    "."
                )}.${key}\n\tThe translations in other languages are ${JSON.stringify(value)}`
            }
            const subParts: string[] = value["en"].match(/{[^}]*}/g)
            let expr = `return new Translation(${JSON.stringify(value)}, "core:${path.join(
                "."
            )}.${key}")`
            if (subParts !== null) {
                // convert '{to_substitute}' into 'to_substitute'
                const types = Utils.Dedup(subParts.map((tp) => tp.substring(1, tp.length - 1)))
                const invalid = types.filter(
                    (part) => part.match(/^[a-z0-9A-Z_]+(\(.*\))?$/) == null
                )
                if (invalid.length > 0) {
                    throw `At ${path.join(
                        "."
                    )}: A subpart contains invalid characters: ${subParts.join(", ")}`
                }
                expr = `return new TypedTranslation<{ ${types.join(", ")} }>(${JSON.stringify(
                    value
                )}, "core:${path.join(".")}.${key}")`
            }

            values.push(`${spaces}get ${key}() { ${expr} }`)
        } else {
            values.push(
                spaces + key + ": " + transformTranslation(value, [...path, key], languageWhitelist)
            )
        }
    }
    return `{${values.join(",\n")}}`
}

function sortKeys(o: object): object {
    const keys = Object.keys(o)
    keys.sort()
    const nw = {}
    for (const key of keys) {
        const v = o[key]
        if (typeof v === "object") {
            nw[key] = sortKeys(v)
        } else {
            nw[key] = v
        }
    }
    return nw
}

function removeEmptyString(object: object) {
    for (const k in object) {
        if (object[k] === "") {
            delete object[k]
            continue
        }
        if (typeof object[k] === "object") {
            removeEmptyString(object[k])
        }
    }
    return object
}

/**
 * Formats the specified file, helps to prevent merge conflicts
 * */
function formatFile(path) {
    const original = readFileSync(path, "utf8")
    let contents = JSON.parse(original)
    contents = removeEmptyString(contents)
    contents = sortKeys(contents)
    const endsWithNewline = original.endsWith("\n")
    writeFileSync(path, JSON.stringify(contents, null, "    ") + (endsWithNewline ? "\n" : ""))
}

/**
 * Generates the big compiledTranslations file
 */
function genTranslations() {
    if (!fs.existsSync("./src/assets/generated/")) {
        fs.mkdirSync("./src/assets/generated/")
    }
    const translations = JSON.parse(
        fs.readFileSync("./src/assets/generated/translations.json", "utf-8")
    )
    const transformed = transformTranslation(translations)

    let module = `import {Translation, TypedTranslation} from "../../UI/i18n/Translation"\n\nexport default class CompiledTranslations {\n\n`
    module += " public static t = " + transformed
    module += "\n    }"

    fs.writeFileSync("./src/assets/generated/CompiledTranslations.ts", module)
}

/**
 * Reads 'lang/*.json', writes them into to 'assets/generated/translations.json'.
 * This is only for the core translations
 */
function compileTranslationsFromWeblate() {
    const translations = ScriptUtils.readDirRecSync("./langs", 1).filter(
        (path) => path.indexOf(".json") > 0
    )

    const allTranslations = new TranslationPart()

    allTranslations.validateStrict()

    for (const translationFile of translations) {
        try {
            const contents = JSON.parse(readFileSync(translationFile, "utf-8"))
            let language = translationFile.substring(translationFile.lastIndexOf("/") + 1)
            language = language.substring(0, language.length - 5)
            allTranslations.add(language, contents)
        } catch (e) {
            throw "Could not read file " + translationFile + " due to " + e
        }
    }

    writeFileSync(
        "./src/assets/generated/translations.json",
        JSON.stringify(JSON.parse(allTranslations.toJson()), null, "    ")
    )
}

/**
 * Get all the strings out of the layers; writes them onto the weblate paths
 * @param objects
 * @param target
 */
function generateTranslationsObjectFrom(
    objects: { path: string; parsed: { id: string } }[],
    target: string
): string[] {
    const tr = new TranslationPart()

    for (const layerFile of objects) {
        const config: { id: string } = layerFile.parsed
        const layerTr = new TranslationPart()
        if (config === undefined) {
            throw "Got something not parsed! Path is " + layerFile.path
        }
        layerTr.recursiveAdd(config, layerFile.path)
        tr.contents.set(config.id, layerTr)
    }

    const langs = tr.knownLanguages()
    for (const lang of langs) {
        if (lang === "#" || lang === "*") {
            // Lets not export our comments or non-translated stuff
            continue
        }
        let json = tr.toJson(lang)
        try {
            json = JSON.stringify(JSON.parse(json), null, "    ") // MUST BE FOUR SPACES
        } catch (e) {
            console.error(e)
        }

        writeFileSync(`langs/${target}/${lang}.json`, json)
    }
    return langs
}

/**
 * Merge two objects together
 * @param source: where the translations come from
 * @param target: the object in which the translations should be merged
 * @param language: the language code
 * @param context: context for error handling
 * @constructor
 */
function MergeTranslation(source: any, target: any, language: string, context: string = "") {
    let keyRemapping: Map<string, string> = undefined
    if (context.endsWith(".tagRenderings")) {
        keyRemapping = new Map<string, string>()
        for (const key in target) {
            keyRemapping.set(target[key].id ?? target[key].builtin, key)
        }
    }

    for (const key in source) {
        const sourceV = source[key]
        const targetV = target[keyRemapping?.get(key) ?? key]

        if (typeof sourceV === "string") {
            // Add the translation
            if (targetV === undefined) {
                if (typeof target === "string") {
                    throw (
                        `Trying to merge a translation for ${language} into a fixed string at ${context} for key ${key}`
                    )
                }
                target[key] = source[key]
                continue
            }

            if (targetV[language] === sourceV) {
                // Already the same
                continue
            }

            if (sourceV === "") {
                console.log("Ignoring empty string in the translations")
            }

            if (typeof targetV === "string") {
                throw `At context ${context}: Could not add a translation in language ${language}. The target object has a string at the given path, whereas the translation contains an object.\n    String at target: ${targetV}\n    Object at translation source: ${JSON.stringify(
                    sourceV
                )}`
            }

            targetV[language] = sourceV
            let was = ""
            if (targetV[language] !== undefined && targetV[language] !== sourceV) {
                was = " (overwritten " + targetV[language] + ")"
            }
            console.log("   + ", context + "." + language, "-->", sourceV, was)
            continue
        }
        if (typeof sourceV === "object") {
            if (targetV === undefined) {
                try {
                    target[language] = sourceV
                } catch (e) {
                    throw `At context${context}: Could not add a translation in language ${language} due to ${e}`
                }
            } else {
                MergeTranslation(sourceV, targetV, language, context + "." + key)
            }
            continue
        }
        throw "Case fallthrough"
    }
    return target
}

function mergeLayerTranslation(
    layerConfig: { id: string },
    path: string,
    translationFiles: Map<string, any>
) {
    const id = layerConfig.id
    translationFiles.forEach((translations, lang) => {
        const translationsForLayer = translations[id]
        MergeTranslation(translationsForLayer, layerConfig, lang, path + ":" + id)
    })
}

function loadTranslationFilesFrom(target: string): Map<string, any> {
    const translationFilePaths = ScriptUtils.readDirRecSync("./langs/" + target).filter((path) =>
        path.endsWith(".json")
    )

    const translationFiles = new Map<string, any>()
    for (const translationFilePath of translationFilePaths) {
        let language = translationFilePath.substr(translationFilePath.lastIndexOf("/") + 1)
        language = language.substr(0, language.length - 5)
        try {
            translationFiles.set(language, JSON.parse(readFileSync(translationFilePath, "utf8")))
        } catch (e) {
            console.error("Invalid JSON file or file does not exist", translationFilePath)
            throw e
        }
    }
    return translationFiles
}

/**
 * Load the translations from the weblate files back into the layers
 */
function mergeLayerTranslations(englishOnly: boolean = false) {
    const layerFiles = ScriptUtils.getLayerFiles()
    for (const layerFile of layerFiles) {
        mergeLayerTranslation(layerFile.parsed, layerFile.path, loadTranslationFilesFrom("layers"))
        const endsWithNewline =
            readFileSync(layerFile.path, { encoding: "utf8" })?.endsWith("\n") ?? true
        let config = layerFile.parsed
        if (englishOnly) {
            config = Utils.Clone(config)
            removeNonEnglishTranslations(config)
        }
        writeFileSync(
            layerFile.path,
            JSON.stringify(config, null, "  ") + (endsWithNewline ? "\n" : "")
        ) // layers use 2 spaces
    }
}

function removeNonEnglishTranslations(object: any) {
    Utils.WalkObject(
        object,
        (leaf: any) => {
            const en = leaf["en"]
            if (!en) {
                return
            }
            for (const key in leaf) {
                if (key.startsWith("#")) {
                    continue
                }
                delete leaf[key]
            }
            leaf["en"] = en
        },
        (possibleLeaf) =>
            possibleLeaf !== null && typeof possibleLeaf === "object" && isTranslation(possibleLeaf)
    )
}

/**
 * Load the translations into the theme files
 */
function mergeThemeTranslations(englishOnly: boolean = false) {
    const themeFiles = ScriptUtils.getThemeFiles()
    for (const themeFile of themeFiles) {
        let config = themeFile.parsed
        mergeLayerTranslation(config, themeFile.path, loadTranslationFilesFrom("themes"))

        const allTranslations = new TranslationPart()
        allTranslations.recursiveAdd(config, themeFile.path)
        const endsWithNewline =
            readFileSync(themeFile.path, { encoding: "utf8" })?.endsWith("\n") ?? true

        if (englishOnly) {
            config = Utils.Clone(config)
            removeNonEnglishTranslations(config)
        }

        writeFileSync(
            themeFile.path,
            JSON.stringify(config, null, "  ") + (endsWithNewline ? "\n" : "")
        ) // Themefiles use 2 spaces
    }
}

class GenerateTranslations extends Script {
    constructor() {
        super("Syncs translations from/to the theme and layer files")
    }

    /**
     * OUtputs the 'used_languages.json'-file
     */
    detectUsedLanguages() {
        {
            const l1 = generateTranslationsObjectFrom(ScriptUtils.getLayerFiles(), "layers")
            const l2 = generateTranslationsObjectFrom(
                ScriptUtils.getThemeFiles().filter(
                    (th) => th.parsed.mustHaveLanguage === undefined
                ),
                "themes"
            )

            const usedLanguages: string[] = Utils.Dedup(l1.concat(l2)).filter((v) => v !== "*")
            usedLanguages.sort()
            fs.writeFileSync(
                "./src/assets/used_languages.json",
                JSON.stringify({ languages: usedLanguages })
            )
        }
    }

    async main(args: string[]): Promise<void> {
        if (!existsSync("./langs/themes")) {
            mkdirSync("./langs/themes")
        }
        const themeOverwritesWeblate = args[0] === "--ignore-weblate"
        const englishOnly = args[0] === "--english-only"
        if (!themeOverwritesWeblate) {
            mergeLayerTranslations()
            mergeThemeTranslations()
            compileTranslationsFromWeblate()
        } else {
            console.log("Ignore weblate")
        }

        this.detectUsedLanguages()
        genTranslations()
        {
            const allTranslationFiles = ScriptUtils.readDirRecSync("langs").filter((path) =>
                path.endsWith(".json")
            )
            for (const path of allTranslationFiles) {
                formatFile(path)
            }
        }

        // Some validation
        TranslationPart.fromDirectory("./langs").validateStrict("./langs")
        TranslationPart.fromDirectory("./langs/layers").validateStrict("layers")
        TranslationPart.fromDirectory("./langs/themes").validateStrict("themes")

        if (englishOnly) {
            mergeLayerTranslations(true)
            mergeThemeTranslations(true)
        }

        console.log("All done!")
    }
}

new GenerateTranslations().run()
