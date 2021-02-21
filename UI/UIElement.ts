import {UIEventSource} from "../Logic/UIEventSource";
import {Utils} from "../Utils";

export abstract class UIElement extends UIEventSource<string> {

    private static nextId: number = 0;
    public readonly id: string;
    public readonly _source: UIEventSource<any>;
    public dumbMode = false;
    private clss: Set<string> = new Set<string>();
    private style: string;
    private _hideIfEmpty = false;
    private lastInnerRender: string;
    private _onClick: () => void;
    private _onHover: UIEventSource<boolean>;

    protected constructor(source: UIEventSource<any> = undefined) {
        super("");
        this.id = "ui-element-" + UIElement.nextId;
        this._source = source;
        UIElement.nextId++;
        this.dumbMode = true;
        this.ListenTo(source);
    }

    public ListenTo(source: UIEventSource<any>) {
        if (source === undefined) {
            return this;
        }
        this.dumbMode = false;
        const self = this;
        source.addCallback(() => {
            self.lastInnerRender = undefined;
            self.Update();
        })
        return this;
    }

    public onClick(f: (() => void)) {
        this.dumbMode = false;
        this._onClick = f;
        this.SetClass("clickable")
        this.Update();
        return this;
    }

    public IsHovered(): UIEventSource<boolean> {
        this.dumbMode = false;
        if (this._onHover !== undefined) {
            return this._onHover;
        }
        // Note: we just save it. 'Update' will register that an eventsource exist and install the necessary hooks
        this._onHover = new UIEventSource<boolean>(false);
        return this._onHover;
    }

    Update(): void {
        if (Utils.runningFromConsole) {
            return;
        }

        let element = document.getElementById(this.id);
        if (element === undefined || element === null) {
            // The element is not painted or, in the case of 'dumbmode' this UI-element is not explicitely present
            if (this.dumbMode) {
                // We update all the children anyway
                this.UpdateAllChildren();
            }
            return;
        }
        const newRender = this.InnerRender();
        if (newRender !== this.lastInnerRender) {
            this.lastInnerRender = newRender;
            this.setData(this.InnerRender());
            element.innerHTML = this.data;
        }

        if (this._hideIfEmpty) {
            if (element.innerHTML === "") {
                element.parentElement.style.display = "none";
            } else {
                element.parentElement.style.display = "";
            }
        }

        if (this._onClick !== undefined) {
            const self = this;
            element.onclick = (e) => {
                // @ts-ignore
                if (e.consumed) {
                    return;
                }
                self._onClick();
                // @ts-ignore
                e.consumed = true;
            }
            element.style.pointerEvents = "all";
            element.style.cursor = "pointer";
        }

        if (this._onHover !== undefined) {
            const self = this;
            element.addEventListener('mouseover', () => self._onHover.setData(true));
            element.addEventListener('mouseout', () => self._onHover.setData(false));
        }

        this.InnerUpdate(element);
        this.UpdateAllChildren();

    }

    HideOnEmpty(hide: boolean): UIElement {
        this._hideIfEmpty = hide;
        this.Update();
        return this;
    }

    Render(): string {
        this.lastInnerRender = this.InnerRender();
        if (this.dumbMode) {
            return this.lastInnerRender;
        }

        let style = "";
        if (this.style !== undefined && this.style !== "") {
            style = `style="${this.style}" `;
        }
        let clss = "";
        if (this.clss.size > 0) {
            clss = `class='${Array.from(this.clss).join(" ")}' `;
        }
        return `<span ${clss}${style}id='${this.id}' gen="${this.constructor.name}">${this.lastInnerRender}</span>`
    }

    AttachTo(divId: string) {
        this.dumbMode = false;
        let element = document.getElementById(divId);
        if (element === null) {
            throw "SEVERE: could not attach UIElement to " + divId;
        }
        element.innerHTML = this.Render();
        this.Update();
        return this;
    }

    public abstract InnerRender(): string;

    public IsEmpty(): boolean {
        return this.InnerRender() === "";
    }

    /**
     * Adds all the relevant classes, space seperated
     * @param clss
     * @constructor
     */
    public SetClass(clss: string) {
        this.dumbMode = false;
        const all = clss.split(" ");
        let recordedChange = false;
        for (const c of all) {
            if (this.clss.has(clss)) {
                continue;
            }
            this.clss.add(c);
            recordedChange = true;
        }
        if (recordedChange) {
            this.Update();
        }
        return this;
    }

    public RemoveClass(clss: string): UIElement {
        if (this.clss.has(clss)) {
            this.clss.delete(clss);
            this.Update();
        }
        return this;
    }

    public SetStyle(style: string): UIElement {
        this.dumbMode = false;
        this.style = style;
        this.Update();
        return this;
    }

    // Called after the HTML has been replaced. Can be used for css tricks
    protected InnerUpdate(htmlElement: HTMLElement) {
    }

    private UpdateAllChildren() {
        for (const i in this) {
            const child = this[i];
            if (child instanceof UIElement) {
                child.Update();
            } else if (child instanceof Array) {
                for (const ch of child) {
                    if (ch instanceof UIElement) {
                        ch.Update();
                    }
                }
            }
        }
    }
}



