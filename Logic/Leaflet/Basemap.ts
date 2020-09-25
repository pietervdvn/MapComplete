import L from "leaflet"
import {UIEventSource} from "../UIEventSource";
import {UIElement} from "../../UI/UIElement";


export class BaseLayers {


    /*public static readonly baseLayers: { name: string, layer: any, id: string } [] = [
 
         {
             id: "aiv-latest",
             name: "Luchtfoto Vlaanderen (recentste door AIV)",
             layer: L.tileLayer("https://tile.informatievlaanderen.be/ws/raadpleegdiensten/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&" +
                 "LAYER=omwrgbmrvl&STYLE=&FORMAT=image/png&tileMatrixSet=GoogleMapsVL&tileMatrix={z}&tileRow={y}&tileCol={x}",
                 {
                     // omwrgbmrvl
                     attribution: 'Luchtfoto\'s van © AIV Vlaanderen (Laatste)  © AGIV',
                     maxZoom: 22,
                     minZoom: 1,
                     wmts: true
                 })
         },
         BaseLayers.defaultLayer,
         {
             id: "aiv-13-15",
             name: "Luchtfoto Vlaanderen (2013-2015, door AIV)",
             layer: L.tileLayer.wms('https://geoservices.informatievlaanderen.be/raadpleegdiensten/OGW/wms?s',
                 {
                     maxZoom: 22,
                     layers: "OGWRGB13_15VL",
                     attribution: "Luchtfoto's van © AIV Vlaanderen (2013-2015) | "
                 })
         },
         {
             id:"grb",
             name: "Kaart Grootschalig ReferentieBestand Vlaanderen (GRB) door AIV",
             layer: L.tileLayer("https://tile.informatievlaanderen.be/ws/raadpleegdiensten/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=grb_bsk&STYLE=&FORMAT=image/png&tileMatrixSet=GoogleMapsVL&tileMatrix={z}&tileCol={x}&tileRow={y}",
                 {
                     attribution: 'Achtergrond <i>Grootschalig ReferentieBestand</i>(GRB) © AGIV',
                     maxZoom: 22,
                     minZoom: 1,
                     wmts: true
                 })
         }
     ]
     ;*/

}

// Contains all setup and baselayers for Leaflet stuff
export class Basemap {


    public static readonly defaultLayer: { name: string, layer: any, id: string } =
        Basemap.CreateBackgroundLayer("osm", "OpenStreetMap", "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            "<a href='https://openstreetmap.org/copyright' target='_blank'>OpenStreetMap (ODBL)</a>",
            22, false);

    // @ts-ignore
    public readonly map: Map;

    public readonly Location: UIEventSource<{ zoom: number, lat: number, lon: number }>;
    public readonly LastClickLocation: UIEventSource<{ lat: number, lon: number }> = new UIEventSource<{ lat: number, lon: number }>(undefined)
    private _previousLayer: L.tileLayer = undefined;
    public readonly CurrentLayer: UIEventSource<{
        id: string,
        name: string,
        layer: L.tileLayer
    }> = new UIEventSource<L.tileLayer>(Basemap.defaultLayer);


    constructor(leafletElementId: string,
                location: UIEventSource<{ zoom: number, lat: number, lon: number }>,
                extraAttribution: UIElement) {
        this._previousLayer = Basemap.defaultLayer.layer;
        this.map = L.map(leafletElementId, {
            center: [location.data.lat ?? 0, location.data.lon ?? 0],
            zoom: location.data.zoom ?? 2,
            layers: [this._previousLayer],
        });


        // Users are not allowed to zoom to the 'copies' on the left and the right, stuff goes wrong then
        // We give a bit of leeway for people on the edges
        // Also see: https://www.reddit.com/r/openstreetmap/comments/ih4zzc/mapcomplete_a_new_easytouse_editor/g31ubyv/
        this.map.setMaxBounds(
            [[-100,-200],[100,200]]
        );
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

        this.map.on("contextmenu", function (e) {
            self.LastClickLocation.setData({lat: e.latlng.lat, lon: e.latlng.lng});
            e.preventDefault();
        });
    }

    public static CreateBackgroundLayer(id: string, name: string, url: string, attribution: string,
                                        maxZoom: number, isWms: boolean, isWMTS?: boolean) {

        url = url.replace("{zoom}", "{z}")
            .replace("{switch:", "{")
            .replace("{proj}", "EPSG:3857")
            .replace("{width}", "256")
            .replace("{height}", "256")

        //geoservices.informatievlaanderen.be/raadpleegdiensten/dhmv/wms?FORMAT=image/jpeg&VERSION=1.1.1&SERVICE=WMS&REQUEST=GetMap&LAYERS=DHMV_II_SVF_25cm&STYLES=&SRS=EPSG:3857&WIDTH=256&HEIGHT=256
        if (isWms) {
            return {
                id: id,
                name: name,
                layer: L.tileLayer.wms(url,
                    {
                        maxZoom: maxZoom ?? 19,
                        attribution: attribution + " | "
                    })
            }
        }

        return {
            id: id,
            name: name,
            layer: L.tileLayer(url,
                {
                    attribution: attribution,
                    maxZoom: maxZoom,
                    minZoom: 1,
                    wmts: isWMTS ?? false
                })
        }
    }

}
