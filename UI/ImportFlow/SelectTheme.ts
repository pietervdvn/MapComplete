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

    constructor(params: ({ features: any[], layer: LayerConfig, bbox: BBox,  })) {

        let options: InputElement<string>[] = AllKnownLayouts.layoutsList
            .filter(th => th.layers.some(l => l.id === params.layer.id))
            .filter(th => th.id !== "personal")
            .map(th => new FixedInputElement<string>(
                new Combine([
                    new Img(th.icon).SetClass("block h-12 w-12 br-4"),
                    new Title( th.title)
                ]).SetClass("flex items-center"),
                th.id))


        const themeRadios = new RadioButton<string>(options, {
            selectFirstAsDefault: false
        })



        const applicablePresets = themeRadios.GetValue().map(theme => {
            if(theme === undefined){
                return []
            }
            // we get the layer with the correct ID via the actual theme config, as the actual theme might have different presets due to overrides
            const themeConfig = AllKnownLayouts.layoutsList.find(th => th.id === theme)
            const layer = themeConfig.layers.find(l => l.id === params.layer.id)
            return layer.presets
        })


        const nonMatchedElements = applicablePresets.map(presets => {
            if(presets === undefined || presets.length === 0){
                return undefined
            }
            return params.features.filter(feat => !presets.some(preset => new And(preset.tags).matchesProperties(feat.properties)))
        })

        super([
            new Title("Select a theme"),
            "All of the following themes will show the import notes. However, the note on OpenStreetMap can link to only one single theme. Choose which theme that the created notes will link to",
            themeRadios,
            new VariableUiElement(applicablePresets.map(applicablePresets => {
                if(themeRadios.GetValue().data === undefined){
                    return undefined
                }
                if(applicablePresets === undefined || applicablePresets.length === 0){
                    return new FixedUiElement("This theme has no presets loaded. As a result, imports won't work here").SetClass("alert")
                }
            },[themeRadios.GetValue()])),
            new VariableUiElement(nonMatchedElements.map(unmatched => {
                if(unmatched === undefined || unmatched.length === 0){
                    return
                }
                return new Combine([new FixedUiElement(unmatched.length+" objects dont match any presets").SetClass("alert"),
                    ...applicablePresets.data.map(preset => preset.title.txt +" needs tags "+ preset.tags.map(t => t.asHumanString()).join(" & ")),
                    ,
                    new Toggleable( new Title( "The following elements don't match any of the presets"),
                        new Combine( unmatched.map(feat => JSON.stringify(feat.properties))).SetClass("flex flex-col")
                    )

                ]) .SetClass("flex flex-col")

            }))
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
            if ([obj.theme, obj.features].some(v => v === undefined)){
                return false;
            }
            if(applicablePresets.data === undefined || applicablePresets.data.length === 0){
                return false
            }
            if((nonMatchedElements.data?.length??0) > 0){
                return false;
            }

            return true;

        }, [applicablePresets])
    }


}