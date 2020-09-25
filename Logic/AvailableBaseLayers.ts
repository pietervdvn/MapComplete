import * as editorlayerindex from "../assets/editor-layer-index.json"
import {UIEventSource} from "./UIEventSource";
import {GeoOperations} from "./GeoOperations";
import {State} from "../State";
import {Basemap} from "./Leaflet/Basemap";

/**
 * Calculates which layers are available at the current location
 */
export default class AvailableBaseLayers {

    public static osmCarto =
        {
            id: "osm", url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            max_zoom: 19, license_url: "https://openStreetMap.org/copyright",
            name: "OpenStreetMap", geometry: null,
            leafletLayer: Basemap.CreateBackgroundLayer("osm", "OpenStreetMap",
                "https://tile.openstreetmap.org/{z}/{x}/{y}.png", "OpenStreetMap", 19, false, false)
        }

    public static layerOverview = AvailableBaseLayers.LoadRasterIndex();
    public availableEditorLayers: UIEventSource<{ id: string, url: string, max_zoom: number, license_url: string, name: string, geometry: any, leafletLayer: any }[]>;

    constructor(state: State) {
        const self = this;
        this.availableEditorLayers =
            state.locationControl.map(
                (currentLocation) => {
                    const currentLayers = self.availableEditorLayers?.data;
                    const newLayers = AvailableBaseLayers.AvailableLayersAt(currentLocation?.lon, currentLocation?.lat);

                    if (currentLayers === undefined) {
                        return newLayers;
                    }
                    if (newLayers.length !== currentLayers.length) {
                        return newLayers;
                    }
                    for (let i = 0; i < newLayers.length; i++) {
                        if (newLayers[i].name !== currentLayers[i].name) {
                            return newLayers;
                        }
                    }

                    return currentLocation;
                });

    }

    public static AvailableLayersAt(lon: number, lat: number):
        { url: string, max_zoom: number, license_url: string, name: string, geometry: any }[] {
        const availableLayers = [AvailableBaseLayers.osmCarto as any]
        const globalLayers = [];
        for (const i in AvailableBaseLayers.layerOverview) {
            const layer = AvailableBaseLayers.layerOverview[i];
            if (layer.feature.geometry === null) {
                globalLayers.push(layer);
                continue;
            }

            if (lon === undefined || lat === undefined) {
                continue;
            }

            if (GeoOperations.inside([lon, lat], layer.feature)) {
                availableLayers.push(layer);
            }
        }

        return availableLayers.concat(globalLayers);
    }

    private static LoadRasterIndex(): { id: string, url: string, max_zoom: number, license_url: string, name: string, feature: any }[] {
        const layers: { id: string, url: string, max_zoom: number, license_url: string, name: string, feature: any, leafletLayer: any }[] = []
        // @ts-ignore
        const features = editorlayerindex.features;
        for (const i in features) {
            const layer = features[i];
            const props = layer.properties;

            if(props.id === "Bing"){
                // Doesnt work
                continue;
            }
            
            if (props.overlay) {
                continue;
            }
            
            if(props.max_zoom < 19){
                continue;
            }

            if (props.url.toLowerCase().indexOf("apikey") > 0) {
                continue;
            }

            if (props.url.toLowerCase().indexOf("{bbox}") > 0) {
                continue;
            }
            
            if(props.name === undefined){
                console.log("Editor layer index: name not defined on ", props)
                continue
            }

            const leafletLayer = Basemap.CreateBackgroundLayer(
                props.id,
                props.name,
                props.url,
                props.name,
                props.max_zoom,
                props.type.toLowerCase() === "wms",
                props.type.toLowerCase() === "wmts"
            )

            // Note: if layer.geometry is null, there is global coverage for this layer
            layers.push({
                id: props.id,
                feature: layer,
                url: props.url,
                max_zoom: props.max_zoom,
                license_url: props.license_url,
                name: props.name,
                leafletLayer: leafletLayer
            });
        }
        return layers;

    }

}