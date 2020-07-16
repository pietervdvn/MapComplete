import {LayerDefinition} from "../LayerDefinition";
import {And, Tag, TagsFilter} from "../../Logic/TagsFilter";
import * as L from "leaflet";
import BikeStationChain from "../Questions/bike/StationChain";
import BikeStationPumpTools from "../Questions/bike/StationPumpTools";
import BikeStationStand from "../Questions/bike/StationStand";
import PumpManual from "../Questions/bike/PumpManual";
import BikeStationOperator from "../Questions/bike/StationOperator";
import BikeStationBrand from "../Questions/bike/StationBrand";
import FixedText from "../Questions/FixedText";
import PumpManometer from "../Questions/bike/PumpManometer";
import {ImageCarouselWithUploadConstructor} from "../../UI/Image/ImageCarouselWithUpload";
import PumpOperationalStatus from "../Questions/bike/PumpOperationalStatus";
import PumpValves from "../Questions/bike/PumpValves";


export default class BikeStations extends LayerDefinition {
    private readonly pump: TagsFilter = new Tag("service:bicycle:pump", "yes");
    private readonly tools: TagsFilter = new Tag("service:bicycle:tools", "yes");

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

        this.elementsToShow = [
            new ImageCarouselWithUploadConstructor(),

            new BikeStationPumpTools(),
            new BikeStationChain().OnlyShowIf(this.tools),
            new BikeStationStand().OnlyShowIf(this.tools),

            new PumpManual().OnlyShowIf(this.pump),
            new PumpManometer().OnlyShowIf(this.pump),
            new PumpValves().OnlyShowIf(this.pump),
            new PumpOperationalStatus().OnlyShowIf(this.pump),

            new BikeStationOperator(),
            // new BikeStationBrand()   DISABLED
        ];
    }

    private generateStyleFunction() {
        const self = this;
        return function (properties: any) {
            const onlyPump = self.pump.matchesProperties(properties) &&
                !self.tools.matchesProperties(properties)
            const iconUrl = onlyPump ? "./assets/pump.svg" : "./assets/wrench.svg"
            return {
                color: "#00bb00",
                icon: L.icon({
                    iconUrl: iconUrl,
                    iconSize: [40, 40]
                })
            };
        };
    }
}
