import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";
import Loc from "../../Models/Loc";
import State from "../../State";
import {Utils} from "../../Utils";
import LayerConfig from "../../Customizations/JSON/LayerConfig";


/**
 * Fetches a geojson file somewhere and passes it along
 */
export default class GeoJsonSource implements FeatureSource {

    public readonly features: UIEventSource<{ feature: any; freshness: Date }[]>;
    public readonly name;
    private onFail: ((errorMsg: any, url: string) => void) = undefined;
    private readonly layerId: string;
    private readonly seenids: Set<string> = new Set<string>()
    public readonly isOsmCache: boolean

    private constructor(locationControl: UIEventSource<Loc>,
                        flayer: { isDisplayed: UIEventSource<boolean>, layerDef: LayerConfig },
                        onFail?: ((errorMsg: any) => void)) {
        this.layerId = flayer.layerDef.id;
        let url = flayer.layerDef.source.geojsonSource.replace("{layer}", flayer.layerDef.id);
        this.name = "GeoJsonSource of " + url;
        const zoomLevel = flayer.layerDef.source.geojsonZoomLevel;

        this.isOsmCache = flayer.layerDef.source.isOsmCacheLayer;

        this.features = new UIEventSource<{ feature: any; freshness: Date }[]>([])

        if (zoomLevel === undefined) {
            // This is a classic, static geojson layer
            if (onFail === undefined) {
                onFail = _ => {
                }
            }
            this.onFail = onFail;

            this.LoadJSONFrom(url)
        } else {
            this.ConfigureDynamicLayer(url, zoomLevel, locationControl, flayer)
        }
    }

    /**
     * Merges together the layers which have the same source
     * @param flayers
     * @param locationControl
     * @constructor
     */
    public static ConstructMultiSource(flayers: { isDisplayed: UIEventSource<boolean>, layerDef: LayerConfig }[], locationControl: UIEventSource<Loc>): GeoJsonSource[] {

        const flayersPerSource = new Map<string, { isDisplayed: UIEventSource<boolean>, layerDef: LayerConfig }[]>();
        for (const flayer of flayers) {
            const url = flayer.layerDef.source.geojsonSource?.replace(/{layer}/g, flayer.layerDef.id)
            if (url === undefined) {
                continue;
            }

            if (!flayersPerSource.has(url)) {
                flayersPerSource.set(url, [])
            }
            flayersPerSource.get(url).push(flayer)
        }

        const sources: GeoJsonSource[] = []

        flayersPerSource.forEach((flayers, key) => {
            if (flayers.length == 1) {
                sources.push(new GeoJsonSource(locationControl, flayers[0]));
                return;
            }

            const zoomlevels = Utils.Dedup(flayers.map(flayer => "" + (flayer.layerDef.source.geojsonZoomLevel ?? "")))
            if (zoomlevels.length > 1) {
                throw "Multiple zoomlevels defined for same geojson source " + key
            }

            let isShown = new UIEventSource<boolean>(true, "IsShown for multiple layers: or of multiple values");
            for (const flayer of flayers) {
                flayer.isDisplayed.addCallbackAndRun(() => {
                    let value = false;
                    for (const flayer of flayers) {
                        value = flayer.isDisplayed.data || value;
                    }
                    isShown.setData(value);
                });

            }

            const source = new GeoJsonSource(locationControl, {
                isDisplayed: isShown,
                layerDef: flayers[0].layerDef // We only care about the source info here
            })
            sources.push(source)

        })
        return sources;

    }

    private ConfigureDynamicLayer(url: string, zoomLevel: number, locationControl: UIEventSource<Loc>, flayer: { isDisplayed: UIEventSource<boolean>, layerDef: LayerConfig }) {
        // This is a dynamic template with a fixed zoom level
        url = url.replace("{z}", "" + zoomLevel)
        const loadedTiles = new Set<string>();
        const self = this;
        this.onFail = (msg, url) => {
            console.warn(`Could not load geojson layer from`, url, "due to", msg)
            loadedTiles.add(url); // We add the url to the 'loadedTiles' in order to not reload it in the future
        }

        const neededTiles = locationControl.map(
            location => {
                if (!flayer.isDisplayed.data) {
                    // No need to download! - the layer is disabled
                    return undefined;
                }

                if (location.zoom < flayer.layerDef.minzoom) {
                    // No need to download! - the layer is disabled
                    return undefined;
                }

                // Yup, this is cheating to just get the bounds here
                const bounds = State.state.leafletMap.data.getBounds()
                const tileRange = Utils.TileRangeBetween(zoomLevel, bounds.getNorth(), bounds.getEast(), bounds.getSouth(), bounds.getWest())
                const needed = Utils.MapRange(tileRange, (x, y) => {
                    return url.replace("{x}", "" + x).replace("{y}", "" + y);
                })
                return new Set<string>(needed);
            }
            , [flayer.isDisplayed]);
        neededTiles.stabilized(250).addCallback((needed: Set<string>) => {
            if (needed === undefined) {
                return;
            }

            needed.forEach(neededTile => {
                if (loadedTiles.has(neededTile)) {
                    return;
                }

                loadedTiles.add(neededTile)
                self.LoadJSONFrom(neededTile)

            })
        })

    }

    private LoadJSONFrom(url: string) {
        const eventSource = this.features;
        const self = this;
        Utils.downloadJson(url)
            .then(json => {
                if (json.elements === [] && json.remarks.indexOf("runtime error") > 0) {
                    self.onFail("Runtime error (timeout)", url)
                    return;
                }
                const time = new Date();
                const newFeatures: { feature: any, freshness: Date } [] = []
                let i = 0;
                let skipped = 0;
                for (const feature of json.features) {
                    if (feature.properties.id === undefined) {
                        feature.properties.id = url + "/" + i;
                        feature.id = url + "/" + i;
                        i++;
                    }
                    if (self.seenids.has(feature.properties.id)) {
                        skipped++;
                        continue;
                    }
                    self.seenids.add(feature.properties.id)

                    let freshness: Date = time;
                    if (feature.properties["_last_edit:timestamp"] !== undefined) {
                        freshness = new Date(feature.properties["_last_edit:timestamp"])
                    }

                    newFeatures.push({feature: feature, freshness: freshness})
                }
                console.debug("Downloaded " + newFeatures.length + " new features and " + skipped + " already seen features from " + url);

                if (newFeatures.length == 0) {
                    return;
                }

                eventSource.setData(eventSource.data.concat(newFeatures))

            }).catch(msg => self.onFail(msg, url))
    }

}
