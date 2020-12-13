import {UIElement} from "../UIElement";

export default class LazyElement extends UIElement {


    private _content: UIElement = undefined;

    public Activate: () => void;

    constructor(content: (() => UIElement)) {
        super();
        this.dumbMode = false;
        const self = this;
        this.Activate = () => {
            if (this._content === undefined) {
                self._content = content();
            }
            self.Update();
        }
    }

    InnerRender(): string {
        if (this._content === undefined) {
            return "Rendering...";
        }
        return this._content.InnerRender();
    }


}