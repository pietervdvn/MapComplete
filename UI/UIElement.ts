import {UIEventSource} from "./UIEventSource";

export abstract class UIElement {

    private static nextId: number = 0;

    public readonly id: string;
    public readonly _source: UIEventSource<any>;

    protected constructor(source: UIEventSource<any>) {
        this.id = "ui-element-" + UIElement.nextId;
        this._source = source;
        UIElement.nextId++;
        this.ListenTo(source);
    }


    protected ListenTo(source: UIEventSource<any>) {
        if(source === undefined){
            return;
        }
        const self = this;
        source.addCallback(() => {
            self.Update();
        })
    }

    Update(): void {
        let element  = document.getElementById(this.id);
        if (element === null || element === undefined) {
            // The element is not painted
            return;
        }
        
        element.innerHTML = this.InnerRender();
        this.InnerUpdate(element);
    }
    
    // Called after the HTML has been replaced. Can be used for css tricks
    InnerUpdate(htmlElement : HTMLElement){}

    Render(): string {
        return "<span class='uielement' id='" + this.id + "'>" + this.InnerRender() + "</span>"
    }

    AttachTo(divId: string) {
        let element = document.getElementById(divId);
        element.innerHTML = this.Render();
        this.Update();
    }

    protected abstract InnerRender(): string;
    public Activate(): void {};

    public IsEmpty(): boolean {
        return this.InnerRender() === "";
    }

}