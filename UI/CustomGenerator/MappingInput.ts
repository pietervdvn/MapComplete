import {InputElement} from "../Input/InputElement";
import {AndOrTagConfigJson} from "../../Customizations/JSON/TagConfigJson";
import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";
import SettingsTable from "./SettingsTable";
import SingleSetting from "./SingleSetting";
import AndOrTagInput from "../Input/AndOrTagInput";
import MultiLingualTextFields from "../Input/MultiLingualTextFields";
import {DropDown} from "../Input/DropDown";

export default class MappingInput extends InputElement<{ if: AndOrTagConfigJson, then: (string | any), hideInAnswer?: boolean }> {

    private readonly _value: UIEventSource<{ if: AndOrTagConfigJson; then: any; hideInAnswer?: boolean }>;
    private readonly _panel: UIElement;

    constructor(languages: UIEventSource<any>, disableQuestions: boolean = false) {
        super();
        const currentSelected = new UIEventSource<SingleSetting<any>>(undefined);
        this._value = new UIEventSource<{ if: AndOrTagConfigJson, then: any, hideInAnswer?: boolean }>({
            if: undefined,
            then: undefined
        });
        const self = this;

        function setting(inputElement: InputElement<any>, path: string, name: string, description: string | UIElement) {
            return new SingleSetting(self._value, inputElement, path, name, description);
        }

        const withQuestions = [setting(new DropDown("",
            [{value: false, shown: "Can be used as answer"}, {value: true, shown: "Not an answer option"}]),
            "hideInAnswer", "Answer option",
            "Sometimes, multiple tags for the same meaning are used (e.g. <span class='literal-code'>access=yes</span> and <span class='literal-code'>access=public</span>)." +
            "Use this toggle to disable an anwer. Alternatively an implied/assumed rendering can be used. In order to do this:" +
            "use a single tag in the 'if' with <i>no</i> value defined, e.g. <span class='literal-code'>indoor=</span>. The mapping will then be shown as default until explicitly changed"
        )];
        
        this._panel = new SettingsTable([
            setting(new AndOrTagInput(), "if", "If matches", "If this condition matches, the template <b>then</b> below will be used"),
            setting(new MultiLingualTextFields(languages),
                "then", "Then show", "If the condition above matches, this template <b>then</b> below will be shown to the user."),
            ...(disableQuestions ? [] : withQuestions)

        ], currentSelected).SetClass("bordered tag-mapping");

    }


    InnerRender(): string {
        return this._panel.Render();
    }


    GetValue(): UIEventSource<{ if: AndOrTagConfigJson; then: any; hideInAnswer?: boolean }> {
        return this._value;
    }


    IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);

    IsValid(t: { if: AndOrTagConfigJson; then: any; hideInAnswer: boolean }): boolean {
        return false;
    }

}