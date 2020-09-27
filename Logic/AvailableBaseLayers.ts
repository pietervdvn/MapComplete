import * as editorlayerindex from "../assets/editor-layer-index.json"
import {UIEventSource} from "./UIEventSource";
import {GeoOperations} from "./GeoOperations";
import {State} from "../State";
import {Basemap} from "./Leaflet/Basemap";
import {QueryParameters} from "./Web/QueryParameters";
import {BaseLayer} from "./BaseLayer";

/**
 * Calculates which layers are available at the current location
 */
export default class AvailableBaseLayers {

    

    public static layerOverview = AvailableBaseLayers.LoadRasterIndex().concat(AvailableBaseLayers.LoadProviderIndex());
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
            layerControl.setData(Basemap.osmCarto);

        });


        const queryParam = QueryParameters.GetQueryParameter("background", State.state.layoutToUse.data.defaultBackground);

        queryParam.addCallbackAndRun((selectedId:string) => {
            console.log("Selected layer is ", selectedId)
            const available = self.availableEditorLayers.data;
            for (const layer of available) {
                if (layer.id === selectedId) {
                    state.bm.CurrentLayer.setData(layer);
                }
            }
        })

        state.bm.CurrentLayer.addCallbackAndRun(currentLayer => {
            queryParam.setData(currentLayer.id);
        });

    }

    public static AvailableLayersAt(lon: number, lat: number): BaseLayer[] {
        const availableLayers = [Basemap.osmCarto]
        const globalLayers = [];
        for (const i in AvailableBaseLayers.layerOverview) {
            const layer = AvailableBaseLayers.layerOverview[i];
            if (layer.feature?.geometry === undefined || layer.feature?.geometry === null) {
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

            if (props.id === "MAPNIK") {
                // Already added by default
                continue;
            }

            if (props.overlay) {
                continue;
            }

            if (props.url.toLowerCase().indexOf("apikey") > 0) {
                continue;
            }
            
            if(props.max_zoom < 19){
                // We want users to zoom to level 19 when adding a point
                // If they are on a layer which hasn't enough precision, they can not zoom far enough. This is confusing, so we don't use this layer
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
                props.license_url,
                props.max_zoom,
                props.type.toLowerCase() === "wms",
                props.type.toLowerCase() === "wmts"
            )

            // Note: if layer.geometry is null, there is global coverage for this layer
            layers.push({
                id: props.id,
                max_zoom: props.max_zoom ?? 25,
                min_zoom: props.min_zoom ?? 1,
                name: props.name,
                layer: leafletLayer,
                feature: layer
            });
        }
        return layers;
    }

    private static LoadProviderIndex(): BaseLayer[] {

        function l(id: string, name: string){
            const layer = Basemap.ProvidedLayer(id);
            return {
                feature: null,
                id: id,
                name: name,
                layer: layer,
                min_zoom: layer.minzoom,
                max_zoom: layer.maxzoom
            }
        }
        
        return [
            l("Stamen.TonerLite", "Toner Lite (by Stamen)"),
            l("Stamen.TonerBackground", "Toner Background - no labels (by Stamen)"),
            l("Stamen.Watercolor", "Watercolor (by Stamen)"),
            l("Stadia.AlidadeSmooth", "Alidade Smooth (by Stadia)"),
            l("Stadia.AlidadeSmoothDark", "Alidade Smooth Dark (by Stadia)"),
            l("Stadia.OSMBright", "Osm Bright (by Stadia)"),
            l("CartoDB.Positron", "Positron (by CartoDB)"),
            l("CartoDB.PositronNoLabels", "Positron  - no labels (by CartoDB)"),
            l("CartoDB.Voyager", "Voyager (by CartoDB)"),
            l("CartoDB.VoyagerNoLabels", "Voyager  - no labels (by CartoDB)"),

        ];

    }

}