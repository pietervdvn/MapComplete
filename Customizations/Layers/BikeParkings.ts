import {LayerDefinition} from "../LayerDefinition";
import {Tag} from "../../Logic/Tags";
import FixedText from "../Questions/FixedText";
import ParkingType from "../Questions/bike/ParkingType";
import ParkingCapacity from "../Questions/bike/ParkingCapacity";
import {ImageCarouselWithUploadConstructor} from "../../UI/Image/ImageCarouselWithUpload";
import Translations from "../../UI/i18n/Translations";
import ParkingAccessCargo from "../Questions/bike/ParkingAccessCargo";
import ParkingCapacityCargo from "../Questions/bike/ParkingCapacityCargo";


export default class BikeParkings extends LayerDefinition {
        private readonly accessCargoDesignated = new Tag("cargo_bike", "designated");

    constructor() {
        super("bikeparking");
        this.name = Translations.t.cyclofix.parking.name;
        this.icon = "./assets/bike/parking.svg";
        this.overpassFilter = new Tag("amenity", "bicycle_parking");
        this.presets = [{
            title: Translations.t.cyclofix.parking.title,
            tags: [
                new Tag("amenity", "bicycle_parking"),
            ]
        }];

        this.maxAllowedOverlapPercentage = 10;

        this.minzoom = 17;
        this.style = function () {
            return {
                color: "#00bb00",
                icon: {
                    iconUrl: "./assets/bike/parking.svg",
                    iconSize: [50, 50],
                    iconAnchor: [25, 50]
                }
            };
        };
        this.title = new FixedText(Translations.t.cyclofix.parking.title)
        this.elementsToShow = [
            new ImageCarouselWithUploadConstructor(),
            //new ParkingOperator(),
            new ParkingType(),
            new ParkingCapacity(),
            new ParkingAccessCargo(),
            new ParkingCapacityCargo().OnlyShowIf(this.accessCargoDesignated)
        ];
        this.wayHandling = LayerDefinition.WAYHANDLING_CENTER_AND_WAY;

    }
}
