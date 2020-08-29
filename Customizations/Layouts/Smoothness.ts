import {Layout} from "../Layout";
import {LayerDefinition} from "../LayerDefinition";
import {Or, Tag} from "../../Logic/Tags";
import {TagRenderingOptions} from "../TagRenderingOptions";


export class SmoothnessLayer extends LayerDefinition {

    constructor() {
        super("smoothness");
        this.name = "smoothness";
        this.minzoom = 17;
        this.overpassFilter = new Or([
            new Tag("highway","unclassified"),
            new Tag("highway", "residential"),
            new Tag("highway", "cycleway"),
            new Tag("highway", "footway"),
            new Tag("highway", "path"),
            new Tag("highway", "tertiary")
        ]);
        
        this.elementsToShow = [
            new TagRenderingOptions({
                question: "How smooth is this road to rollerskate on",
                mappings: [
                    {k: new Tag("smoothness","bad"), txt: "It's horrible"},
                    {k: new Tag("smoothness","intermediate"), txt: "It is passable by rollerscate, but only if you have to"},
                    {k: new Tag("smoothness","good"), txt: "Good, but it has some friction or holes"},
                    {k: new Tag("smoothness","very_good"), txt: "Quite good and enjoyable"},
                    {k: new Tag("smoothness","excellent"), txt: "Excellent - this is where you'd want to drive 24/7"},
                ]
            })
        ]
        
        this.style = (properties) => {
            let color = "#000000";
            if(new Tag("smoothness","bad").matchesProperties(properties)){
                color = "#ff0000";
            }
            if(new Tag("smoothness","intermediate").matchesProperties(properties)){
                color = "#ffaa00";
            }
            if(new Tag("smoothness","good").matchesProperties(properties)){
                color = "#ccff00";
            }
            if(new Tag("smoothness","very_good").matchesProperties(properties)){
                color = "#00aa00";
            }
            if(new Tag("smoothness","excellent").matchesProperties(properties)){
                color = "#00ff00";
            }
            
            return {
                color: color,
                icon: undefined,
                weight: 8
            }
            
        }


    }

}

export class Smoothness extends Layout {
    constructor() {
        super(
            "smoothness",
            ["en"   ],
            "Smoothness while rollerskating",
            [new SmoothnessLayer()],
            17,
            51.2,
            3.2,
            "Give smoothness feedback for rollerskating"
        );
        this.widenFactor = 0.005
        this.hideFromOverview = true;
        this.enableAdd = false;
    }
}