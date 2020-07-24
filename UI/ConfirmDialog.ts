import {UIElement} from "./UIElement";
import {UIEventSource} from "./UIEventSource";
import {FixedUiElement} from "./Base/FixedUiElement";
import {VariableUiElement} from "./Base/VariableUIElement";


export class ConfirmDialog extends UIElement {
    private _showOptions: UIEventSource<boolean> = new UIEventSource<boolean>(false);

    private _question: UIElement;
    private _optionA: UIElement;
    private _optionB: UIElement;

    constructor(
        show: UIEventSource<boolean>,
        question: string,
        optionA: string, optionB: string,
        executeA: () => void,
        executeB: () => void,
        classA: string = "",
        classB: string = "") {
        super(show);
        this.ListenTo(this._showOptions);
        const self = this;
        show.addCallback(() => {
            self._showOptions.setData(false);
        })
        this._question = new FixedUiElement("<span class='ui-question'>" + question + "</span>")
            .onClick(() => {
                self._showOptions.setData(!self._showOptions.data);
            });
        this._optionA = new VariableUiElement(
            this._showOptions.map(
                (show) => show ? "<div class='" + classA + "'>" + optionA + "</div>" : ""))
            .onClick(() => {
                    self._showOptions.setData(false);
                    executeA();
                }
            );
        this._optionB = new VariableUiElement(
            this._showOptions.map((show) =>
                show ? "<div class='" + classB + "'>" + optionB + "</div>" : "")        )
            .onClick(() => {
                self._showOptions.setData(false);
                executeB();
            });

        
        
    }

    InnerRender(): string {
        if (!this._source.data) {
            return "";
        }

        return this._question.Render() +
            this._optionA.Render() +
            this._optionB.Render();
    }

    Update() {
        super.Update();
        this._question.Update();
        this._optionA.Update();
        this._optionB.Update();
    }

}