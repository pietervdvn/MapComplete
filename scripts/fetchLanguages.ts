/**
 * Fetches all 'modern languages' from wikidata, then exports their names in every language
 */

import * as wds from "wikidata-sdk"
import {Utils} from "../Utils";
import ScriptUtils from "./ScriptUtils";
import {existsSync, readFileSync, writeFileSync} from "fs";
import * as used_languages from "../assets/generated/used_languages.json"
import {QuestionableTagRenderingConfigJson} from "../Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson";
import {LayerConfigJson} from "../Models/ThemeConfig/Json/LayerConfigJson";

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
    const fil = await fetchSpecial( 33298, "fil")

    bindings.push(...zh_hant)
    bindings.push(...zh_hans)
    bindings.push(...pt_br)
    bindings.push(...fil)
    
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
    const keys: string[] = Array.from(langs.keys())
    keys.sort()
    for (const key of keys) {
        const translations: Map<string, string> = langs.get(key)
        if(!usedLanguages.has(key)){
            continue
        }
        native[key] = translations.get(key)
    }
    return native
}

async function getOfficialLanguagesPerCountry() : Promise<Map<string, string[]>>{
    const lngs = new Map<string, string[]>();
    const sparql = `SELECT ?country ?countryLabel ?countryCode ?language ?languageCode ?languageLabel
    WHERE
    {
            ?country wdt:P31/wdt:P279* wd:Q3624078;
        wdt:P297 ?countryCode;
        wdt:P37 ?language.
            ?language wdt:P218 ?languageCode.
            SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }`
    const url = wds.sparqlQuery(sparql)

    const result = await Utils.downloadJson(url, {"User-Agent": "MapComplete script"})
    const bindings : {countryCode: {value: string}, languageCode: {value: string}}[]= result.results.bindings
    for (const binding of bindings) {
        const countryCode = binding.countryCode.value
        const language = binding.languageCode.value
        if(lngs.get(countryCode) === undefined){
            lngs.set(countryCode, [])
        }
        lngs.get(countryCode).push(language)
    }
    return lngs;
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
    

    const translations = Utils.MapToObj(perId, (value, key) => {
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
    
    
    let officialLanguages : Record<string, string[]>;
    const officialLanguagesPath = "./assets/language_in_country.json"
    if(existsSync("./assets/languages_in_country.json") && !wipeCache){
        officialLanguages = JSON.parse(readFileSync(officialLanguagesPath, "utf8"))
    }else {
        officialLanguages = Utils.MapToObj(await getOfficialLanguagesPerCountry(), t => t)
        writeFileSync(officialLanguagesPath, JSON.stringify(officialLanguages, null, "  "))
    }
    
    const perLanguage = Utils.TransposeMap(officialLanguages);
    console.log(JSON.stringify(perLanguage, null, " "))
    const mappings: {if: string, then: Record<string, string>, hideInAnswer: string}[] = []
    for (const language of Object.keys(perLanguage)) {
        const countries = Utils.Dedup(perLanguage[language].map(c => c.toLowerCase()))
        mappings.push({
            if: "language="+language,
            then: translations[language],
            hideInAnswer : "_country="+countries.join("|")
        })
    }
    
    const tagRenderings =  <QuestionableTagRenderingConfigJson> {
        id: "official-language",
        mappings,
        question: "What languages are spoken here?"
    }
    
    writeFileSync("./assets/layers/language/language.json", JSON.stringify(<LayerConfigJson>{
        id:"language",
        description: "Various tagRenderings to help language tooling",
        tagRenderings
    }, null, "  "))
    
}

const forceRefresh = process.argv[2] === "--force-refresh"
ScriptUtils.fixUtils()
main(forceRefresh).then(() => console.log("Done!"))

