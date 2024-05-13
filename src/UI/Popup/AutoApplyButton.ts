import BaseUIElement from "../BaseUIElement"
import { Stores, UIEventSource } from "../../Logic/UIEventSource"
import { SubtleButton } from "../Base/SubtleButton"
import Img from "../Base/Img"
import { FixedUiElement } from "../Base/FixedUiElement"
import Combine from "../Base/Combine"
import Link from "../Base/Link"
import { Utils } from "../../Utils"
import StaticFeatureSource from "../../Logic/FeatureSource/Sources/StaticFeatureSource"
import { VariableUiElement } from "../Base/VariableUIElement"
import Loading from "../Base/Loading"
import Translations from "../i18n/Translations"
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"
import { Changes } from "../../Logic/Osm/Changes"
import { UIElement } from "../UIElement"
import FilteredLayer from "../../Models/FilteredLayer"
import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig"
import Lazy from "../Base/Lazy"
import List from "../Base/List"
import { SpecialVisualization, SpecialVisualizationState } from "../SpecialVisualization"
import { IndexedFeatureSource } from "../../Logic/FeatureSource/FeatureSource"
import { MapLibreAdaptor } from "../Map/MapLibreAdaptor"
import ShowDataLayer from "../Map/ShowDataLayer"
import SvelteUIElement from "../Base/SvelteUIElement"
import MaplibreMap from "../Map/MaplibreMap.svelte"
import SpecialVisualizations from "../SpecialVisualizations"
import { Feature } from "geojson"

export interface AutoAction extends SpecialVisualization {
    supportsAutoAction: boolean

    applyActionOn(
        feature: Feature,
        state: {
            layout: LayoutConfig
            changes: Changes
            indexedFeatures: IndexedFeatureSource
        },
        tagSource: UIEventSource<any>,
        argument: string[]
    ): Promise<void>
}

class ApplyButton extends UIElement {
    private readonly icon: string
    private readonly text: string
    private readonly targetTagRendering: string
    private readonly target_layer_id: string
    private readonly state: SpecialVisualizationState
    private readonly target_feature_ids: string[]
    private readonly buttonState = new UIEventSource<
        "idle" | "running" | "done" | { error: string }
    >("idle")
    private readonly layer: FilteredLayer
    private readonly tagRenderingConfig: TagRenderingConfig
    private readonly appliedNumberOfFeatures = new UIEventSource<number>(0)

    constructor(
        state: SpecialVisualizationState,
        target_feature_ids: string[],
        options: {
            target_layer_id: string
            targetTagRendering: string
            text: string
            icon: string
        }
    ) {
        super()
        this.state = state
        this.target_feature_ids = target_feature_ids
        this.target_layer_id = options.target_layer_id
        this.targetTagRendering = options.targetTagRendering
        this.text = options.text
        this.icon = options.icon
        this.layer = this.state.layerState.filteredLayers.get(this.target_layer_id)
        this.tagRenderingConfig = this.layer.layerDef.tagRenderings.find(
            (tr) => tr.id === this.targetTagRendering
        )
    }

    protected InnerRender(): string | BaseUIElement {
        if (this.target_feature_ids.length === 0) {
            return new FixedUiElement("No elements found to perform action")
        }

        if (this.tagRenderingConfig === undefined) {
            return new FixedUiElement(
                "Target tagrendering " + this.targetTagRendering + " not found"
            ).SetClass("alert")
        }
        const self = this
        const button = new SubtleButton(new Img(this.icon), this.text).onClick(() => {
            this.buttonState.setData("running")
            window.setTimeout(() => {
                self.Run()
            }, 50)
        })

        const explanation = new Combine([
            "The following objects will be updated: ",
            ...this.target_feature_ids.map(
                (id) => new Combine([new Link(id, "https:/  /openstreetmap.org/" + id, true), ", "])
            ),
        ]).SetClass("subtle")

        const mlmap = new UIEventSource(undefined)
        const mla = new MapLibreAdaptor(mlmap, {
            rasterLayer: this.state.mapProperties.rasterLayer,
        })
        mla.allowZooming.setData(false)
        mla.allowMoving.setData(false)

        const previewMap = new SvelteUIElement(MaplibreMap, {
            mapProperties: mla,
            map: mlmap,
        }).SetClass("h-48")

        const features = this.target_feature_ids.map((id) =>
            this.state.indexedFeatures.featuresById.data.get(id)
        )

        new ShowDataLayer(mlmap, {
            features: StaticFeatureSource.fromGeojson(features),
            zoomToFeatures: true,
            layer: this.layer.layerDef,
        })

        return new VariableUiElement(
            this.buttonState.map((st) => {
                if (st === "idle") {
                    return new Combine([button, previewMap, explanation])
                }
                if (st === "done") {
                    return new FixedUiElement("All done!").SetClass("thanks")
                }
                if (st === "running") {
                    return new Loading(
                        new VariableUiElement(
                            this.appliedNumberOfFeatures.map((appliedTo) => {
                                return (
                                    "Applying changes, currently at " +
                                    appliedTo +
                                    "/" +
                                    this.target_feature_ids.length
                                )
                            })
                        )
                    )
                }
                const error = st.error
                return new Combine([
                    new FixedUiElement("Something went wrong...").SetClass("alert"),
                    new FixedUiElement(error).SetClass("subtle"),
                ]).SetClass("flex flex-col")
            })
        )
    }

