import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig"
import { VariableUiElement } from "../Base/VariableUIElement"
import BaseUIElement from "../BaseUIElement"
import EditableTagRendering from "./EditableTagRendering"
import Combine from "../Base/Combine"
import { SpecialVisualization } from "../SpecialVisualization"

export class StealViz implements SpecialVisualization {
    funcName = "steal"
    docs = "Shows a tagRendering from a different object as if this was the object itself"
    args = [
        {
            name: "featureId",
            doc: "The key of the attribute which contains the id of the feature from which to use the tags",
            required: true,
        },
        {
            name: "tagRenderingId",
            doc: "The layer-id and tagRenderingId to render. Can be multiple value if ';'-separated (in which case every value must also contain the layerId, e.g. `layerId.tagRendering0; layerId.tagRendering1`). Note: this can cause layer injection",
            required: true,
        },
    ]
    constr(state, featureTags, args) {
        const [featureIdKey, layerAndtagRenderingIds] = args
        const tagRenderings: [LayerConfig, TagRenderingConfig][] = []
        for (const layerAndTagRenderingId of layerAndtagRenderingIds.split(";")) {
            const [layerId, tagRenderingId] = layerAndTagRenderingId.trim().split(".")
            const layer = state.layoutToUse.layers.find((l) => l.id === layerId)
            const tagRendering = layer.tagRenderings.find((tr) => tr.id === tagRenderingId)
            tagRenderings.push([layer, tagRendering])
        }
        if (tagRenderings.length === 0) {
            throw "Could not create stolen tagrenddering: tagRenderings not found"
        }
        return new VariableUiElement(
            featureTags.map((tags) => {
                const featureId = tags[featureIdKey]
                if (featureId === undefined) {
                    return undefined
                }
                const otherTags = state.allElements.getEventSourceById(featureId)
                const elements: BaseUIElement[] = []
                for (const [layer, tagRendering] of tagRenderings) {
                    const el = new EditableTagRendering(
                        otherTags,
                        tagRendering,
                        layer.units,
                        state,
                        {}
                    )
                    elements.push(el)
                }
                if (elements.length === 1) {
                    return elements[0]
                }
                return new Combine(elements).SetClass("flex flex-col")
            })
        )
    }

    getLayerDependencies(args): string[] {
        const [_, tagRenderingId] = args
        if (tagRenderingId.indexOf(".") < 0) {
            throw "Error: argument 'layerId.tagRenderingId' of special visualisation 'steal' should contain a dot"
        }
        const [layerId, __] = tagRenderingId.split(".")
        return [layerId]
    }
}
