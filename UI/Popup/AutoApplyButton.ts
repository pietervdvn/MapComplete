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
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import {Changes} from "../../Logic/Osm/Changes";
import {UIElement} from "../UIElement";
import FilteredLayer from "../../Models/FilteredLayer";
import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig";
import Lazy from "../Base/Lazy";

export interface AutoAction extends SpecialVisualization {
    supportsAutoAction: boolean

    applyActionOn(state: {
        layoutToUse: LayoutConfig,
        changes: Changes
    }, tagSource: UIEventSource<any>, argument: string[]): Promise<void>
}

class ApplyButton extends UIElement {
    private readonly icon: string;
    private readonly text: string;
    private readonly targetTagRendering: string;
    private readonly target_layer_id: string;
    private readonly state: FeaturePipelineState;
    private readonly target_feature_ids: string[];
    private readonly buttonState = new UIEventSource<"idle" | "running" | "done" | { error: string }>("idle")
    private readonly layer: FilteredLayer;
    private readonly tagRenderingConfig: TagRenderingConfig;

    constructor(state: FeaturePipelineState, target_feature_ids: string[], options: {
        target_layer_id: string,
        targetTagRendering: string,
        text: string,
        icon: string
    }) {
        super()
        this.state = state;
        this.target_feature_ids = target_feature_ids;
        this.target_layer_id = options.target_layer_id;
        this.targetTagRendering = options.targetTagRendering;
        this.text = options.text
        this.icon = options.icon
        this.layer = this.state.filteredLayers.data.find(l => l.layerDef.id === this.target_layer_id)
        this.tagRenderingConfig = this.layer.layerDef.tagRenderings.find(tr => tr.id === this.targetTagRendering)

    }

    protected InnerRender(): string | BaseUIElement {
        if (this.target_feature_ids.length === 0) {
            return new FixedUiElement("No elements found to perform action")
        }


        if (this.tagRenderingConfig === undefined) {
            return new FixedUiElement("Target tagrendering " + this.targetTagRendering + " not found").SetClass("alert")
        }
        const self = this;
        const button = new SubtleButton(
            new Img(this.icon),
            this.text
        ).onClick(() => {
            this.buttonState.setData("running")
            window.setTimeout(() => {

            self.Run();
            }, 50)
        });

        const explanation = new Combine(["The following objects will be updated: ",
            ...this.target_feature_ids.map(id => new Combine([new Link(id, "https:/  /openstreetmap.org/" + id, true), ", "]))]).SetClass("subtle")

        const previewMap = Minimap.createMiniMap({
            allowMoving: false,
            background: this.state.backgroundLayer,
            addLayerControl: true,
        }).SetClass("h-48")

        const features = this.target_feature_ids.map(id => this.state.allElements.ContainingFeatures.get(id))

        new ShowDataLayer({
            leafletMap: previewMap.leafletMap,
            zoomToFeatures: true,
            features: new StaticFeatureSource(features, false),
            state: this.state,
            layerToShow: this.layer.layerDef,
        })


        return new VariableUiElement(this.buttonState.map(
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
                const error = st.error
                return new Combine([new FixedUiElement("Something went wrong...").SetClass("alert"), new FixedUiElement(error).SetClass("subtle")]).SetClass("flex flex-col")
            }
        ))
    }

    private async Run() {

        
        try {
            console.log("Applying auto-action on " + this.target_feature_ids.length + " features")

            for (const targetFeatureId of this.target_feature_ids) {
                const featureTags = this.state.allElements.getEventSourceById(targetFeatureId)
                const rendering = this.tagRenderingConfig.GetRenderValue(featureTags.data).txt
                const specialRenderings = Utils.NoNull(SubstitutedTranslation.ExtractSpecialComponents(rendering)
                    .map(x => x.special))
                    .filter(v => v.func["supportsAutoAction"] === true)

                if (specialRenderings.length == 0) {
                    console.warn("AutoApply: feature " + targetFeatureId + " got a rendering without supported auto actions:", rendering)
                }

                for (const specialRendering of specialRenderings) {
                    const action = <AutoAction>specialRendering.func
                    await action.applyActionOn(this.state, featureTags, specialRendering.args)
                }
            }
            console.log("Flushing changes...")
            await this.state.changes.flushChanges("Auto button")
            this.buttonState.setData("done")
        } catch (e) {
            console.error("Error while running autoApply: ", e)
            this.buttonState.setData({error: e})
        }
    }

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

    constr(state: FeaturePipelineState, tagSource: UIEventSource<any>, argument: string[], guistate: DefaultGuiState): BaseUIElement {
        try {

            if (!state.layoutToUse.official && !(state.featureSwitchIsTesting.data || state.osmConnection._oauth_config.url === OsmConnection.oauth_configs["osm-test"].url)) {
                const t = Translations.t.general.add.import;
                return new Combine([new FixedUiElement("The auto-apply button is only available in official themes (or in testing mode)").SetClass("alert"), t.howToTest])
            }

            const target_layer_id = argument[0]
            const targetTagRendering = argument[2]
            const text = argument[3]
            const icon = argument[4]
            const options = {
                target_layer_id, targetTagRendering, text, icon
            }

            return new Lazy(() => {
                const to_parse = new UIEventSource(undefined)
                // Very ugly hack: read the value every 500ms
                UIEventSource.Chronic(500, () => to_parse.data === undefined).addCallback(() => {
                    const applicable = tagSource.data[argument[1]]
                    to_parse.setData(applicable)
                })

                const loading = new Loading("Gathering which elements support auto-apply... ");
                return new VariableUiElement(to_parse.map(ids => {
                    if (ids === undefined) {
                        return loading
                    }

                    return new ApplyButton(state, JSON.parse(ids), options);
                }))
            })


        } catch (e) {
            return new FixedUiElement("Could not generate a auto_apply-button for key " + argument[0] + " due to " + e).SetClass("alert")
        }
    }

    getLayerDependencies(args: string[]): string[] {
        return [args[0]]
    }


}