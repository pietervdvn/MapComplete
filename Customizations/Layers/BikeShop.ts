import {TagRenderingOptions} from "../TagRendering";
import {LayerDefinition} from "../LayerDefinition";
import {Tag} from "../../Logic/TagsFilter";
import L from "leaflet";
import {ImageCarouselWithUploadConstructor} from "../../UI/Image/ImageCarouselWithUpload";
import {NameQuestion} from "../Questions/NameQuestion";

export class BikeShop extends LayerDefinition {


    const
    sellsBikes = new Tag("service:bicycle:retail", "yes");

    constructor() {
        super(
            {
                name: "bike shop or repair",
                icon: "assets/bike/repair_shop.svg",
                minzoom: 14,
                overpassFilter: new Tag("shop", "bicycle"),
                newElementTags: [new Tag("shop", "bicycle")]
            }
        );

        this.title = new TagRenderingOptions({
            mappings: [
                {k: this.sellsBikes, txt: "Bicycle shop"},
                {k: new Tag("service:bicycle:retail", "no"), txt: "Bicycle repair"},
                {k: new Tag("service:bicycle:retail", ""), txt: "Bicycle repair/shop"},
            ]
        })
        
        
        this.elementsToShow = [
            new ImageCarouselWithUploadConstructor(),
            new TagRenderingOptions({
                question: "What is the name of this bicycle shop?",
                freeform:{
                    key:"name",
                    renderTemplate: "The name of this bicycle shop is {name}",
                    template: "The name of this bicycle shop is $$$"
                }
            }),

            new TagRenderingOptions({
                question: "Can one buy a new bike here?",
                mappings: [
                    {k: this.sellsBikes, txt: "Bikes are sold here"},
                    {k: new Tag("service:bicycle:retail", "no"), txt: "No bikes can be bought here"},
                ]
            }),
            
            
           
            new TagRenderingOptions({
                question: "Does this shop repair bicycles?",
                mappings: [
                    {k: new Tag("service:bicycle:repair", "yes"), txt: "Bikes are repaired here, by the shop owner (for a fee)"},
                    {k: new Tag("service:bicycle:repair", "no"), txt: "Bikes are not repaired here"},
                ]
            }),

            new TagRenderingOptions({
                question: "Are there tools here so that one can repair their own bike?",
                mappings: [
                    {k: new Tag("service:bicycle:diy", "yes"), txt: "Tools for DIY are available here"},
                    {k: new Tag("service:bicycle:diy", "no"), txt: "No tools for DIY are available here"},
                ]
            }),
        ]


        this.style = (tags) => {
            let icon = "assets/bike/repair_shop.svg";

            if (this.sellsBikes.matchesProperties(tags)) {
                icon = "assets/bike/shop.svg";
            }

            return {
                color: "#ff0000",
                icon: L.icon({
                    iconUrl: icon,
                    iconSize: [50, 50],
                    iconAnchor: [25, 50]
                })
            }
        }


    }
    
    
}