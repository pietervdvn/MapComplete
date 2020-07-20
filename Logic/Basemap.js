"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Basemap = void 0;
var leaflet_1 = require("leaflet");
var UIEventSource_1 = require("../UI/UIEventSource");
// Contains all setup and baselayers for Leaflet stuff
var Basemap = /** @class */ (function () {
    function Basemap(leafletElementId, location, extraAttribution) {
        this.LastClickLocation = new UIEventSource_1.UIEventSource(undefined);
        this.aivLucht2013Layer = leaflet_1.default.tileLayer.wms('https://geoservices.informatievlaanderen.be/raadpleegdiensten/OGW/wms?s', {
            layers: "OGWRGB13_15VL",
            attribution: "Luchtfoto's van © AIV Vlaanderen (2013-2015) | "
        });
        this.aivLuchtLatestLayer = leaflet_1.default.tileLayer("https://tile.informatievlaanderen.be/ws/raadpleegdiensten/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&" +
            "LAYER=omwrgbmrvl&STYLE=&FORMAT=image/png&tileMatrixSet=GoogleMapsVL&tileMatrix={z}&tileRow={y}&tileCol={x}", {
            // omwrgbmrvl
            attribution: 'Luchtfoto\'s van © AIV Vlaanderen (Laatste)  © AGIV',
            maxZoom: 20,
            minZoom: 1,
            wmts: true
        });
        this.osmLayer = leaflet_1.default.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '',
            maxZoom: 19,
            minZoom: 1
        });
        this.osmBeLayer = leaflet_1.default.tileLayer("https://tile.osm.be/osmbe/{z}/{x}/{y}.png", {
            attribution: '<a href="https://geo6.be/">Tile hosting courtesy of Geo6</a>',
            maxZoom: 18,
            minZoom: 1
        });
        this.grbLayer = leaflet_1.default.tileLayer("https://tile.informatievlaanderen.be/ws/raadpleegdiensten/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=grb_bsk&STYLE=&FORMAT=image/png&tileMatrixSet=GoogleMapsVL&tileMatrix={z}&tileCol={x}&tileRow={y}", {
            attribution: 'Achtergrond <i>Grootschalig ReferentieBestand</i>(GRB) © AGIV',
            maxZoom: 20,
            minZoom: 1,
            wmts: true
        });
        this.baseLayers = {
            "Luchtfoto Vlaanderen (recentste door AIV)": this.aivLuchtLatestLayer,
            "Luchtfoto Vlaanderen (2013-2015, door AIV)": this.aivLucht2013Layer,
            "Kaart van OpenStreetMap": this.osmLayer,
            "Kaart Grootschalig ReferentieBestand Vlaanderen (GRB) door AIV": this.grbLayer
        };
        this.map = leaflet_1.default.map(leafletElementId, {
            center: [location.data.lat, location.data.lon],
            zoom: location.data.zoom,
            layers: [this.osmLayer],
        });
        this.map.attributionControl.setPrefix(extraAttribution.Render() + " | <a href='https://osm.org'>OpenStreetMap</a>");
        this.Location = location;
        var layerControl = leaflet_1.default.control.layers(this.baseLayers, null, {
            position: 'bottomright',
            hideSingleBase: true
        });
        layerControl.addTo(this.map);
        this.map.zoomControl.setPosition("bottomright");
        var self = this;
        this.map.on("moveend", function () {
            location.data.zoom = self.map.getZoom();
            location.data.lat = self.map.getCenter().lat;
            location.data.lon = self.map.getCenter().lng;
            location.ping();
        });
        this.map.on("click", function (e) {
            self.LastClickLocation.setData({ lat: e.latlng.lat, lon: e.latlng.lng });
        });
    }
    return Basemap;
}());
exports.Basemap = Basemap;
