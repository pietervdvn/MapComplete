import {Basemap} from "./Logic/Leaflet/Basemap";

const input = "https://geoservices.informatievlaanderen.be/raadpleegdiensten/OGW/wms?FORMAT=image/jpeg&VERSION=1.1.1&SERVICE=WMS&REQUEST=GetMap&LAYERS=OGWRGB13_15VL&STYLES=&SRS={proj}&WIDTH={width}&HEIGHT={height}&BBOX={bbox}";
const leafletLayer = Basemap.CreateBackgroundLayer("aiv", "AIV", input, "Attr", "http://osm.org", 22, true, false);
console.log(leafletLayer)