import * as editorlayerindex from "../assets/editor-layer-index.json"
import {UIEventSource} from "./UIEventSource";
import {GeoOperations} from "./GeoOperations";
import {State} from "../State";
import {Basemap} from "./Leaflet/Basemap";
import {QueryParameters} from "./Web/QueryParameters";

export interface BaseLayer {
    id: string,
    name: string,
    attribution_url: string,
    layer: any,
    max_zoom: number,
    min_zoom: number;
    feature: any
}

/**
 * Calculates which layers are available at the current location
 */
export default class AvailableBaseLayers {

    public static osmCarto: BaseLayer =
        {
            id: "osm",
            //max_zoom: 19, 
            attribution_url: "https://openStreetMap.org/copyright",
            name: "OpenStreetMap",
            layer: Basemap.CreateBackgroundLayer("osm", "OpenStreetMap",
                "https://tile.openstreetmap.org/{z}/{x}/{y}.png", "OpenStreetMap", 19, false, false),
            feature: null,
            max_zoom: 19,
            min_zoom: 0
        }

    public static layerOverview = AvailableBaseLayers.LoadRasterIndex();
    public availableEditorLayers: UIEventSource<BaseLayer[]>;

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

                    return currentLayers;
                });


        this.availableEditorLayers.addCallbackAndRun(availableLayers => {
            const layerControl = (state.bm as Basemap).CurrentLayer;
            const currentLayer = layerControl.data.id;
            for (const availableLayer of availableLayers) {
                if (availableLayer.id === currentLayer) {

                    if (availableLayer.max_zoom < state.locationControl.data.zoom) {
                        break;
                    }

                    if (availableLayer.min_zoom > state.locationControl.data.zoom) {
                        break;
                    }


                    return; // All good!
                }
            }
            // Oops, we panned out of range for this layer!
            console.log("AvailableBaseLayers-actor: detected that the current bounds aren't sufficient anymore - reverting to OSM standard")
            layerControl.setData(AvailableBaseLayers.osmCarto.layer);

        });


        const queryParam = QueryParameters.GetQueryParameter("background", State.state.layoutToUse.data.defaultBackground);

        queryParam.addCallbackAndRun(selectedId => {
            console.log("Selected layer is ", selectedId)
            const available = self.availableEditorLayers.data;
            for (const layer of available) {
                if (layer.id === selectedId) {
                    state.bm.CurrentLayer.setData(layer.layer);
                }
            }
        })

        state.bm.CurrentLayer.addCallbackAndRun(currentLayer => {
            queryParam.setData(currentLayer.id);
        });

    }

    public static AvailableLayersAt(lon: number, lat: number): BaseLayer[] {
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

    private static LoadRasterIndex(): BaseLayer[] {
        const layers: BaseLayer[] = []
        // @ts-ignore
        const features = editorlayerindex.features;
        for (const i in features) {
            const layer = features[i];
            const props = layer.properties;

            if (props.id === "Bing") {
                // Doesnt work
                continue;
            }

            if (props.id === "carto") {
                // Already added by default
                continue;
            }

            if (props.overlay) {
                console.log("Refusing overlay layer ", props.name)

                continue;
            }

            if (props.url.toLowerCase().indexOf("apikey") > 0) {
                continue;
            }

            if (props.url.toLowerCase().indexOf("{bbox}") > 0) {
                console.warn("Editor layer index: needs bbox ", props)
                continue;
            }
            
            if(props.name === undefined){
                console.warn("Editor layer index: name not defined on ", props)
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
                max_zoom: props.max_zoom ?? 25,
                min_zoom: props.min_zoom ?? 1,
                attribution_url: props.license_url,
                name: props.name,
                layer: leafletLayer,
                feature: layer
            });
        }
        return layers;

    }

}