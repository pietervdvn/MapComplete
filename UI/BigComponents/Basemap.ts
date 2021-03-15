import * as L from "leaflet"
import {UIEventSource} from "../../Logic/UIEventSource";
import Loc from "../../Models/Loc";
import {UIElement} from "../UIElement";
import BaseLayer from "../../Models/BaseLayer";

export class Basemap {


    public readonly map: L.Map;

    constructor(leafletElementId: string,
                location: UIEventSource<Loc>,
                currentLayer: UIEventSource<BaseLayer>,
                lastClickLocation: UIEventSource<{ lat: number, lon: number }>,
                extraAttribution: UIElement) {
        this.map = L.map(leafletElementId, {
            center: [location.data.lat ?? 0, location.data.lon ?? 0],
            zoom: location.data.zoom ?? 2,
            layers: [currentLayer.data.layer],
            zoomControl: false
            
        });

        L.control.scale(
            {
                position: 'topright',
            }
        ).addTo(this.map)


        // Users are not allowed to zoom to the 'copies' on the left and the right, stuff goes wrong then
        // We give a bit of leeway for people on the edges
        // Also see: https://www.reddit.com/r/openstreetmap/comments/ih4zzc/mapcomplete_a_new_easytouse_editor/g31ubyv/
        this.map.setMaxBounds(
            [[-100, -200], [100, 200]]
        );
        this.map.attributionControl.setPrefix(
            extraAttribution.Render() + " | <a href='https://osm.org'>OpenStreetMap</a>");

        const self = this;

        let previousLayer = currentLayer.data;
        currentLayer.addCallbackAndRun(layer => {
            if (layer === previousLayer) {
                return;
            }
            if (previousLayer !== undefined) {
                self.map.removeLayer(previousLayer.layer);
            }
            previousLayer = layer;
            self.map.addLayer(layer.layer);
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
            lastClickLocation.setData({lat: e.latlng.lat, lon: e.latlng.lng})
        });

        this.map.on("contextmenu", function (e) {
            // @ts-ignore
            lastClickLocation.setData({lat: e.latlng.lat, lon: e.latlng.lng});
        });


    }


}
