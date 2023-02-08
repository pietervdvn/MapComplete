import { InputElement } from "./InputElement"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import BaseUIElement from "../BaseUIElement"
import { Translation } from "../i18n/Translation"
import Locale from "../i18n/Locale"

interface TextFieldOptions {
    placeholder?: string | Store<string> | Translation
    value?: UIEventSource<string>
    htmlType?: "area" | "text" | "time" | string
    inputMode?: string
    label?: BaseUIElement
    textAreaRows?: number
    inputStyle?: string
    isValid?: (s: string) => boolean
}

export class TextField extends InputElement<string> {
    public readonly enterPressed = new UIEventSource<string>(undefined)
    private readonly value: UIEventSource<string>
    private _actualField: HTMLElement
    private readonly _isValid: (s: string) => boolean
    private readonly _rawValue: UIEventSource<string>
    private _isFocused = false
    private readonly _options: TextFieldOptions

    constructor(options?: TextFieldOptions) {
        super()
        this._options = options ?? {}
        options = options ?? {}
        this.value = options?.value ?? new UIEventSource<string>(undefined)
        this._rawValue = new UIEventSource<string>("")
        this._isValid = options.isValid ?? ((_) => true)
    }

    private static SetCursorPosition(textfield: HTMLElement, i: number) {
        if (textfield === undefined || textfield === null) {
            return
        }
        if (i === -1) {
            // @ts-ignore
            i = textfield.value.length
        }
        textfield.focus()
        // @ts-ignore
        textfield.setSelectionRange(i, i)
    }

    GetValue(): UIEventSource<string> {
        return this.value
    }

    GetRawValue(): UIEventSource<string> {
        return this._rawValue
    }

    IsValid(t: string): boolean {
        if (t === undefined || t === null) {
            return false
        }
        return this._isValid(t)
    }

    /**
     *
     * // should update placeholders dynamically
     * const placeholder = new UIEventSource<string>("placeholder")
     * const tf = new TextField({
     *     placeholder
     * })
     * const html = <HTMLInputElement> tf.InnerConstructElement().children[0];
     * html.placeholder // => 'placeholder'
     * placeholder.setData("another piece of text")
     * html.placeholder// => "another piece of text"
     *
     * // should update translated placeholders dynamically
     * const placeholder = new Translation({nl: "Nederlands", en: "English"})
     * Locale.language.setData("nl");
     * const tf = new TextField({
     *     placeholder
     * })
     * const html = <HTMLInputElement> tf.InnerConstructElement().children[0];
     * html.placeholder// => "Nederlands"
     * Locale.language.setData("en");
     * html.placeholder // => 'English'
     */
    protected InnerConstructElement(): HTMLElement {
        const options = this._options
        const self = this
        let placeholderStore: Store<string>
        let placeholder: string = ""
        if (options.placeholder) {
            if (typeof options.placeholder === "string") {
                placeholder = options.placeholder
                placeholderStore = undefined
            } else {
                if (
                    options.placeholder instanceof Store &&
                    options.placeholder["data"] !== undefined
                ) {
                    placeholderStore = options.placeholder
                } else if (
                    options.placeholder instanceof Translation &&
                    options.placeholder["translations"] !== undefined
                ) {
                    placeholderStore = <Store<string>>(
                        Locale.language.map((l) => (<Translation>options.placeholder).textFor(l))
                    )
                }
                placeholder = placeholderStore?.data ?? placeholder ?? ""
            }
        }

        this.SetClass("form-text-field")
        let inputEl: HTMLElement
        if (options.htmlType === "area") {
            this.SetClass("w-full box-border max-w-full")
            const el = document.createElement("textarea")
            el.placeholder = placeholder
            el.rows = options.textAreaRows
            el.cols = 50
            el.style.width = "100%"
            el.dir = "auto"
            inputEl = el
            if (placeholderStore) {
                placeholderStore.addCallbackAndRunD((placeholder) => (el.placeholder = placeholder))
            }
        } else {
            const el = document.createElement("input")
            el.type = options.htmlType ?? "text"
            el.inputMode = options.inputMode
            el.placeholder = placeholder
            el.style.cssText = options.inputStyle ?? "width: 100%;"
            el.dir = "auto"
            inputEl = el
            if (placeholderStore) {
                placeholderStore.addCallbackAndRunD((placeholder) => (el.placeholder = placeholder))
            }
        }

        const form = document.createElement("form")
        form.appendChild(inputEl)
        form.onsubmit = () => false

        if (options.label) {
            form.appendChild(options.label.ConstructElement())
        }

        const field = inputEl

        this.value.addCallbackAndRunD((value) => {
            // We leave the textfield as is in the case of undefined or null (handled by addCallbackAndRunD) - make sure we do not erase it!
            field["value"] = value
            if (self.IsValid(value)) {
                self.RemoveClass("invalid")
            } else {
                self.SetClass("invalid")
            }
        })

        field.oninput = () => {
            // How much characters are on the right, not including spaces?
            // @ts-ignore
            const endDistance = field.value.substring(field.selectionEnd).replace(/ /g, "").length
            // @ts-ignore
            let val: string = field.value
            self._rawValue.setData(val)
            if (!self.IsValid(val)) {
                self.value.setData(undefined)
            } else {
                self.value.setData(val)
            }
            // Setting the value might cause the value to be set again. We keep the distance _to the end_ stable, as phone number formatting might cause the start to change
            // See https://github.com/pietervdvn/MapComplete/issues/103
            // We reread the field value - it might have changed!

            // @ts-ignore
            val = field.value
            let newCursorPos = val.length - endDistance
            while (
                newCursorPos >= 0 &&
                // We count the number of _actual_ characters (non-space characters) on the right of the new value
                // This count should become bigger then the end distance
                val.substr(newCursorPos).replace(/ /g, "").length < endDistance
            ) {
                newCursorPos--
            }
            TextField.SetCursorPosition(field, newCursorPos)
        }

        field.addEventListener("keyup", function (event) {
            if (event.key === "Enter") {
                // @ts-ignore
                self.enterPressed.setData(field.value)
            }
        })

        if (this._isFocused) {
            field.focus()
        }

        this._actualField = field
        return form
    }

    public focus() {
        if (this._actualField === undefined) {
            this._isFocused = true
        } else {
            this._actualField.focus()
        }
    }
}
