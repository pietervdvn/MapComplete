import {TagsFilter, TagUtils} from "./Tags";
import {UIEventSource} from "./UIEventSource";
import * as L from "leaflet"
import {Layer} from "leaflet"
import {GeoOperations} from "./GeoOperations";
import {UIElement} from "../UI/UIElement";
import State from "../State";
import LayerConfig from "../Customizations/JSON/LayerConfig";

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
    private readonly combinedIsDisplayed: UIEventSource<boolean>;
    public readonly layerDef: LayerConfig;
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
    /**
     * The main function to load data into this layer.
     * The data that is NOT used by this layer, is returned as a geojson object; the other data is rendered
     */
    public SetApplicableData(geojson: any): any {
        const leftoverFeatures = [];
        const selfFeatures = [];
        for (let feature of geojson.features) {
            const tags = TagUtils.proprtiesToKV(feature.properties);
            if (!this.filters.matches(tags)) {
                leftoverFeatures.push(feature);
                continue;
            }
            selfFeatures.push(feature);
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

        return {
            type: "FeatureCollection",
            features: notShadowed
        };
    }


    public AddNewElement(element) {
        this._newElements.push(element);
        this.RenderLayer( this._dataFromOverpass); // Update the layer
    }

    private RenderLayer(features) {

        if (this._geolayer !== undefined && this._geolayer !== null) {
            // Remove the old geojson layer from the map - we'll reshow all the elements later on anyway
            State.state.bm.map.removeLayer(this._geolayer);
        }

        // We fetch all the data we have to show:
        let fusedFeatures = this.ApplyWayHandling(this.FuseData(features));
        console.log("Fused:",fusedFeatures)

        // And we copy some features as points - if needed
        const data = {
            type: "FeatureCollection",
            features: fusedFeatures
        }

        let self = this;
        console.log(data);
        this._geolayer = L.geoJSON(data, {
           /* style: feature => {
                self.layerDef.GenerateLeafletStyle(feature.properties);
                return {
                    color: "#f00",
                    weight: 4
                }
            },*/
            /*
            pointToLayer: function (feature, latLng) {
                // Point to layer converts the 'point' to a layer object - as the geojson layer natively cannot handle points
                // Click handling is done in the next step

                const style = self.layerDef.GenerateLeafletStyle(feature.properties);
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
                    if (style.icon.iconSize === undefined) {
                        style.icon.iconSize = [50, 50]
                    }

                    marker = L.marker(latLng, {
                        icon: L.icon(style.icon)
                    });
                }
                return marker;
            },*/
/*
            onEachFeature: function (feature, layer:Layer) {

                layer.on("click", (e) => {
                    if (layer.getPopup() === undefined
                        && (window.screen.availHeight > 600 || window.screen.availWidth > 600) // We DON'T trigger this code on small screens! No need to create a popup
                    ) {
                        const popup = L.popup({
                            autoPan: true,
                            closeOnEscapeKey: true,
                        }, layer);

                        // @ts-ignore
                        popup.setLatLng(e.latlng)

                        layer.bindPopup(popup);
                        const eventSource = State.state.allElements.addOrGetElement(feature);
                        const uiElement = self._showOnPopup(eventSource, feature);
                        // We first render the UIelement (which'll still need an update later on...)
                        // But at least it'll be visible already
                        popup.setContent(uiElement.Render());
                        popup.openOn(State.state.bm.map);
                        // popup.openOn(State.state.bm.map);
                        // ANd we perform the pending update
                        uiElement.Update();
                    }
                    // We set the element as selected...
                    State.state.selectedElement.setData(feature);

                    // We mark the event as consumed
                    L.DomEvent.stop(e);
                });
            }
        */
        }
        )
        ;

        if (this.combinedIsDisplayed.data) {
            this._geolayer.addTo(State.state.bm.map);
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