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
 * 
 */
export class FilteredLayer {

    public readonly name: string | UIElement;
    public readonly isDisplayed: UIEventSource<boolean> = new UIEventSource(true);
    public readonly layerDef: LayerConfig;

    private readonly filters: TagsFilter;
    private readonly _maxAllowedOverlap: number;

    /** The featurecollection from overpass
     */
    private _dataFromOverpass: any[];
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
        return leftoverFeatures;
    }


    private RenderLayer(features: any[]) {

        if (this._geolayer !== undefined && this._geolayer !== null) {
            // Remove the old geojson layer from the map - we'll reshow all the elements later on anyway
            State.state.leafletMap.data.removeLayer(this._geolayer);
        }

        // We fetch all the data we have to show:
        const data = {
            type: "FeatureCollection",
            features: features
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
                } else {
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

        this._geolayer.addTo(State.state.leafletMap.data);

    }


}