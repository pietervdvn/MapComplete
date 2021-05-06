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

    private readonly _popups = new Map<any, L.Layer>();

    constructor(features: UIEventSource<{ feature: any, freshness: Date }[]>,
                leafletMap: UIEventSource<L.Map>,
                layoutToUse: UIEventSource<LayoutConfig>) {
        this._leafletMap = leafletMap;
        const self = this;
        const mp = leafletMap.data;
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
            if (leafletMap.data === undefined) {
                return;
            }

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


        State.state.selectedElement.addCallbackAndRun(selected => {
            if (selected === undefined) {
                mp.closePopup();
                return;
            }
            const marker = self._popups.get(selected);
            if (marker === undefined) {
                return;
            }
            marker.openPopup();

            const popup = marker.getPopup();
            const tags = State.state.allElements.getEventSourceById(selected.properties.id);
            const layer: LayerConfig = this._layerDict[selected._matching_layer_id];
            const infoBox = FeatureInfoBox.construct(tags, layer);

            infoBox.isShown.addCallback(isShown => {
                if (!isShown) {
                    State.state.selectedElement.setData(undefined);
                }
            });

            popup.setContent(infoBox.Render());
            infoBox.Activate();
            infoBox.Update();
        })

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
                html: style.icon.html.Render(),
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
        if (layer.title === undefined && (layer.tagRenderings ?? []).length === 0) {
            // No popup action defined -> Don't do anything
            return;
        }
        const popup = L.popup({
            autoPan: true,
            closeOnEscapeKey: true,
            closeButton: false
        }, leafletLayer);

        // By setting 50vh, leaflet will attempt to fit the entire screen and move the feature down
        popup.setContent("<div style='height: 50vh'>Rendering</div>");

        leafletLayer.bindPopup(popup);
        leafletLayer.on("popupopen", () => {
            State.state.selectedElement.setData(feature)
        });
        
        this._popups.set(feature, leafletLayer);
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