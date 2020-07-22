import { DropDown } from "./UI/Input/DropDown";
import { BaseLayers, Basemap } from "./Logic/Basemap";

let baseLayerOptions = [];

Object.entries(BaseLayers.baseLayers).forEach(([key, value], i) => {
// console.log(key, value, i);
    baseLayerOptions.push({value: i, shown: key});
});

console.log(Basemap);


new DropDown(`label`, baseLayerOptions, Basemap.CurrentLayer).AttachTo("maindiv");