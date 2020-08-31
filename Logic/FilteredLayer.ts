import {TagsFilter, TagUtils} from "./Tags";
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
    private readonly combinedIsDisplayed : UIEventSource<boolean>;
    public readonly layerDef: LayerDefinition;
    private readonly _maxAllowedOverlap: number;

    private readonly _style: (properties) => { color: string, weight?: number, icon: { iconUrl: string, iconSize? : number[], popupAnchor?: number[], iconAnchor?:number[] } };


    /** The featurecollection from overpass
     */
    private _dataFromOverpass: any[];
    private readonly _wayHandling: number;
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
                return {icon: {iconUrl: "./assets/bug.svg"}, color: "#000"};
            }
        }
        this.name = name;
        this.filters = layerDef.overpassFilter;
        this._maxAllowedOverlap = layerDef.maxAllowedOverlapPercentage;
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
            const tags = TagUtils.proprtiesToKV(feature.properties);
            
            if (this.filters.matches(tags)) {
                const centerPoint = GeoOperations.centerpoint(feature);
                feature.properties["_surface"] = ""+GeoOperations.surfaceAreaInSqMeters(feature);
                const lat = ""+centerPoint.geometry.coordinates[1];
                const lon = ""+centerPoint.geometry.coordinates[0]
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
        this.RenderLayer({features:this._dataFromOverpass}); // Update the layer

    }

    private RenderLayer(data) {
        let self = this;

        if (this._geolayer !== undefined && this._geolayer !== null) {
            // Remove the old geojson layer from the map - we'll reshow all the elements later on anyway
            State.state.bm.map.removeLayer(this._geolayer);
        }

        const oldData = this._dataFromOverpass ?? [];

        // We keep track of all the ids that are freshly loaded in order to avoid adding duplicates
        const idsFromOverpass: Set<number> = new Set<number>();
        // A list of all the features to show
        const fusedFeatures = [];
        // First, we add all the fresh data:
        for (const feature of data.features) {
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

        for (const feature of this._newElements) {
            if (idsFromOverpass.has(feature.properties.id)) {
                // This element is not yet uploaded or not yet visible in overpass
                // We include it in the layer
                fusedFeatures.push(feature);
            }
        }
        
        this._dataFromOverpass = fusedFeatures;

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
                    }
                    
                    marker = L.marker(latLng, {
                        icon: new L.icon(style.icon),
                    });
                }
                let eventSource = State.state.allElements.addOrGetElement(feature);
                const uiElement = self._showOnPopup(eventSource, feature);
                const popup = L.popup({}, marker).setContent(uiElement.Render());
                marker.bindPopup(popup)
                    .on("popupopen", () => {
                        uiElement.Activate();   
                        uiElement.Update();
                    });
                return marker;
            },

            onEachFeature: function (feature, layer) {

                // We monky-patch the feature element with an update-style
                feature.updateStyle = () => {
                    if (layer.setIcon) {
                        const icon = self._style(feature.properties).icon;
                        if (icon.iconUrl) {
                            layer.setIcon(L.icon(icon))
                        }
                    } else {
                        self._geolayer.setStyle(function (featureX) {
                            const style = self._style(featureX.properties);
                            if (featureX === feature) {
                                console.log("Selected element is", featureX.properties.id)
                            }
                            return style;
                        });
                    }
                }

                let eventSource = State.state.allElements.addOrGetElement(feature);


                eventSource.addCallback(feature.updateStyle);

                layer.on("click", function (e) {
                    State.state.selectedElement.data?.feature.updateStyle();
                    State.state.selectedElement.setData({feature: feature});
                    feature.updateStyle()
                    if (feature.geometry.type === "Point") {
                        return; // Points bind there own popups
                    }

                    const uiElement = self._showOnPopup(eventSource, feature);
                   
                    L.popup({
                        autoPan: true,
                    }).setContent(uiElement.Render())
                        .setLatLng(e.latlng)
                        .openOn(State.state.bm.map);
                    
                    uiElement.Update();
                    uiElement.Activate();
                    L.DomEvent.stop(e); // Marks the event as consumed
                });
            }
        });

        if (this.combinedIsDisplayed.data) {
            this._geolayer.addTo(State.state.bm.map);
        }
    }


}