/***
 * Parses presets from the iD repository and extracts some usefull tags from them
 */
import {TagRenderingConfigJson} from "../Models/ThemeConfig/Json/TagRenderingConfigJson";
import ScriptUtils from "./ScriptUtils";
import {existsSync, readFileSync, writeFileSync} from "fs";
import {TagsFilter} from "../Logic/Tags/TagsFilter";
import * as known_languages from "../assets/language_native.json"
import {LayerConfigJson} from "../Models/ThemeConfig/Json/LayerConfigJson";
import {QuestionableTagRenderingConfigJson} from "../Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson";
import SmallLicense from "../Models/smallLicense";
import {icon} from "leaflet";

interface IconThief {
    steal(iconName: string): boolean
}

interface IdPreset {
    icon: string,
    geometry: ("point" | "line" | "area")[]
    /**
     * Extra search terms
     */
    terms: string []
    tags: Record<string, string>
    name: string,
    searchable?: false,
}

class MakiThief implements IconThief{
    private readonly _directory: string;
    private readonly _targetDir: string;
    
    constructor(directory: string, targetDir: string) {
        this._directory = directory;
        this._targetDir = targetDir;
    }
    
    public steal(iconName: string): boolean{
        const target = this._targetDir+iconName+".svg"
        if(existsSync(target)){
           // return true
        }
        const file = readFileSync(this._directory+"/icons/"+iconName+".svg", "utf8")
        writeFileSync(target, file,'utf8')
        writeFileSync(target+".license_info.json",
            JSON.stringify(<SmallLicense>{
                authors:['Maki icon set'],
                license: 'CC0',
                path: 'maki-'+iconName+".svg",
                sources: ["https://github.com/mapbox/maki"]
            }), 'utf8')
        console.log("Successfully stolen "+iconName)
        return true
    }
    
}

class AggregateIconThief implements IconThief{
    private readonly _maki: MakiThief;
    
    constructor(maki: MakiThief) {
        this._maki = maki;
    }
    
    
    public steal(iconName: string): boolean{
        if(iconName.startsWith('maki-')){
            this._maki.steal(iconName.substr('maki-'.length))
            return true
        }
        return false
    }
}


class IdThief {
    private readonly _idPresetsRepository: string;

    private readonly _tranlationFiles: Record<string, object> = {}
    private readonly _knownLanguages: string[]
    private readonly _iconThief: IconThief;

    public constructor(idPresetsRepository: string, iconThief: IconThief) {
        this._idPresetsRepository = idPresetsRepository;
        this._iconThief = iconThief;
        const knownById = ScriptUtils.readDirRecSync(`${this._idPresetsRepository}/dist/translations/`)
            .map(pth => pth.substring(pth.lastIndexOf('/') + 1, pth.length - '.json'.length))
            .filter(lng => !lng.endsWith('.min'));
        const missing = Object.keys(known_languages).filter(lng => knownById.indexOf(lng.replace('-','_')) < 0)
        this._knownLanguages = knownById.filter(lng => known_languages[lng] !== undefined)
        console.log("Id knows following languages:", this._knownLanguages.join(", "), "missing:", missing)
    }

    public getTranslation(language: string, ...path: string[]) {
        let obj = this.loadTranslationFile(language)[language]
        for (const p of path) {
            obj = obj[p]
            if (obj === undefined) {
                return undefined;
            }
        }
        return obj
    }


    /**
     * Creates a tagRenderingConfigJson for the 'shop' theme
     */
    public readShopPresets(): {if, then, hideInAnswer?: string | boolean}[] {

        const dir = this._idPresetsRepository + "/data/presets/shop"

        const mappings:
            {
                if: string | {and: string[]},
                then: Record<string, string>,
                hideInAnswer?: string | boolean
                icon?:  {
                    
                    path: string,
                    /**
                     * Size of the image
                     */
                    class: "small" | "medium" | "large" | string
                }
            }[] = []
        const files = ScriptUtils.readDirRecSync(dir, 1);
        for (const file of files) {
            const name = file.substring(file.lastIndexOf('/')+1, file.length - '.json'.length)
            const preset = <IdPreset>JSON.parse(readFileSync(file, 'utf8'))

            if(preset.searchable === false){
                continue
            }
            
            console.log(`     ${name} (shop=${preset.tags["shop"]}), ${preset.icon}` )
            
            const thenClause : Record<string, string> = {
                en: preset.name
            }
            for (const lng of this._knownLanguages) {
                const tr = this.getTranslation(lng, "presets", "presets", "shop/"+name, "name")
                if(tr === undefined){
                    continue
                }
                thenClause[lng.replace('-','_')] = tr
            }
            
            let tag : string | {and: string[]}
            const tagKeys = Object.keys(preset.tags)
            if(tagKeys.length === 1){
                tag = tagKeys[0]+"="+preset.tags[tagKeys[0]]
            }else{
                tag = {
                    and: tagKeys.map(key => key+"="+preset.tags[key])
                }
            }
            const mapping = {
                if: tag,
                then: thenClause
            }
            if(preset.tags["shop"] == "yes"){
                mapping["hideInAnswer"] = true
                mapping.if["en"] = "Unspecified shop"
            }
            
            if(this._iconThief.steal(preset.icon)){
                mapping["icon"] = {
                    path: "./assets/layers/shops/"+preset.icon+".svg",
                    size: "medium"
                }
            }
            
            mappings.push(mapping)
           
        }

        return mappings
    }

    private loadTranslationFile(language: string): object {
        const cached = this._tranlationFiles[language]
        if (cached) {
            return cached
        }
        return this._tranlationFiles[language] = JSON.parse(readFileSync(`${this._idPresetsRepository}/dist/translations/${language}.json`, 'utf8'))
    }

}

const targetDir = "./assets/layers/shops/"
const iconThief = new AggregateIconThief(
    new MakiThief('../maki', targetDir+"maki-")
)

const shopOptions = new IdThief("../id-tagging-schema/",iconThief ).readShopPresets()

const shopLayerPath =targetDir+"shops.json"
const shopLayer = <LayerConfigJson> JSON.parse(readFileSync(shopLayerPath,'utf8'))
const type = <QuestionableTagRenderingConfigJson> shopLayer.tagRenderings.find(tr => tr["id"] == "shops-type-from-id")
type.mappings = shopOptions
writeFileSync(shopLayerPath, JSON.stringify(shopLayer, null, "  "),'utf8')