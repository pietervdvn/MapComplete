/**
 * The data layer shows all the given geojson elements with the appropriate icon etc
 */
import {UIEventSource} from "../../Logic/UIEventSource";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
import FeatureInfoBox from "../Popup/FeatureInfoBox";
import State from "../../State";
import {ShowDataLayerOptions} from "./ShowDataLayerOptions";

export default class ShowDataLayer {

    private readonly _leafletMap: UIEventSource<L.Map>;
    private readonly _enablePopups: boolean;
    private readonly _features: UIEventSource<{ feature: any }[]>
    private readonly _layerToShow: LayerConfig;

    // Used to generate a fresh ID when needed
    private _cleanCount = 0;
    private geoLayer = undefined;

    /**
     * If the selected element triggers, this is used to lookup the correct layer and to open the popup
     * Used to avoid a lot of callbacks on the selected element
     * @private
     */
    private readonly leafletLayersPerId = new Map<string, { feature: any, leafletlayer: any }>()


    constructor(options: ShowDataLayerOptions & { layerToShow: LayerConfig }) {
        this._leafletMap = options.leafletMap;
        this._enablePopups = options.enablePopups ?? true;
        if (options.features === undefined) {
            throw "Invalid ShowDataLayer invocation"
        }
        const features = options.features.features.map(featFreshes => featFreshes.map(ff => ff.feature));
        this._features = features;
        this._layerToShow = options.layerToShow;
        const self = this;

        features.addCallback(_ => self.update(options));
        options.leafletMap.addCallback(_ => self.update(options));
        this.update(options);

        State.state.selectedElement.addCallbackAndRunD(selected => {
            if (self._leafletMap.data === undefined) {
                return;
            }
            const v = self.leafletLayersPerId.get(selected.properties.id)
            if (v === undefined) {
                return;
            }
            const leafletLayer = v.leafletlayer
            const feature = v.feature
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

        options.doShowLayer?.addCallbackAndRun(doShow => {
            const mp = options.leafletMap.data;
            if (this.geoLayer == undefined || mp == undefined) {
                return;
            }
            if (doShow) {
                mp.addLayer(this.geoLayer)
            } else {
                mp.removeLayer(this.geoLayer)
            }


        })

    }

    private update(options) {
        if (this._features.data === undefined) {
            return;
        }
        const mp = options.leafletMap.data;

        if (mp === undefined) {
            return;
        }
        this._cleanCount++
        // clean all the old stuff away, if any
        if (this.geoLayer !== undefined) {
            mp.removeLayer(this.geoLayer);
        }

        this.geoLayer = this.CreateGeojsonLayer()
        const allFeats = this._features.data;
        for (const feat of allFeats) {
            if (feat === undefined) {
                continue
            }
            try {
                this.geoLayer.addData(feat);
            } catch (e) {
                console.error("Could not add ", feat, "to the geojson layer in leaflet")
            }
        }

        if (options.zoomToFeatures ?? false) {
            try {
                mp.fitBounds(this.geoLayer.getBounds(), {animate: false})
            } catch (e) {
                console.error(e)
            }
        }

        if (options.doShowLayer?.data ?? true) {
            mp.addLayer(this.geoLayer)
        }
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

        const tagSource = feature.properties.id === undefined ? new UIEventSource<any>(feature.properties) : 
            State.state.allElements.getEventSourceById(feature.properties.id)
        const clickable = !(layer.title === undefined && (layer.tagRenderings ?? []).length === 0)
        const style = layer.GenerateLeafletStyle(tagSource, clickable);
        const baseElement = style.icon.html;
        if (!this._enablePopups) {
            baseElement.SetStyle("cursor: initial !important")
        }
        return L.marker(latLng, {
            icon: L.divIcon({
                html: baseElement.ConstructElement(),
                className: style.icon.className,
                iconAnchor: style.icon.iconAnchor,
                iconUrl: style.icon.iconUrl ?? "./assets/svg/bug.svg",
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


        // Add the feature to the index to open the popup when needed
        this.leafletLayersPerId.set(feature.properties.id, {feature: feature, leafletlayer: leafletLayer})

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