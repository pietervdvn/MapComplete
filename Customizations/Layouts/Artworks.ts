import {Layout} from "../Layout";
import {Artwork} from "../Layers/Artwork";

export class Artworks extends Layout{
    constructor() {
        super(    "artworks",
            ["en","nl","fr"],
            "Open Artwork Map",
            [new Artwork()],
            10,
            50.8435,
            4.3688,
            "<h3>Open Artwork Map</h3>");
        this.icon = "./assets/statue.svg"
    }
    
}