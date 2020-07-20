import {TagRenderingOptions} from "../TagRendering";
import {LayerDefinition} from "../LayerDefinition";
import {Tag} from "../../Logic/TagsFilter";

export class BikeShop extends LayerDefinition{
    
    constructor() {
        super(
            {
                name: "bike shop or repair",
                icon: "assets/bike/repair_shop.svg", 
                minzoom: 14, 
                overpassFilter: new Tag("shop","bicycle"), 
            newElementTags: [new Tag("shop","bicycle")]
            }
        );
        
        this.title = new TagRenderingOptions({
            mappings:[
                {k:new Tag("service:bicycle:retail","yes"), txt: "Bicycle shop"},
                {k:new Tag("service:bicycle:retail","no"), txt: "Bicycle repair"},
                {k:new Tag("service:bicycle:retail",""), txt: "Bicycle repair/shop"},
            ]
        })
        
        
        this.style()
        
        
    }
    
    
}