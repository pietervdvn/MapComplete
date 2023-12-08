import known_themes from "../assets/generated/known_themes.json"
import LayoutConfig from "../Models/ThemeConfig/LayoutConfig"
import favourite from "../assets/generated/layers/favourite.json"
import { LayoutConfigJson } from "../Models/ThemeConfig/Json/LayoutConfigJson"
import { AllSharedLayers } from "./AllSharedLayers"
import Constants from "../Models/Constants"

/**
 * Somewhat of a dictionary, which lazily parses needed themes
 */
export class AllKnownLayoutsLazy {
    private readonly raw: Map<string, LayoutConfigJson> = new Map()
    private readonly dict: Map<string, LayoutConfig> = new Map()

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

    public getConfig(key: string): LayoutConfigJson {
        return this.raw.get(key)
    }

    public get(key: string): LayoutConfig {
        const cached = this.dict.get(key)
        if (cached !== undefined) {
            return cached
        }

        const layout = new LayoutConfig(this.getConfig(key))
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
