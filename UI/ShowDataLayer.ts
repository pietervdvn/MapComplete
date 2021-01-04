/**
 * The data layer shows all the given geojson elements with the appropriate icon etc
 */
import {UIEventSource} from "../Logic/UIEventSource";
import * as L from "leaflet"
import "leaflet.markercluster"
import LayerConfig from "../Customizations/JSON/LayerConfig";
import State from "../State";
import LazyElement from "./Base/LazyElement";
import Hash from "../Logic/Web/Hash";
import {GeoOperations} from "../Logic/GeoOperations";
import FeatureInfoBox from "./Popup/FeatureInfoBox";
import LayoutConfig from "../Customizations/JSON/LayoutConfig";


export default class ShowDataLayer {

    private readonly _layerDict;
    private readonly _leafletMap: UIEventSource<L.Map>;
    private readonly _onSelectedTrigger: any = {}; // osmId+geometry.type+matching_layer_id --> () => void

    constructor(features: UIEventSource<{ feature: any, freshness: Date }[]>,
                leafletMap: UIEventSource<L.Map>,
                layoutToUse: LayoutConfig) {
        this._leafletMap = leafletMap;
        const self = this;
        let oldGeoLayer: L.Layer = undefined;

        this._layerDict = {};
        for (const layer of layoutToUse.layers) {
            this._layerDict[layer.id] = layer;
        }

        function update() {
            if (features.data === undefined) {
                return;
            }
            if (leafletMap.data === undefined) {
                return;
            }
            const mp = leafletMap.data;

            const feats = features.data.map(ff => ff.feature);
            let geoLayer = self.CreateGeojsonLayer(feats)
            if (layoutToUse.clustering.minNeededElements <= features.data.length) {
                    const cl = window["L"];
                    const cluster = cl.markerClusterGroup({ disableClusteringAtZoom: layoutToUse.clustering.maxZoom });
                    cluster.addLayer(geoLayer);
                    geoLayer = cluster;
            }

            if (oldGeoLayer) {
                mp.removeLayer(oldGeoLayer);
            }
            mp.addLayer(geoLayer);
            oldGeoLayer = geoLayer;
        }

        features.addCallbackAndRun(() => update());
        leafletMap.addCallback(() => update());
        State.state.selectedElement.addCallback(feature => {
            if(feature === undefined){
                return;
            }
            const id = feature.properties.id+feature.geometry.type+feature._matching_layer_id;
            const action = self._onSelectedTrigger[id];
            if(action){
                action();
            }
        });

    }


    private createStyleFor(feature) {
        const tagsSource = State.state.allElements.getEventSourceFor(feature);
        // Every object is tied to exactly one layer
        const layer = this._layerDict[feature._matching_layer_id];
        return layer.GenerateLeafletStyle(tagsSource, layer._showOnPopup !== undefined);
    }

    private pointToLayer(feature, latLng): L.Layer {
        // Leaflet cannot handle geojson points natively
        // We have to convert them to the appropriate icon
        // Click handling is done in the next step

        const tagSource = State.state.allElements.getEventSourceFor(feature);
        const layer: LayerConfig = this._layerDict[feature._matching_layer_id];

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
        if (layer.title === undefined && (layer.tagRenderings ?? []).length === 0) {
            // No popup action defined -> Don't do anything
            return;
        }

        const popup = L.popup({
            autoPan: true,
            closeOnEscapeKey: true,
        }, leafletLayer);


        const tags = State.state.allElements.getEventSourceFor(feature);
        const uiElement: LazyElement = new LazyElement(() => new FeatureInfoBox(tags, layer));
        popup.setContent(uiElement.Render());
        leafletLayer.bindPopup(popup);
        // We first render the UIelement (which'll still need an update later on...)
        // But at least it'll be visible already


        leafletLayer.on("click", (e) => {
            // We set the element as selected...
         //   uiElement.Activate();
            State.state.selectedElement.setData(feature);
        });
        
        const id = feature.properties.id+feature.geometry.type+feature._matching_layer_id;
        this._onSelectedTrigger[id]
         = () => {
            leafletLayer.openPopup();
            uiElement.Activate();
        }
        

        if (feature.properties.id.replace(/\//g, "_") === Hash.Get().data) {
            // This element is in the URL, so this is a share link
            // We already open it
            uiElement.Activate();
            popup.setContent(uiElement.Render());

            const center = GeoOperations.centerpoint(feature).geometry.coordinates;
            popup.setLatLng({lat: center[1], lng: center[0]});
            popup.openOn(State.state.leafletMap.data);
            State.state.selectedElement.setData(feature);
            uiElement.Update();
        }
    }

    private CreateGeojsonLayer(features: any[]): L.Layer {
        const self = this;
        const data = {
            type: "FeatureCollection",
            features: features
        }
        return L.geoJSON(data, {
            style: feature => self.createStyleFor(feature),
            pointToLayer: (feature, latLng) => self.pointToLayer(feature, latLng),
            onEachFeature: (feature, leafletLayer) => self.postProcessFeature(feature, leafletLayer)
        });

    }

}