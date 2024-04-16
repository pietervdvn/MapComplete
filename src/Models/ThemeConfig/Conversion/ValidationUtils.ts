import { TagRenderingConfigJson } from "../Json/TagRenderingConfigJson"
import { Utils } from "../../../Utils"
import SpecialVisualizations from "../../../UI/SpecialVisualizations"
import { RenderingSpecification, SpecialVisualization } from "../../../UI/SpecialVisualization"
import { QuestionableTagRenderingConfigJson } from "../Json/QuestionableTagRenderingConfigJson"

export default class ValidationUtils {
    public static getAllSpecialVisualisations(
        renderingConfigs: (TagRenderingConfigJson | QuestionableTagRenderingConfigJson)[]
    ): RenderingSpecification[] {
        const visualisations: RenderingSpecification[] = []
        if (!Array.isArray(renderingConfigs)) {
            throw (
                "Could not inspect renderingConfigs, not an array: " +
                JSON.stringify(renderingConfigs)
            )
        }
        for (const renderConfig of renderingConfigs) {
            visualisations.push(...ValidationUtils.getSpecialVisualisationsWithArgs(renderConfig))
        }
        return visualisations
    }

    /**
     * Gives all the (function names of) used special visualisations
     * @param renderingConfig
     */
    public static getSpecialVisualisations(
        renderingConfig: TagRenderingConfigJson
    ): SpecialVisualization[] {
        return ValidationUtils.getSpecialVisualisationsWithArgs(renderingConfig).map(
            (spec) => spec["func"]
        )
    }

    public static getSpecialVisualisationsWithArgs(
        renderingConfig: TagRenderingConfigJson
    ): RenderingSpecification[] {
        if (!renderingConfig) {
            return []
        }
        const cacheName = "__specialVisualisationsWithArgs_cache"
        if (renderingConfig[cacheName]) {
            return renderingConfig[cacheName]
        }
        if (!Array.isArray(renderingConfig.mappings ?? [])) {
            throw (
                "Mappings of renderingconfig " +
                (renderingConfig["id"] ?? renderingConfig.render ?? "") +
                " are supposed to be an array but it is: " +
                JSON.stringify(renderingConfig.mappings)
            )
        }
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
                const template = translation[key]
                const parts = SpecialVisualizations.constructSpecification(template)
                const specials = parts.filter((p) => typeof p !== "string")
                all.push(...specials)
            }
        }

        // _Very_ dirty hack
        Object.defineProperty(renderingConfig, cacheName, {
            value: all,
            enumerable: false,
            configurable: true,
            writable: true,
        })

        return all
    }
}
