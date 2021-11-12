import BaseUIElement from "../BaseUIElement";
import {VariableUiElement} from "./VariableUIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import Loading from "./Loading";

export default class AsyncLazy extends BaseUIElement {
    private readonly _f: () => Promise<BaseUIElement>;

    constructor(f: () => Promise<BaseUIElement>) {
        super();
        this._f = f;
    }

    protected InnerConstructElement(): HTMLElement {
        // The caching of the BaseUIElement will guarantee that _f will only be called once

        return new VariableUiElement(
            UIEventSource.FromPromise(this._f()).map(el => {
                if (el === undefined) {
                    return new Loading()
                }
                return el
            })
        ).ConstructElement()
    }

}