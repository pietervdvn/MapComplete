import {InputElement} from "./InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {DropDown} from "./DropDown";
import {TextField} from "./TextField";
import Combine from "../Base/Combine";
import {Utils} from "../../Utils";
import {UIElement} from "../UIElement";
import {VariableUiElement} from "../Base/VariableUIElement";
import {FromJSON} from "../../Customizations/JSON/FromJSON";
import ValidatedTextField from "./ValidatedTextField";

export default class SingleTagInput extends InputElement<string> {

    private readonly _value: UIEventSource<string>;
    IsSelected: UIEventSource<boolean>;

    private key: InputElement<string>;
    private value: InputElement<string>;
    private operator: DropDown<string>
    private readonly helpMessage: UIElement;

    constructor(value: UIEventSource<string> = undefined) {
        super(undefined);
        this._value = value ?? new UIEventSource<string>("");
        this.helpMessage = new VariableUiElement(this._value.map(tagDef => {
                try {
                    FromJSON.Tag(tagDef, "");
                    return "";
                } catch (e) {
                    return `<br/><span class='alert'>${e}</span>`
                }
            }
        ));

        this.key = ValidatedTextField.KeyInput();

        this.value = new TextField({
                placeholder: "value - if blank, matches if key is NOT present",
                value: new UIEventSource<string>("")
            }
        );
        
        this.operator = new DropDown<string>("", [
            {value: "=", shown: "="},
            {value: "~", shown: "~"},
            {value: "!~", shown: "!~"}
        ]);
        this.operator.GetValue().setData("=");

        const self = this;

        function updateValue() {
            if (self.key.GetValue().data === undefined ||
                self.value.GetValue().data === undefined ||
                self.operator.GetValue().data === undefined) {
                return undefined;
            }
            self._value.setData(self.key.GetValue().data + self.operator.GetValue().data + self.value.GetValue().data);
        }

        this.key.GetValue().addCallback(() => updateValue());
        this.operator.GetValue().addCallback(() => updateValue());
        this.value.GetValue().addCallback(() => updateValue());


        function loadValue(value: string) {
            if (value === undefined) {
                return;
            }
            let parts: string[];
            if (value.indexOf("=") >= 0) {
                parts = Utils.SplitFirst(value, "=");
                self.operator.GetValue().setData("=");
            } else if (value.indexOf("!~") > 0) {
                parts = Utils.SplitFirst(value, "!~");
                self.operator.GetValue().setData("!~");

            } else if (value.indexOf("~") > 0) {
                parts = Utils.SplitFirst(value, "~");
                self.operator.GetValue().setData("~");
            } else {
                console.warn("Invalid value for tag: ", value)
                return;
            }
            self.key.GetValue().setData(parts[0]);
            self.value.GetValue().setData(parts[1]);
        }

        self._value.addCallback(loadValue);
        loadValue(self._value.data);
        this.IsSelected = this.key.IsSelected.map(
            isSelected => isSelected || this.value.IsSelected.data, [this.value.IsSelected]
        )
    }

    IsValid(t: string): boolean {
        return false;
    }

    InnerRender(): string {
        return new Combine([
            this.key, this.operator, this.value,
            this.helpMessage
        ]).Render();
    }


    GetValue(): UIEventSource<string> {
        return this._value;
    }


}