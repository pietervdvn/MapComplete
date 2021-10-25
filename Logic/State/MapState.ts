import UserRelatedState from "./UserRelatedState";
import {UIEventSource} from "../UIEventSource";
import BaseLayer from "../../Models/BaseLayer";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import AvailableBaseLayers from "../Actors/AvailableBaseLayers";
import BackgroundLayerResetter from "../Actors/BackgroundLayerResetter";
import Attribution from "../../UI/BigComponents/Attribution";
import Minimap, {MinimapObj} from "../../UI/Base/Minimap";
import {Tiles} from "../../Models/TileRange";
import BaseUIElement from "../../UI/BaseUIElement";
import FilteredLayer from "../../Models/FilteredLayer";
import TilesourceConfig from "../../Models/ThemeConfig/TilesourceConfig";
import {QueryParameters} from "../Web/QueryParameters";
import * as personal from "../../assets/themes/personal/personal.json";
import FilterConfig from "../../Models/ThemeConfig/FilterConfig";
import ShowOverlayLayer from "../../UI/ShowDataLayer/ShowOverlayLayer";

/**
 * Contains all the leaflet-map related state
 */
export default class MapState extends UserRelatedState {

    /**
     The leaflet instance of the big basemap
     */
    public leafletMap = new UIEventSource<any /*L.Map*/>(undefined, "leafletmap");
    /**
     * A list of currently available background layers
     */
    public availableBackgroundLayers: UIEventSource<BaseLayer[]>;

    /**
     * The current background layer
     */
    public backgroundLayer: UIEventSource<BaseLayer>;
    /**
     * Last location where a click was registered
     */
    public readonly LastClickLocation: UIEventSource<{
        lat: number;
        lon: number;
    }> = new UIEventSource<{ lat: number; lon: number }>(undefined);

    /**
     * The location as delivered by the GPS
     */
    public currentGPSLocation: UIEventSource<{
        latlng: { lat: number; lng: number };
        accuracy: number;
    }> = new UIEventSource<{
        latlng: { lat: number; lng: number };
        accuracy: number;
    }>(undefined);

    public readonly mainMapObject: BaseUIElement & MinimapObj;


    /**
     * WHich layers are enabled in the current theme
     */
    public filteredLayers: UIEventSource<FilteredLayer[]> = new UIEventSource<FilteredLayer[]>([], "filteredLayers");
    /**
     * Which overlays are shown
     */
    public overlayToggles: { config: TilesourceConfig, isDisplayed: UIEventSource<boolean> }[]


    constructor(layoutToUse: LayoutConfig) {
        super(layoutToUse);

        this.availableBackgroundLayers = AvailableBaseLayers.AvailableLayersAt(this.locationControl);

        this.backgroundLayer = this.backgroundLayerId.map(
            (selectedId: string) => {
                if (selectedId === undefined) {
                    return AvailableBaseLayers.osmCarto;
                }

                const available = this.availableBackgroundLayers.data;
                for (const layer of available) {
                    if (layer.id === selectedId) {
                        return layer;
                    }
                }
                return AvailableBaseLayers.osmCarto;
            },
            [this.availableBackgroundLayers],
            (layer) => layer.id
        );


        /*
        * Selects a different background layer if the background layer has no coverage at the current location
         */
        new BackgroundLayerResetter(
            this.backgroundLayer,
            this.locationControl,
            this.availableBackgroundLayers,
            this.layoutToUse.defaultBackgroundId
        );

        const attr = new Attribution(
            this.locationControl,
            this.osmConnection.userDetails,
            this.layoutToUse,
            this.currentBounds
        );

        // Will write into this.leafletMap
        this.mainMapObject = Minimap.createMiniMap({
            background: this.backgroundLayer,
            location: this.locationControl,
            leafletMap: this.leafletMap,
            bounds: this.currentBounds,
            attribution: attr,
            lastClickLocation: this.LastClickLocation
        })


        this.overlayToggles = this.layoutToUse.tileLayerSources.filter(c => c.name !== undefined).map(c => ({
            config: c,
            isDisplayed: QueryParameters.GetBooleanQueryParameter("overlay-" + c.id, "" + c.defaultState, "Wether or not the overlay " + c.id + " is shown")
        }))
        this.filteredLayers = this.InitializeFilteredLayers()


        this.lockBounds()
        this.AddAllOverlaysToMap(this.leafletMap)
    }



