import {TagRenderingOptions} from "../TagRendering";
import {LayerDefinition} from "../LayerDefinition";
import {And, Tag} from "../../Logic/TagsFilter";
import L from "leaflet";
import {ImageCarouselWithUploadConstructor} from "../../UI/Image/ImageCarouselWithUpload";
import {NameQuestion} from "../Questions/NameQuestion";

export class BikeShop extends LayerDefinition {


    private readonly sellsBikes = new Tag("service:bicycle:retail", "yes");
    private readonly repairsBikes = new Tag("service:bicycle:repair", "yes");

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
                {k: new And([new Tag("name", "*"), this.sellsBikes]), txt: "Bicycle shop {name}"},
                {
                    k: new And([new Tag("name", "*"), new Tag("service:bicycle:retail", "no")]),
                    txt: "Bicycle repair {name}",
                },
                {
                    k: new And([new Tag("name", "*"), new Tag("service:bicycle:retail", "")]),
                    txt: "Bicycle repair {name}"
                },

                {k: this.sellsBikes, txt: "Bicycle shop"},
                {k: new Tag("service:bicycle:retail", "no"), txt: "Bicycle repair"},
                {k: new Tag("service:bicycle:retail", ""), txt: "Bicycle repair/shop"},
            ]
        })
        
        
        this.elementsToShow = [
            new ImageCarouselWithUploadConstructor(),
            new TagRenderingOptions({
                question: "What is the name of this bicycle shop?",
                freeform: {
                    key: "name",
                    renderTemplate: "The name of this bicycle shop is {name}",
                    template: "The name of this bicycle shop is $$$"
                }
            }),

            new TagRenderingOptions({
                question: "Can one buy a bike here?",
                mappings: [
                    {k: this.sellsBikes, txt: "Bikes are sold here"},
                    {k: new Tag("service:bicycle:retail", "no"), txt: "No bikes are sold here"},
                ]
            }),

            new TagRenderingOptions({
                question: "Can one buy a new bike here?",
                mappings: [
                    {k: new Tag("service:bicycle:second_hand", "yes"), txt: "Second-hand bikes are sold here"},
                    {k: new Tag("service:bicycle:second_hand", "only"), txt: "All bicycles sold here are second-hand"},
                    {k: new Tag("service:bicycle:second_hand", "no"), txt: "Only brand new bikes are sold here"},
                ]
            }).OnlyShowIf(this.sellsBikes),


            new TagRenderingOptions({
                question: "Does this shop repair bicycles?",
                mappings: [
                    {k: this.repairsBikes, txt: "Bikes are repaired here, by the shop owner (for a fee)"},
                    {k: new Tag("service:bicycle:repair", "only_sold"), txt: "Only bikes that were bought here, are repaired"},
                    {k: new Tag("service:bicycle:repair", "brand"), txt: "Only bikes of a fixed brand are repaired here"},
                    {k: new Tag("service:bicycle:repair", "no"), txt: "Bikes are not repaired here"},
                ]
            }),

            new TagRenderingOptions({
                question: "Can one hire a new bike here?",
                mappings: [
                    {k: new Tag("service:bicycle:rental", "yes"), txt: "Bikes can be rented here"},
                    {k: new Tag("service:bicycle:rental", "no"), txt:  "Bikes cannot be rented here"},
                ]
            }).OnlyShowIf(this.sellsBikes),

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