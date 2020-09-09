import {InputElement} from "./InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {Utils} from "../../Utils";

/**
 * Supports multi-input
 */
export class CheckBoxes<T> extends InputElement<T[]> {
    IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);

    private readonly _selectedElementIndex: UIEventSource<number>
        = new UIEventSource<number>(null);

    private readonly value: UIEventSource<T[]>;
    private readonly _elements: InputElement<T>[]
    private readonly _selectFirstAsDefault: boolean;


    constructor(elements: InputElement<T>[],
                selectFirstAsDefault = true) {
        super(undefined);
        this._elements = Utils.NoNull(elements);
        this._selectFirstAsDefault = selectFirstAsDefault;

        this.value = new UIEventSource<T[]>([])
        this.ListenTo(this.value);

    }

    IsValid(ts: T[]): boolean {
        if (ts === undefined) {
            return false;
        }
        for (const t of ts) {
            let matchFound = false;
            for (const element of this._elements) {
                if (element.IsValid(t)) {
                    matchFound = true;
                    break
                }
            }
            if (!matchFound) {
                return false;
            }
        }
        return true;
    }

    GetValue(): UIEventSource<T[]> {
        return this.value;
    }


    private IdFor(i) {
        return 'checkmark-' + this.id + '-' + i;
    }

    InnerRender(): string {

        let body = "";
        for (let i = 0; i < this._elements.length; i++) {
            let el = this._elements[i];
            const htmlElement =
                `<input type="checkbox" id="${this.IdFor(i)}"><label for="${this.IdFor(i)}">${el.Render()}</label><br/>`;
            body += htmlElement;

        }

        return `<form id='${this.id}-form'>${body}</form>`;
    }

    protected InnerUpdate(htmlElement: HTMLElement) {
        super.InnerUpdate(htmlElement);
        const self = this;

        for (let i = 0; i < this._elements.length; i++) {
            const el = document.getElementById(this.IdFor(i));
            const inputEl = this._elements[i];
            {

                const v = inputEl.GetValue().data;
                const index = self.value.data.indexOf(v);
                if(index >= 0){
                    // @ts-ignore
                    el.checked = true;
                }
            }


            el.onchange = e => {
                const v = inputEl.GetValue().data;
                const index = self.value.data.indexOf(v);
                // @ts-ignore
                if (el.checked) {
                    if (index < 0) {
                        self.value.data.push(v);
                        self.value.ping();
                    }
                } else {
                    if (index >= 0) {
                        self.value.data.splice(index, 1);
                        self.value.ping();
                    }
                }
            }

        }


    }


}