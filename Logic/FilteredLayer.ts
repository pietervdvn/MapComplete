import {TagsFilter, TagUtils} from "./TagsFilter";
import {UIEventSource} from "./UIEventSource";
import L from "leaflet"
import {GeoOperations} from "./GeoOperations";
import {UIElement} from "../UI/UIElement";
import {LayerDefinition} from "../Customizations/LayerDefinition";
import codegrid from "codegrid-js";
import {State} from "../State";

/***
 * A filtered layer is a layer which offers a 'set-data' function
 * It is initialized with a tagfilter.
 *
 * When geojson-data is given to 'setData', all the geojson matching the filter, is rendered on this layer.
 * If it is not rendered, it is returned in a 'leftOver'-geojson; which can be consumed by the next layer.
 *
 * This also makes sure that no objects are rendered twice if they are applicable on two layers
 */
export class FilteredLayer {

    public readonly name: string | UIElement;
    public readonly filters: TagsFilter;
    public readonly isDisplayed: UIEventSource<boolean> = new UIEventSource(true);
    public readonly layerDef: LayerDefinition;
    private readonly _maxAllowedOverlap: number;

    private readonly _style: (properties) => { color: string, weight?: number, icon: { iconUrl: string, iconSize? : number[], popupAnchor?: number[], iconAnchor?:number[] } };


    /** The featurecollection from overpass
     */
    private _dataFromOverpass;
    private _wayHandling: number;
    /** List of new elements, geojson features
     */
    private _newElements = [];
    /**
     * The leaflet layer object which should be removed on rerendering
     */
    private _geolayer;
    private _showOnPopup: (tags: UIEventSource<any>, feature: any) => UIElement;

    private static readonly grid = codegrid.CodeGrid();

    constructor(
        layerDef: LayerDefinition,
        showOnPopup: ((tags: UIEventSource<any>, feature: any) => UIElement)
    ) {
        this.layerDef = layerDef;

        this._wayHandling = layerDef.wayHandling;
        this._showOnPopup = showOnPopup;
        this._style = layerDef.style;
        if (this._style === undefined) {
            this._style = function () {
                return {icon: {iconUrl: "./assets/bug.svg"}, color: "#000000"};
            }
        }
        this.name = name;
        this.filters = layerDef.overpassFilter;
        this._maxAllowedOverlap = layerDef.maxAllowedOverlapPercentage;
        const self = this;
        this.isDisplayed.addCallback(function (isDisplayed) {
            const map = State.state.bm.map;
            if (self._geolayer !== undefined && self._geolayer !== null) {
                if (isDisplayed) {
                    self._geolayer.addTo(map);
                } else {
                    map.removeLayer(self._geolayer);
                }
            }
        })
    }
    
    static fromDefinition(
        definition, 
                 showOnPopup: (tags: UIEventSource<any>, feature: any) => UIElement):
        FilteredLayer {
        return new FilteredLayer(
            definition, showOnPopup);

    }


    /**
     * The main function to load data into this layer.
     * The data that is NOT used by this layer, is returned as a geojson object; the other data is rendered
     */
    public SetApplicableData(geojson: any): any {
        const leftoverFeatures = [];
        const selfFeatures = [];
        for (let feature of geojson.features) {
            // feature.properties contains all the properties
            var tags = TagUtils.proprtiesToKV(feature.properties);
            if (this.filters.matches(tags)) {
                const centerPoint = GeoOperations.centerpoint(feature);
                feature.properties["_surface"] = GeoOperations.surfaceAreaInSqMeters(feature);
                const lat = centerPoint.geometry.coordinates[1];
                const lon = centerPoint.geometry.coordinates[0]
                feature.properties["_lon"] = lat;
                feature.properties["_lat"] = lon;
                FilteredLayer.grid.getCode(lat, lon, (error, code) => {
                    if (error === null) {
                        feature.properties["_country"] = code;
                    }
                })

                if (feature.geometry.type !== "Point") {
                    if (this._wayHandling === LayerDefinition.WAYHANDLING_CENTER_AND_WAY) {
                        selfFeatures.push(centerPoint);
                    } else if (this._wayHandling === LayerDefinition.WAYHANDLING_CENTER_ONLY) {
                        feature = centerPoint;
                    }
                }
                selfFeatures.push(feature);
            } else {
                leftoverFeatures.push(feature);
            }
        }


        this.RenderLayer({
            type: "FeatureCollection",
            features: selfFeatures
        })

        const notShadowed = [];
        for (const feature of leftoverFeatures) {
            if (this._maxAllowedOverlap !== undefined && this._maxAllowedOverlap > 0) {
                if (GeoOperations.featureIsContainedInAny(feature, selfFeatures, this._maxAllowedOverlap)) {
                    // This feature is filtered away
                    continue;
                }
            }

            notShadowed.push(feature);
        }

        return {
            type: "FeatureCollection",
            features: notShadowed
        };
    }


