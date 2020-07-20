import {UIElement} from "../UIElement";
import {UIEventSource} from "../UIEventSource";
import {UIInputElement} from "./UIInputElement";

export class UIRadioButton<T> extends UIInputElement<T> {

    public readonly SelectedElementIndex: UIEventSource<number>
        = new UIEventSource<number>(null);

    private value: UIEventSource<T>;
    private readonly _elements: UIInputElement<T>[]
    private _selectFirstAsDefault: boolean;
    private _valueMapping: (i: number) => T;


    constructor(elements: UIInputElement<T>[],
                selectFirstAsDefault = true) {
        super(undefined);
        this._elements = elements;
        this._selectFirstAsDefault = selectFirstAsDefault;
        const self = this;
        this.SelectedElementIndex.addCallback(() => {
            self.InnerUpdate(undefined);
        })


        this.value =
            UIEventSource.flatten(this.SelectedElementIndex.map(
                (selectedIndex) => {
                    if (selectedIndex !== undefined && selectedIndex !== null) {
                        return elements[selectedIndex].GetValue()
                    }
                }
            ), elements.map(e => e.GetValue()))
        ;


        for (let i = 0; i < elements.length; i ++){
            elements[i].onClick(( ) => {
                self.SelectedElementIndex.setData(i);
            });
        }


    }
    
    GetValue(): UIEventSource<T> {
        return this.value;
    }


    private IdFor(i) {
        return 'radio-' + this.id + '-' + i;
    }

    protected InnerRender(): string {

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

    InnerUpdate(htmlElement: HTMLElement) {
        const self = this;

        function checkButtons() {
            for (let i = 0; i < self._elements.length; i++) {
                const el = document.getElementById(self.IdFor(i));
                // @ts-ignore
                if (el.checked) {
                    self.SelectedElementIndex.setData(i);
                }
            }
        }


        const el = document.getElementById(this.id);
        el.addEventListener("change",
            function () {
                checkButtons();
            }
        );

        if (this.SelectedElementIndex.data == null) {
            if (this._selectFirstAsDefault) {
                const el = document.getElementById(this.IdFor(0));
                if (el) {
                    // @ts-ignore
                    el.checked = true;
                    checkButtons();
                }
            }
        } else {

            // We check that what is selected matches the previous rendering
            var checked = -1;
            var expected = this.SelectedElementIndex.data;
            if (expected) {

                for (let i = 0; i < self._elements.length; i++) {
                    const el = document.getElementById(self.IdFor(i));
                    // @ts-ignore
                    if (el.checked) {
                        checked = i;
                    }
                }
                if (expected != checked) {
                    const el = document.getElementById(this.IdFor(expected));
                    // @ts-ignore
                    el.checked = true;
                }
            }
        }


    }


}