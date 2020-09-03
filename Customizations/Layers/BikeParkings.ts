import {LayerDefinition} from "../LayerDefinition";
import {Tag} from "../../Logic/Tags";
import ParkingCapacityCargo from "../Questions/bike/ParkingCapacityCargo";


export default class BikeParkings extends LayerDefinition {
        private readonly accessCargoDesignated = new Tag();

    constructor() {
        super(undefined);
        this.elementsToShow = [
            new ParkingCapacityCargo().OnlyShowIf(this.accessCargoDesignated)
            //new ParkingOperator(),
        ];

    }
}
