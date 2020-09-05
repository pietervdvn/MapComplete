import {InputElement} from "../Input/InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";
import {MultiTagInput} from "../Input/MultiTagInput";
import SettingsTable from "./SettingsTable";
import SingleSetting from "./SingleSetting";
import MultiLingualTextFields from "../Input/MultiLingualTextFields";
import Combine from "../Base/Combine";

export default class PresetInputPanel extends InputElement<{
    title: string | any,
    tags: string[],
    description?: string | any
}> {
    private readonly _value: UIEventSource<{
        title: string | any,
        tags: string[],
        description?: string | any
    }>;
    private readonly panel: UIElement;


    constructor(currentlySelected: UIEventSource<SingleSetting<any>>, languages: UIEventSource<string[]>) {
        super();
        this._value = new UIEventSource({tags: [], title: {}});


        const self = this;
        function s(input: InputElement<any>, path: string, name: string, description: string){
            return new SingleSetting(self._value, input, path, name, description)
        }
        this.panel = new SettingsTable([
            s(new MultiTagInput(), "tags","Preset tags","These tags will be applied on the newly created point"),
            s(new MultiLingualTextFields(languages), "title","Preset title","This little text is shown in bold on the 'create new point'-button" ),
            s(new MultiLingualTextFields(languages), "description","Description", "This text is shown in the button as description when creating a new point")
        ], currentlySelected).SetStyle("display: block; border: 1px solid black; border-radius: 1em;padding: 1em;");
    }


    InnerRender(): string {
        return new Combine([this.panel]).Render();
    }

    GetValue(): UIEventSource<{
        title: string | any,
        tags: string[],
        description?: string | any
    }> {
        return this._value;
    }

    IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);

    IsValid(t: any): boolean {
        return false;
    }

}