import { InputElement } from "./InputElement";
import { UIEventSource } from "../../Logic/UIEventSource";
import { Utils } from "../../Utils";
import BaseUIElement from "../BaseUIElement";

/**
 * Supports multi-input
 */
export default class CheckBoxes extends InputElement<number[]> {
    private static _nextId = 0;
    IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    private readonly value: UIEventSource<number[]>;
    private readonly _elements: BaseUIElement[];

    constructor(
        elements: BaseUIElement[],
        value = new UIEventSource<number[]>([])
    ) {
        super();
        this.value = value;
        this._elements = Utils.NoNull(elements);
        this.SetClass("flex flex-col");
    }

    IsValid(ts: number[]): boolean {
        return ts !== undefined;
    }

    GetValue(): UIEventSource<number[]> {
        return this.value;
    }

    protected InnerConstructElement(): HTMLElement {
        const el = document.createElement("form");

        const value = this.value;
        const elements = this._elements;

        for (let i = 0; i < elements.length; i++) {
            let inputI = elements[i];
            const input = document.createElement("input");
            const id = CheckBoxes._nextId;
            CheckBoxes._nextId++;
            input.id = "checkbox" + id;

            input.type = "checkbox";
            input.classList.add("p-1", "cursor-pointer", "m-3", "pl-3", "mr-0");

            const label = document.createElement("label");
            label.htmlFor = input.id;
            label.appendChild(inputI.ConstructElement());
            label.classList.add(
                "block",
                "w-full",
                "p-2",
                "cursor-pointer",
                "bg-red"
            );

            const wrapper = document.createElement("span");
            wrapper.classList.add(
                "wrapper",
                "flex",
                "w-full",
                "border",
                "border-gray-400",
                "m-1"
            );
            wrapper.appendChild(input);
            wrapper.appendChild(label);
            el.appendChild(wrapper);

            value.addCallbackAndRunD((selectedValues) => {
                if (selectedValues.indexOf(i) >= 0) {
                    input.checked = true;
                }

                if (input.checked) {
                    wrapper.classList.remove("border-gray-400");
                    wrapper.classList.add("border-black");
                } else {
                    wrapper.classList.add("border-gray-400");
                    wrapper.classList.remove("border-black");
                }
            });

            input.onchange = () => {
                // Index = index in the list of already checked items
                const index = value.data.indexOf(i);
                if (input.checked && index < 0) {
                    value.data.push(i);
                    value.ping();
                } else if (index >= 0) {
                    value.data.splice(index, 1);
                    value.ping();
                }
            };
        }

        return el;
    }
}
