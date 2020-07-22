import { LayerDefinition } from "../LayerDefinition";
import { And, Or, Tag } from "../../Logic/TagsFilter";
import { OperatorTag } from "../Questions/OperatorTag";
import * as L from "leaflet";
import FixedText from "../Questions/FixedText";

export class Viewpoint extends LayerDefinition {

    constructor() {
        super();
        this.name = "viewpoint";
        this.icon = "./assets/bug.svg";

        this.overpassFilter = new Or([
            new And([
                new Tag("tourism", "viewpoint")
            ])
        ]);


        this.newElementTags = [
            new Tag("tourism", "viewpoint"),
        ];
        this.maxAllowedOverlapPercentage = 10;

        this.minzoom = 13;
        this.style = this.generateStyleFunction();
        this.title = new FixedText("Viewpoints");
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