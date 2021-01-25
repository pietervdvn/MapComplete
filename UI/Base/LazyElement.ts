import {UIElement} from "../UIElement";

export default class LazyElement<T extends UIElement> extends UIElement {


    public Activate: (onElement?: (element: T) => void) => void;
    private _content: T = undefined;
    private readonly _loadingContent: string;

    constructor(content: (() => T), loadingContent = "Rendering...") {
        super();
        this._loadingContent = loadingContent;
        this.dumbMode = false;
        const self = this;
        this.Activate = (onElement?: (element: T) => void) => {
            console.log("ACTIVATED")
            if (this._content === undefined) {
                self._content = content();
            }
            if (onElement) {
                onElement(self._content)
            }
            self.Update();
        }
    }

    InnerRender(): string {
        if (this._content === undefined) {
            return this._loadingContent;
        }
        return this._content.Render();
    }

}