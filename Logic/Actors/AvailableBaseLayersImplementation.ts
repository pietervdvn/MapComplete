import BaseLayer from "../../Models/BaseLayer";
import {UIEventSource} from "../UIEventSource";
import Loc from "../../Models/Loc";
import {GeoOperations} from "../GeoOperations";
import * as editorlayerindex from "../../assets/editor-layer-index.json";
import * as L from "leaflet";
import {TileLayer} from "leaflet";
import * as X from "leaflet-providers";
import {Utils} from "../../Utils";
import {AvailableBaseLayersObj} from "./AvailableBaseLayers";
import {BBox} from "../BBox";

export default class AvailableBaseLayersImplementation implements AvailableBaseLayersObj {

    public readonly osmCarto: BaseLayer =
        {
            id: "osm",
            name: "OpenStreetMap",
            layer: () => AvailableBaseLayersImplementation.CreateBackgroundLayer("osm", "OpenStreetMap",
                "https://tile.openstreetmap.org/{z}/{x}/{y}.png", "OpenStreetMap", "https://openStreetMap.org/copyright",
                19,
                false, false),
            feature: null,
            max_zoom: 19,
            min_zoom: 0,
            isBest: true, // Of course, OpenStreetMap is the best map!
            category: "osmbasedmap"
        }

    public readonly layerOverview = AvailableBaseLayersImplementation.LoadRasterIndex().concat(AvailableBaseLayersImplementation.LoadProviderIndex());
    public readonly globalLayers = this.layerOverview.filter(layer => layer.feature?.geometry === undefined || layer.feature?.geometry === null)
    public readonly localLayers = this.layerOverview.filter(layer => layer.feature?.geometry !== undefined && layer.featuer?.geometry !== null)

    private static LoadRasterIndex(): BaseLayer[] {
        const layers: BaseLayer[] = []
        // @ts-ignore
        const features = editorlayerindex.features;
        for (const i in features) {
            const layer = features[i];
            const props = layer.properties;

            if (props.type === "bing") {
                // A lot of work to implement - see https://github.com/pietervdvn/MapComplete/issues/648
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

            if (props.max_zoom < 19) {
                // We want users to zoom to level 19 when adding a point
                // If they are on a layer which hasn't enough precision, they can not zoom far enough. This is confusing, so we don't use this layer
                continue;
            }

            if (props.name === undefined) {
                console.warn("Editor layer index: name not defined on ", props)
                continue
            }


            const leafletLayer: () => TileLayer = () => AvailableBaseLayersImplementation.CreateBackgroundLayer(
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
                max_zoom: props.max_zoom ?? 19,
                min_zoom: props.min_zoom ?? 1,
                name: props.name,
                layer: leafletLayer,
                feature: layer.geometry !== null ? layer : null,
                isBest: props.best ?? false,
                category: props.category
            });
        }
        return layers;
    }

    private static LoadProviderIndex(): BaseLayer[] {
        // @ts-ignore
        X; // Import X to make sure the namespace is not optimized away
        function l(id: string, name: string): BaseLayer {
            try {
                const layer: any = L.tileLayer.provider(id, undefined);
                return {
                    feature: null,
                    id: id,
                    name: name,
                    layer: () => L.tileLayer.provider(id, {
                        maxNativeZoom: layer.options?.maxZoom,
                       maxZoom: Math.max(layer.options?.maxZoom ?? 19, 21)
                    }),
                    min_zoom: 1,
                    max_zoom: layer.options.maxZoom,
                    category: "osmbasedmap",
                    isBest: false
                }
            } catch (e) {
                console.error("Could not find provided layer", name, e);
                return null;
            }
        }

        const layers = [
            l("Stamen.TonerLite", "Toner Lite (by Stamen)"),
            l("Stamen.TonerBackground", "Toner Background - no labels (by Stamen)"),
            l("Stamen.Watercolor", "Watercolor (by Stamen)"),
            l("Stadia.OSMBright", "Osm Bright (by Stadia)"),
            l("CartoDB.Positron", "Positron (by CartoDB)"),
            l("CartoDB.PositronNoLabels", "Positron  - no labels (by CartoDB)"),
            l("CartoDB.Voyager", "Voyager (by CartoDB)"),
            l("CartoDB.VoyagerNoLabels", "Voyager  - no labels (by CartoDB)"),
        ];
        return Utils.NoNull(layers);

    }

