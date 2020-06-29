import L from "leaflet"
import {UIEventSource} from "../UI/UIEventSource";
import {UIElement} from "../UI/UIElement";

// Contains all setup and baselayers for Leaflet stuff
export class Basemap {

    // @ts-ignore
    public map: Map;

    public Location: UIEventSource<{ zoom: number, lat: number, lon: number }>;
    public LastClickLocation: UIEventSource<{ lat: number, lon: number }> = new UIEventSource<{lat: number, lon: number}>(undefined)

    private aivLucht2013Layer = L.tileLayer.wms('https://geoservices.informatievlaanderen.be/raadpleegdiensten/OGW/wms?s',
        {
            layers: "OGWRGB13_15VL",
            attribution: "Luchtfoto's van © AIV Vlaanderen (2013-2015) | "
        });

    private aivLuchtLatestLayer = L.tileLayer("https://tile.informatievlaanderen.be/ws/raadpleegdiensten/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&" +
        "LAYER=omwrgbmrvl&STYLE=&FORMAT=image/png&tileMatrixSet=GoogleMapsVL&tileMatrix={z}&tileRow={y}&tileCol={x}",
        {
            // omwrgbmrvl
            attribution: 'Luchtfoto\'s van © AIV Vlaanderen (Laatste)  © AGIV',
            maxZoom: 20,
            minZoom: 1,
            wmts: true
        });


    private osmLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution: '',
            maxZoom: 19,
            minZoom: 1
        });
    private osmBeLayer = L.tileLayer("https://tile.osm.be/osmbe/{z}/{x}/{y}.png",
        {
            attribution: '<a href="https://geo6.be/">Tile hosting courtesy of Geo6</a>',
            maxZoom: 18,
            minZoom: 1
        });

    private grbLayer = L.tileLayer("https://tile.informatievlaanderen.be/ws/raadpleegdiensten/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=grb_bsk&STYLE=&FORMAT=image/png&tileMatrixSet=GoogleMapsVL&tileMatrix={z}&tileCol={x}&tileRow={y}",
        {
            attribution: 'Achtergrond <i>Grootschalig ReferentieBestand</i>(GRB) © AGIV',
            maxZoom: 20,
            minZoom: 1,
            wmts: true
        });


    private baseLayers = {
        "OpenStreetMap Be": this.osmBeLayer,
        "OpenStreetMap": this.osmLayer,
        "Luchtfoto AIV Vlaanderen (2013-2015)": this.aivLucht2013Layer,
        "Luchtfoto AIV Vlaanderen (laatste)": this.aivLuchtLatestLayer,
        "GRB Vlaanderen": this.grbLayer
    };

    constructor(leafletElementId: string,
                location: UIEventSource<{ zoom: number, lat: number, lon: number }>,
                extraAttribution: UIElement) {
        this.map = L.map(leafletElementId, {
            center: [location.data.lat, location.data.lon],
            zoom: location.data.zoom,
            layers: [this.osmLayer],
        });
        this.map.attributionControl.setPrefix(
            extraAttribution.Render() + " | <a href='https://osm.org'>OpenStreetMap</a>");
        this.Location = location;

        const layerControl = L.control.layers(this.baseLayers, null,
            {
                position: 'bottomright',
                hideSingleBase: true
            })
        layerControl.addTo(this.map);


        this.map.zoomControl.setPosition("bottomright");
        const self = this;

        this.map.on("moveend", function () {
            location.data.zoom = self.map.getZoom();
            location.data.lat = self.map.getCenter().lat;
            location.data.lon = self.map.getCenter().lng;
            location.ping();
        });

        this.map.on("click", function (e) {
            self.LastClickLocation.setData({lat: e.latlng.lat, lon: e.latlng.lng})
        });
    }


}
