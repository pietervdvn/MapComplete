/**
 * The data layer shows all the given geojson elements with the appropriate icon etc
 */
import {UIEventSource} from "../../Logic/UIEventSource";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
import FeatureInfoBox from "../Popup/FeatureInfoBox";
import {ShowDataLayerOptions} from "./ShowDataLayerOptions";
import {ElementStorage} from "../../Logic/ElementStorage";
import Hash from "../../Logic/Web/Hash";

export default class ShowDataLayer {

    private readonly _leafletMap: UIEventSource<L.Map>;
    private readonly _enablePopups: boolean;
    private readonly _features: UIEventSource<{ feature: any }[]>
    private readonly _layerToShow: LayerConfig;
    private readonly _selectedElement: UIEventSource<any>
    private readonly allElements : ElementStorage
    // Used to generate a fresh ID when needed
    private _cleanCount = 0;
    private geoLayer = undefined;
    private isDirty = false;

    /**
     * If the selected element triggers, this is used to lookup the correct layer and to open the popup
     * Used to avoid a lot of callbacks on the selected element
     *
     * Note: the key of this dictionary is 'feature.properties.id+features.geometry.type' as one feature might have multiple presentations
     * @private
     */
    private readonly leafletLayersPerId = new Map<string, { feature: any, leafletlayer: any }>()

    private readonly showDataLayerid : number;
    private static dataLayerIds = 0

    constructor(options: ShowDataLayerOptions & { layerToShow: LayerConfig }) {
        this._leafletMap = options.leafletMap;
        this.showDataLayerid = ShowDataLayer.dataLayerIds;
        ShowDataLayer.dataLayerIds++
        this._enablePopups = options.enablePopups ?? true;
        if (options.features === undefined) {
            throw "Invalid ShowDataLayer invocation"
        }
        const features = options.features.features.map(featFreshes => featFreshes.map(ff => ff.feature));
        this._features = features;
        this._layerToShow = options.layerToShow;
        this._selectedElement = options.selectedElement
        this.allElements = options.allElements;
        const self = this;

        options.leafletMap.addCallbackAndRunD(_ => {
                self.update(options)
            }
        );

        features.addCallback(_ => self.update(options));
        options.doShowLayer?.addCallbackAndRun(doShow => {
            const mp = options.leafletMap.data;
            if (mp == undefined) {
                return;
            }
            if (doShow) {
                if (self.isDirty) {
                    self.update(options)
                } else {
                    mp.addLayer(this.geoLayer)
                }
            } else {
                if (this.geoLayer !== undefined) {
                    mp.removeLayer(this.geoLayer)
                }
            }

        })


        this._selectedElement?.addCallbackAndRunD(selected => {
            if (self._leafletMap.data === undefined) {
                return;
            }
            const v = self.leafletLayersPerId.get(selected.properties.id + selected.geometry.type)
            if (v === undefined) {
                return;
            }
            const leafletLayer = v.leafletlayer
            const feature = v.feature
            if (leafletLayer.getPopup().isOpen()) {
                return;
            }
            if (selected.properties.id !== feature.properties.id) {
                return;
            }

            if (feature.id !== feature.properties.id) {
                // Probably a feature which has renamed
                // the feature might have as id 'node/-1' and as 'feature.properties.id' = 'the newly assigned id'. That is no good too
                console.log("Not opening the popup for", feature, "as probably renamed")
                return;
            }
            if (selected.geometry.type === feature.geometry.type  // If a feature is rendered both as way and as point, opening one popup might trigger the other to open, which might trigger the one to open again
            ) {
                console.log("Opening popup of feature", feature)
                leafletLayer.openPopup()
            }
        })

    }

    private update(options: ShowDataLayerOptions) {
        if (this._features.data === undefined) {
            return;
        }
        this.isDirty = true;
        if (options?.doShowLayer?.data === false) {
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

        const self = this;
        const data = {
            type: "FeatureCollection",
            features: []
        }
        // @ts-ignore
        this.geoLayer = L.geoJSON(data, {
            style: feature => self.createStyleFor(feature),
            pointToLayer: (feature, latLng) => self.pointToLayer(feature, latLng),
            onEachFeature: (feature, leafletLayer) => self.postProcessFeature(feature, leafletLayer)
        });

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
        this.isDirty = false;
    }


    private createStyleFor(feature) {
        const tagsSource = this.allElements?.addOrGetElement(feature) ?? new UIEventSource<any>(feature.properties.id);
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

        let tagSource = this.allElements?.getEventSourceById(feature.properties.id) ?? new UIEventSource<any>(feature.properties)
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

        const id = `popup-${feature.properties.id}-${feature.geometry.type}-${this.showDataLayerid}-${this._cleanCount}`
        popup.setContent(`<div style='height: 65vh' id='${id}'>Popup for ${feature.properties.id} ${feature.geometry.type} ${id} is loading</div>`)
        leafletLayer.on("popupopen", () => {
            if (infobox === undefined) {
                const tags = this.allElements?.getEventSourceById(feature.properties.id) ?? new UIEventSource<any>(feature.properties);
                infobox = new FeatureInfoBox(tags, layer);

                infobox.isShown.addCallback(isShown => {
                    if (!isShown) {
                        this._selectedElement?.setData(undefined);
                        leafletLayer.closePopup()
                    }
                });
            }
            infobox.AttachTo(id)
            infobox.Activate();
            if (this._selectedElement?.data?.properties?.id !== feature.properties.id) {
                this._selectedElement?.setData(feature)
            }

        });


        // Add the feature to the index to open the popup when needed
        this.leafletLayersPerId.set(feature.properties.id + feature.geometry.type, {
            feature: feature,
            leafletlayer: leafletLayer
        })
        

    }

}