    /**
     * Converts a layer from the editor-layer-index into a tilelayer usable by leaflet
     */
    private static CreateBackgroundLayer(id: string, name: string, url: string, attribution: string, attributionUrl: string,
                                         maxZoom: number, isWms: boolean, isWMTS?: boolean): TileLayer {

        url = url.replace("{zoom}", "{z}")
            .replace("&BBOX={bbox}", "")
            .replace("&bbox={bbox}", "");

        const subdomainsMatch = url.match(/{switch:[^}]*}/)
        let domains: string[] = [];
        if (subdomainsMatch !== null) {
            let domainsStr = subdomainsMatch[0].substr("{switch:".length);
            domainsStr = domainsStr.substr(0, domainsStr.length - 1);
            domains = domainsStr.split(",");
            url = url.replace(/{switch:[^}]*}/, "{s}")
        }


        if (isWms) {
            url = url.replace("&SRS={proj}", "");
            url = url.replace("&srs={proj}", "");
            const paramaters = ["format", "layers", "version", "service", "request", "styles", "transparent", "version"];
            const urlObj = new URL(url);

            const isUpper = urlObj.searchParams["LAYERS"] !== null;
            const options = {
                maxZoom: Math.max(maxZoom ?? 19, 21),
                maxNativeZoom: maxZoom ?? 19,
                attribution: attribution + " | ",
                subdomains: domains,
                uppercase: isUpper,
                transparent: false,
            };

            for (const paramater of paramaters) {
                let p = paramater;
                if (isUpper) {
                    p = paramater.toUpperCase();
                }
                options[paramater] = urlObj.searchParams.get(p);
            }

            if (options.transparent === null) {
                options.transparent = false;
            }


            return L.tileLayer.wms(urlObj.protocol + "//" + urlObj.host + urlObj.pathname, options);
        }

        if (attributionUrl) {
            attribution = `<a href='${attributionUrl}' target='_blank'>${attribution}</a>`;
        }

        return L.tileLayer(url,
            {
                attribution: attribution,
                maxZoom: Math.max(21, maxZoom ?? 19),
                maxNativeZoom: maxZoom ?? 19,
                minZoom: 1,
                // @ts-ignore
                wmts: isWMTS ?? false,
                subdomains: domains
            });
    }

    public AvailableLayersAt(location: UIEventSource<Loc>): UIEventSource<BaseLayer[]> {
        return UIEventSource.ListStabilized(location.map(
            (currentLocation) => {
                if (currentLocation === undefined) {
                    return this.layerOverview;
                }
                return this.CalculateAvailableLayersAt(currentLocation?.lon, currentLocation?.lat);
            }));
    }

    public SelectBestLayerAccordingTo(location: UIEventSource<Loc>, preferedCategory: UIEventSource<string | string[]>): UIEventSource<BaseLayer> {
        return this.AvailableLayersAt(location)
            .map(available => {
                // First float all 'best layers' to the top
                available.sort((a, b) => {
                        if (a.isBest && b.isBest) {
                            return 0;
                        }
                        if (!a.isBest) {
                            return 1
                        }

                        return -1;
                    }
                )

                if (preferedCategory.data === undefined) {
                    return available[0]
                }

                let prefered: string []
                if (typeof preferedCategory.data === "string") {
                    prefered = [preferedCategory.data]
                } else {
                    prefered = preferedCategory.data;
                }

                prefered.reverse();
                for (const category of prefered) {
                    //Then sort all 'photo'-layers to the top. Stability of the sorting will force a 'best' photo layer on top
                    available.sort((a, b) => {
                            if (a.category === category && b.category === category) {
                                return 0;
                            }
                            if (a.category !== category) {
                                return 1
                            }

                            return -1;
                        }
                    )
                }
                return available[0]
            }, [preferedCategory])
    }


    private CalculateAvailableLayersAt(lon: number, lat: number): BaseLayer[] {
        const availableLayers = [this.osmCarto]
        if (lon === undefined || lat === undefined) {
            return availableLayers.concat(this.globalLayers);
        }
        const lonlat = [lon, lat];
        for (const layerOverviewItem of this.localLayers) {
            const layer = layerOverviewItem;
            const bbox = BBox.get(layer.feature)
            
            if(layer.name === "AIV Flanders GRB"){
                console.log("Y U NO LOAD?")
            }
            
            if(!bbox.contains(lonlat)){
                continue
            }

            if (GeoOperations.inside(lonlat, layer.feature)) {
                availableLayers.push(layer);
            }
        }

        return availableLayers.concat(this.globalLayers);
    }
}