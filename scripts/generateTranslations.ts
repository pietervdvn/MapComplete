import * as fs from "fs";
import {Utils} from "../Utils";

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
        values += (Utils.Times((_) => "  ", depth)) + key + ": " + transformTranslation(obj[key], depth + 1) + ",\n"
    }
    return `{${values}}`;

}

function genTranslations() {
    const translations = JSON.parse(fs.readFileSync("./assets/translations.json", "utf-8"))
    const transformed = transformTranslation(translations);

    let module = `import {Translation} from "./UI/i18n/Translation"\n\nexport default class AllTranslationAssets {\n\n`;
    module += " public static t = " + transformed;
    module += "}"

    fs.writeFileSync("AllTranslationAssets.ts", module);


}

genTranslations()