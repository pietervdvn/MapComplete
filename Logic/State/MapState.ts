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
import {FeatureSourceForLayer, Tiled} from "../FeatureSource/FeatureSource";
import SimpleFeatureSource from "../FeatureSource/Sources/SimpleFeatureSource";
import {LocalStorageSource} from "../Web/LocalStorageSource";
import {GeoOperations} from "../GeoOperations";

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
    public currentUserLocation: FeatureSourceForLayer & Tiled;

    /**
     * All previously visited points
     */
    public historicalUserLocations: FeatureSourceForLayer & Tiled;
    /**
     * The number of seconds that the GPS-locations are stored in memory.
     * Time in seconds
     */
    public gpsLocationHistoryRetentionTime = new UIEventSource(7 * 24 * 60 * 60, "gps_location_retention")
    public historicalUserLocationsTrack: FeatureSourceForLayer & Tiled;

    /**
     * A feature source containing the current home location of the user
     */
    public homeLocation: FeatureSourceForLayer & Tiled

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

        this.initHomeLocation()
        this.initGpsLocation()
        this.initUserLocationTrail()
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

    private initGpsLocation() {
        // Initialize the gps layer data. This is emtpy for now, the actual writing happens in the Geolocationhandler
        let gpsLayerDef: FilteredLayer = this.filteredLayers.data.filter(l => l.layerDef.id === "gps_location")[0]
        this.currentUserLocation = new SimpleFeatureSource(gpsLayerDef, Tiles.tile_index(0, 0, 0));
    }

    private initUserLocationTrail() {
        const features = LocalStorageSource.GetParsed<{ feature: any, freshness: Date }[]>("gps_location_history", [])
        const now = new Date().getTime()
        features.data = features.data
            .map(ff => ({feature: ff.feature, freshness: new Date(ff.freshness)}))
            .filter(ff => (now - ff.freshness.getTime()) < 1000 * this.gpsLocationHistoryRetentionTime.data)
        features.ping()
        const self = this;
        let i = 0
        this.currentUserLocation.features.addCallbackAndRunD(([location]) => {
            if (location === undefined) {
                return;
            }

            const previousLocation = features.data[features.data.length - 1]
            if (previousLocation !== undefined) {
                const d = GeoOperations.distanceBetween(
                    previousLocation.feature.geometry.coordinates,
                    location.feature.geometry.coordinates
                )
                let timeDiff = Number.MAX_VALUE // in seconds
                const olderLocation = features.data[features.data.length - 2]
                if (olderLocation !== undefined) {
                    timeDiff = (previousLocation.freshness.getTime() - olderLocation.freshness.getTime()) / 1000
                }
                if (d < 20 && timeDiff < 60) {
                    // Do not append changes less then 20m - it's probably noise anyway
                    return;
                }
            }

            const feature = JSON.parse(JSON.stringify(location.feature))
            feature.properties.id = "gps/" + features.data.length
            i++
            features.data.push({feature, freshness: new Date()})
            features.ping()
        })


        let gpsLayerDef: FilteredLayer = this.filteredLayers.data.filter(l => l.layerDef.id === "gps_location_history")[0]
        this.historicalUserLocations = new SimpleFeatureSource(gpsLayerDef, Tiles.tile_index(0, 0, 0), features);
        this.changes.useLocationHistory(this)


        const asLine = features.map(allPoints => {
            if (allPoints === undefined || allPoints.length < 2) {
                return []
            }

            const feature = {
                type: "Feature",
                properties: {
                    "id": "location_track",
                    "_date:now": new Date().toISOString(),
                },
                geometry: {
                    type: "LineString",
                    coordinates: allPoints.map(ff => ff.feature.geometry.coordinates)
                }
            }

            self.allElements.ContainingFeatures.set(feature.properties.id, feature)

            return [{
                feature,
                freshness: new Date()
            }]
        })
        let gpsLineLayerDef: FilteredLayer = this.filteredLayers.data.filter(l => l.layerDef.id === "gps_track")[0]
        this.historicalUserLocationsTrack = new SimpleFeatureSource(gpsLineLayerDef, Tiles.tile_index(0, 0, 0), asLine);
    }

    private initHomeLocation() {
        const empty = []
        const feature = UIEventSource.ListStabilized(this.osmConnection.userDetails.map(userDetails => {

            if (userDetails === undefined) {
                return undefined;
            }
            const home = userDetails.home;
            if (home === undefined) {
                return undefined;
            }
            return [home.lon, home.lat]
        })).map(homeLonLat => {
            if (homeLonLat === undefined) {
                return empty
            }
            return [{
                feature: {
                    "type": "Feature",
                    "properties": {
                        "id": "home",
                        "user:home": "yes",
                        "_lon": homeLonLat[0],
                        "_lat": homeLonLat[1]
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": homeLonLat
                    }
                }, freshness: new Date()
            }]
        })

        const flayer = this.filteredLayers.data.filter(l => l.layerDef.id === "home_location")[0]
        this.homeLocation = new SimpleFeatureSource(flayer, Tiles.tile_index(0, 0, 0), feature)

    }

    private InitializeFilteredLayers() {

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


}