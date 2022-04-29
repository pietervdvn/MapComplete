import BaseUIElement from "../BaseUIElement";

export class Paragraph extends BaseUIElement {
    public readonly content: (string | BaseUIElement);

    constructor(html: (string | BaseUIElement)) {
        super();
        this.content = html ?? "";
    }


    AsMarkdown(): string {
        let c:string ;
       if(typeof this.content !== "string"){
        c = this.content.AsMarkdown()
       }else{
           c = this.content
       }
           return "\n\n"+c+"\n\n"
    }

    protected InnerConstructElement(): HTMLElement {
        const e = document.createElement("p")
        if(typeof this.content !== "string"){
            e.appendChild(this.content.ConstructElement())
        }else{
            e.innerHTML = this.content
        }
        return e;
    }


}