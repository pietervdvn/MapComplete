import {Layout} from "../Layout";
import * as Layer from "../Layers/Bookcases";
import {Map} from "../Layers/Map";

export class MetaMap extends Layout{
    constructor() {
        super(    "metamap",
            ["en"],
            "Open Map Map",
            [new Map()],
            1,
            0,
            0,


            "        <h3>Open Map Map</h3>\n" +
            "This map is a map of physical maps, as known by OpenStreetMap.");
    }
}