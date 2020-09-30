import {UIEventSource} from "../Logic/UIEventSource";

export abstract class UIElement extends UIEventSource<string> {

    private static nextId: number = 0;

    public readonly id: string;
    public readonly _source: UIEventSource<any>;
    private clss: string[] = []

    private style: string;

    private _hideIfEmpty = false;

    public dumbMode = false;
    
    private lastInnerRender: string;

    /**
     * In the 'deploy'-step, some code needs to be run by ts-node.
     * However, ts-node crashes when it sees 'document'. When running from console, we flag this and disable all code where document is needed.
     * This is a workaround and yet another hack
     */
    public static runningFromConsole = false;

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

    private _onClick: () => void;

    public onClick(f: (() => void)) {
        this.dumbMode = false;
        this._onClick = f;
        this.SetClass("clickable")
        this.Update();
        return this;
    }

    private _onHover: UIEventSource<boolean>;

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
        if (UIElement.runningFromConsole) {
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
                element.parentElement.style.display = "block";
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

    HideOnEmpty(hide: boolean) {
        this._hideIfEmpty = hide;
        this.Update();
        return this;
    }

    // Called after the HTML has been replaced. Can be used for css tricks
    protected InnerUpdate(htmlElement: HTMLElement) {
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
        if (this.clss.length > 0) {
            clss = `class='${this.clss.join(" ")}' `;
        }
        return `<span ${clss}${style}id='${this.id}'>${this.lastInnerRender}</span>`
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

    public SetClass(clss: string): UIElement {
        this.dumbMode = false;
        if (clss === "" && this.clss.length > 0) {
            throw "Use RemoveClass instead";
        } else if (this.clss.indexOf(clss) < 0) {
            this.clss.push(clss);
            this.Update();
        }
        return this;
    }
    public RemoveClass(clss: string): UIElement {
        const i = this.clss.indexOf(clss);
        if (i >= 0) {
            this.clss.splice(i, 1);
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
}



