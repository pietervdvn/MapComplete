import {Layout} from "../Layout";
import {GhostBike} from "../Layers/GhostBike";
import Combine from "../../UI/Base/Combine";

export class GhostBikes extends Layout {
    constructor() {
        super("ghostbikes",
            ["en"],
            "Ghost Bike Map",
            [new GhostBike()],
            6,
            50.423,
            5.493,
            new Combine(["<h3>", "A map of Ghost Bikes", "</h3>",
                "A <b>ghost bike</b> is a memorial for a cyclist who died in a traffic accident," +
                " in the form of a white bicycle placed permanently near the accident location.",
                "On this map, one can see the location of known ghost bikes, and (with a free OpenStreetMap account) easily add missing and new Ghost Bikes"])
        );
        
        this.icon = "./assets/bike/ghost.svg";
    }
}