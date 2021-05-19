import * as fs from "fs";
import {Utils} from "../Utils";
import ScriptUtils from "./ScriptUtils";
import {readFileSync, writeFileSync} from "fs";

class TranslationPart {

    contents: Map<string, TranslationPart | string> = new Map<string, TranslationPart | string>()

    add(language: string, obj: any){
        for (const key in obj) {
            const v = obj[key]
            if(!this.contents.has(key)){
                this.contents.set(key, new TranslationPart())
            }
            const subpart = this.contents.get(key) as TranslationPart

            if(typeof v === "string"){
                subpart.contents.set(language, v)
            }else{
                subpart.add(language, v)
            }

        }
    }

    toJson(): string{
        const parts = []
        for (let key of Array.from(this.contents.keys()) ){
            const value = this.contents.get(key);

            if(typeof  value === "string"){
                parts.push(`\"${key}\": \"${value}\"`)
            }else{
                parts.push(`\"${key}\": ${(value as TranslationPart).toJson()}`);
            }
        }
        return JSON.stringify(JSON.parse(`{${parts.join(",")}}`), null, "    ");
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
        if(key === "#"){
            continue;
        }
        if(key.match("^[a-zA-Z0-9_]*$") === null){
            throw "Invalid character in key: "+key
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
function compileTranslationsFromWeblate(){
    const translations = ScriptUtils.readDirRecSync("./langs")
        .filter(path => path.indexOf(".json") > 0)

    const allTranslations = new TranslationPart()

    for (const translationFile of translations) {
        const contents = JSON.parse(readFileSync(translationFile, "utf-8"));
        let language = translationFile.substring(translationFile.lastIndexOf("/") + 1)
        language = language.substring(0, language.length-5)
        allTranslations.add(language, contents)
    }

    writeFileSync("./assets/generated/translations.json", allTranslations.toJson())

}

compileTranslationsFromWeblate();
genTranslations()