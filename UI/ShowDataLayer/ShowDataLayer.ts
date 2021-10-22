
import {UIEventSource} from "../../Logic/UIEventSource";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
import FeatureInfoBox from "../Popup/FeatureInfoBox";
import {ShowDataLayerOptions} from "./ShowDataLayerOptions";
import {ElementStorage} from "../../Logic/ElementStorage";
import RenderingMultiPlexerFeatureSource from "../../Logic/FeatureSource/Sources/RenderingMultiPlexerFeatureSource";
/*
// import 'leaflet-polylineoffset'; 
We don't actually import it here. It is imported in the 'MinimapImplementation'-class, which'll result in a patched 'L' object.
 Even though actually importing this here would seem cleaner, we don't do this as this breaks some scripts:
 - Scripts are ran in ts-node
 - ts-node doesn't define the 'window'-object
 - Importing this will execute some code which needs the window object

 */

/**
 * The data layer shows all the given geojson elements with the appropriate icon etc
 */
export default class ShowDataLayer {

    private readonly _leafletMap: UIEventSource<L.Map>;
    private readonly _enablePopups: boolean;
    private readonly _features: RenderingMultiPlexerFeatureSource
    private readonly _layerToShow: LayerConfig;
    private readonly _selectedElement: UIEventSource<any>
    private readonly allElements: ElementStorage
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

    private readonly showDataLayerid: number;
    private static dataLayerIds = 0

    constructor(options: ShowDataLayerOptions & { layerToShow: LayerConfig }) {
        this._leafletMap = options.leafletMap;
        this.showDataLayerid = ShowDataLayer.dataLayerIds;
        ShowDataLayer.dataLayerIds++
        this._enablePopups = options.enablePopups ?? true;
        if (options.features === undefined) {
            console.error("Invalid ShowDataLayer invocation: options.features is undefed")
            throw "Invalid ShowDataLayer invocation: options.features is undefed"
        }
        this._features = new RenderingMultiPlexerFeatureSource(options.features, options.layerToShow);
        this._layerToShow = options.layerToShow;
        this._selectedElement = options.selectedElement
        this.allElements = options.allElements;
        const self = this;

        options.leafletMap.addCallback(_ => {
                self.update(options)
            }
        );

        this._features.features.addCallback(_ => self.update(options));
        options.doShowLayer?.addCallback(doShow => {
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

        this.update(options)

    }

    private update(options: ShowDataLayerOptions) {
        if (this._features.features.data === undefined) {
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

        const allFeats = this._features.features.data;
        for (const feat of allFeats) {
            if (feat === undefined) {
                continue
            }
            try {

                if ((feat.geometry.type === "LineString" || feat.geometry.type === "MultiLineString")) {
                    const self = this;
                    const coords = L.GeoJSON.coordsToLatLngs(feat.geometry.coordinates)
                    const tagsSource = this.allElements?.addOrGetElement(feat) ?? new UIEventSource<any>(feat.properties);
                    let offsettedLine;
                    tagsSource
                         .map(tags => this._layerToShow.lineRendering[feat.lineRenderingIndex].GenerateLeafletStyle(tags))
                        .withEqualityStabilized((a, b) => {
                            if(a === b){
                                return true
                            }
                            if(a === undefined || b === undefined){
                                return false
                            }
                            return a.offset === b.offset && a.color === b.color && a.weight === b.weight && a.dashArray === b.dashArray
                        })
                        .addCallbackAndRunD(lineStyle => {
                        if (offsettedLine !== undefined) {
                            self.geoLayer.removeLayer(offsettedLine)
                        }
                        offsettedLine = L.polyline(coords, lineStyle);
                        this.postProcessFeature(feat, offsettedLine)
                        offsettedLine.addTo(this.geoLayer)
                    })
                } else {
                    this.geoLayer.addData(feat);
                }
            } catch (e) {
                console.error("Could not add ", feat, "to the geojson layer in leaflet due to", e, e.stack)
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
        const tagsSource = this.allElements?.addOrGetElement(feature) ?? new UIEventSource<any>(feature.properties);
        // Every object is tied to exactly one layer
        const layer = this._layerToShow

        const pointRenderingIndex = feature.pointRenderingIndex
        const lineRenderingIndex = feature.lineRenderingIndex

        if (pointRenderingIndex !== undefined) {
            return {
                icon: layer.mapRendering[pointRenderingIndex].GenerateLeafletStyle(tagsSource, this._enablePopups)
            }
        }
        if (lineRenderingIndex !== undefined) {
            return layer.lineRendering[lineRenderingIndex].GenerateLeafletStyle(tagsSource)
        }

        throw "Neither lineRendering nor mapRendering defined for " + feature
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
        let style: any = layer.mapRendering[feature.pointRenderingIndex].GenerateLeafletStyle(tagSource, clickable);
        const baseElement = style.html;
        if (!this._enablePopups) {
            baseElement.SetStyle("cursor: initial !important")
        }
        style.html = style.html.ConstructElement()
        return L.marker(latLng, {
            icon: L.divIcon(style)
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

        const id = `popup-${feature.properties.id}-${feature.geometry.type}-${this.showDataLayerid}-${this._cleanCount}-${feature.pointRenderingIndex ?? feature.lineRenderingIndex}`
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