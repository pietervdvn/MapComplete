import L from "leaflet"
import {UIEventSource} from "../UI/UIEventSource";
import {UIElement} from "../UI/UIElement";


export class BaseLayers {

    public static readonly defaultLayer: { name: string, layer: any } = {
        name: "Kaart van OpenStreetMap", layer: L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution: '',
                maxZoom: 19,
                minZoom: 1
            })
    };
    public static readonly baseLayers: { name: string, layer: any } [] = [

        {
            name: "Luchtfoto Vlaanderen (recentste door AIV)",
            layer: L.tileLayer("https://tile.informatievlaanderen.be/ws/raadpleegdiensten/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&" +
                "LAYER=omwrgbmrvl&STYLE=&FORMAT=image/png&tileMatrixSet=GoogleMapsVL&tileMatrix={z}&tileRow={y}&tileCol={x}",
                {
                    // omwrgbmrvl
                    attribution: 'Luchtfoto\'s van © AIV Vlaanderen (Laatste)  © AGIV',
                    maxZoom: 20,
                    minZoom: 1,
                    wmts: true
                })
        },
        BaseLayers.defaultLayer,
        {
            name: "Luchtfoto Vlaanderen (2013-2015, door AIV)",
            layer: L.tileLayer.wms('https://geoservices.informatievlaanderen.be/raadpleegdiensten/OGW/wms?s',
                {
                    layers: "OGWRGB13_15VL",
                    attribution: "Luchtfoto's van © AIV Vlaanderen (2013-2015) | "
                })
        },
        {
            name: "Kaart Grootschalig ReferentieBestand Vlaanderen (GRB) door AIV",
            layer: L.tileLayer("https://tile.informatievlaanderen.be/ws/raadpleegdiensten/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=grb_bsk&STYLE=&FORMAT=image/png&tileMatrixSet=GoogleMapsVL&tileMatrix={z}&tileCol={x}&tileRow={y}",
                {
                    attribution: 'Achtergrond <i>Grootschalig ReferentieBestand</i>(GRB) © AGIV',
                    maxZoom: 20,
                    minZoom: 1,
                    wmts: true
                })
        }
    ]
    ;

}

// Contains all setup and baselayers for Leaflet stuff
export class Basemap {


    // @ts-ignore
    public map: Map;

    public Location: UIEventSource<{ zoom: number, lat: number, lon: number }>;
    public LastClickLocation: UIEventSource<{ lat: number, lon: number }> = new UIEventSource<{ lat: number, lon: number }>(undefined)
    private _previousLayer: L.tileLayer = undefined;
    public CurrentLayer: UIEventSource<{
        name: string,
        layer: L.tileLayer
    }> = new UIEventSource<L.tileLayer>(BaseLayers.defaultLayer);


    constructor(leafletElementId: string,
                location: UIEventSource<{ zoom: number, lat: number, lon: number }>,
                extraAttribution: UIElement) {
        this.map = L.map(leafletElementId, {
            center: [location.data.lat, location.data.lon],
            zoom: location.data.zoom,
            layers: [BaseLayers.defaultLayer.layer],
        });


        this.map.attributionControl.setPrefix(
            extraAttribution.Render() + " | <a href='https://osm.org'>OpenStreetMap</a>");
        this.Location = location;


        this.map.zoomControl.setPosition("bottomright");
        const self = this;

        this.map.on("moveend", function () {
            location.data.zoom = self.map.getZoom();
            location.data.lat = self.map.getCenter().lat;
            location.data.lon = self.map.getCenter().lng;
            location.ping();
        });
        
        this.CurrentLayer.addCallback((layer:{layer: L.tileLayer}) => {
            if(self._previousLayer !== undefined){
                self.map.removeLayer(self._previousLayer);
            }
            self._previousLayer = layer.layer;
            self.map.addLayer(layer.layer);
        });

        this.map.on("click", function (e) {
            self.LastClickLocation.setData({lat: e.latlng.lat, lon: e.latlng.lng})
        });
    }
    
}
