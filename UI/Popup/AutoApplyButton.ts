import {SpecialVisualization} from "../SpecialVisualizations";
import FeaturePipelineState from "../../Logic/State/FeaturePipelineState";
import BaseUIElement from "../BaseUIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {DefaultGuiState} from "../DefaultGuiState";
import {SubtleButton} from "../Base/SubtleButton";
import Img from "../Base/Img";
import {FixedUiElement} from "../Base/FixedUiElement";
import Combine from "../Base/Combine";
import Link from "../Base/Link";
import {SubstitutedTranslation} from "../SubstitutedTranslation";
import {Utils} from "../../Utils";
import Minimap from "../Base/Minimap";
import ShowDataLayer from "../ShowDataLayer/ShowDataLayer";
import StaticFeatureSource from "../../Logic/FeatureSource/Sources/StaticFeatureSource";
import {VariableUiElement} from "../Base/VariableUIElement";
import Loading from "../Base/Loading";
import {OsmConnection} from "../../Logic/Osm/OsmConnection";
import Translations from "../i18n/Translations";

export interface AutoAction extends SpecialVisualization {
    supportsAutoAction: boolean

    applyActionOn(state: FeaturePipelineState, tagSource: UIEventSource<any>, argument: string[]): Promise<void>
}

export default class AutoApplyButton implements SpecialVisualization {
    public readonly docs: string;
    public readonly funcName: string = "auto_apply";
    public readonly args: { name: string; defaultValue?: string; doc: string }[] = [
        {
            name: "target_layer",
            doc: "The layer that the target features will reside in"
        },
        {
            name: "target_feature_ids",
            doc: "The key, of which the value contains a list of ids"
        },
        {
            name: "tag_rendering_id",
            doc: "The ID of the tagRendering containing the autoAction. This tagrendering will be calculated. The embedded actions will be executed"
        },
        {
            name: "text",
            doc: "The text to show on the button"
        },
        {
            name: "icon",
            doc: "The icon to show on the button",
            defaultValue: "./assets/svg/robot.svg"
        }
    ];

    constructor(allSpecialVisualisations: SpecialVisualization[]) {
        this.docs = AutoApplyButton.generateDocs(allSpecialVisualisations.filter(sv => sv["supportsAutoAction"] === true).map(sv => sv.funcName))
    }

    constr(state: FeaturePipelineState, tagSource: UIEventSource<any>, argument: string[], guistate: DefaultGuiState): BaseUIElement {

        if (!state.layoutToUse.official && !(state.featureSwitchIsTesting.data || state.osmConnection._oauth_config.url === OsmConnection.oauth_configs["osm-test"].url)) {
            const t = Translations.t.general.add.import;
            return new Combine([new FixedUiElement("The auto-apply button is only available in official themes (or in testing mode)").SetClass("alert"), t.howToTest])
        }
        
        const to_parse = tagSource.data[argument[1]]
        if (to_parse === undefined) {
            return new Loading("Gathering which elements support auto-apply... ")
        }
        try {


            const target_layer_id = argument[0]
            const target_feature_ids = <string[]>JSON.parse(to_parse)
            
            if(target_feature_ids.length === 0){
                return new FixedUiElement("No elements found to perform action")
            }
            
            const targetTagRendering = argument[2]
            const text = argument[3]
            const icon = argument[4]

            const layer = state.filteredLayers.data.filter(l => l.layerDef.id === target_layer_id)[0]

            const tagRenderingConfig = layer.layerDef.tagRenderings.filter(tr => tr.id === targetTagRendering)[0]

            if (tagRenderingConfig === undefined) {
                return new FixedUiElement("Target tagrendering " + targetTagRendering + " not found").SetClass("alert")
            }

            const buttonState = new UIEventSource<"idle" | "running" | "done" | {error: string}>("idle")

            const button = new SubtleButton(
                new Img(icon),
                text
            ).onClick(async () => {
                buttonState.setData("running")
                try {


                    for (const targetFeatureId of target_feature_ids) {
                        const featureTags = state.allElements.getEventSourceById(targetFeatureId)
                        const rendering = tagRenderingConfig.GetRenderValue(featureTags.data).txt
                        const specialRenderings = Utils.NoNull(SubstitutedTranslation.ExtractSpecialComponents(rendering)
                            .map(x => x.special))
                            .filter(v => v.func["supportsAutoAction"] === true)

                        for (const specialRendering of specialRenderings) {
                            const action = <AutoAction>specialRendering.func
                            await action.applyActionOn(state, featureTags, specialRendering.args)
                        }
                    }
                    console.log("Flushing changes...")
                    await state.changes.flushChanges("Auto button")
                    buttonState.setData("done")
                } catch (e) {
                    console.error("Error while running autoApply: ", e)
                    buttonState.setData({error: e})
                }
            });

            const explanation = new Combine(["The following objects will be updated: ",
                ...target_feature_ids.map(id => new Combine([new Link(id, "https:/  /openstreetmap.org/" + id, true), ", "]))]).SetClass("subtle")

            const previewMap = Minimap.createMiniMap({
                allowMoving: false,
                background: state.backgroundLayer,
                addLayerControl: true,
            }).SetClass("h-48")

            const features = target_feature_ids.map(id => state.allElements.ContainingFeatures.get(id))

            new ShowDataLayer({
                leafletMap: previewMap.leafletMap,
                enablePopups: false,
                zoomToFeatures: true,
                features: new StaticFeatureSource(features, false),
                allElements: state.allElements,
                layerToShow: layer.layerDef,
            })


            return new VariableUiElement(buttonState.map(
                st => {
                    if (st === "idle") {
                        return new Combine([button, previewMap, explanation]);
                    }
                    if (st === "done") {
                        return new FixedUiElement("All done!").SetClass("thanks")
                    }
                    if (st === "running") {
                    return new Loading("Applying changes...")
                    }
                    const error =st.error
                        return new Combine([new FixedUiElement("Something went wrong...").SetClass("alert"), new FixedUiElement(error).SetClass("subtle")]).SetClass("flex flex-col")
                }
            ))


        } catch (e) {
            console.log("To parse is", to_parse)
            return new FixedUiElement("Could not generate a auto_apply-button for key " + argument[0] + " due to " + e).SetClass("alert")
        }
    }

    getLayerDependencies(args: string[]): string[] {
        return [args[0]]
    }

    private static generateDocs(supportedActions: string[]) {
        return [
            "A button to run many actions for many features at once.\n",
            "To effectively use this button, you'll need some ingredients:\n" +
            "- A target layer with features for which an action is defined in a tag rendering. The following special visualisations support an autoAction: " + supportedActions.join(", "),
            "- A host feature to place the auto-action on. This can be a big outline (such as a city). Another good option for this is the [current_view](./BuiltinLayers.md#current_view)",
            "- Then, use a calculated tag on the host feature to determine the overlapping object ids",
            "- At last, add this component"
        ].join("\n")
    }


}