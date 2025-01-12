import ThemeConfig from "../Models/ThemeConfig/ThemeConfig"
import favourite from "../assets/generated/layers/favourite.json"
import { ThemeConfigJson } from "../Models/ThemeConfig/Json/ThemeConfigJson"
import { AllSharedLayers } from "./AllSharedLayers"
import Constants from "../Models/Constants"
import ScriptUtils from "../../scripts/ScriptUtils"
import { readFileSync } from "fs"
import { LayerConfigJson } from "../Models/ThemeConfig/Json/LayerConfigJson"

/**
 * Somewhat of a dictionary, which lazily parses needed themes
 */
export class AllKnownLayoutsLazy {
    private readonly raw: Map<string, ThemeConfigJson> = new Map()
    private readonly dict: Map<string, ThemeConfig> = new Map()

    constructor(includeFavouriteLayer = true) {
        const paths = ScriptUtils.readDirRecSync("./public/assets/generated/themes/",1)

        for (const path of paths) {
           const themeConfigJson = <ThemeConfigJson> JSON.parse(readFileSync(path, "utf8"))
            for (const layerId of Constants.added_by_default) {
                if (layerId === "favourite" && favourite.id) {
                    if (includeFavouriteLayer) {
                        themeConfigJson.layers.push(<LayerConfigJson> favourite)
                    }
                    continue
                }
                const defaultLayer = AllSharedLayers.getSharedLayersConfigs().get(layerId)
                if (defaultLayer === undefined) {
                    continue
                }
                themeConfigJson.layers.push(defaultLayer)
            }
            this.raw.set(themeConfigJson.id, themeConfigJson)
        }
    }

    public getConfig(key: string): ThemeConfigJson {
        return this.raw.get(key)
    }

    public size() {
        return this.raw.size
    }

    public get(key: string): ThemeConfig {
        const cached = this.dict.get(key)
        if (cached !== undefined) {
            return cached
        }

        const layout = new ThemeConfig(this.getConfig(key))
        this.dict.set(key, layout)
        return layout
    }

    public keys() {
        return this.raw.keys()
    }

    public values() {
        return Array.from(this.keys()).map((k) => this.get(k))
    }
}

export class AllKnownLayouts {
    public static allKnownLayouts: AllKnownLayoutsLazy = new AllKnownLayoutsLazy()
}
