import {UIInputElement} from "./UIInputElement";
import {UIEventSource} from "../UIEventSource";
import {UIRadioButton} from "./UIRadioButton";
import {UIElement} from "../UIElement";
import {TextField} from "./TextField";
import {FixedUiElement} from "./FixedUiElement";


export class UIRadioButtonWithOther<T> extends UIInputElement<T> {
    private readonly _radioSelector: UIRadioButton<T>;
    private readonly _freeformText: TextField<T>;
    private readonly _value: UIEventSource<T> = new UIEventSource<T>(undefined)

    constructor(choices: UIElement[],
                otherChoiceTemplate: string,
                placeholder: string,
                choiceToValue: ((i: number) => T),
                stringToValue: ((string: string) => T)) {
        super(undefined);
        const self = this;

        this._freeformText = new TextField(
            new UIEventSource<string>(placeholder),
            stringToValue);


        const otherChoiceElement = new FixedUiElement(
            otherChoiceTemplate.replace("$$$",  this._freeformText.Render()));
        choices.push(otherChoiceElement);

        this._radioSelector = new UIRadioButton(new UIEventSource(choices),
            (i) => {
                if (i === undefined || i === null) {
                    return undefined;
                }
                if (i + 1 >= choices.length) {
                    return  this._freeformText.GetValue().data
                }
                return choiceToValue(i);
            },
            false);

        this._radioSelector.GetValue().addCallback(
            (i) => {
                self._value.setData(i);
            });
        this._freeformText.GetValue().addCallback((str) => {
                self._value.setData(str);
            }
        );
        this._freeformText.onClick(() => {
            self._radioSelector.SelectedElementIndex.setData(choices.length - 1);
        })


    }

    GetValue(): UIEventSource<T> {
        return this._value;
    }

    protected InnerRender(): string {
        return this._radioSelector.Render();
    }

    InnerUpdate(htmlElement: HTMLElement) {
        super.InnerUpdate(htmlElement);
        this._radioSelector.Update();
        this._freeformText.Update();
    }

}