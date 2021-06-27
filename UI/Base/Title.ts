import BaseUIElement from "../BaseUIElement";
import Translations from "../i18n/Translations";

export default class Title extends BaseUIElement{
    private readonly _embedded: BaseUIElement;
    private readonly  _level: number;
    constructor(embedded: string | BaseUIElement, level: number =3 ) {
        super()
        this._embedded = Translations.W(embedded);
        this._level = level;
    }

    protected InnerConstructElement(): HTMLElement {
        const el = this._embedded.ConstructElement()
        if(el === undefined){
            return undefined;
        }
        const h =  document.createElement("h"+this._level)
        h.appendChild(el)
        return h;
    }
    
    AsMarkdown(): string {
        const embedded = " " +this._embedded.AsMarkdown()+" ";

        if(this._level == 1){
            return "\n"+embedded+"\n"+"=".repeat(embedded.length)+"\n\n"
        }

        if(this._level == 2){
            return "\n"+embedded+"\n"+"-".repeat(embedded.length)+"\n\n"
        }
        
        return "\n"+"#".repeat( this._level)+embedded +"\n\n";
    }
}