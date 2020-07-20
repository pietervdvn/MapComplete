import {LayerDefinition} from "../LayerDefinition";
import {And, Or, Tag} from "../../Logic/TagsFilter";
import {OperatorTag} from "../Questions/OperatorTag";
import * as L from "leaflet";
import FixedText from "../Questions/FixedText";
import {TagRenderingOptions} from "../TagRendering";
import {ImageCarouselWithUploadConstructor} from "../../UI/Image/ImageCarouselWithUpload";

export class DrinkingWater extends LayerDefinition {

    constructor() {
        super();
        this.name = "drinking water";
        this.icon = "./assets/bike/drinking_water.svg";

        this.overpassFilter = new Or([
            new And([
                new Tag("amenity", "drinking_water")
            ])
        ]);


        this.newElementTags = [
            new Tag("amenity", "drinking_water"),
        ];
        this.maxAllowedOverlapPercentage = 10;

        this.minzoom = 13;
        this.style = this.generateStyleFunction();
        this.title = new FixedText("Drinking water");
        this.elementsToShow = [
            new OperatorTag(),
        ];
        this.elementsToShow = [
            new ImageCarouselWithUploadConstructor(),
            new TagRenderingOptions({
            question: "How easy is it to fill water bottles?",
            mappings: [
                { k: new Tag("bottle", "yes"), txt: "It is easy to refill water bottles" },
                { k: new Tag("bottle", "no"), txt: "Water bottles may not fit" }
            ],
        })];

    }


    private generateStyleFunction() {
        const self = this;
        return function (properties: any) {

            return {
                color: "#00bb00",
                icon: new L.icon({
                    iconUrl: self.icon,
                    iconSize: [50, 50],
                    iconAnchor: [25,50]
                })
            };
        };
    }

}