    public AddNewElement(element) {
        this._newElements.push(element);
        console.log("Element added");
        this.RenderLayer(this._dataFromOverpass); // Update the layer

    }

    private RenderLayer(data) {
        let self = this;

        if (this._geolayer !== undefined && this._geolayer !== null) {
            State.state.bm.map.removeLayer(this._geolayer);
        }
        this._dataFromOverpass = data;
        const fusedFeatures = [];
        const idsFromOverpass = [];
        for (const feature of data.features) {
            idsFromOverpass.push(feature.properties.id);
            fusedFeatures.push(feature);
        }

        for (const feature of this._newElements) {
            if (idsFromOverpass.indexOf(feature.properties.id) < 0) {
                // This element is not yet uploaded or not yet visible in overpass
                // We include it in the layer
                fusedFeatures.push(feature);
            }
        }

        // We use a new, fused dataset
        data = {
            type: "FeatureCollection",
            features: fusedFeatures
        }


        // The data is split in two parts: the poinst and the rest
        // The points get a special treatment in order to render them properly
        // Note that some features might get a point representation as well


        this._geolayer = L.geoJSON(data, {
            style: function (feature) {
                return self._style(feature.properties);
            },

            pointToLayer: function (feature, latLng) {
                const style = self._style(feature.properties);
                let marker;
                if (style.icon === undefined) {
                    marker = L.circle(latLng, {
                        radius: 25,
                        color: style.color
                    });

                } else {
                    if(style.icon.iconSize === undefined){
                        style.icon.iconSize = [50,50]
                    }if(style.icon.iconAnchor === undefined){
                        style.icon.iconAnchor = [style.icon.iconSize[0] / 2,style.icon.iconSize[1]]
                    }
                    if (style.icon.popupAnchor === undefined) {
                        style.icon.popupAnchor = [0, 8 - (style.icon.iconSize[1])]
                    }
                    marker = L.marker(latLng, {
                        icon: new L.icon(style.icon),
                    });
                }
                let eventSource = State.state.allElements.addOrGetElement(feature);
                const uiElement = self._showOnPopup(eventSource, feature);
                const popup = L.popup({}, marker).setContent(uiElement.Render());
                marker.bindPopup(popup)
                    .on("popupopen", (popup) => {
                        uiElement.Activate();   
                        uiElement.Update();
                    });
                return marker;
            },

            onEachFeature: function (feature, layer) {

                // We monky-patch the feature element with an update-style
                feature.updateStyle = () => {
                    if (layer.setIcon) {
                        layer.setIcon(L.icon(self._style(feature.properties).icon))
                    } else {
                        self._geolayer.setStyle(function (featureX) {
                            const style = self._style(featureX.properties);
                            if (featureX === feature) {
                                console.log("Selected element is", featureX.properties.id)
                                //      style.weight = style.weight * 2;
                                // console.log(style)
                            }
                            return style;
                        });
                    }
                }

                let eventSource = State.state.allElements.addOrGetElement(feature);


                eventSource.addCallback(feature.updateStyle);

                layer.on("click", function (e) {
                    const prevSelectedElement = State.state.selectedElement.data?.feature.updateStyle();
                    State.state.selectedElement.setData({feature: feature});
                    feature.updateStyle()
                    if (feature.geometry.type === "Point") {
                        return; // Points bind there own popups
                    }

                    const uiElement = self._showOnPopup(eventSource, feature);

                    const popup = L.popup({
                        autoPan: true,
                    })
                        .setContent(uiElement.Render())
                        .setLatLng(e.latlng)
                        .openOn(State.state.bm.map);
                    uiElement.Update();
                    uiElement.Activate();
                    L.DomEvent.stop(e); // Marks the event as consumed
                });
            }
        });

        if (this.isDisplayed.data) {
            this._geolayer.addTo(State.state.bm.map);
        }
    }


}