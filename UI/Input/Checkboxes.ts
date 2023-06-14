import {InputElement} from "./InputElement"
import {UIEventSource} from "../../Logic/UIEventSource"
import {Utils} from "../../Utils"
import BaseUIElement from "../BaseUIElement"
import InputElementMap from "./InputElementMap"
import Translations from "../i18n/Translations"

/**
 * @deprecated
 */
export class CheckBox extends InputElementMap<number[], boolean> {
    constructor(el: BaseUIElement | string, defaultValue?: boolean) {
        super(
            new CheckBoxes([Translations.W(el)]),
            (x0, x1) => x0 === x1,
            (t) => t.length > 0,
            (x) => (x ? [0] : [])
        )
        if (defaultValue !== undefined) {
            this.GetValue().setData(defaultValue)
        }
    }
}

/**
 * A list of individual checkboxes
 * The value will contain the indexes of the selected checkboxes
 */
export default class CheckBoxes extends InputElement<number[]> {
    private static _nextId = 0
    private readonly value: UIEventSource<number[]>
    private readonly _elements: BaseUIElement[]

    constructor(elements: BaseUIElement[], value = new UIEventSource<number[]>([])) {
        super()
        this.value = value
        this._elements = Utils.NoNull(elements)
        this.SetClass("flex flex-col")
    }

    IsValid(ts: number[]): boolean {
        return ts !== undefined
    }

    GetValue(): UIEventSource<number[]> {
        return this.value
    }

    protected InnerConstructElement(): HTMLElement {
        const formTag = document.createElement("form")

        const value = this.value
        const elements = this._elements

        for (let i = 0; i < elements.length; i++) {
            let inputI = elements[i]
            const input = document.createElement("input")
            const id = CheckBoxes._nextId
            CheckBoxes._nextId++
            input.id = "checkbox" + id

            input.type = "checkbox"
            input.classList.add("p-1", "cursor-pointer", "m-3", "pl-3", "mr-0")

            const label = document.createElement("label")
            label.htmlFor = input.id
            label.appendChild(input)
            label.appendChild(inputI.ConstructElement())
            label.classList.add("block", "w-full", "p-2", "cursor-pointer")

            formTag.appendChild(label)

            value.addCallbackAndRunD((selectedValues) => {
                input.checked = selectedValues.indexOf(i) >= 0

                if (input.checked) {
                    label.classList.add("checked")
                } else {
                    label.classList.remove("checked")
                }
            })

            input.onchange = () => {
                // Index = index in the list of already checked items
                const index = value.data.indexOf(i)
                if (input.checked && index < 0) {
                    value.data.push(i)
                    value.ping()
                } else if (index >= 0) {
                    value.data.splice(index, 1)
                    value.ping()
                }
            }
        }

        return formTag
    }
}
