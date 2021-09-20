/**
 * The data layer shows all the given geojson elements with the appropriate icon etc
 */
import {UIEventSource} from "../Logic/UIEventSource";
import * as L from "leaflet"
import State from "../State";
import FeatureInfoBox from "./Popup/FeatureInfoBox";
import LayerConfig from "../Models/ThemeConfig/LayerConfig";
import FeatureSource from "../Logic/FeatureSource/FeatureSource";

export interface ShowDataLayerOptions {
    features: FeatureSource,
    leafletMap: UIEventSource<L.Map>,
    enablePopups?: true | boolean,
    zoomToFeatures? : false | boolean,
}

export default class ShowDataLayer {

    private readonly _leafletMap: UIEventSource<L.Map>;
    private readonly _enablePopups: boolean;
    private readonly _features: UIEventSource<{ feature: any }[]>
    private readonly _layerToShow: LayerConfig;

    // Used to generate a fresh ID when needed
    private _cleanCount = 0;
    
    constructor(options: ShowDataLayerOptions & { layerToShow: LayerConfig}) {
        this._leafletMap = options.leafletMap;
        this._enablePopups = options.enablePopups ?? true;
        if(options.features === undefined){
            throw "Invalid ShowDataLayer invocation"
        }
        const features = options.features.features.map(featFreshes => featFreshes.map(ff => ff.feature));
        this._features = features;
        this._layerToShow = options.layerToShow;
        const self = this;

        let geoLayer = undefined;

        function update() {
            if (features.data === undefined) {
                return;
            }
            const mp =options. leafletMap.data;

            if (mp === undefined) {
                return;
            }

            self._cleanCount++
            // clean all the old stuff away, if any
            if (geoLayer !== undefined) {
                mp.removeLayer(geoLayer);
            }

            const allFeats = features.data;
            geoLayer = self.CreateGeojsonLayer();
            for (const feat of allFeats) {
                if (feat === undefined) {
                    continue
                }
                // @ts-ignore
                geoLayer.addData(feat);
            }
           
                mp.addLayer(geoLayer)

            if (options.zoomToFeatures ?? false) {
                try {
                    mp.fitBounds(geoLayer.getBounds(), {animate: false})
                } catch (e) {
                    console.error(e)
                }
            }
            if (self._enablePopups) {
                State.state.selectedElement.ping()
            }
        }

        features.addCallback(() => update());
        options.leafletMap.addCallback(() => update());
        update();
    }


    private createStyleFor(feature) {
        const tagsSource = State.state.allElements.addOrGetElement(feature);
        // Every object is tied to exactly one layer
        const layer = this._layerToShow 
        return layer?.GenerateLeafletStyle(tagsSource, true);
    }

    private pointToLayer(feature, latLng): L.Layer {
        // Leaflet cannot handle geojson points natively
        // We have to convert them to the appropriate icon
        // Click handling is done in the next step

        const layer: LayerConfig = this._layerToShow 
        if (layer === undefined) {
            return;
        }

        const tagSource = feature.properties.id === undefined ? new UIEventSource<any>(feature.properties) : State.state.allElements.getEventSourceById(feature.properties.id)
        const style = layer.GenerateLeafletStyle(tagSource, !(layer.title === undefined && (layer.tagRenderings ?? []).length === 0));
        const baseElement = style.icon.html;
        if (!this._enablePopups) {
            baseElement.SetStyle("cursor: initial !important")
        }
        return L.marker(latLng, {
            icon: L.divIcon({
                html: baseElement.ConstructElement(),
                className: style.icon.className,
                iconAnchor: style.icon.iconAnchor,
                iconUrl: style.icon.iconUrl,
                popupAnchor: style.icon.popupAnchor,
                iconSize: style.icon.iconSize
            })
        });
    }

    /**
     * POst processing - basically adding the popup
     * @param feature
     * @param leafletLayer
     * @private
     */
    private postProcessFeature(feature, leafletLayer: L.Layer) {
        const layer: LayerConfig = this._layerToShow
        if (layer.title === undefined || !this._enablePopups) {
            // No popup action defined -> Don't do anything
            // or probably a map in the popup - no popups needed!
            return;
        }

        const popup = L.popup({
            autoPan: true,
            closeOnEscapeKey: true,
            closeButton: false,
            autoPanPaddingTopLeft: [15, 15],

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
        State.state.selectedElement.addCallbackAndRunD(selected => {
            if (self._leafletMap.data === undefined) {
                return;
            }
            if (leafletLayer.getPopup().isOpen()) {
                return;
            }
            if (selected.properties.id === feature.properties.id) {
                // A small sanity check to prevent infinite loops:
                if (selected.geometry.type === feature.geometry.type  // If a feature is rendered both as way and as point, opening one popup might trigger the other to open, which might trigger the one to open again
                    && feature.id === feature.properties.id // the feature might have as id 'node/-1' and as 'feature.properties.id' = 'the newly assigned id'. That is no good too
                ) {
                    leafletLayer.openPopup()
                }
                if (feature.id !== feature.properties.id) {
                    console.trace("Not opening the popup for", feature)
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