import {TagRenderingOptions} from "../TagRendering";
import {And, Tag} from "../../Logic/TagsFilter";
import {UIElement} from "../../UI/UIElement";


export class NameInline extends TagRenderingOptions{
    
    static Upper(string){
         return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    constructor(category: string ) {
        super({
            question: "",

            freeform: {
                renderTemplate: "{name}",
                template: "De naam van dit "+category+" is $$$",
                key: "name",
                extraTags: new Tag("noname", "") // Remove 'noname=yes'
            },

            mappings: [
                {k: new Tag("noname","yes"), txt: NameInline.Upper(category)+" zonder naam"},
                {k: null, txt: NameInline.Upper(category)}
            ]
        });
    }
    
}