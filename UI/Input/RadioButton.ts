import {InputElement} from "./InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {Utils} from "../../Utils";

export class RadioButton<T> extends InputElement<T> {
    IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);

    private readonly _selectedElementIndex: UIEventSource<number>
        = new UIEventSource<number>(null);

    private readonly value: UIEventSource<T>;
    private readonly _elements: InputElement<T>[]
    private readonly _selectFirstAsDefault: boolean;

    constructor(elements: InputElement<T>[],
                selectFirstAsDefault = true) {
        super(undefined);
        this._elements = Utils.NoNull(elements);
        this._selectFirstAsDefault = selectFirstAsDefault;
        const self = this;

        this.value =
            UIEventSource.flatten(this._selectedElementIndex.map(
                (selectedIndex) => {
                    if (selectedIndex !== undefined && selectedIndex !== null) {
                        return elements[selectedIndex].GetValue()
                    }
                }
            ), elements.map(e => e?.GetValue()));

        this.value.addCallback((t) => {
            self?.ShowValue(t);
        })


        for (let i = 0; i < elements.length; i++) {
            // If an element is clicked, the radio button corresponding with it should be selected as well
            elements[i]?.onClick(() => {
                self._selectedElementIndex.setData(i);
            });
            elements[i].IsSelected.addCallback(isSelected => {
                if (isSelected) {
                    self._selectedElementIndex.setData(i);
                }
            })
            elements[i].GetValue().addCallback(() => {
                self._selectedElementIndex.setData(i);
            })
        }
        this.dumbMode = false;

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
        for (let i = 0; i < this._elements.length; i++){
            const el = this._elements[i];
            const htmlElement =
                `<label for="${this.IdFor(i)}" class="question-option-with-border">` +
                    `<input type="radio" id="${this.IdFor(i)}" name="radiogroup-${this.id}">` +
                    el.Render() +
                `</label>`;
            body += htmlElement;
        }

        return `<form id='${this.id}-form'>${body}</form>`;
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