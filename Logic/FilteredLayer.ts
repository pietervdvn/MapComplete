import {TagsFilter, TagUtils} from "./Tags";
import {UIEventSource} from "./UIEventSource";
import * as L from "leaflet"
import {Layer} from "leaflet"
import {GeoOperations} from "./GeoOperations";
import {UIElement} from "../UI/UIElement";
import State from "../State";
import LayerConfig from "../Customizations/JSON/LayerConfig";
import Hash from "./Web/Hash";
import LazyElement from "../UI/Base/LazyElement";

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
    public readonly layerDef: LayerConfig;
    private readonly combinedIsDisplayed: UIEventSource<boolean>;
    private readonly _maxAllowedOverlap: number;

    /** The featurecollection from overpass
     */
    private _dataFromOverpass: any[];
    /** List of new elements, geojson features
     */
    private _newElements = [];
    /**
     * The leaflet layer object which should be removed on rerendering
     */
    private _geolayer;

    private _showOnPopup: (tags: UIEventSource<any>, feature: any) => UIElement;


    constructor(
        layerDef: LayerConfig,
        showOnPopup: ((tags: UIEventSource<any>, feature: any) => UIElement)
    ) {
        this.layerDef = layerDef;

        this._showOnPopup = showOnPopup;
        this.name = name;
        this.filters = layerDef.overpassTags;
        this._maxAllowedOverlap = layerDef.hideUnderlayingFeaturesMinPercentage;
        const self = this;
        this.combinedIsDisplayed = this.isDisplayed.map<boolean>(isDisplayed => {
                return isDisplayed && State.state.locationControl.data.zoom >= self.layerDef.minzoom
            },
            [State.state.locationControl]
        );
        this.combinedIsDisplayed.addCallback(function (isDisplayed) {
            const map = State.state.leafletMap.data;
            if (self._geolayer !== undefined && self._geolayer !== null) {
                if (isDisplayed) {
                    self._geolayer.addTo(map);
                } else {
                    map.removeLayer(self._geolayer);
                }
            }
        })
    }

    /**
     * The main function to load data into this layer.
     * The data that is NOT used by this layer, is returned as a geojson object; the other data is rendered
     */
    public SetApplicableData(features: any[]): any[] {
        const leftoverFeatures = [];
        const selfFeatures = [];
        for (let feature of features) {
            const tags = TagUtils.proprtiesToKV(feature.properties);
            const matches = this.filters.matches(tags);
            if (matches) {
                selfFeatures.push(feature);
            }
            if (!matches || this.layerDef.passAllFeatures) {
                leftoverFeatures.push(feature);
            }
        }

        this.RenderLayer(selfFeatures)

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

        return notShadowed;
    }


    public AddNewElement(element) {
        this._newElements.push(element);
        this.RenderLayer(this._dataFromOverpass); // Update the layer
    }

    private RenderLayer(features) {

        if (this._geolayer !== undefined && this._geolayer !== null) {
            // Remove the old geojson layer from the map - we'll reshow all the elements later on anyway
            State.state.leafletMap.data.removeLayer(this._geolayer);
        }

        // We fetch all the data we have to show:
        let fusedFeatures = this.ApplyWayHandling(this.FuseData(features));

        // And we copy some features as points - if needed
        const data = {
            type: "FeatureCollection",
            features: fusedFeatures
        }

        let self = this;
        this._geolayer = L.geoJSON(data, {
            style: feature => {
                const tagsSource = State.state.allElements.getEventSourceFor(feature);
                return self.layerDef.GenerateLeafletStyle(tagsSource, self._showOnPopup !== undefined);
            },
            pointToLayer: function (feature, latLng) {
                // Point to layer converts the 'point' to a layer object - as the geojson layer natively cannot handle points
                // Click handling is done in the next step
                const tagSource = State.state.allElements.getEventSourceFor(feature);

                const style = self.layerDef.GenerateLeafletStyle(tagSource, self._showOnPopup !== undefined);
                let marker;
                if (style.icon === undefined) {
                    marker = L.circle(latLng, {
                        radius: 25,
                        color: style.color
                    });
                } else if (style.icon.iconUrl.startsWith("$circle")) {
                    marker = L.circle(latLng, {
                        radius: 25,
                        color: style.color
                    });
                } else {
                    style.icon.html.ListenTo(self.isDisplayed)
                    marker = L.marker(latLng, {
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
                return marker;
            },
            onEachFeature: function (feature, layer: Layer) {

                if (self._showOnPopup === undefined) {
                    // No popup contents defined -> don't do anything
                    return;
                }
                const popup = L.popup({
                    autoPan: true,
                    closeOnEscapeKey: true,
                }, layer);


                const eventSource = State.state.allElements.getEventSourceFor(feature);
                let uiElement: LazyElement = new LazyElement(() => self._showOnPopup(eventSource, feature));
                popup.setContent(uiElement.Render());
                layer.bindPopup(popup);
                // We first render the UIelement (which'll still need an update later on...)
                // But at least it'll be visible already


                layer.on("click", (e) => {
                    // We set the element as selected...
                    uiElement.Activate();
                    State.state.selectedElement.setData(feature);
                });

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
        });

        if (this.combinedIsDisplayed.data) {
            this._geolayer.addTo(State.state.leafletMap.data);
        }

    }

    private ApplyWayHandling(fusedFeatures: any[]) {
        if (this.layerDef.wayHandling === LayerConfig.WAYHANDLING_DEFAULT) {
            // We don't have to do anything special
            return fusedFeatures;
        }


        // We have to convert all the ways into centerpoints
        const existingPoints = [];
        const newPoints = [];
        const existingWays = [];

        for (const feature of fusedFeatures) {
            if (feature.geometry.type === "Point") {
                existingPoints.push(feature);
                continue;
            }

            existingWays.push(feature);
            const centerPoint = GeoOperations.centerpoint(feature);
            newPoints.push(centerPoint);
        }

        fusedFeatures = existingPoints.concat(newPoints);
        if (this.layerDef.wayHandling === LayerConfig.WAYHANDLING_CENTER_AND_WAY) {
            fusedFeatures = fusedFeatures.concat(existingWays)
        }
        return fusedFeatures;
    }

    //*Fuses the old and the new datasets*/
    private FuseData(data: any[]) {
        const oldData = this._dataFromOverpass ?? [];

        // We keep track of all the ids that are freshly loaded in order to avoid adding duplicates
        const idsFromOverpass: Set<number> = new Set<number>();
        // A list of all the features to show
        const fusedFeatures = [];
        // First, we add all the fresh data:
        for (const feature of data) {
            idsFromOverpass.add(feature.properties.id);
            fusedFeatures.push(feature);
        }
        // Now we add all the stale data
        for (const feature of oldData) {
            if (idsFromOverpass.has(feature.properties.id)) {
                continue; // Feature already loaded and a fresher version is available
            }
            idsFromOverpass.add(feature.properties.id);
            fusedFeatures.push(feature);
        }
        this._dataFromOverpass = fusedFeatures;

        for (const feature of this._newElements) {
            if (!idsFromOverpass.has(feature.properties.id)) {
                // This element is not yet uploaded or not yet visible in overpass
                // We include it in the layer
                fusedFeatures.push(feature);
            }
        }
        return fusedFeatures;
    }
}