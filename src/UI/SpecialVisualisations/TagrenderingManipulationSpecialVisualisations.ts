import { SpecialVisualization, SpecialVisualizationState } from "../SpecialVisualization"
import { ImmutableStore, UIEventSource } from "../../Logic/UIEventSource"
import { Feature } from "geojson"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import { Translation } from "../i18n/Translation"
import { VariableUiElement } from "../Base/VariableUIElement"
import SvelteUIElement from "../Base/SvelteUIElement"
import SpecialTranslation from "../Popup/TagRendering/SpecialTranslation.svelte"
import GroupedView from "../Popup/GroupedView.svelte"
import OpenIdEditor from "../BigComponents/OpenIdEditor.svelte"
import OpenJosm from "../Base/OpenJosm.svelte"
import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig"
import BaseUIElement from "../BaseUIElement"
import TagRenderingEditable from "../Popup/TagRendering/TagRenderingEditable.svelte"
import Combine from "../Base/Combine"

class StealViz implements SpecialVisualization {

    funcName = "steal"
    group = "tagrendering_manipulation"

    docs = "Shows a tagRendering from a different object as if this was the object itself"
    args = [
        {
            name: "featureId",
            doc: "The key of the attribute which contains the id of the feature from which to use the tags",
            required: true
        },
        {
            name: "tagRenderingId",
            doc: "The layer-id and tagRenderingId to render. Can be multiple value if ';'-separated (in which case every value must also contain the layerId, e.g. `layerId.tagRendering0; layerId.tagRendering1`). Note: this can cause layer injection",
            required: true
        }
    ]
    needsUrls = []
    svelteBased = true

    constr(state: SpecialVisualizationState, featureTags, args) {
        const [featureIdKey, layerAndtagRenderingIds] = args
        const tagRenderings: [LayerConfig, TagRenderingConfig][] = []
        for (const layerAndTagRenderingId of layerAndtagRenderingIds.split(";")) {
            const [layerId, tagRenderingId] = layerAndTagRenderingId.trim().split(".")
            const layer = state.theme.layers.find((l) => l.id === layerId)
            const tagRendering = layer.tagRenderings.find((tr) => tr.id === tagRenderingId)
            tagRenderings.push([layer, tagRendering])
        }
        if (tagRenderings.length === 0) {
            throw "Could not create stolen tagrenddering: tagRenderings not found"
        }
        return new VariableUiElement(
            featureTags.map(
                (tags) => {
                    const featureId = tags[featureIdKey]
                    if (featureId === undefined) {
                        return undefined
                    }
                    const otherTags = state.featureProperties.getStore(featureId)
                    const otherFeature = state.indexedFeatures.featuresById.data.get(featureId)
                    const elements: BaseUIElement[] = []
                    for (const [layer, tagRendering] of tagRenderings) {
                        elements.push(
                            new SvelteUIElement(TagRenderingEditable, {
                                config: tagRendering,
                                tags: otherTags,
                                selectedElement: otherFeature,
                                state,
                                layer
                            })
                        )
                    }
                    if (elements.length === 1) {
                        return elements[0]
                    }
                    return new Combine(elements).SetClass("flex flex-col")
                },
                [state.indexedFeatures.featuresById]
            )
        )
    }

    getLayerDependencies(args): string[] {
        const [, tagRenderingId] = args
        if (tagRenderingId.indexOf(".") < 0) {
            throw "Error: argument 'layerId.tagRenderingId' of special visualisation 'steal' should contain a dot"
        }
        const [layerId] = tagRenderingId.split(".")
        return [layerId]
    }
}

export default class TagrenderingManipulationSpecialVisualisations {

    public static initList(): (SpecialVisualization & { group })[] {
        return [
            new StealViz(),
            {
                funcName: "multi",
                group: "tagrendering_manipulation",
                docs: "Given an embedded tagRendering (read only) and a key, will read the keyname as a JSON-list. Every element of this list will be considered as tags and rendered with the tagRendering",
                example:
                    "```json\n" +
                    JSON.stringify(
                        {
                            render: {
                                special: {
                                    type: "multi",
                                    key: "_doors_from_building_properties",
                                    tagrendering: {
                                        en: "The building containing this feature has a <a href='#{id}'>door</a> of width {entrance:width}"
                                    }
                                }
                            }
                        },
                        null,
                        "  "
                    ) +
                    "\n```",
                args: [
                    {
                        name: "key",
                        doc: "The property to read and to interpret as a list of properties",
                        required: true
                    },
                    {
                        name: "tagrendering",
                        doc: "An entire tagRenderingConfig",
                        required: true
                    },
                    {
                        name: "classes",
                        doc: "CSS-classes to apply on every individual item. Seperated by `space`"
                    }
                ],
                constr(
                    state: SpecialVisualizationState,
                    featureTags: UIEventSource<Record<string, string>>,
                    args: string[],
                    feature: Feature,
                    layer: LayerConfig
                ) {
                    const [key, tr, classesRaw] = args
                    const classes = classesRaw ?? ""
                    const translation = new Translation({ "*": tr })
                    return new VariableUiElement(
                        featureTags.map((tags) => {
                            let properties: object[]
                            if (typeof tags[key] === "string") {
                                properties = JSON.parse(tags[key])
                            } else {
                                properties = <object[]><unknown>tags[key]
                            }
                            if (!properties) {
                                console.debug(
                                    "Could not create a special visualization for multi(",
                                    args.join(", ") + ")",
                                    "no properties found for object",
                                    feature.properties.id
                                )
                                return undefined
                            }
                            const elements = []
                            for (const property of properties) {
                                const subsTr = new SvelteUIElement(SpecialTranslation, {
                                    t: translation,
                                    tags: new ImmutableStore(property),
                                    state,
                                    feature,
                                    layer
                                    // clss: classes ?? "",
                                }).SetClass(classes)
                                elements.push(subsTr)
                            }
                            return elements
                        })
                    )
                }
            },
            {
                funcName: "group",
                group: "tagrendering_manipulation",
                docs: "A collapsable group (accordion)",
                args: [
                    {
                        name: "header",
                        doc: "The _identifier_ of a single tagRendering. This will be used as header"
                    },
                    {
                        name: "labels",
                        doc: "A `;`-separated list of either identifiers or label names. All tagRenderings matching this value will be shown in the accordion"
                    }
                ],
                constr(
                    state: SpecialVisualizationState,
                    tags: UIEventSource<Record<string, string>>,
                    argument: string[],
                    selectedElement: Feature,
                    layer: LayerConfig
                ): SvelteUIElement {
                    const [header, labelsStr] = argument
                    const labels = labelsStr.split(";").map((x) => x.trim())
                    return new SvelteUIElement(GroupedView, {
                        state,
                        tags,
                        selectedElement,
                        layer,
                        header,
                        labels
                    })
                }
            },
            {
                funcName: "open_in_iD",
                docs: "Opens the current view in the iD-editor",
                args: [],
                group: "tagrendering_manipulation",
                constr: (state, feature): SvelteUIElement => {
                    return new SvelteUIElement(OpenIdEditor, {
                        mapProperties: state.mapProperties,
                        objectId: feature.data.id
                    })
                }
            },
            {
                funcName: "open_in_josm",
                group: "tagrendering_manipulation",
                docs: "Opens the current view in the JOSM-editor",
                args: [],
                needsUrls: ["http://127.0.0.1:8111/load_and_zoom"],

                constr: (state): SvelteUIElement => {
                    return new SvelteUIElement(OpenJosm, { state })
                }
            }
        ]
    }

}
