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
import {RadioButton} from "../Input/RadioButton";
import {FixedInputElement} from "../Input/FixedInputElement";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import {InputElement} from "../Input/InputElement";
import Img from "../Base/Img";
import {VariableUiElement} from "../Base/VariableUIElement";
import {And} from "../../Logic/Tags/And";
import Toggleable from "../Base/Toggleable";

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

    constructor(params: ({ features: any[], theme: string })) {

        const introduction = ValidatedTextField.ForType("text").ConstructInputElement({
            value: LocalStorageSource.Get("import-helper-introduction-text"),
            inputStyle: "width: 100%"
        })

        const wikilink = ValidatedTextField.ForType("url").ConstructInputElement({
            value: LocalStorageSource.Get("import-helper-wikilink-text"),
            inputStyle: "width: 100%"
        })

        const source = ValidatedTextField.ForType("string").ConstructInputElement({
            value: LocalStorageSource.Get("import-helper-source-text"),
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
            new VariableUiElement(wikilink.GetValue().map(wikilink => {
                try{
                    const url = new URL(wikilink)
                    if(url.hostname.toLowerCase() !== "wiki.openstreetmap.org"){
                        return new FixedUiElement("Expected a link to wiki.openstreetmap.org").SetClass("alert");
                    }

                    if(url.pathname.toLowerCase() === "/wiki/main_page"){
                        return new FixedUiElement("Nope, the home page isn't allowed either. Enter the URL of a proper wikipage documenting your import").SetClass("alert");
                    }
                }catch(e){
                    return new FixedUiElement("Not a valid URL").SetClass("alert")
                }
            }))
        ]);
        this.SetClass("flex flex-col")

        this.Value = introduction.GetValue().map(intro => {
            return {
                features: params.features,
                wikilink: wikilink.GetValue().data,
                intro,
                source: source.GetValue().data,
                theme: params.theme
            }
        }, [wikilink.GetValue(), source.GetValue()])

        this.IsValid = this.Value.map(obj => {
            if (obj === undefined) {
                return false;
            }
            if ([ obj.features, obj.intro, obj.wikilink, obj.source].some(v => v === undefined)){
                console.log("Obj is", obj)
                return false;
            }
            
            try{
                const url = new URL(obj.wikilink)
                if(url.hostname.toLowerCase() !== "wiki.openstreetmap.org"){
                    return false;
                }
            }catch(e){
                return false
            }
            
            return true;
                
        })
    }


}