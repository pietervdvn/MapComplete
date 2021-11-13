import BaseUIElement from "../BaseUIElement";

export default class Lazy extends BaseUIElement {
    private readonly _f: () => BaseUIElement;

    constructor(f: () => BaseUIElement) {
        super();
        this._f = f;
    }

    protected InnerConstructElement(): HTMLElement {
        // The caching of the BaseUIElement will guarantee that _f will only be called once
        return this._f().ConstructElement();
    }

}