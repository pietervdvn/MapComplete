import * as L from "leaflet"
import {UIEventSource} from "../../Logic/UIEventSource";
import Loc from "../../Models/Loc";
import BaseLayer from "../../Models/BaseLayer";
import BaseUIElement from "../BaseUIElement";

export class Basemap {


    public readonly map: L.Map;

    constructor(leafletElementId: string,
                location: UIEventSource<Loc>,
                currentLayer: UIEventSource<BaseLayer>,
                lastClickLocation?: UIEventSource<{ lat: number, lon: number }>,
                extraAttribution?: BaseUIElement) {

        console.log("Currentlayer is" ,currentLayer, currentLayer.data, currentLayer.data?.id)
        let previousLayer = currentLayer.data.layer();

        this.map = L.map(leafletElementId, {
            center: [location.data.lat ?? 0, location.data.lon ?? 0],
            zoom: location.data.zoom ?? 2,
            layers: [previousLayer],
            zoomControl: false,
            attributionControl: extraAttribution !== undefined
        });


        // Users are not allowed to zoom to the 'copies' on the left and the right, stuff goes wrong then
        // We give a bit of leeway for people on the edges
        // Also see: https://www.reddit.com/r/openstreetmap/comments/ih4zzc/mapcomplete_a_new_easytouse_editor/g31ubyv/
        this.map.setMaxBounds(
            [[-100, -200], [100, 200]]
        );

        this.map.attributionControl.setPrefix(
            "<span id='leaflet-attribution'></span> | <a href='https://osm.org'>OpenStreetMap</a>");

        extraAttribution.AttachTo('leaflet-attribution')
        const self = this;

        currentLayer.addCallbackAndRun(layer => {
            const newLayer = layer.layer()
            if (newLayer === previousLayer) {
                return;
            }
            if (previousLayer !== undefined) {
                self.map.removeLayer(previousLayer);
            }
            previousLayer = newLayer;
            self.map.addLayer(newLayer);
        })


        this.map.on("moveend", function () {
            location.data.zoom = self.map.getZoom();
            location.data.lat = self.map.getCenter().lat;
            location.data.lon = self.map.getCenter().lng;
            location.ping();
        });

        location.map(loc => loc.zoom)
            .addCallback(zoom => {
                if (Math.abs(self.map.getZoom() - zoom) > 0.1) {
                    self.map.setZoom(zoom, {});
                }
            })

        this.map.on("click", function (e) {
            // @ts-ignore
            lastClickLocation?.setData({lat: e.latlng.lat, lon: e.latlng.lng})
        });

        this.map.on("contextmenu", function (e) {
            // @ts-ignore
            lastClickLocation?.setData({lat: e.latlng.lat, lon: e.latlng.lng});
        });


    }


}
