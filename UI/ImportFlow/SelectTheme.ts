import {FlowStep} from "./FlowStep";
import Combine from "../Base/Combine";
import {UIEventSource} from "../../Logic/UIEventSource";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
import {InputElement} from "../Input/InputElement";
import {AllKnownLayouts} from "../../Customizations/AllKnownLayouts";
import {FixedInputElement} from "../Input/FixedInputElement";
import Img from "../Base/Img";
import Title from "../Base/Title";
import {RadioButton} from "../Input/RadioButton";
import {And} from "../../Logic/Tags/And";
import {VariableUiElement} from "../Base/VariableUIElement";
import {FixedUiElement} from "../Base/FixedUiElement";
import Toggleable from "../Base/Toggleable";
import {BBox} from "../../Logic/BBox";
import BaseUIElement from "../BaseUIElement";
import PresetConfig from "../../Models/ThemeConfig/PresetConfig";
import List from "../Base/List";

export default class SelectTheme extends Combine implements FlowStep<{
    features: any[],
    theme: string,
    layer: LayerConfig,
    bbox: BBox,
}> {

    public readonly Value: UIEventSource<{
        features: any[],
        theme: string,
        layer: LayerConfig,
        bbox: BBox,
    }>;
    public readonly IsValid: UIEventSource<boolean>;

    constructor(params: ({ features: any[], layer: LayerConfig, bbox: BBox, })) {

        let options: InputElement<string>[] = AllKnownLayouts.layoutsList
            .filter(th => th.layers.some(l => l.id === params.layer.id))
            .filter(th => th.id !== "personal")
            .map(th => new FixedInputElement<string>(
                new Combine([
                    new Img(th.icon).SetClass("block h-12 w-12 br-4"),
                    new Title(th.title)
                ]).SetClass("flex items-center"),
                th.id))


        const themeRadios = new RadioButton<string>(options, {
            selectFirstAsDefault: false
        })


        const applicablePresets = themeRadios.GetValue().map(theme => {
            if (theme === undefined) {
                return []
            }
            // we get the layer with the correct ID via the actual theme config, as the actual theme might have different presets due to overrides
            const themeConfig = AllKnownLayouts.layoutsList.find(th => th.id === theme)
            const layer = themeConfig.layers.find(l => l.id === params.layer.id)
            return layer.presets
        })


        const nonMatchedElements = applicablePresets.map(presets => {
            if (presets === undefined || presets.length === 0) {
                return undefined
            }
            return params.features.filter(feat => !presets.some(preset => new And(preset.tags).matchesProperties(feat.properties)))
        })

        super([
            new Title("Select a theme"),
            "All of the following themes will show the import notes. However, the note on OpenStreetMap can link to only one single theme. Choose which theme that the created notes will link to",
            themeRadios,
            new VariableUiElement(applicablePresets.map(applicablePresets => {
                if (themeRadios.GetValue().data === undefined) {
                    return undefined
                }
                if (applicablePresets === undefined || applicablePresets.length === 0) {
                    return new FixedUiElement("This theme has no presets loaded. As a result, imports won't work here").SetClass("alert")
                }
            }, [themeRadios.GetValue()])),

            new VariableUiElement(nonMatchedElements.map(unmatched => SelectTheme.nonMatchedElementsPanel(unmatched, applicablePresets.data), [applicablePresets]))
        ]);
        this.SetClass("flex flex-col")

        this.Value = themeRadios.GetValue().map(theme => ({
            features: params.features,
            layer: params.layer,
            bbox: params.bbox,
            theme
        }))

        this.IsValid = this.Value.map(obj => {
            if (obj === undefined) {
                return false;
            }
            if ([obj.theme, obj.features].some(v => v === undefined)) {
                return false;
            }
            if (applicablePresets.data === undefined || applicablePresets.data.length === 0) {
                return false
            }
            if ((nonMatchedElements.data?.length ?? 0) > 0) {
                return false;
            }

            return true;

        }, [applicablePresets])
    }

    private static nonMatchedElementsPanel(unmatched: any[], applicablePresets: PresetConfig[]): BaseUIElement {
        if (unmatched === undefined || unmatched.length === 0) {
            return
        }

        const applicablePresetsOverview = applicablePresets.map(preset => new Combine([
            preset.title.txt, "needs tags",
            new FixedUiElement(preset.tags.map(t => t.asHumanString()).join(" & ")).SetClass("thanks")
        ]))

        const unmatchedPanels: BaseUIElement[] = []
        for (const feat of unmatched) {
            const parts: BaseUIElement[] = []
            parts.push(new Combine(Object.keys(feat.properties).map(k => 
                k+"="+feat.properties[k]
            )).SetClass("flex flex-col"))

            for (const preset of applicablePresets) {
                const tags = new And(preset.tags).asChange({})
                const missing = []
                for (const {k, v} of tags) {
                    if (preset[k] === undefined) {
                        missing.push(
                            `Expected ${k}=${v}, but it is completely missing`
                        )
                    } else if (feat.properties[k] !== v) {
                        missing.push(
                            `Property with key ${k} does not have expected value ${v}; instead it is ${feat.properties}`
                        )
                    }
                }

                if (missing.length > 0) {
                    parts.push(
                        new Combine([
                            new FixedUiElement(`Preset ${preset.title.txt} is not applicable:`),
                            new List(missing)
                        ]).SetClass("flex flex-col alert")
                    )
                }

            }

            unmatchedPanels.push(new Combine(parts).SetClass("flex flex-col"))
        }

        return new Combine([
            new FixedUiElement(unmatched.length + " objects dont match any presets").SetClass("alert"),
            ...applicablePresetsOverview,
            new Toggleable(new Title("The following elements don't match any of the presets"),
                new Combine(unmatchedPanels))
        ]).SetClass("flex flex-col")

    }


}