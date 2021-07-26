import {InputElement} from "./InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import BaseUIElement from "../BaseUIElement";
import {Translation} from "../i18n/Translation";
import {SubstitutedTranslation} from "../SubstitutedTranslation";

export default class InputElementWrapper<T> extends InputElement<T> {
    public readonly IsSelected: UIEventSource<boolean>;
    private readonly _inputElement: InputElement<T>;
    private readonly _renderElement: BaseUIElement

    constructor(inputElement: InputElement<T>, translation: Translation, key: string, tags: UIEventSource<any>) {
        super()
        this._inputElement = inputElement;
        this.IsSelected = inputElement.IsSelected
        const mapping = new Map<string, BaseUIElement>()

        mapping.set(key, inputElement)

        this._renderElement = new SubstitutedTranslation(translation, tags, mapping)
    }

    GetValue(): UIEventSource<T> {
        return this._inputElement.GetValue();
    }

    IsValid(t: T): boolean {
        return this._inputElement.IsValid(t);
    }

    protected InnerConstructElement(): HTMLElement {
        return this._renderElement.ConstructElement();
    }

}