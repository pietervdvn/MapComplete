/**
 * Fetches all 'modern languages' from wikidata, then exports their names in every language
 */

import * as wds from "wikidata-sdk"
import {Utils} from "../Utils";
import ScriptUtils from "./ScriptUtils";
import {existsSync, readFileSync, writeFileSync} from "fs";
import * as knownLanguages from "../assets/generated/used_languages.json"

async function fetch(target: string) {

    ScriptUtils.fixUtils()
    console.log("Fetching languages")

    const sparql = 'SELECT ?lang ?label ?code \n' +
        'WHERE \n' +
        '{ \n' +
        '  ?lang wdt:P31 wd:Q1288568. \n' + // language instanceOf (p31) modern language(Q1288568)
        '  ?lang rdfs:label ?label. \n' +
        '  ?lang wdt:P424 ?code' + // Wikimedia language code seems to be close to the weblate entries
        '} ' 
    const url = wds.sparqlQuery(sparql)

// request the generated URL with your favorite HTTP request library
    const result = await Utils.downloadJson(url, {"User-Agent": "MapComplete script"})
    writeFileSync(target, JSON.stringify(result.results.bindings))
    console.log("Written to "+target)
}

function extract(data){
    console.log("Got "+data.length+" entries")
    const perId = new Map<string, Map<string, string>>();
    for (const element of data) {
        //const id = element.lang.value.substring(prefixL)
        const id = element.code.value
        const labelLang = element.label["xml:lang"]
        const value = element.label.value
        if(!perId.has(id)){
            perId.set(id, new Map<string, string>())
        }
        perId.get(id).set(labelLang, value)
    }
    console.log("Got "+perId.size+" languages")
    return perId
}

function getNativeList(langs: Map<string, Map<string, string>>){
    const native = {}
    langs.forEach((translations, key ) =>{
        native[key] = translations.get(key)
    })
    return native
}

function getTranslationsIn(targetLanguage: string, perId: Map<string, Map<string, string>>, whitelist = undefined){
    const langs = {}
    perId.forEach((translations, langCode) => {
        if(whitelist !== undefined && whitelist.indexOf(langCode) < 0){
            return
        }
        langs[langCode] = translations.get(targetLanguage)
    })
    return langs;
}

function main(wipeCache = false){
    const cacheFile = "./assets/generated/languages-wd.json"
    if(wipeCache || !existsSync(cacheFile)){
       // await fetch(cacheFile);
    }else{
        console.log("Reusing the cached file")
    }
    const data = JSON.parse(readFileSync( cacheFile, "UTF8"))
    const perId = extract(data)
    const nativeList = getNativeList(perId)
    writeFileSync("./assets/language_native.json", JSON.stringify(nativeList))
    

    writeFileSync("./assets/language_translations.json", 
        JSON.stringify(Utils.MapToObj<Map<string, string>>(perId, value => Utils.MapToObj(value)), null, "  "))
}


main()//.then(() => console.log("Done!"))