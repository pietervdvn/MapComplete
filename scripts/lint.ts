import ScriptUtils from "./ScriptUtils";
import {writeFileSync} from "fs";
import {FixLegacyTheme, UpdateLegacyLayer} from "../Models/ThemeConfig/Conversion/LegacyJsonConvert";
import Translations from "../UI/i18n/Translations";
import {Translation} from "../UI/i18n/Translation";
import {LayerConfigJson} from "../Models/ThemeConfig/Json/LayerConfigJson";

/*
 * This script reads all theme and layer files and reformats them inplace
 * Use with caution, make a commit beforehand!
 */

const t : Translation = Translations.t.general.add.addNew
t.OnEveryLanguage((txt, ln) => {
    console.log(ln, txt)
    return txt
})

const articles = {
    de: "eine",
    es: 'una',
    fr: 'une',
    it: 'una',
    nb_NO: 'en',
    nl: 'een',
    pt: 'uma',
    pt_BR : 'uma',
}

function addArticleToPresets(layerConfig: {presets?: {title: any}[]}){
    /*
    if(layerConfig.presets === undefined){
        return 
    }
    for (const preset of layerConfig.presets) {
        preset.title = new Translation(preset.title, "autofix")
            .OnEveryLanguage((txt, lang) => {
                const article = articles[lang]
                if(article === undefined){
                    return txt;
                }
                if(txt.startsWith(article)){
                    return txt;
                }
                return article +" " +  txt.toLowerCase();
            })
            .translations
    }
    //*/
}

const layerFiles = ScriptUtils.getLayerFiles();
for (const layerFile of layerFiles) {
    try {
        const fixed =<LayerConfigJson> new UpdateLegacyLayer().convertStrict(layerFile.parsed, "While linting " + layerFile.path);
       addArticleToPresets(fixed)
        writeFileSync(layerFile.path, JSON.stringify(fixed, null, "  "))
    } catch (e) {
        console.error("COULD NOT LINT LAYER" + layerFile.path + ":\n\t" + e)
    }
}

const themeFiles = ScriptUtils.getThemeFiles()
for (const themeFile of themeFiles) {
    try {
        const fixed = new FixLegacyTheme().convertStrict(themeFile.parsed, "While linting " + themeFile.path);
        for (const layer of fixed.layers) {
            if(layer["presets"] !== undefined){
                addArticleToPresets(<any> layer)
            }
        }
        
        writeFileSync(themeFile.path, JSON.stringify(fixed, null, "  "))
    } catch (e) {
        console.error("COULD NOT LINT THEME" + themeFile.path + ":\n\t" + e)
    }
}
