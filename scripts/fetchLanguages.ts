/**
 * Fetches all 'modern languages' from wikidata, then exports their names in every language
 */

import * as wds from "wikidata-sdk"
import {Utils} from "../Utils";
import ScriptUtils from "./ScriptUtils";
import {existsSync, readFileSync, writeFileSync} from "fs";
import * as used_languages from "../assets/generated/used_languages.json"
const languageRemap = {
    // MapComplete (or weblate) on the left, language of wikimedia on the right
    "nb":"nb_NO",
    "zh-hant":"zh_Hant",
    "zh-hans":"zh_Hans",
    "pt-br":"pt_BR"
}

const usedLanguages : Set<string> = new Set(used_languages.languages)

async function fetch(target: string){
    const regular = await fetchRegularLanguages()
    writeFileSync(target, JSON.stringify(regular, null, "  "))
    console.log("Written to "+target)
}

async function fetchRegularLanguages() {

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
    const bindings = result.results.bindings
    
    const zh_hant = await fetchSpecial(18130932, "zh_Hant")
    const zh_hans = await fetchSpecial(13414913, "zh_Hant")
    const pt_br = await fetchSpecial( 750553, "pt_BR")
    
    bindings.push(...zh_hant)
    bindings.push(...zh_hans)
    bindings.push(...pt_br)
    
    return result.results.bindings

}

async function fetchSpecial(id: number, code: string) {

    ScriptUtils.fixUtils()
    console.log("Fetching languages")

    const sparql = 'SELECT ?lang ?label ?code \n' +
        'WHERE \n' +
        '{ \n' +
        '  wd:Q'+id+' rdfs:label ?label. \n' +
        '} '
    const url = wds.sparqlQuery(sparql)

// request the generated URL with your favorite HTTP request library
    const result = await Utils.downloadJson(url, {"User-Agent": "MapComplete script"})
    const bindings = result.results.bindings
    bindings.forEach(binding => binding["code"] = {value: code})
    return bindings
}

function extract(data){
    console.log("Got "+data.length+" entries")
    const perId = new Map<string, Map<string, string>>();
    for (const element of data) {
        let id = element.code.value
        id = languageRemap[id] ?? id
        let labelLang = element.label["xml:lang"]
        labelLang = languageRemap[labelLang] ?? labelLang
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
        if(!usedLanguages.has(key)){
            return
        }
        native[key] = translations.get(key)
    })
    return native
}

async function main(wipeCache = false){
    const cacheFile = "./assets/generated/languages-wd.json"
    if(wipeCache || !existsSync(cacheFile)){
        console.log("Refreshing cache")
        await fetch(cacheFile);
    }else{
        console.log("Reusing the cached file")
    }
    const data = JSON.parse(readFileSync( cacheFile, "UTF8"))
    const perId = extract(data)
    const nativeList = getNativeList(perId)
    writeFileSync("./assets/language_native.json", JSON.stringify(nativeList, null, "  "))
    

    const translations = Utils.MapToObj<Map<string, string>>(perId, (value, key) => {
        if(!usedLanguages.has(key)){
            return undefined // Remove unused languages
        }
        return Utils.MapToObj(value, (v, k ) => {
            if(!usedLanguages.has(k)){
                return undefined
            }
            return v
        })
    })
    
    writeFileSync("./assets/language_translations.json", 
        JSON.stringify(translations, null, "  "))
}

const forceRefresh = process.argv[2] === "--force-refresh"
main(forceRefresh).then(() => console.log("Done!"))