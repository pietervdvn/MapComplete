/**
 * The data layer shows all the given geojson elements with the appropriate icon etc
 */
import {UIEventSource} from "../Logic/UIEventSource";
import * as L from "leaflet"
import "leaflet.markercluster"
import LayerConfig from "../Customizations/JSON/LayerConfig";
import State from "../State";
import LazyElement from "./Base/LazyElement";
import FeatureInfoBox from "./Popup/FeatureInfoBox";
import LayoutConfig from "../Customizations/JSON/LayoutConfig";
import ScrollableFullScreen from "./Base/ScrollableFullScreen";
import {GeoOperations} from "../Logic/GeoOperations";


export default class ShowDataLayer {

    private _layerDict;
    private readonly _leafletMap: UIEventSource<L.Map>;

    constructor(features: UIEventSource<{ feature: any, freshness: Date }[]>,
                leafletMap: UIEventSource<L.Map>,
                layoutToUse: UIEventSource<LayoutConfig>) {
        this._leafletMap = leafletMap;
        const self = this;
        const mp = leafletMap.data;
        self._layerDict = {};

        layoutToUse.addCallbackAndRun(layoutToUse => {
            for (const layer of layoutToUse.layers) {
                self._layerDict[layer.id] = layer;
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
    }


    private createStyleFor(feature) {
        const tagsSource = State.state.allElements.getEventSourceFor(feature);
        // Every object is tied to exactly one layer
        const layer = this._layerDict[feature._matching_layer_id];
        return layer?.GenerateLeafletStyle(tagsSource, layer._showOnPopup !== undefined);
    }

    private pointToLayer(feature, latLng): L.Layer {
        // Leaflet cannot handle geojson points natively
        // We have to convert them to the appropriate icon
        // Click handling is done in the next step

        const tagSource = State.state.allElements.addOrGetElement(feature)
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
        if(layer === undefined){
            console.warn("No layer found for object (probably a now disabled layer)", feature)
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

        const tags = State.state.allElements.getEventSourceFor(feature);
        const uiElement = new LazyElement(() =>
                FeatureInfoBox.construct(tags, layer, () => {
                    State.state.selectedElement.setData(undefined);
                    leafletLayer.closePopup();
                    popup.remove();
                    ScrollableFullScreen.RestoreLeaflet();
                }),
            "<div style='height: 90vh'>Rendering</div>"); // By setting 90vh, leaflet will attempt to fit the entire screen and move the feature down
        popup.setContent(uiElement.Render());
        popup.on('remove', () => {
            ScrollableFullScreen.RestoreLeaflet(); // Just in case...
        });
        leafletLayer.bindPopup(popup);
        // We first render the UIelement (which'll still need an update later on...)
        // But at least it'll be visible already


        leafletLayer.on("popupopen", () => {
            State.state.selectedElement.setData(feature);
            uiElement.Activate();
        })

        State.state.selectedElement.addCallbackAndRun(selected => {
           
                if (selected === undefined) {
                    if (popup.isOpen()) {
                        popup.remove();
                    }
                } else if (selected == feature && selected.geometry.type === feature.geometry.type) {
                    // If wayhandling introduces a centerpoint and an area, this code might become unstable:
                    // The popup for the centerpoint would open, a bit later the area would close the first popup and open it's own
                    // In the process, the 'selectedElement' is set to undefined and to the other feature again, causing an infinite loop

                    // This is why we check for the geometry-type too

                    const mp = this._leafletMap.data;
                    if (!popup.isOpen() && mp !== undefined) {
                        popup
                            .setLatLng(GeoOperations.centerpointCoordinates(feature))
                            .openOn(mp);
                        uiElement.Activate();
                    }
                }
            }
        );

    }

    private CreateGeojsonLayer(): L.Layer {
        const self = this;
        const data = {
            type: "FeatureCollection",
            features: []
        }
        return L.geoJSON(data, {
            style: feature => self.createStyleFor(feature),
            pointToLayer: (feature, latLng) => self.pointToLayer(feature, latLng),
            onEachFeature: (feature, leafletLayer) => self.postProcessFeature(feature, leafletLayer)
        });

    }

}