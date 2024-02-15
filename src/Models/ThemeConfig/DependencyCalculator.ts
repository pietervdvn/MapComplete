import TagRenderingConfig from "./TagRenderingConfig"
import { ExtraFuncParams, ExtraFunctions } from "../../Logic/ExtraFunctions"
import LayerConfig from "./LayerConfig"
import { SpecialVisualization } from "../../UI/SpecialVisualization"
import SpecialVisualizations from "../../UI/SpecialVisualizations"

export default class DependencyCalculator {
    public static GetTagRenderingDependencies(tr: TagRenderingConfig): string[] {
        if (tr === undefined) {
            throw "Got undefined tag rendering in getTagRenderingDependencies"
        }
        const deps: string[] = []

        // All translated snippets
        const parts: string[] = [].concat(...tr.EnumerateTranslations().map((tr) => tr.AllValues()))

        for (const part of parts) {
            const specialVizs: { func: SpecialVisualization; args: string[] }[] =
                SpecialVisualizations.constructSpecification(part)
                    .filter((p) => typeof p !== "string")
                    .map((p) => <{ func: SpecialVisualization; args: string[] }>p)
                    .filter((o) => o?.func?.getLayerDependencies !== undefined)
            for (const specialViz of specialVizs) {
                deps.push(...specialViz.func.getLayerDependencies(specialViz.args))
            }
        }
        return deps
    }

    /**
     * Returns a set of all other layer-ids that this layer needs to function.
     * E.g. if this layers does snap to another layer in the preset, this other layer id will be mentioned
     */
    public static getLayerDependencies(
        layer: LayerConfig
    ): { neededLayer: string; reason: string; context?: string; neededBy: string }[] {
        const deps: { neededLayer: string; reason: string; context?: string; neededBy: string }[] =
            []

        for (let i = 0; layer.presets !== undefined && i < layer.presets.length; i++) {
            const preset = layer.presets[i]
            const snapTo = preset.preciseInput?.snapToLayers
            if (snapTo && !Array.isArray(snapTo)) {
                throw new Error(
                    `snapToLayers is not an array; it is ${snapTo}(used in preset ${i} for: ${layer.id})`
                )
            }
            preset.preciseInput?.snapToLayers?.forEach((id) => {
                deps.push({
                    neededLayer: id,
                    reason: "a preset snaps to this layer",
                    context: "presets[" + i + "]",
                    neededBy: layer.id,
                })
            })
        }

        for (const tr of layer.AllTagRenderings()) {
            for (const dep of DependencyCalculator.GetTagRenderingDependencies(tr)) {
                deps.push({
                    neededLayer: dep,
                    reason: "a tagrendering needs this layer",
                    context: tr.id,
                    neededBy: layer.id,
                })
            }
        }

        if (layer.calculatedTags?.length > 0) {
            const obj = {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [0, 0],
                },
                properties: {
                    id: "node/1",
                },
            }
            let currentKey = undefined
            let currentLine = undefined
            const params: ExtraFuncParams = {
                getFeatureById: (_) => undefined,
                getFeaturesWithin: (layerId, _) => {
                    if (layerId === "*") {
                        // This is a wildcard
                        return []
                    }

                    // The important line: steal the dependencies!
                    deps.push({
                        neededLayer: layerId,
                        reason: "a calculated tag loads features from this layer",
                        context:
                            "calculatedTag[" +
                            currentLine +
                            "] which calculates the value for " +
                            currentKey,
                        neededBy: layer.id,
                    })

                    return []
                },
            }
            const helpers = ExtraFunctions.constructHelpers(params)
            // ... Run the calculated tag code, which will trigger the getFeaturesWithin above...
            for (let i = 0; i < layer.calculatedTags.length; i++) {
                const [key, code] = layer.calculatedTags[i]
                currentLine = i // Leak the state...
                currentKey = key
                try {
                    const func = new Function(
                        "feat",
                        "{" + ExtraFunctions.types.join(",") + "}",
                        "return " + code + ";"
                    )
                    const result = func(obj, helpers)
                    obj.properties[key] = JSON.stringify(result)
                } catch (e) {}
            }
        }

        return deps
    }
}
