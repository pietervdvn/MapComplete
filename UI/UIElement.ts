import {UIEventSource} from "./UIEventSource";
import {Playground} from "../Layers/Playground";

export abstract class UIElement {

    private static nextId: number = 0;

    public readonly id: string;
    public readonly _source: UIEventSource<any>;
    
    private _hideIfEmpty = false;

    protected constructor(source: UIEventSource<any>) {
        this.id = "ui-element-" + UIElement.nextId;
        this._source = source;
        UIElement.nextId++;
        this.ListenTo(source);
    }


    protected ListenTo(source: UIEventSource<any>) {
        if (source === undefined) {
            return;
        }
        const self = this;
        source.addCallback(() => {
            self.Update();
        })
    }

    private _onClick: () => void;

    public onClick(f: (() => void)) {
        this._onClick = f;
        this.Update();
        return this;
    }

    Update(): void {
        let element = document.getElementById(this.id);
        if (element === null || element === undefined) {
            // The element is not painted
            return;
        }

        element.innerHTML = this.InnerRender();
        if (this._hideIfEmpty) {
            if (element.innerHTML === "") {
                element.parentElement.style.display = "none";
            } else {
                element.parentElement.style.display = undefined;
            }
        }

        if (this._onClick !== undefined) {
            const self = this;
            element.onclick = () => {
                self._onClick();
            }
            element.style.cursor = "pointer";
        }

        this.InnerUpdate(element);
    }
    
    HideOnEmpty(hide : boolean){
        this._hideIfEmpty = hide;
        this.Update();
        return this;
    }
    
    // Called after the HTML has been replaced. Can be used for css tricks
    InnerUpdate(htmlElement : HTMLElement){}

    Render(): string {
        return "<span class='uielement' id='" + this.id + "'>" + this.InnerRender() + "</span>"
    }

    AttachTo(divId: string) {
        let element = document.getElementById(divId);
        if(element === null){
            console.log("SEVERE: could not attach UIElement to ", divId);
            return;
        }
        element.innerHTML = this.Render();
        this.Update();
        return this;
    }

    protected abstract InnerRender(): string;
    public Activate(): void {};

    public IsEmpty(): boolean {
        return this.InnerRender() === "";
    }

}