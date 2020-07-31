import {UIElement} from "../UIElement";


export class Image extends UIElement{
    private src: string;
    private style: string = "";
    constructor(src: string, style: string = "") {
        super(undefined);
        this.style = style;
        this.src = src;
    }
    
    InnerRender(): string {
        if(this.src === undefined){
            return "";
        }
        return `<img src='${this.src}' style='${this.style}'>`;
    }
    
}