import {LayerDefinition} from "../LayerDefinition";
import {And, Or, Tag} from "../../Logic/TagsFilter";
import {OperatorTag} from "../Questions/OperatorTag";
import FixedText from "../Questions/FixedText";
import ParkingType from "../Questions/bike/ParkingType";
import {ImageCarouselWithUploadConstructor} from "../../UI/Image/ImageCarouselWithUpload";
import BikeStationOperator from "../Questions/bike/StationOperator";
import Translations from "../../UI/i18n/Translations";
import ParkingOperator from "../Questions/bike/ParkingOperator";
import {TagRenderingOptions} from "../TagRendering";


export default class BikeParkings extends LayerDefinition {
    constructor() {
        super();
        this.name = Translations.t.cyclofix.parking.name;
        this.icon = "./assets/bike/parking.svg";
        this.overpassFilter = new Tag("amenity", "bicycle_parking");
        this.newElementTags = [
            new Tag("amenity", "bicycle_parking"),
        ];
        this.maxAllowedOverlapPercentage = 10;

        this.minzoom = 13;
        this.style = this.generateStyleFunction();
        this.title = new FixedText(Translations.t.cyclofix.parking.title)
        this.elementsToShow = [
            new ImageCarouselWithUploadConstructor(),
            //new ParkingOperator(),
            new ParkingType(),
            new TagRenderingOptions({
                question: "How many bicycles fit in this bicycle parking?",
                freeform: {
                    key: "capacity",
                    renderTemplate: "Place for {capacity} bikes",
                    template: "$nat$ bikes fit in here"
                }
            })
        ];
        this.wayHandling = LayerDefinition.WAYHANDLING_CENTER_AND_WAY;

    }

    private generateStyleFunction() {
        const self = this;
        return function (properties: any) {
            return {
                color: "#00bb00",
                icon: {
                    iconUrl: self.icon,
                    iconSize: [50, 50],
                    iconAnchor: [25,50]
                }
            };
        };
    }
}
