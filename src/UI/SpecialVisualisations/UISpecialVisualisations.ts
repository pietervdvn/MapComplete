import { SpecialVisualizationState, SpecialVisualizationSvelte } from "../SpecialVisualization"
import SvelteUIElement from "../Base/SvelteUIElement"
import { UIEventSource } from "../../Logic/UIEventSource"
import { Feature } from "geojson"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import Questionbox from "../Popup/TagRendering/Questionbox.svelte"
import MinimapViz from "../Popup/MinimapViz.svelte"
import SplitRoadWizard from "../Popup/SplitRoadWizard.svelte"
import MoveWizard from "../Popup/MoveWizard.svelte"
import DeleteWizard from "../Popup/DeleteFlow/DeleteWizard.svelte"
import QrCode from "../Popup/QrCode.svelte"
import NothingKnown from "../Popup/NothingKnown.svelte"
import { ShareLinkViz } from "../Popup/ShareLinkViz"

/**
 * Thin wrapper around QuestionBox.svelte to include it into the special Visualisations
 */
class QuestionViz implements SpecialVisualizationSvelte {
    funcName = "questions"
    needsUrls = []
    docs =
        "The special element which shows the questions which are unkown. Added by default if not yet there"
    args = [
        {
            name: "labels",
            doc: "One or more ';'-separated labels. If these are given, only questions with these labels will be given. Use `unlabeled` for all questions that don't have an explicit label. If none given, all questions will be shown"
        },
        {
            name: "blacklisted-labels",
            doc: "One or more ';'-separated labels of questions which should _not_ be included"
        }
    ]
    svelteBased = true
    group: "default"

    constr(
        state: SpecialVisualizationState,
        tags: UIEventSource<Record<string, string>>,
        args: string[],
        feature: Feature,
        layer: LayerConfig
    ): SvelteUIElement {

        const labels = args[0]
            ?.split(";")
            ?.map((s) => s.trim())
            ?.filter((s) => s !== "")
        const blacklist = args[1]
            ?.split(";")
            ?.map((s) => s.trim())
            ?.filter((s) => s !== "")
        return new SvelteUIElement(Questionbox, {
            layer,
            tags,
            selectedElement: feature,
            state,
            onlyForLabels: labels,
            notForLabels: blacklist
        })
    }
}

export class UISpecialVisualisations {
    public static initList(): SpecialVisualizationSvelte [] {
        return [new QuestionViz(),
            {
                funcName: "minimap",
                docs: "A small map showing the selected feature.",
                needsUrls: [],
                group: "default",

                args: [
                    {
                        doc: "The (maximum) zoomlevel: the target zoomlevel after fitting the entire feature. The minimap will fit the entire feature, then zoom out to this zoom level. The higher, the more zoomed in with 1 being the entire world and 19 being really close",
                        name: "zoomlevel",
                        defaultValue: "18"
                    },
                    {
                        doc: "(Matches all resting arguments) This argument should be the key of a property of the feature. The corresponding value is interpreted as either the id or the a list of ID's. The features with these ID's will be shown on this minimap. (Note: if the key is 'id', list interpration is disabled)",
                        name: "idKey",
                        defaultValue: "id"
                    }
                ],
                example:
                    "`{minimap()}`, `{minimap(17, id, _list_of_embedded_feature_ids_calculated_by_calculated_tag):height:10rem; border: 2px solid black}`",

                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>,
                    args: string[],
                    feature: Feature
                ): SvelteUIElement {
                    return new SvelteUIElement(MinimapViz, { state, args, feature, tagSource })
                }
            },
            {
                funcName: "split_button",
                docs: "Adds a button which allows to split a way",
                args: [],
                group: "default",

                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>
                ): SvelteUIElement {
                    return new SvelteUIElement(SplitRoadWizard, { id: tagSource.map(pr => pr.id), state })
                }
            },
            {
                funcName: "move_button",
                docs: "Adds a button which allows to move the object to another location. The config will be read from the layer config",
                args: [],
                group: "default",
                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>,
                    argument: string[],
                    feature: Feature,
                    layer: LayerConfig
                ): SvelteUIElement {
                    if (feature.geometry.type !== "Point") {
                        return undefined
                    }

                    return new SvelteUIElement(MoveWizard, {
                        state,
                        featureToMove: feature,
                        layer
                    })
                }
            },
            {
                funcName: "delete_button",
                docs: "Adds a button which allows to delete the object at this location. The config will be read from the layer config",
                args: [],
                group: "default",

                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>,
                    argument: string[],
                    feature: Feature,
                    layer: LayerConfig
                ): SvelteUIElement {
                    if (!layer.deletion) {
                        return undefined
                    }
                    return new SvelteUIElement(DeleteWizard, {
                        tags: tagSource,
                        deleteConfig: layer.deletion,
                        state,
                        feature,
                        layer
                    })
                }
            },
            {
                funcName: "qr_code",
                args: [],
                group: "default",
                docs: "Generates a QR-code to share the selected object",
                constr(
                    state: SpecialVisualizationState,
                    tags: UIEventSource<Record<string, string>>,
                    argument: string[],
                    feature: Feature
                ): SvelteUIElement {
                    return new SvelteUIElement(QrCode, { state, tags, feature })
                }
            },
            {
                funcName: "if_nothing_known",
                args: [
                    {
                        name: "text",
                        doc: "Text to show",
                        required: true
                    },
                    { name: "cssClasses", doc: "Classes to apply onto the text" }
                ],
                group: "default",
                docs: "Shows a 'nothing is currently known-message if there is at least one unanswered question and no known (answerable) question",
                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>,
                    argument: string[],
                    feature: Feature,
                    layer: LayerConfig
                ): SvelteUIElement {
                    const text = argument[0]
                    const cssClasses = argument[1]
                    return new SvelteUIElement(NothingKnown, {
                        state,
                        tags: tagSource,
                        layer,
                        text,
                        cssClasses
                    })
                }
            },
            new ShareLinkViz()
        ]
    }
}
