import known_themes from "../assets/generated/known_themes.json"
import ThemeConfig from "../Models/ThemeConfig/ThemeConfig"
import favourite from "../assets/generated/layers/favourite.json"
import { ThemeConfigJson } from "../Models/ThemeConfig/Json/ThemeConfigJson"
import { AllSharedLayers } from "./AllSharedLayers"
import Constants from "../Models/Constants"

/**
 * Somewhat of a dictionary, which lazily parses needed themes
 */
export class AllKnownLayoutsLazy {
    private readonly raw: Map<string, ThemeConfigJson> = new Map()
    private readonly dict: Map<string, ThemeConfig> = new Map()

    constructor(includeFavouriteLayer = true) {
        for (const layoutConfigJson of known_themes["themes"]) {
            for (const layerId of Constants.added_by_default) {
                if (layerId === "favourite" && favourite.id) {
                    if (includeFavouriteLayer) {
                        layoutConfigJson.layers.push(favourite)
                    }
                    continue
                }
                const defaultLayer = AllSharedLayers.getSharedLayersConfigs().get(layerId)
                if (defaultLayer === undefined) {
                    console.error("Could not find builtin layer", layerId)
                    continue
                }
                layoutConfigJson.layers.push(defaultLayer)
            }
            this.raw.set(layoutConfigJson.id, layoutConfigJson)
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
