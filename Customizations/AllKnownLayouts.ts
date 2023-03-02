import known_themes from "../assets/generated/known_themes.json"
import LayoutConfig from "../Models/ThemeConfig/LayoutConfig"
import { LayoutConfigJson } from "../Models/ThemeConfig/Json/LayoutConfigJson"

/**
 * Somewhat of a dictionary, which lazily parses needed themes
 */
export class AllKnownLayoutsLazy {
    private readonly dict: Map<string, { data: LayoutConfig } | { func: () => LayoutConfig }> =
        new Map()
    constructor() {
        for (const layoutConfigJson of known_themes["themes"]) {
            this.dict.set(layoutConfigJson.id, {
                func: () => {
                    const layout = new LayoutConfig(<LayoutConfigJson>layoutConfigJson, true)
                    for (let i = 0; i < layout.layers.length; i++) {
                        let layer = layout.layers[i]
                        if (typeof layer === "string") {
                            throw "Layer " + layer + " was not expanded in " + layout.id
                        }
                    }
                    return layout
                },
            })
        }
    }

    public get(key: string): LayoutConfig {
        const thunk = this.dict.get(key)
        if (thunk === undefined) {
            return undefined
        }
        if (thunk["data"]) {
            return thunk["data"]
        }
        const layout = thunk["func"]()
        this.dict.set(key, { data: layout })
        return layout
    }

    public keys() {
        return this.dict.keys()
    }

    public values() {
        return Array.from(this.keys()).map((k) => this.get(k))
    }
}

export class AllKnownLayouts {
    public static allKnownLayouts: AllKnownLayoutsLazy = new AllKnownLayoutsLazy()
}
