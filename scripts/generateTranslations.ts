import * as fs from "fs";
import {readFileSync, writeFileSync} from "fs";
import {Utils} from "../Utils";
import ScriptUtils from "./ScriptUtils";
import {LayerConfigJson} from "../Customizations/JSON/LayerConfigJson";

const knownLanguages = ["en", "nl", "de", "fr", "es", "gl", "ca"];

class TranslationPart {

    contents: Map<string, TranslationPart | string> = new Map<string, TranslationPart | string>()

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
        for (const translationsKey in translations) {
            if (!translations.hasOwnProperty(translationsKey)) {
                continue;
            }
            const v = translations[translationsKey]
            if (typeof (v) != "string") {
                console.error("Non-string object in translation: ", translations[translationsKey])
                throw "Error in an object depicting a translation: a non-string object was found. (" + context + ")\n    You probably put some other section accidentally in the translation"
            }
            this.contents.set(translationsKey, v)
        }
    }

    recursiveAdd(object: any) {


        const isProbablyTranslationObject = knownLanguages.map(l => object.hasOwnProperty(l)).filter(x => x).length > 0;
        if (isProbablyTranslationObject) {
            this.addTranslationObject(object)
            return;
        }

        for (const key in object) {
            if (!object.hasOwnProperty(key)) {
                continue;
            }

            const v = object[key]
            if (v == null) {
                console.warn("Got a null value for key ", key)
                continue
            }

            if (typeof v !== "object") {
                continue;
            }

            if (!this.contents.get(key)) {
                this.contents.set(key, new TranslationPart())
            }

            (this.contents.get(key) as TranslationPart).recursiveAdd(v);
        }
    }

    knownLanguages(): string[] {
        const languages = []
        for (let key of Array.from(this.contents.keys())) {
            const value = this.contents.get(key);

            if (typeof value === "string") {
                if (key === "#") {
                    continue;
                }
                languages.push(key)
            } else {
                languages.push(...(value as TranslationPart).knownLanguages())
            }
        }
        return Utils.Dedup(languages);
    }

    toJson(neededLanguage?: string): string {
        const parts = []

        for (let key of Array.from(this.contents.keys())) {
            let value = this.contents.get(key);

            if (typeof value === "string") {
                value = value.replace(/"/g, "\\\"")
                    .replace(/\n/g, "\\n")
                if (neededLanguage === undefined) {
                    parts.push(`\"${key}\": \"${value}\"`)
                } else if (key === neededLanguage) {
                    return `"${value}"`
                }

            } else {
                const sub = (value as TranslationPart).toJson(neededLanguage)
                if (sub !== "") {
                    parts.push(`\"${key}\": ${sub}`);
                }

            }
        }
        if (parts.length === 0) {
            return "";
        }
        return `{${parts.join(",")}}`;
    }
}


function isTranslation(tr: any): boolean {
    for (const key in tr) {
        if (typeof tr[key] !== "string") {
            return false;
        }
    }
    return true;
}

function transformTranslation(obj: any, depth = 1) {

    if (isTranslation(obj)) {
        return `new Translation( ${JSON.stringify(obj)} )`
    }

    let values = ""
    for (const key in obj) {
        if (key === "#") {
            continue;
        }
        if (key.match("^[a-zA-Z0-9_]*$") === null) {
            throw "Invalid character in key: " + key
        }
        values += (Utils.Times((_) => "  ", depth)) + key + ": " + transformTranslation(obj[key], depth + 1) + ",\n"
    }
    return `{${values}}`;

}

function genTranslations() {
    const translations = JSON.parse(fs.readFileSync("./assets/generated/translations.json", "utf-8"))
    const transformed = transformTranslation(translations);

    let module = `import {Translation} from "../../UI/i18n/Translation"\n\nexport default class CompiledTranslations {\n\n`;
    module += " public static t = " + transformed;
    module += "}"

    fs.writeFileSync("./assets/generated/CompiledTranslations.ts", module);


}

// Read 'lang/*.json', writes to 'assets/generated/translations.json'
function compileTranslationsFromWeblate() {
    const translations = ScriptUtils.readDirRecSync("./langs", 1)
        .filter(path => path.indexOf(".json") > 0)

    const allTranslations = new TranslationPart()

    for (const translationFile of translations) {
        const contents = JSON.parse(readFileSync(translationFile, "utf-8"));
        let language = translationFile.substring(translationFile.lastIndexOf("/") + 1)
        language = language.substring(0, language.length - 5)
        allTranslations.add(language, contents)
    }

    writeFileSync("./assets/generated/translations.json", JSON.stringify(JSON.parse(allTranslations.toJson()), null, "    "))

}

