import { Store, UIEventSource } from "../../Logic/UIEventSource"
import type { Map as MLMap } from "maplibre-gl"
import {
    EditorLayerIndexProperties,
    RasterLayerPolygon,
    RasterLayerProperties,
} from "../../Models/RasterLayers"
import { Utils } from "../../Utils"
import Loc from "../../Models/Loc"

export class MapLibreAdaptor {
    private readonly _maplibreMap: Store<MLMap>
    private readonly _backgroundLayer?: Store<RasterLayerPolygon>

    private _currentRasterLayer: string = undefined

    constructor(
        maplibreMap: Store<MLMap>,
        state?: {
            // availableBackgroundLayers: Store<BaseLayer[]>
            /**
             * The current background layer
             */
            readonly backgroundLayer?: Store<RasterLayerPolygon>
            readonly locationControl?: UIEventSource<Loc>
        }
    ) {
        this._maplibreMap = maplibreMap
        this._backgroundLayer = state.backgroundLayer

        const self = this
        this._backgroundLayer?.addCallback((_) => self.setBackground())

        maplibreMap.addCallbackAndRunD((map) => {
            map.on("load", () => {
                self.setBackground()
            })
            if (state.locationControl) {
                self.MoveMapToCurrentLoc(state.locationControl.data)
                map.on("moveend", () => {
                    const dt = state.locationControl.data
                    dt.lon = map.getCenter().lng
                    dt.lat = map.getCenter().lat
                    dt.zoom = map.getZoom()
                    state.locationControl.ping()
                })
            }
        })

        state.locationControl.addCallbackAndRunD((loc) => {
            self.MoveMapToCurrentLoc(loc)
        })
    }

    private MoveMapToCurrentLoc(loc: Loc) {
        const map = this._maplibreMap.data
        if (map === undefined || loc === undefined) {
            return
        }
        if (map.getZoom() !== loc.zoom) {
            map.setZoom(loc.zoom)
        }
        const center = map.getCenter()
        if (center.lng !== loc.lon || center.lat !== loc.lat) {
            map.setCenter({ lng: loc.lon, lat: loc.lat })
        }
    }

    /**
     * Prepares an ELI-URL to be compatible with mapbox
     */
    private static prepareWmsURL(url: string, size: number = 256) {
        // ELI:  LAYERS=OGWRGB13_15VL&STYLES=&FORMAT=image/jpeg&CRS={proj}&WIDTH={width}&HEIGHT={height}&BBOX={bbox}&VERSION=1.3.0&SERVICE=WMS&REQUEST=GetMap
        // PROD: SERVICE=WMS&REQUEST=GetMap&LAYERS=OGWRGB13_15VL&STYLES=&FORMAT=image/jpeg&TRANSPARENT=false&VERSION=1.3.0&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX=488585.4847988467,6590094.830634755,489196.9810251281,6590706.32686104

        const toReplace = {
            "{bbox}": "{bbox-epsg-3857}",
            "{proj}": "EPSG:3857",
            "{width}": "" + size,
            "{height}": "" + size,
            "{zoom}": "{z}",
        }

        for (const key in toReplace) {
            url = url.replace(new RegExp(key), toReplace[key])
        }

        const subdomains = url.match(/\{switch:([a-zA-Z0-9,]*)}/)
        if (subdomains !== null) {
            console.log("Found a switch:", subdomains)
            const options = subdomains[1].split(",")
            const option = options[Math.floor(Math.random() * options.length)]
            url = url.replace(subdomains[0], option)
        }

        return url
    }

    private async awaitStyleIsLoaded(): Promise<void> {
        const map = this._maplibreMap.data
        if (map === undefined) {
            return
        }
        while (!map.isStyleLoaded()) {
            await Utils.waitFor(250)
        }
    }

    private removeCurrentLayer(map: MLMap) {
        if (this._currentRasterLayer) {
            // hide the previous layer
            console.log("Removing previous layer", this._currentRasterLayer)
            map.removeLayer(this._currentRasterLayer)
            map.removeSource(this._currentRasterLayer)
        }
    }

    private async setBackground() {
        const map = this._maplibreMap.data
        if (map === undefined) {
            return
        }
        const background: RasterLayerProperties = this._backgroundLayer?.data?.properties
        if (background !== undefined && this._currentRasterLayer === background.id) {
            // already the correct background layer, nothing to do
            return
        }
        await this.awaitStyleIsLoaded()

        if (background !== this._backgroundLayer?.data?.properties) {
            // User selected another background in the meantime... abort
            return
        }

        if (background !== undefined && this._currentRasterLayer === background.id) {
            // already the correct background layer, nothing to do
            return
        }
        if (background === undefined) {
            // no background to set
            this.removeCurrentLayer(map)
            this._currentRasterLayer = undefined
            return
        }

        map.addSource(background.id, {
            type: "raster",
            // use the tiles option to specify a 256WMS tile source URL
            // https://maplibre.org/maplibre-gl-js-docs/style-spec/sources/
            tiles: [MapLibreAdaptor.prepareWmsURL(background.url, background["tile-size"] ?? 256)],
            tileSize: background["tile-size"] ?? 256,
            minzoom: background["min_zoom"] ?? 1,
            maxzoom: background["max_zoom"] ?? 25,
            //  scheme: background["type"] === "tms" ? "tms" : "xyz",
        })

        map.addLayer(
            {
                id: background.id,
                type: "raster",
                source: background.id,
                paint: {},
            },
            background.category === "osmbasedmap" || background.category === "map"
                ? undefined
                : "aeroway_fill"
        )
        await this.awaitStyleIsLoaded()
        this.removeCurrentLayer(map)
        this._currentRasterLayer = background?.id
    }
}
