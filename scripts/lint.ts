
import ScriptUtils from "./ScriptUtils";
import {writeFileSync} from "fs";
import {LayerConfigJson} from "../Models/ThemeConfig/Json/LayerConfigJson";
import LineRenderingConfigJson from "../Models/ThemeConfig/Json/LineRenderingConfigJson";
import LegacyJsonConvert from "../Models/ThemeConfig/LegacyJsonConvert";

/*
 * This script reads all theme and layer files and reformats them inplace
 * Use with caution, make a commit beforehand!
 */

const layerFiles = ScriptUtils.getLayerFiles();
for (const layerFile of layerFiles) {
    LegacyJsonConvert.    fixLayerConfig(layerFile.parsed)
    writeFileSync(layerFile.path, JSON.stringify(layerFile.parsed, null, "    "))
}

const themeFiles = ScriptUtils.getThemeFiles()
for (const themeFile of themeFiles) {
   LegacyJsonConvert.fixThemeConfig(themeFile.parsed)
    writeFileSync(themeFile.path, JSON.stringify(themeFile.parsed, null, "  "))
}
