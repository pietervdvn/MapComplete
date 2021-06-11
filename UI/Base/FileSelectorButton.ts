import BaseUIElement from "../BaseUIElement";
import {InputElement} from "../Input/InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";

export default class FileSelectorButton extends InputElement<FileList> {

    IsSelected: UIEventSource<boolean>;
    private readonly _value = new UIEventSource(undefined);
    private readonly _label: BaseUIElement;
    private readonly _acceptType: string;

    constructor(label: BaseUIElement, acceptType: string = "image/*") {
        super();
        this._label = label;
        this._acceptType = acceptType;
    }

    GetValue(): UIEventSource<FileList> {
        return this._value;
    }

    IsValid(t: FileList): boolean {
        return true;
    }

    protected InnerConstructElement(): HTMLElement {
        const self = this;
        const el = document.createElement("form")
        {
            const label = document.createElement("label")
            label.appendChild(this._label.ConstructElement())
            el.appendChild(label)
        }
        {
            const actualInputElement = document.createElement("input");
            actualInputElement.style.cssText = "display:none";
            actualInputElement.type = "file";
            actualInputElement.accept = this._acceptType;
            actualInputElement.name = "picField";
            actualInputElement.multiple = true;

            actualInputElement.onchange = () => {
                if (actualInputElement.files !== null) {
                    self._value.setData(actualInputElement.files)
                }
            }

            el.addEventListener('submit', e => {
                if (actualInputElement.files !== null) {
                    self._value.setData(actualInputElement.files)
                }
                e.preventDefault()
            })

            el.appendChild(actualInputElement)
        }

        return undefined;
    }


}