    /**
     * Actually applies all the changes...
     */
    private async Run() {
        try {
            console.log("Applying auto-action on " + this.target_feature_ids.length + " features")
            const appliedOn: string[] = []
            for (let i = 0; i < this.target_feature_ids.length; i++) {
                const targetFeatureId = this.target_feature_ids[i]
                const feature = this.state.indexedFeatures.featuresById.data.get(targetFeatureId)
                const featureTags = this.state.featureProperties.getStore(targetFeatureId)
                const rendering = this.tagRenderingConfig.GetRenderValue(featureTags.data).txt
                const specialRenderings = Utils.NoNull(
                    SpecialVisualizations.constructSpecification(rendering)
                ).filter((v) => typeof v !== "string" && v.func["supportsAutoAction"] === true)

                if (specialRenderings.length == 0) {
                    console.warn(
                        "AutoApply: feature " +
                            targetFeatureId +
                            " got a rendering without supported auto actions:",
                        rendering
                    )
                }

                for (const specialRendering of specialRenderings) {
                    if (typeof specialRendering === "string") {
                        continue
                    }
                    const action = <AutoAction>specialRendering.func
                    await action.applyActionOn(
                        feature,
                        this.state,
                        featureTags,
                        specialRendering.args
                    )
                }
                appliedOn.push(targetFeatureId)
                if (i % 50 === 0) {
                    await this.state.changes.flushChanges("Auto button: intermediate save")
                }
                this.appliedNumberOfFeatures.setData(i + 1)
            }
            console.log("Flushing changes...")
            await this.state.changes.flushChanges("Auto button: done")
            this.buttonState.setData("done")
            console.log(
                "Applied changes onto",
                appliedOn.length,
                "items, unique IDs:",
                new Set(appliedOn).size
            )
        } catch (e) {
            console.error("Error while running autoApply: ", e)
            this.buttonState.setData({ error: e })
        }
    }
}

export default class AutoApplyButton implements SpecialVisualization {
    public readonly docs: string
    public readonly funcName: string = "auto_apply"
    public readonly needsUrls = []

    public readonly args: {
        name: string
        defaultValue?: string
        doc: string
        required?: boolean
    }[] = [
        {
            name: "target_layer",
            doc: "The layer that the target features will reside in",
            required: true,
        },
        {
            name: "target_feature_ids",
            doc: "The key, of which the value contains a list of ids",
            required: true,
        },
        {
            name: "tag_rendering_id",
            doc: "The ID of the tagRendering containing the autoAction. This tagrendering will be calculated. The embedded actions will be executed",
            required: true,
        },
        {
            name: "text",
            doc: "The text to show on the button",
            required: true,
        },
        {
            name: "icon",
            doc: "The icon to show on the button",
            defaultValue: "./assets/svg/robot.svg",
        },
    ]

    constructor(allSpecialVisualisations: SpecialVisualization[]) {
        this.docs = AutoApplyButton.generateDocs(
            allSpecialVisualisations
                .filter((sv) => sv["supportsAutoAction"] === true)
                .map((sv) => sv.funcName)
        )
    }

    private static generateDocs(supportedActions: string[]) {
        return new Combine([
            "A button to run many actions for many features at once.",
            "To effectively use this button, you'll need some ingredients:",
            new List([
                "A target layer with features for which an action is defined in a tag rendering. The following special visualisations support an autoAction: " +
                    supportedActions.join(", "),
                "A host feature to place the auto-action on. This can be a big outline (such as a city). Another good option for this is the layer ",
                new Link("current_view", "./BuiltinLayers.md#current_view"),
                "Then, use a calculated tag on the host feature to determine the overlapping object ids",
                "At last, add this component",
            ]),
        ]).AsMarkdown()
    }

    constr(
        state: SpecialVisualizationState,
        tagSource: UIEventSource<Record<string, string>>,
        argument: string[]
    ): BaseUIElement {
        try {
            if (!state.layout.official && !state.featureSwitchIsTesting.data) {
                const t = Translations.t.general.add.import
                return new Combine([
                    new FixedUiElement(
                        "The auto-apply button is only available in official themes (or in testing mode)"
                    ).SetClass("alert"),
                    t.howToTest,
                ])
            }

            const target_layer_id = argument[0]
            const targetTagRendering = argument[2]
            const text = argument[3]
            const icon = argument[4]
            const options = {
                target_layer_id,
                targetTagRendering,
                text,
                icon,
            }

            return new Lazy(() => {
                const to_parse = new UIEventSource<string[]>(undefined)
                // Very ugly hack: read the value every 500ms
                Stores.Chronic(500, () => to_parse.data === undefined).addCallback(() => {
                    let applicable = <string | string[]>tagSource.data[argument[1]]
                    if (typeof applicable === "string") {
                        applicable = JSON.parse(applicable)
                    }
                    to_parse.setData(<string[]>applicable)
                })

                const loading = new Loading("Gathering which elements support auto-apply... ")
                return new VariableUiElement(
                    Stores.ListStabilized(to_parse).map((ids) => {
                        if (ids === undefined) {
                            return loading
                        }

                        if (typeof ids === "string") {
                            ids = JSON.parse(ids)
                        }
                        return new ApplyButton(state, ids, options)
                    })
                )
            })
        } catch (e) {
            return new FixedUiElement(
                "Could not generate a auto_apply-button for key " + argument[0] + " due to " + e
            ).SetClass("alert")
        }
    }

    getLayerDependencies(args: string[]): string[] {
        return [args[0]]
    }
}
