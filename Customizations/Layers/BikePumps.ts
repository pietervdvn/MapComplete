import {LayerDefinition} from "../LayerDefinition";
import {And, Or, Tag} from "../../Logic/TagsFilter";
import {OperatorTag} from "../Questions/OperatorTag";
import * as L from "leaflet";
import { PumpManual } from "../Questions/PumpManual";
import FixedText from "../Questions/FixedText";
import {ImageCarouselWithUploadConstructor} from "../../UI/Image/ImageCarouselWithUpload";

export class BikePumps extends LayerDefinition {

    constructor() {
        super();
        this.name = "pomp";
        this.icon = "./assets/bike_pump.svg";

        this.overpassFilter =
            new And([
                new Tag("amenity", "bicycle_repair_station"),
                new Tag("service:bicycle:pump", "yes"),
            ]);


        this.newElementTags = [
            new Tag("amenity", "bicycle_repair_station"),
            new Tag("service:bicycle:pump", "yes"),
        ];
        
        this.maxAllowedOverlapPercentage = 10;

        this.minzoom = 13;
        const self = this;
        this.style = (properties: any) => {

            return {
                color: "#00bb00",
                icon: new L.icon({
                    iconUrl: self.icon,
                    iconSize: [40, 40]
                })
            };
        };
        
        
        this.title = new FixedText("Pomp");
        this.elementsToShow = [
            new ImageCarouselWithUploadConstructor(),
            // new NameQuestion(),
            // new AccessTag(),
            new OperatorTag(),
            new PumpManual()
        ];

    }



}