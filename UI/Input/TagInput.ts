import {InputElement} from "./InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {DropDown} from "./DropDown";
import {TextField} from "./TextField";
import Combine from "../Base/Combine";
import {Utils} from "../../Utils";

export default class SingleTagInput extends InputElement<string> {

    private readonly _value: UIEventSource<string>;
    IsSelected: UIEventSource<boolean>;

    private key: InputElement<string>;
    private value: InputElement<string>;
    private operator: DropDown<string>

    constructor(value: UIEventSource<string> = undefined) {
        super(undefined);
        this._value = value ?? new UIEventSource<string>(undefined);
       
        this.key = TextField.KeyInput();

        this.value = new TextField<string>({
                placeholder: "value - if blank, matches if key is NOT present",
                fromString: str => str,
                toString: str => str
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
            this.key, this.operator, this.value
        ]).SetStyle("display:flex")
            .Render();
    }


    GetValue(): UIEventSource<string> {
        return this._value;
    }


}