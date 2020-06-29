import {UIElement} from "../UIElement";
import {UIEventSource} from "../UIEventSource";
import {FixedUiElement} from "./FixedUiElement";
import $ from "jquery"

export class UIRadioButton extends UIElement {

    public readonly SelectedElementIndex: UIEventSource<{ index: number, value: string }>
        = new UIEventSource<{ index: number, value: string }>(null);

    private readonly _elements: UIEventSource<{ element: UIElement, value: string }[]>

    constructor(elements: UIEventSource<{ element: UIElement, value: string }[]>) {
        super(elements);
        this._elements = elements;
    }

    static FromStrings(choices: string[]): UIRadioButton {
        const wrapped = [];
        for (const choice of choices) {
            wrapped.push({
                element: new FixedUiElement(choice),
                value: choice
            });
        }
        return new UIRadioButton(new UIEventSource<{ element: UIElement, value: string }[]>(wrapped))
    }

    private IdFor(i) {
        return 'radio-' + this.id + '-' + i;
    }

    protected InnerRender(): string {

        let body = "";
        let i = 0;
        for (const el of this._elements.data) {
            const uielement = el.element;
            const value = el.value;

            const htmlElement =
                '<input type="radio" id="' + this.IdFor(i) + '" name="radiogroup-' + this.id + '" value="' + value + '">' +
                '<label for="' + this.IdFor(i) + '">' + uielement.Render() + '</label>' +
                '<br>';
            body += htmlElement;

            i++;
        }

        return "<form id='" + this.id + "-form'>" + body + "</form>";
    }

    InnerUpdate(htmlElement: HTMLElement) {
        super.InnerUpdate(htmlElement);
        const self = this;

        function checkButtons() {
            for (let i = 0; i < self._elements.data.length; i++) {
                const el = document.getElementById(self.IdFor(i));
                // @ts-ignore
                if (el.checked) {
                    var v = {index: i, value: self._elements.data[i].value}
                    self.SelectedElementIndex.setData(v);
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
            const el = document.getElementById(this.IdFor(0));
            el.checked = true;
            checkButtons();
        } else {

            // We check that what is selected matches the previous rendering
            var checked = -1;
            var expected = -1
            for (let i = 0; i < self._elements.data.length; i++) {
                const el = document.getElementById(self.IdFor(i));
                // @ts-ignore
                if (el.checked) {
                    checked = i;
                }
                if (el.value === this.SelectedElementIndex.data.value) {
                    expected = i;
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