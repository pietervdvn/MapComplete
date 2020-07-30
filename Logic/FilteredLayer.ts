import {TagsFilter, TagUtils} from "./TagsFilter";
import {UIEventSource} from "../UI/UIEventSource";
import {ElementStorage} from "./ElementStorage";
import L from "leaflet"
import {GeoOperations} from "./GeoOperations";
import {UIElement} from "../UI/UIElement";
import {LayerDefinition} from "../Customizations/LayerDefinition";
import codegrid from "codegrid-js";
import {Changes} from "./Osm/Changes";
import {UserDetails} from "./Osm/OsmConnection";
import {Basemap} from "./Leaflet/Basemap";

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
    private readonly _map: Basemap;
    private readonly _maxAllowedOverlap: number;

    private readonly _style: (properties) => { color: string, weight?: number, icon: { iconUrl: string, iconSize? : number[], popupAnchor?: number[], iconAnchor?:number[] } };

    private readonly _storage: ElementStorage;

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
    private _selectedElement: UIEventSource<{ feature: any }>;
    private _showOnPopup: (tags: UIEventSource<any>, feature: any) => UIElement;

    private static readonly grid = codegrid.CodeGrid();

    constructor(
        layerDef: LayerDefinition,
        map: Basemap, storage: ElementStorage,
        changes: Changes,
        selectedElement: UIEventSource<any>,
        showOnPopup: ((tags: UIEventSource<any>, feature: any) => UIElement)
    ) {
        this.layerDef = layerDef;

        this._wayHandling = layerDef.wayHandling;
        this._selectedElement = selectedElement;
        this._showOnPopup = showOnPopup;
        this._style = layerDef.style;
        if (this._style === undefined) {
            this._style = function () {
                return {icon: {iconUrl: "./assets/bug.svg"}, color: "#000000"};
            }
        }
        this.name = name;
        this._map = map;
        this.filters = layerDef.overpassFilter;
        this._storage = storage;
        this._maxAllowedOverlap = layerDef.maxAllowedOverlapPercentage;
        const self = this;
        this.isDisplayed.addCallback(function (isDisplayed) {
            if (self._geolayer !== undefined && self._geolayer !== null) {
                if (isDisplayed) {
                    self._geolayer.addTo(self._map.map);
                } else {
                    self._map.map.removeLayer(self._geolayer);
                }
            }
        })
    }
    
    static fromDefinition(
        definition,
        basemap: Basemap, allElements: ElementStorage, changes: Changes, userDetails: UIEventSource<UserDetails>,
                 selectedElement: UIEventSource<{feature: any}>,
                 showOnPopup: (tags: UIEventSource<any>, feature: any) => UIElement):
        FilteredLayer {
        return new FilteredLayer(
            definition,
            basemap, allElements, changes,
            selectedElement,
            showOnPopup);

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
            this._map.map.removeLayer(this._geolayer);
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
                let eventSource = self._storage.addOrGetElement(feature);
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

                feature.updateStyle = () => {
                    if (layer.setIcon) {
                        layer.setIcon(L.icon(self._style(feature.properties).icon))
                    } else {
                        self._geolayer.setStyle(function (feature) {
                            const style = self._style(feature.properties);
                            if (self._selectedElement.data?.feature === feature) {
                                if (style.weight !== undefined) {
                                    style.weight = style.weight * 2;
                                }else{
                                    style.weight = 20;
                                }
                            }
                            return style;
                        });
                    }
                }

                let eventSource = self._storage.addOrGetElement(feature);


                eventSource.addCallback(feature.updateStyle);

                layer.on("click", function (e) {
                    const previousFeature = self._selectedElement.data?.feature;
                    self._selectedElement.setData({feature: feature});
                    feature.updateStyle();
                    previousFeature?.updateStyle();


                    if (feature.geometry.type === "Point") {
                        return; // Points bind there own popups
                    }

                    const uiElement = self._showOnPopup(eventSource, feature);

                    const popup = L.popup({
                        autoPan: true,
                    })
                        .setContent(uiElement.Render())
                        .setLatLng(e.latlng)
                        .openOn(self._map.map);
                    uiElement.Update();
                    uiElement.Activate();
                    L.DomEvent.stop(e); // Marks the event as consumed
                });
            }
        });

        if (this.isDisplayed.data) {
            this._geolayer.addTo(this._map.map);
        }
    }


}