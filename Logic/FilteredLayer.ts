import { Basemap } from "./Basemap";
import { TagsFilter, TagUtils } from "./TagsFilter";
import { UIEventSource } from "../UI/UIEventSource";
import { ElementStorage } from "./ElementStorage";
import { Changes } from "./Changes";
import L from "leaflet"
import { GeoOperations } from "./GeoOperations";
import { UIElement } from "../UI/UIElement";

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

    public readonly name: string;
    public readonly filters: TagsFilter;
    public readonly isDisplayed: UIEventSource<boolean> = new UIEventSource(true);

    private readonly _map: Basemap;
    private readonly _maxAllowedOverlap: number;

    private readonly _style: (properties) => { color: string, icon: any };

    private readonly _storage: ElementStorage;

    /** The featurecollection from overpass
     */
    private _dataFromOverpass;
    /** List of new elements, geojson features
     */
    private _newElements = [];
    /**
     * The leaflet layer object which should be removed on rerendering
     */
    private _geolayer;
    private _selectedElement: UIEventSource<any>;
    private _showOnPopup: (tags: UIEventSource<any>) => UIElement;

    constructor(
        name: string,
        map: Basemap, storage: ElementStorage,
        changes: Changes,
        filters: TagsFilter,
        maxAllowedOverlap: number,
        style: ((properties) => any),
        selectedElement: UIEventSource<any>,
        showOnPopup: ((tags: UIEventSource<any>) => UIElement)
    ) {
        this._selectedElement = selectedElement;
        this._showOnPopup = showOnPopup;

        if (style === undefined) {
            style = function () {
                return {};
            }
        }
        this.name = name;
        this._map = map;
        this.filters = filters;
        this._style = style;
        this._storage = storage;
        this._maxAllowedOverlap = maxAllowedOverlap;
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


    /**
     * The main function to load data into this layer.
     * The data that is NOT used by this layer, is returned as a geojson object; the other data is rendered
     */
    public SetApplicableData(geojson: any): any {
        const leftoverFeatures = [];
        const selfFeatures = [];
        for (const feature of geojson.features) {
            // feature.properties contains all the properties
            var tags = TagUtils.proprtiesToKV(feature.properties);
            if (this.filters.matches(tags)) {
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
                    marker = L.marker(latLng, {
                        icon: style.icon
                    });
                }
                return marker;
            },

            onEachFeature: function (feature, layer) {
                let eventSource = self._storage.addOrGetElement(feature);
                eventSource.addCallback(function () {
                    if (layer.setIcon) {
                        layer.setIcon(self._style(feature.properties).icon)
                    } else {
                        console.log("UPdating", layer);

                        self._geolayer.setStyle(function (feature) {
                            return self._style(feature.properties);
                        });
                    }
                });


                layer.on("click", function (e) {
                    console.log("Selected ", feature)
                    self._selectedElement.setData(feature.properties);
                    const uiElement = self._showOnPopup(eventSource);
                    const popup = L.popup()
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