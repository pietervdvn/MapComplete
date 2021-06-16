import {UIEventSource} from "../Logic/UIEventSource";
import BaseUIElement from "./BaseUIElement";

export abstract class UIElement extends BaseUIElement{

    private static nextId: number = 0;
    public readonly id: string;
    public readonly _source: UIEventSource<any>;

    private lastInnerRender: string;

    protected constructor(source: UIEventSource<any> = undefined) {
        super()
        this.id = `ui-${this.constructor.name}-${UIElement.nextId}`;
        this._source = source;
        UIElement.nextId++;
        this.ListenTo(source);
    }

    public ListenTo(source: UIEventSource<any>) {
        if (source === undefined) {
            return this;
        }
        //console.trace("Got a listenTo in ", this.constructor.name)
        const self = this;
        source.addCallback(() => {
            self.lastInnerRender = undefined;
            if(self._constructedHtmlElement !== undefined){
                self.UpdateElement(self._constructedHtmlElement);
            }
            
        })
        return this;
    }

    /**
     * Should be overridden for specific HTML functionality
     */
    protected InnerConstructElement(): HTMLElement {
        // Uses the old fashioned way to construct an element using 'InnerRender'
        const innerRender = this.InnerRender();
        if (innerRender === undefined || innerRender === "") {
            return undefined;
        }
        const el = document.createElement("span")
        if (typeof innerRender === "string") {
            el.innerHTML = innerRender
        } else {
            const subElement = innerRender.ConstructElement();
            if (subElement === undefined) {
                return undefined;
            }
            el.appendChild(subElement)
        }
        return el;
    }

    protected UpdateElement(el: HTMLElement) : void{
        const innerRender = this.InnerRender();

        if (typeof innerRender === "string") {
            if(el.innerHTML !== innerRender){
                el.innerHTML = innerRender    
            }
        } else {
            const subElement = innerRender.ConstructElement();
            if(el.children.length === 1 && el.children[0] === subElement){
                return; // Nothing changed
            }

            while (el.firstChild) {
                el.removeChild(el.firstChild);
            }           
            
            if (subElement === undefined) {
                return;
            }
            el.appendChild(subElement)
        }
        
    }

    /**
     * @deprecated The method should not be used
     */
    protected abstract InnerRender(): string | BaseUIElement;

}



