import * as fs from "fs";
import {Utils} from "../Utils";
import ScriptUtils from "./ScriptUtils";
import {readFileSync, writeFileSync} from "fs";
import LayerConfig from "../Customizations/JSON/LayerConfig";
import {LayerConfigJson} from "../Customizations/JSON/LayerConfigJson";
import * as bookcases from "../assets/layers/public_bookcase/public_bookcase.json"
import LayerOverviewUtils from "./generateLayerOverview";

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

    isLeaf() {
        for (let key of Array.from(this.contents.keys())) {
            const value = this.contents.get(key);
            if (typeof value !== "string") {
                return false;
            }
        }
        return true;
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
                if(neededLanguage === undefined){
                    parts.push(`\"${key}\": \"${value}\"`)
                }else if (key === neededLanguage){
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
    const translations = ScriptUtils.readDirRecSync("./langs")
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

function generateTranslationFromLayerConfig(layerConfig: LayerConfigJson): TranslationPart {
    const tr = new TranslationPart();
    tr.recursiveAdd(layerConfig)
    return tr;
}

function generateLayerTranslationsObject() {
    const layerFiles = new LayerOverviewUtils().getLayerFiles();

    const tr = new TranslationPart();

    for (const layerFile of layerFiles) {
        const config: LayerConfigJson = layerFile.parsed;
        const layerTr = generateTranslationFromLayerConfig(config)
        tr.contents.set(config.id, layerTr)
    }

    const langs = tr.knownLanguages();
    for (const lang of langs) {
        console.log("Exporting ", lang)
        
        let json = tr.toJson(lang)
        try{
            json = JSON.stringify(JSON.parse(json), null, "    ");
        }catch (e) {
            console.error(e)
        }
        
        writeFileSync("langs/layers/" + lang + ".json", json)
    }
}


generateLayerTranslationsObject()

compileTranslationsFromWeblate();
genTranslations()