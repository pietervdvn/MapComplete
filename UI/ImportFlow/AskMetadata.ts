import Combine from "../Base/Combine";
import {FlowStep} from "./FlowStep";
import {UIEventSource} from "../../Logic/UIEventSource";
import ValidatedTextField from "../Input/ValidatedTextField";
import {LocalStorageSource} from "../../Logic/Web/LocalStorageSource";
import Title from "../Base/Title";
import {AllKnownLayouts} from "../../Customizations/AllKnownLayouts";
import {DropDown} from "../Input/DropDown";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
import BaseUIElement from "../BaseUIElement";
import {FixedUiElement} from "../Base/FixedUiElement";

export class AskMetadata extends Combine implements FlowStep<{
    features: any[],
    wikilink: string,
    intro: string,
    source: string,
    theme: string
}> {

    public readonly Value: UIEventSource<{
        features: any[],
        wikilink: string,
        intro: string,
        source: string,
        theme: string
    }>;
    public readonly IsValid: UIEventSource<boolean>;

    constructor(params: ({ features: any[], layer: LayerConfig })) {

        const introduction = ValidatedTextField.InputForType("text", {
            value: LocalStorageSource.Get("import-helper-introduction-text"),
            inputStyle: "width: 100%"
        })

        const wikilink = ValidatedTextField.InputForType("string", {
            value: LocalStorageSource.Get("import-helper-wikilink-text"),
            inputStyle: "width: 100%"
        })

        const source = ValidatedTextField.InputForType("string", {
            value: LocalStorageSource.Get("import-helper-source-text"),
            inputStyle: "width: 100%"
        })

        let options : {value: string, shown: BaseUIElement}[]=  AllKnownLayouts.layoutsList
            .filter(th => th.layers.some(l => l.id === params.layer.id))
            .filter(th => th.id !== "personal")
            .map(th => ({
                value: th.id,
                shown: th.title
            }))
        
        options.splice(0,0, {
            shown: new FixedUiElement("Select a theme"),
            value:  undefined
        })
        
        const theme = new DropDown("Which theme should be linked in the note?",options)
            
            ValidatedTextField.InputForType("string", {
            value: LocalStorageSource.Get("import-helper-theme-text"),
            inputStyle: "width: 100%"
        })

        super([
            new Title("Set metadata"),
            "Before adding " + params.features.length + " notes, please provide some extra information.",
            "Please, write an introduction for someone who sees the note",
            introduction.SetClass("w-full border border-black"),
            "What is the source of this data? If 'source' is set in the feature, this value will be ignored",
            source.SetClass("w-full border border-black"),
            "On what wikipage can one find more information about this import?",
            wikilink.SetClass("w-full border border-black"),
            theme
        ]);
        this.SetClass("flex flex-col")

        this.Value = introduction.GetValue().map(intro => {
            return {
                features: params.features,
                wikilink: wikilink.GetValue().data,
                intro,
                source: source.GetValue().data,
                theme: theme.GetValue().data

            }
        }, [wikilink.GetValue(), source.GetValue(), theme.GetValue()])

        this.IsValid = this.Value.map(obj => {
            if(obj === undefined){
                return false;
            }
            return obj.theme !== undefined && obj.features !== undefined && obj.wikilink !== undefined && obj.intro !== undefined && obj.source !== undefined;
        })
    }


}