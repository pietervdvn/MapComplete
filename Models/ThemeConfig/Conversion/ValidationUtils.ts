import { TagRenderingConfigJson } from "../Json/TagRenderingConfigJson"
import { Utils } from "../../../Utils"
import SpecialVisualizations from "../../../UI/SpecialVisualizations"

export default class ValidationUtils {
    /**
     * Gives all the (function names of) used special visualisations
     * @param renderingConfig
     */
    public static getSpecialVisualisations(renderingConfig: TagRenderingConfigJson): string[] {
        const translations: any[] = Utils.NoNull([
            renderingConfig.render,
            ...(renderingConfig.mappings ?? []).map((m) => m.then),
        ])
        const all: string[] = []
        for (let translation of translations) {
            if (typeof translation == "string") {
                translation = { "*": translation }
            }

            for (const key in translation) {
                if (!translation.hasOwnProperty(key)) {
                    continue
                }

                const template = translation[key]
                const parts = SpecialVisualizations.constructSpecification(template)
                const specials = parts
                    .filter((p) => typeof p !== "string")
                    .map((special) => special["func"].funcName)
                all.push(...specials)
            }
        }
        return all
    }
}
