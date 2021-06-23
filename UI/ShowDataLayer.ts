/**
 * The data layer shows all the given geojson elements with the appropriate icon etc
 */
import {UIEventSource} from "../Logic/UIEventSource";
import * as L from "leaflet"
import "leaflet.markercluster"
import LayerConfig from "../Customizations/JSON/LayerConfig";
import State from "../State";
import FeatureInfoBox from "./Popup/FeatureInfoBox";
import LayoutConfig from "../Customizations/JSON/LayoutConfig";


export default class ShowDataLayer {

    private _layerDict;
    private readonly _leafletMap: UIEventSource<L.Map>;
    private _cleanCount = 0;
    private readonly _enablePopups: boolean;

    constructor(features: UIEventSource<{ feature: any, freshness: Date }[]>,
                leafletMap: UIEventSource<L.Map>,
                layoutToUse: UIEventSource<LayoutConfig>,
                enablePopups= true) {
        this._leafletMap = leafletMap;
        this._enablePopups = enablePopups;
        const self = this;
        self._layerDict = {};

        layoutToUse.addCallbackAndRun(layoutToUse => {
            for (const layer of layoutToUse.layers) {
                if (self._layerDict[layer.id] === undefined) {
                    self._layerDict[layer.id] = layer;
                }
            }
        });

        let geoLayer = undefined;
        let cluster = undefined;

        function update() {
            if (features.data === undefined) {
                return;
            }
            const mp = leafletMap.data;

            if(mp === undefined){
                return;
            }

            self._cleanCount++
            // clean all the old stuff away, if any
            if (geoLayer !== undefined) {
                mp.removeLayer(geoLayer);
            }
            if (cluster !== undefined) {
                mp.removeLayer(cluster);
            }

            const allFeats = features.data.map(ff => ff.feature);
            geoLayer = self.CreateGeojsonLayer();
            for (const feat of allFeats) {
                // @ts-ignore
                geoLayer.addData(feat);
            }
            if (layoutToUse.data.clustering.minNeededElements <= allFeats.length) {
                // Activate clustering if it wasn't already activated
                const cl = window["L"]; // This is a dirty workaround, the clustering plugin binds to the L of the window, not of the namespace or something
                cluster = cl.markerClusterGroup({disableClusteringAtZoom: layoutToUse.data.clustering.maxZoom});
                cluster.addLayer(geoLayer);
                mp.addLayer(cluster);
            } else {
                mp.addLayer(geoLayer)
            }

            State.state.selectedElement.ping();
        }

        features.addCallback(() => update());
        leafletMap.addCallback(() => update());
        update();
    }


    private createStyleFor(feature) {
        const tagsSource = State.state.allElements.addOrGetElement(feature);
        // Every object is tied to exactly one layer
        const layer = this._layerDict[feature._matching_layer_id];
        return layer?.GenerateLeafletStyle(tagsSource, layer._showOnPopup !== undefined);
    }

    private pointToLayer(feature, latLng): L.Layer {
        // Leaflet cannot handle geojson points natively
        // We have to convert them to the appropriate icon
        // Click handling is done in the next step

        const tagSource = State.state.allElements.getEventSourceById(feature.properties.id)
        const layer: LayerConfig = this._layerDict[feature._matching_layer_id];

        if (layer === undefined) {
            return;
        }

        const style = layer.GenerateLeafletStyle(tagSource, !(layer.title === undefined && (layer.tagRenderings ?? []).length === 0));
        return L.marker(latLng, {
            icon: L.divIcon({
                html: style.icon.html.ConstructElement(),
                className: style.icon.className,
                iconAnchor: style.icon.iconAnchor,
                iconUrl: style.icon.iconUrl,
                popupAnchor: style.icon.popupAnchor,
                iconSize: style.icon.iconSize
            })
        });
    }

    private postProcessFeature(feature, leafletLayer: L.Layer) {
        const layer: LayerConfig = this._layerDict[feature._matching_layer_id];
        if (layer === undefined) {
            console.warn("No layer found for object (probably a now disabled layer)", feature, this._layerDict)
            return;
        }
        if (layer.title === undefined) {
            // No popup action defined -> Don't do anything
            return;
        }
        if(!this._enablePopups){
            // Probably a map in the popup - no popups needed!
            return;
        }
        
        const popup = L.popup({
            autoPan: true,
            closeOnEscapeKey: true,
            closeButton: false
        }, leafletLayer);

        leafletLayer.bindPopup(popup);

        let infobox: FeatureInfoBox = undefined;

        const id = `popup-${feature.properties.id}-${this._cleanCount}`
        popup.setContent(`<div style='height: 65vh' id='${id}'>Rendering</div>`)

        leafletLayer.on("popupopen", () => {
            State.state.selectedElement.setData(feature)
            if (infobox === undefined) {
                const tags = State.state.allElements.getEventSourceById(feature.properties.id);
                infobox = new FeatureInfoBox(tags, layer);

                infobox.isShown.addCallback(isShown => {
                    if (!isShown) {
                        State.state.selectedElement.setData(undefined);
                        leafletLayer.closePopup()
                    }
                });
            }


            infobox.AttachTo(id)
            infobox.Activate();
        });
        const self = this;
        State.state.selectedElement.addCallbackAndRun(selected => {
            if (selected === undefined || self._leafletMap.data === undefined) {
                return;
            }
            if (leafletLayer.getPopup().isOpen()) {
                return;
            }
            if (selected.properties.id === feature.properties.id) {
                // A small sanity check to prevent infinite loops:
                // If a feature is rendered both as way and as point, opening one popup might trigger the other to open, which might trigger the one to open again
                if(selected.geometry.type === feature.geometry.type){
                    leafletLayer.openPopup()    
                }
                
            }
        })

    }

    private CreateGeojsonLayer(): L.Layer {
            const self = this;
            const data = {
                type: "FeatureCollection",
                features: []
            }
            // @ts-ignore
            return L.geoJSON(data, {
                style: feature => self.createStyleFor(feature),
                pointToLayer: (feature, latLng) => self.pointToLayer(feature, latLng),
            onEachFeature: (feature, leafletLayer) => self.postProcessFeature(feature, leafletLayer)
        });

    }

}