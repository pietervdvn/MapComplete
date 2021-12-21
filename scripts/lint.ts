import ScriptUtils from "./ScriptUtils";
import {writeFileSync} from "fs";
import {FixLegacyTheme, UpdateLegacyLayer} from "../Models/ThemeConfig/LegacyJsonConvert";

/*
 * This script reads all theme and layer files and reformats them inplace
 * Use with caution, make a commit beforehand!
 */

const layerFiles = ScriptUtils.getLayerFiles();
for (const layerFile of layerFiles) {
    try {
        const state : any = undefined; // FIXME
        const fixed = new UpdateLegacyLayer().convertStrict(state,layerFile.parsed, "While linting "+layerFile.path);
        writeFileSync(layerFile.path, JSON.stringify(fixed, null, "  "))
    } catch (e) {
        console.error("COULD NOT LINT LAYER" + layerFile.path + ":\n\t" + e)
    }
}

const themeFiles = ScriptUtils.getThemeFiles()
for (const themeFile of themeFiles) {
    try {
        const state : any = undefined; // FIXME
        const fixed = new FixLegacyTheme().convertStrict(state,themeFile.parsed, "While linting "+themeFile.path);
        writeFileSync(themeFile.path, JSON.stringify(fixed, null, "  "))
    } catch (e) {
        console.error("COULD NOT LINT THEME" + themeFile.path + ":\n\t" + e)
    }
}
