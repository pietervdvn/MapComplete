import {InputElement} from "./InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import BaseUIElement from "../BaseUIElement";
import {Translation} from "../i18n/Translation";
import {SubstitutedTranslation} from "../SubstitutedTranslation";
import FeaturePipelineState from "../../Logic/State/FeaturePipelineState";

export default class InputElementWrapper<T> extends InputElement<T> {
    private readonly _inputElement: InputElement<T>;
    private readonly _renderElement: BaseUIElement

    constructor(inputElement: InputElement<T>, translation: Translation, key: string, tags: UIEventSource<any>, state: FeaturePipelineState) {
        super()
        this._inputElement = inputElement;
        const mapping = new Map<string, BaseUIElement>()

        mapping.set(key, inputElement)

        // Bit of a hack: the SubstitutedTranslation expects a special rendering, but those are formatted '{key()}' instead of '{key}', so we substitute it first
        translation = translation.OnEveryLanguage((txt) => txt.replace("{" + key + "}", "{" + key + "()}"))
        this._renderElement = new SubstitutedTranslation(translation, tags, state, mapping)
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