// Get all the strings out of the layers; writes them onto the weblate paths
function generateTranslationsObjectFrom(objects: { path: string, parsed: { id: string } }[], target: string) {
    const tr = new TranslationPart();

    for (const layerFile of objects) {
        const config: { id: string } = layerFile.parsed;
        const layerTr = new TranslationPart();
        if (config === undefined) {
            throw "Got something not parsed! Path is " + layerFile.path
        }
        layerTr.recursiveAdd(config)
        tr.contents.set(config.id, layerTr)
    }

    const langs = tr.knownLanguages();
    for (const lang of langs) {
        if (lang === "#") {
            // Lets not export our comments
            continue;
        }
        let json = tr.toJson(lang)
        try {
            json = JSON.stringify(JSON.parse(json), null, "    ");
        } catch (e) {
            console.error(e)
        }

        writeFileSync(`langs/${target}/${lang}.json`, json)
    }
}

function MergeTranslation(source: any, target: any, language: string, context: string = "") {
    for (const key in source) {
        if (!source.hasOwnProperty(key)) {
            continue
        }
        const sourceV = source[key];
        const targetV = target[key]
        if (typeof sourceV === "string") {
            if (targetV[language] === sourceV) {
                // Already the same
                continue;
            }

            if (typeof targetV === "string") {
                console.error("Could not add a translation to string ", targetV, ". The translation is", sourceV, " in " + context)
                continue;
            }

            targetV[language] = sourceV;
            let was = ""
            if (targetV[language] !== undefined && targetV[language] !== sourceV) {
                was = " (overwritten " + targetV[language] + ")"
            }
            console.log("   + ", context + "." + language, "-->", sourceV, was)
            continue
        }
        if (typeof sourceV === "object") {
            if (targetV === undefined) {
                throw "MergingTranslations failed: source object has a path that does not exist anymore in the target: " + context
            } else {
                MergeTranslation(sourceV, targetV, language, context + "." + key);
            }
            continue;
        }
        throw "Case fallthrough"

    }
    return target;
}

function mergeLayerTranslation(layerConfig: { id: string }, path: string, translationFiles: Map<string, any>) {
    const id = layerConfig.id;
    translationFiles.forEach((translations, lang) => {
        const translationsForLayer = translations[id]
        MergeTranslation(translationsForLayer, layerConfig, lang, id)
    })

}

function loadTranslationFilesFrom(target: string): Map<string, any> {
    const translationFilePaths = ScriptUtils.readDirRecSync("./langs/" + target)
        .filter(path => path.endsWith(".json"))

    const translationFiles = new Map<string, any>();
    for (const translationFilePath of translationFilePaths) {
        let language = translationFilePath.substr(translationFilePath.lastIndexOf("/") + 1)
        language = language.substr(0, language.length - 5)
        translationFiles.set(language, JSON.parse(readFileSync(translationFilePath, "utf8")))
    }
    return translationFiles;
}

/**
 * Load the translations from the weblate files back into the layers
 */
function mergeLayerTranslations() {

    const layerFiles = ScriptUtils.getLayerFiles();
    for (const layerFile of layerFiles) {
        mergeLayerTranslation(layerFile.parsed, layerFile.path, loadTranslationFilesFrom("layers"))
        writeFileSync(layerFile.path, JSON.stringify(layerFile.parsed, null, "  "))
    }
}

function mergeThemeTranslations() {
    const themeFiles = ScriptUtils.getThemeFiles();
    for (const themeFile of themeFiles) {
        const config = themeFile.parsed;
        mergeLayerTranslation(config, themeFile.path, loadTranslationFilesFrom("themes"))

        const oldLanguages = config.language;
        const allTranslations = new TranslationPart();
        allTranslations.recursiveAdd(config)
        const newLanguages = allTranslations.knownLanguages()
        const languageDiff = newLanguages.filter(l => oldLanguages.indexOf(l) < 0).join(", ")
        if (languageDiff !== "") {
            config.language = newLanguages;
            console.log(" :hooray: Got a new language for theme", config.id, ":", languageDiff)
        }
        writeFileSync(themeFile.path, JSON.stringify(config, null, "  "))
    }
}


const themeOverwritesWeblate = process.argv[2] === "--ignore-weblate"
const questionsPath = "assets/tagRenderings/questions.json"
const questionsParsed = JSON.parse(readFileSync(questionsPath, 'utf8'))
if (!themeOverwritesWeblate) {
    mergeLayerTranslations();
    mergeThemeTranslations();

    mergeLayerTranslation(questionsParsed, questionsPath, loadTranslationFilesFrom("shared-questions"))
    writeFileSync(questionsPath, JSON.stringify(questionsParsed, null, "  "))

} else {
    console.log("Ignore weblate")
}
generateTranslationsObjectFrom(ScriptUtils.getLayerFiles(), "layers")
generateTranslationsObjectFrom(ScriptUtils.getThemeFiles(), "themes")


generateTranslationsObjectFrom([{path: questionsPath, parsed: questionsParsed}], "shared-questions")

if (!themeOverwritesWeblate) {
// Generates the core translations
    compileTranslationsFromWeblate();
}
genTranslations()