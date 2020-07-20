import {UIElement} from "../UIElement";
import {UIEventSource} from "../UIEventSource";
import {InputElement} from "./InputElement";

export class RadioButton<T> extends InputElement<T> {

    private readonly _selectedElementIndex: UIEventSource<number>
        = new UIEventSource<number>(null);

    private value: UIEventSource<T>;
    private readonly _elements: InputElement<T>[]
    private _selectFirstAsDefault: boolean;


    constructor(elements: InputElement<T>[],
                selectFirstAsDefault = true) {
        super(undefined);
        this._elements = elements;
        this._selectFirstAsDefault = selectFirstAsDefault;
        const self = this;


        this.value =
            UIEventSource.flatten(this._selectedElementIndex.map(
                (selectedIndex) => {
                    if (selectedIndex !== undefined && selectedIndex !== null) {
                        return elements[selectedIndex].GetValue()
                    }
                }
            ), elements.map(e => e.GetValue()));

        this.value.addCallback((t) => {
            self.ShowValue(t);
        })


        for (let i = 0; i < elements.length; i++) {
            // If an element is clicked, the radio button corresponding with it should be selected as well
            elements[i].onClick(() => {
                self._selectedElementIndex.setData(i);
            });
        }

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


    private IdFor(i) {
        return 'radio-' + this.id + '-' + i;
    }

    InnerRender(): string {

        let body = "";
        let i = 0;
        for (const el of this._elements) {
            const htmlElement =
                '<input type="radio" id="' + this.IdFor(i) + '" name="radiogroup-' + this.id + '">' +
                '<label for="' + this.IdFor(i) + '">' + el.Render() + '</label>' +
                '<br>';
            body += htmlElement;

            i++;
        }

        return "<form id='" + this.id + "-form'>" + body + "</form>";
    }

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
    }

    InnerUpdate(htmlElement: HTMLElement) {
        const self = this;

        function checkButtons() {
            for (let i = 0; i < self._elements.length; i++) {
                const el = document.getElementById(self.IdFor(i));
                // @ts-ignore
                if (el.checked) {
                    self._selectedElementIndex.setData(i);
                }
            }
        }


        const el = document.getElementById(this.id);
        el.addEventListener("change",
            function () {
                checkButtons();
            }
        );
        if (this._selectedElementIndex.data !== null) {
            const el = document.getElementById(this.IdFor(this._selectedElementIndex.data));
            if (el) {
                // @ts-ignore
                el.checked = true;
                checkButtons();
            }
        } else if (this._selectFirstAsDefault) {
            this.ShowValue(this.value.data);
            if (this._selectedElementIndex.data === null || this._selectedElementIndex.data === undefined) {
                const el = document.getElementById(this.IdFor(0));
                if (el) {
                    // @ts-ignore
                    el.checked = true;
                    checkButtons();
                }
            }
        }


    };


}