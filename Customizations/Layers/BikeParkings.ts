import {LayerDefinition} from "../LayerDefinition";
import {And, Or, Tag} from "../../Logic/TagsFilter";
import {OperatorTag} from "../Questions/OperatorTag";
import * as L from "leaflet";
import FixedText from "../Questions/FixedText";
import { BikeParkingType } from "../Questions/BikeParkingType";
import {ImageCarouselWithUploadConstructor} from "../../UI/Image/ImageCarouselWithUpload";

export class BikeParkings extends LayerDefinition {

    constructor() {
        super();
        this.name = "bike_parking";
        this.icon = "./assets/parking.svg";
        this.overpassFilter = new Tag("amenity", "bicycle_parking");
        this.newElementTags = [
            new Tag("amenity", "bicycle_parking"),
        ];
        this.maxAllowedOverlapPercentage = 10;

        this.minzoom = 13;
        this.style = this.generateStyleFunction();
        this.title = new FixedText("Fietsparking");
        this.elementsToShow = [
            new ImageCarouselWithUploadConstructor(),
            new OperatorTag(),
            new BikeParkingType()
        ];

    }


    private generateStyleFunction() {
        const self = this;
        return function (properties: any) {
            // let questionSeverity = 0;
            // for (const qd of self.elementsToShow) {
            //     if (qd.IsQuestioning(properties)) {
            //         questionSeverity = Math.max(questionSeverity, qd.options.priority ?? 0);
            //     }
            // }

            // let colormapping = {
            //     0: "#00bb00",
            //     1: "#00ff00",
            //     10: "#dddd00",
            //     20: "#ff0000"
            // };

            // let colour = colormapping[questionSeverity];
            // while (colour == undefined) {
            //     questionSeverity--;
            //     colour = colormapping[questionSeverity];
            // }

            return {
                color: "#00bb00",
                icon: new L.icon({
                    iconUrl: self.icon,
                    iconSize: [30, 30]
                })
            };
        };
    }

}