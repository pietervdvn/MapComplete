import {InputElement} from "./InputElement";
import Translations from "../i18n/Translations";
import {UIEventSource} from "../../Logic/UIEventSource";
import BaseUIElement from "../BaseUIElement";

export class DropDown<T> extends InputElement<T> {

    private static _nextDropdownId = 0;
    public IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);

    private readonly _element: HTMLElement;

    private readonly _value: UIEventSource<T>;
    private readonly _values: { value: T; shown: string | BaseUIElement }[];

    constructor(label: string | BaseUIElement,
                values: { value: T, shown: string | BaseUIElement }[],
                value: UIEventSource<T> = undefined,
                options?: {
                    select_class?: string
                }
    ) {
        super();
        value = value ?? new UIEventSource<T>(undefined)
        this._value = value
        this._values = values;
        if (values.length <= 1) {
            return;
        }

        const id = DropDown._nextDropdownId;
        DropDown._nextDropdownId++;


        const el = document.createElement("form")
        this._element = el;
        el.id = "dropdown" + id;

        {
            const labelEl = Translations.W(label).ConstructElement()
            if (labelEl !== undefined) {
                const labelHtml = document.createElement("label")
                labelHtml.appendChild(labelEl)
                labelHtml.htmlFor = el.id;
                el.appendChild(labelHtml)
            }
        }

        options = options ?? {}
        options.select_class = options.select_class ?? 'bg-indigo-100 p-1 rounded hover:bg-indigo-200'


        {
            const select = document.createElement("select")
            select.classList.add(...(options.select_class.split(" ") ?? []))
            for (let i = 0; i < values.length; i++) {

                const option = document.createElement("option")
                option.value = "" + i
                option.appendChild(Translations.W(values[i].shown).ConstructElement())
                select.appendChild(option)
            }
            el.appendChild(select)


            select.onchange = (() => {
                var index = select.selectedIndex;
                value.setData(values[index].value);
            });

            value.addCallbackAndRun(selected => {
                for (let i = 0; i < values.length; i++) {
                    const value = values[i].value;
                    if (value === selected) {
                        select.selectedIndex = i;
                    }
                }
            })
        }


        this.onClick(() => {
        }) // by registering a click, the click event is consumed and doesn't bubble further to other elements, e.g. checkboxes
    }

    GetValue(): UIEventSource<T> {
        return this._value;
    }

    IsValid(t: T): boolean {
        for (const value of this._values) {
            if (value.value === t) {
                return true;
            }
        }
        return false
    }

    protected InnerConstructElement(): HTMLElement {
        return this._element;
    }

}