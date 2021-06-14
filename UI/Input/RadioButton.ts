import {InputElement} from "./InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {Utils} from "../../Utils";

export class RadioButton<T> extends InputElement<T> {
    private static _nextId = 0;
    IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    private readonly value: UIEventSource<T>;
    private _elements: InputElement<T>[];
    private readonly _element: HTMLElement;

    constructor(elements: InputElement<T>[],
                selectFirstAsDefault = true) {
        super()
        elements = Utils.NoNull(elements);
        const selectedElementIndex: UIEventSource<number> = new UIEventSource<number>(null);
        const value =
            UIEventSource.flatten(selectedElementIndex.map(
                (selectedIndex) => {
                    if (selectedIndex !== undefined && selectedIndex !== null) {
                        return elements[selectedIndex].GetValue()
                    }
                }
            ), elements.map(e => e?.GetValue()));


        /*
                value.addCallback((t) => {
                    self?.ShowValue(t);
                })*/


        for (let i = 0; i < elements.length; i++) {
            // If an element is clicked, the radio button corresponding with it should be selected as well
            elements[i]?.onClick(() => {
                selectedElementIndex.setData(i);
            });
            elements[i].IsSelected.addCallback(isSelected => {
                if (isSelected) {
                    selectedElementIndex.setData(i);
                }
            })
            elements[i].GetValue().addCallback(() => {
                selectedElementIndex.setData(i);
            })
        }


        const groupId = "radiogroup" + RadioButton._nextId
        RadioButton._nextId++

        const form = document.createElement("form")
        this._element = form;
        for (let i1 = 0; i1 < elements.length; i1++) {
            let element = elements[i1];
            const labelHtml = element.ConstructElement();
            if (labelHtml === undefined) {
                continue;
            }
            
            const input = document.createElement("input")
            input.id = "radio" + groupId + "-" + i1;
            input.name = groupId;
            input.type = "radio"


            const label = document.createElement("label")
            label.appendChild(labelHtml)
            label.htmlFor = input.id;
            input.appendChild(label)

            form.appendChild(input)

            form.addEventListener("change", () => {
                    // TODO FIXME
                }
            );
        }


        this.value = value;
        this._elements = elements;

    }

    IsValid(t: T): boolean {
        for (const inputElement of this._elements) {
            if (inputElement.IsValid(t)) {
                return true;
            }
        }
        return false;
    }

    GetValue(): UIEventSource<T> {
        return this.value;
    }


    protected InnerConstructElement(): HTMLElement {
        return this._element;
    }

    /*
    public ShowValue(t: T): boolean {
        if (t === undefined) {
            return false;
        }
        if (!this.IsValid(t)) {
            return false;
        }
        // We check that what is selected matches the previous rendering
        for (let i = 0; i < this._elements.length; i++) {
            const e = this._elements[i];
            if (e.IsValid(t)) {
                this._selectedElementIndex.setData(i);
                e.GetValue().setData(t);
                const radio = document.getElementById(this.IdFor(i));
                // @ts-ignore
                radio?.checked = true;
                return;
            }

        }
    }*/


}