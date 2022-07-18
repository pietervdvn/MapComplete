import { Utils } from "../Utils";

/**
 * A thin wrapper around a html element, which allows to generate a HTML-element.
 *
 * Assumes a read-only configuration, so it has no 'ListenTo'
 */
export default abstract class BaseUIElement {

    protected _constructedHtmlElement: HTMLElement;
    protected isDestroyed = false;
    private clss: Set<string> = new Set<string>();
    private style: string;
    private _onClick: () => void;

    public onClick(f: (() => void)) {
        this._onClick = f;
        this.SetClass("clickable")
        if (this._constructedHtmlElement !== undefined) {
            this._constructedHtmlElement.onclick = f;
        }
        return this;
    }

    AttachTo(divId: string) {
        let element = document.getElementById(divId);
        if (element === null) {
            throw "SEVERE: could not attach UIElement to " + divId;
        }

        while (element.firstChild) {
            //The list is LIVE so it will re-index each call
            element.removeChild(element.firstChild);
        }
        const el = this.ConstructElement();
        if (el !== undefined) {
            element.appendChild(el)
        }

        return this;
    }

    public ScrollToTop() {
        this._constructedHtmlElement?.scrollTo(0, 0)
    }

    /**
     * Adds all the relevant classes, space separated
     */
    public SetClass(clss: string) {
        if (clss == undefined) {
            return this
        }
        const all = clss.split(" ").map(clsName => clsName.trim());
        let recordedChange = false;
        for (let c of all) {
            c = c.trim();
            if (this.clss.has(clss)) {
                continue;
            }
            if (c === undefined || c === "") {
                continue;
            }
            this.clss.add(c);
            recordedChange = true;
        }
        if (recordedChange) {
            this._constructedHtmlElement?.classList.add(...Array.from(this.clss));
        }
        return this;
    }

    public RemoveClass(classes: string): BaseUIElement {
        const all = classes.split(" ").map(clsName => clsName.trim());
        for (let clss of all) {
            if (this.clss.has(clss)) {
                this.clss.delete(clss);
                this._constructedHtmlElement?.classList.remove(clss)
            }
        }
        return this;
    }

    public HasClass(clss: string): boolean {
        return this.clss.has(clss)
    }

    public SetStyle(style: string): BaseUIElement {
        this.style = style;
        if (this._constructedHtmlElement !== undefined) {
            this._constructedHtmlElement.style.cssText = style;
        }
        return this;
    }

    /**
     * The same as 'Render', but creates a HTML element instead of the HTML representation
     */
    public ConstructElement(): HTMLElement {
        if (typeof window === undefined) {
            return undefined;
        }

        if (this._constructedHtmlElement !== undefined) {
            return this._constructedHtmlElement
        }

        try {
            const el = this.InnerConstructElement();

            if (el === undefined) {
                return undefined;
            }

            this._constructedHtmlElement = el;
            const style = this.style
            if (style !== undefined && style !== "") {
                el.style.cssText = style
            }
            if (this.clss.size > 0) {
                try {
                    el.classList.add(...Array.from(this.clss))
                } catch (e) {
                    console.error("Invalid class name detected in:", Array.from(this.clss).join(" "), "\nErr msg is ", e)
                }
            }

            if (this._onClick !== undefined) {
                const self = this;
                el.onclick = (e) => {
                    // @ts-ignore
                    if (e.consumed) {
                        return;
                    }
                    self._onClick();
                    // @ts-ignore
                    e.consumed = true;
                }
                el.classList.add("pointer-events-none", "cursor-pointer");
            }

            return el
        } catch (e) {
            const domExc = e as DOMException;
            if (domExc) {
                console.log("An exception occured", domExc.code, domExc.message, domExc.name)
            }
            console.error(e)
        }
    }

    public AsMarkdown(): string {
        throw "AsMarkdown is not implemented; implement it in the subclass"
    }

    public Destroy() {
        this.isDestroyed = true;
    }

    protected abstract InnerConstructElement(): HTMLElement;
}
