import BaseUIElement from "../BaseUIElement";
import {InputElement} from "./InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";

export default class FileSelectorButton extends InputElement<FileList> {

    private static _nextid;
    IsSelected: UIEventSource<boolean>;
    private readonly _value = new UIEventSource<FileList>(undefined);
    private readonly _label: BaseUIElement;
    private readonly _acceptType: string;
    private readonly allowMultiple: boolean;

    constructor(label: BaseUIElement, options?:
        { acceptType: "image/*" | string,
        allowMultiple: true | boolean}) {
        super();
        this._label = label;
        this._acceptType = options?.acceptType ?? "image/*";
        this.SetClass("block cursor-pointer")
        label.SetClass("cursor-pointer")
        this.allowMultiple = options?.allowMultiple ?? true
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
        const label = document.createElement("label")
        label.appendChild(this._label.ConstructElement())
        el.appendChild(label)

        const actualInputElement = document.createElement("input");
        actualInputElement.style.cssText = "display:none";
        actualInputElement.type = "file";
        actualInputElement.accept = this._acceptType;
        actualInputElement.name = "picField";
        actualInputElement.multiple = this.allowMultiple;
        actualInputElement.id = "fileselector" + FileSelectorButton._nextid;
        FileSelectorButton._nextid++;

        label.htmlFor = actualInputElement.id;

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

        el.addEventListener('dragover', (event) => {
            event.stopPropagation();
            event.preventDefault();
            // Style the drag-and-drop as a "copy file" operation.
            event.dataTransfer.dropEffect = 'copy';
        });

        el.addEventListener('drop', (event) => {
            event.stopPropagation();
            event.preventDefault();
            const fileList = event.dataTransfer.files;
            this._value.setData(fileList)
        });

        return el;
    }


}