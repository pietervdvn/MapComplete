import { TagRenderingConfigJson } from "../Json/TagRenderingConfigJson"
import { Utils } from "../../../Utils"
import SpecialVisualizations from "../../../UI/SpecialVisualizations"
import { RenderingSpecification, SpecialVisualization } from "../../../UI/SpecialVisualization"
import { LayerConfigJson } from "../Json/LayerConfigJson"

export default class ValidationUtils {
    public static hasSpecialVisualisation(
        layer: LayerConfigJson,
        specialVisualisation: string
    ): boolean {
        return (
            layer.tagRenderings?.some((tagRendering) => {
                if (tagRendering === undefined) {
                    return false
                }

                const spec = ValidationUtils.getSpecialVisualisations(
                    <TagRenderingConfigJson>tagRendering
                )
                return spec.some((vis) => vis.funcName === specialVisualisation)
            }) ?? false
        )
    }

    /**
     * Gives all the (function names of) used special visualisations
     * @param renderingConfig
     */
    public static getSpecialVisualisations(
        renderingConfig: TagRenderingConfigJson
    ): SpecialVisualization[] {
        return ValidationUtils.getSpecialVisualsationsWithArgs(renderingConfig).map(
            (spec) => spec["func"]
        )
    }

    public static getSpecialVisualsationsWithArgs(
        renderingConfig: TagRenderingConfigJson
    ): RenderingSpecification[] {
        const translations: any[] = Utils.NoNull([
            renderingConfig.render,
            ...(renderingConfig.mappings ?? []).map((m) => m.then),
        ])
        const all: RenderingSpecification[] = []
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
                const specials = parts.filter((p) => typeof p !== "string")
                all.push(...specials)
            }
        }
        return all
    }
}
