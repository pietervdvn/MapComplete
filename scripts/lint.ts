import ScriptUtils from "./ScriptUtils"
import { writeFileSync } from "fs"
import {
    FixLegacyTheme,
    UpdateLegacyLayer,
} from "../src/Models/ThemeConfig/Conversion/LegacyJsonConvert"
import Translations from "../src/UI/i18n/Translations"
import { Translation } from "../src/UI/i18n/Translation"
import { LayerConfigJson } from "../src/Models/ThemeConfig/Json/LayerConfigJson"
import themeconfig from "../src/assets/schemas/layoutconfigmeta.json"
import layerconfig from "../src/assets/schemas/layerconfigmeta.json"

import { Utils } from "../src/Utils"
import { ConfigMeta } from "../src/UI/Studio/configMeta"
import { ConversionContext } from "../src/Models/ThemeConfig/Conversion/ConversionContext"

/*
 * This script reads all theme and layer files and reformats them inplace
 * Use with caution, make a commit beforehand!
 */
const themeAttributesOrder = Utils.Dedup(
    (<ConfigMeta[]>themeconfig).filter((c) => c.path.length === 1).map((c) => c.path[0])
)
const layerAttributesOrder = Utils.Dedup(
    (<ConfigMeta[]>layerconfig).filter((c) => c.path.length === 1).map((c) => c.path[0])
)
const t: Translation = Translations.t.general.add.addNew
t.OnEveryLanguage((txt, ln) => {
    console.log(ln, txt)
    return txt
})

const articles = {
    /*  de: "eine",
    es: 'una',
    fr: 'une',
    it: 'una',
    nb_NO: 'en',
    nl: 'een',
    pt: 'uma',
    pt_BR : 'uma',//*/
}

function reorder(object: object, order: string[]) {
    const allKeys = new Set<string>(Object.keys(object))
    const copy = {}
    for (const key of order) {
        copy[key] = object[key]
        allKeys.delete(key)
    }
    for (const key of allKeys) {
        copy[key] = object[key]
    }
    return copy
}

function addArticleToPresets(layerConfig: { presets?: { title: any }[] }) {
    /*
    if(layerConfig.presets === undefined){
        return
    }
    for (const preset of layerConfig.presets) {
        preset.title = new Translation(preset.title, "autofix")
            .OnEveryLanguage((txt, lang) => {
                let article = articles[lang]
                if(lang === "en"){
                   if(["a","e","u","o","i"].some(vowel => txt.toLowerCase().startsWith(vowel))) {
                        article = "an"
                   }else{
                       article = "a"
                   }
                }
                if(article === undefined){
                    return txt;
                }
                if(txt.startsWith(article+" ")){
                    return txt;
                }
                if(txt.startsWith("an ")){
                    return txt;
                }
                return article +" " +  txt.toLowerCase();
            })
            .translations
    }
    //*/
}

const layerFiles = ScriptUtils.getLayerFiles()
for (const layerFile of layerFiles) {
    try {
        const fixed = <LayerConfigJson>(
            new UpdateLegacyLayer().convertStrict(
                layerFile.parsed,
                ConversionContext.construct([layerFile.path.split("/").at(-1)], ["update legacy"])
            )
        )
        addArticleToPresets(fixed)
        const reordered = reorder(fixed, layerAttributesOrder)
        writeFileSync(layerFile.path, JSON.stringify(reordered, null, "  ") + "\n")
    } catch (e) {
        console.error("COULD NOT LINT LAYER" + layerFile.path + ":\n\t" + e)
    }
}

const themeFiles = ScriptUtils.getThemeFiles()
for (const themeFile of themeFiles) {
    try {
        const fixed = new FixLegacyTheme().convertStrict(
            themeFile.parsed,
            ConversionContext.construct([themeFile.path.split("/").at(-1)], ["update legacy layer"])
        )
        for (const layer of fixed.layers) {
            if (layer["presets"] !== undefined) {
                addArticleToPresets(<any>layer)
            }
        }
        // extractInlineLayer(fixed)
        const endsWithNewline = themeFile.raw.at(-1) === "\n"
        const ordered = reorder(fixed, themeAttributesOrder)
        writeFileSync(
            themeFile.path,
            JSON.stringify(ordered, null, "  ") + (endsWithNewline ? "\n" : "")
        )
    } catch (e) {
        console.error("COULD NOT LINT THEME" + themeFile.path + ":\n\t" + e)
    }
}
