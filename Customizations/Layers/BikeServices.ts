import {LayerDefinition} from "../LayerDefinition";
import {And, Tag} from "../../Logic/TagsFilter";
import * as L from "leaflet";
import BikeStationChain from "../Questions/BikeStationChain";
import BikeStationPumpTools from "../Questions/BikeStationPumpTools";
import BikeStationStand from "../Questions/BikeStationStand";
import PumpManual from "../Questions/PumpManual";
import BikeStationOperator from "../Questions/BikeStationOperator";
import BikeStationBrand from "../Questions/BikeStationBrand";
import FixedText from "../Questions/FixedText";
import {BikePumpManometer} from "../Questions/BikePumpManometer";
import {ImageCarouselWithUploadConstructor} from "../../UI/Image/ImageCarouselWithUpload";

export default class BikeServices extends LayerDefinition {
    constructor() {
        super();
        this.name = "bike station or pump";
        this.icon = "./assets/wrench.svg";

        this.overpassFilter = new And([
            new Tag("amenity", "bicycle_repair_station")
        ]);

        this.newElementTags = [
            new Tag("amenity", "bicycle_repair_station")
            // new Tag("fixme", "Toegevoegd met MapComplete, geometry nog uit te tekenen")
        ];
        this.maxAllowedOverlapPercentage = 10;

        this.minzoom = 13;
        this.style = this.generateStyleFunction();
        this.title = new FixedText("Bike station");

        const pump = new Tag("service:bicycle:pump", "yes");

        this.elementsToShow = [

            new ImageCarouselWithUploadConstructor(),


            new BikeStationPumpTools(),
            new BikeStationChain().OnlyShowIf(new Tag("service:bicycle:tools", "yes")),
            new BikeStationStand().OnlyShowIf(new Tag("service:bicycle:tools", "yes")),

            new PumpManual().OnlyShowIf(pump),
            new BikePumpManometer().OnlyShowIf(pump),

            new BikeStationOperator(),
            new BikeStationBrand()
        ];

    }

    private generateStyleFunction() {
        const self = this;
        return function (properties: any) {
            const onlyPump = properties["service:bicycle:tools"] == "no" && properties["service:bicycle:pump"] == "yes";
            const iconUrl = onlyPump ? "./assets/pump.svg" : "./assets/wrench.svg"
            return {
                color: "#00bb00",
                icon: new L.icon({
                    iconUrl: iconUrl,
                    iconSize: [40, 40]
                })
            };
        };
    }
}