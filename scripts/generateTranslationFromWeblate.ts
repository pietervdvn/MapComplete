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

const translations = ScriptUtils.readDirRecSync("./langs")
    .filter(path => path.indexOf(".json") > 0)

const allTranslations = new TranslationPart()

for (const translationFile of translations) {
    const contents = JSON.parse(readFileSync(translationFile, "utf-8"));
    let language = translationFile.substring(translationFile.lastIndexOf("/") + 1)
    language = language.substring(0, language.length-5)
    allTranslations.add(language, contents)
}

writeFileSync("./assets/translations.json", allTranslations.toJson())