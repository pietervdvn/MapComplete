import { LayerDefinition } from "../LayerDefinition";
import { And, Or, Tag } from "../../Logic/TagsFilter";
import { OperatorTag } from "../Questions/OperatorTag";
import * as L from "leaflet";
import FixedText from "../Questions/FixedText";
import { TagRenderingOptions } from "../TagRendering";
import { ImageCarouselWithUploadConstructor } from "../../UI/Image/ImageCarouselWithUpload";

export class Bench extends LayerDefinition {

    constructor() {
        super();
        this.name = "bench";
        this.icon = "./assets/bug.svg";

        this.overpassFilter = new Or([
            new And([
                new Tag("amenity", "bench")
            ])
        ]);


        this.newElementTags = [
            new Tag("amenity", "bench"),
        ];
        this.maxAllowedOverlapPercentage = 10;

        this.minzoom = 13;
        this.style = this.generateStyleFunction();
        this.title = new FixedText("Benches");
        this.elementsToShow = [
            new OperatorTag(),
        ];
        this.elementsToShow = [];

    }


    private generateStyleFunction() {
        const self = this;
        return function (properties: any) {

            return {
                color: "#00bb00",
                icon: new L.icon({
                    iconUrl: self.icon,
                    iconSize: [40, 40]
                })
            };
        };
    }

}