    private lockBounds() {
        const layout = this.layoutToUse;
        if (layout.lockLocation) {
            if (layout.lockLocation === true) {
                const tile = Tiles.embedded_tile(
                    layout.startLat,
                    layout.startLon,
                    layout.startZoom - 1
                );
                const bounds = Tiles.tile_bounds(tile.z, tile.x, tile.y);
                // We use the bounds to get a sense of distance for this zoom level
                const latDiff = bounds[0][0] - bounds[1][0];
                const lonDiff = bounds[0][1] - bounds[1][1];
                layout.lockLocation = [
                    [layout.startLat - latDiff, layout.startLon - lonDiff],
                    [layout.startLat + latDiff, layout.startLon + lonDiff],
                ];
            }
            console.warn("Locking the bounds to ", layout.lockLocation);
            this.leafletMap.addCallbackAndRunD(map => {
                // @ts-ignore
                map.setMaxBounds(layout.lockLocation);
                map.setMinZoom(layout.startZoom);
            })
        }
    }

    private InitializeFilteredLayers() {
        // Initialize the filtered layers state

        const layoutToUse = this.layoutToUse;
        const empty = []
        const flayers: FilteredLayer[] = [];
        for (const layer of layoutToUse.layers) {
            let isDisplayed: UIEventSource<boolean>
            if (layoutToUse.id === personal.id) {
                isDisplayed = this.osmConnection.GetPreference("personal-theme-layer-" + layer.id + "-enabled")
                    .map(value => value === "yes", [], enabled => {
                        return enabled ? "yes" : "";
                    })
            } else {
                isDisplayed = QueryParameters.GetBooleanQueryParameter(
                    "layer-" + layer.id,
                    "true",
                    "Wether or not layer " + layer.id + " is shown"
                )
            }
            const flayer = {
                isDisplayed: isDisplayed,
                layerDef: layer,
                appliedFilters: new UIEventSource<{ filter: FilterConfig, selected: number }[]>([]),
            };

            if (layer.filters.length > 0) {
                const filtersPerName = new Map<string, FilterConfig>()
                layer.filters.forEach(f => filtersPerName.set(f.id, f))
                const qp = QueryParameters.GetQueryParameter("filter-" + layer.id, "", "Filtering state for a layer")
                flayer.appliedFilters.map(filters => {
                    filters = filters ?? []
                    return filters.map(f => f.filter.id + "." + f.selected).join(",")
                }, [], textual => {
                    if (textual.length === 0) {
                        return empty
                    }
                    return textual.split(",").map(part => {
                        const [filterId, selected] = part.split(".");
                        return {filter: filtersPerName.get(filterId), selected: Number(selected)}
                    }).filter(f => f.filter !== undefined && !isNaN(f.selected))
                }).syncWith(qp, true)
            }

            flayers.push(flayer);
        }
        return new UIEventSource<FilteredLayer[]>(flayers);
    }

    public AddAllOverlaysToMap(leafletMap: UIEventSource<any>) {
        const initialized = new Set()
        for (const overlayToggle of this.overlayToggles) {
            new ShowOverlayLayer(overlayToggle.config, leafletMap, overlayToggle.isDisplayed)
            initialized.add(overlayToggle.config)
        }

        for (const tileLayerSource of this.layoutToUse.tileLayerSources) {
            if (initialized.has(tileLayerSource)) {
                continue
            }
            new ShowOverlayLayer(tileLayerSource, leafletMap)
        }

    }


}