import { Utils } from "../../Utils"
import BaseUIElement from "../BaseUIElement"
import { UIEventSource } from "../../Logic/UIEventSource"
import Loc from "../../Models/Loc"
import BaseLayer from "../../Models/BaseLayer"
import AvailableBaseLayers from "../../Logic/Actors/AvailableBaseLayers"
import * as L from "leaflet"
import { LeafletMouseEvent, Map } from "leaflet"
import Minimap, { MinimapObj, MinimapOptions } from "./Minimap"
import { BBox } from "../../Logic/BBox"
import "leaflet-polylineoffset"
import { SimpleMapScreenshoter } from "leaflet-simple-map-screenshoter"
import BackgroundMapSwitch from "../BigComponents/BackgroundMapSwitch"
import AvailableBaseLayersImplementation from "../../Logic/Actors/AvailableBaseLayersImplementation"
import ShowDataLayer from "../ShowDataLayer/ShowDataLayer"
import ShowDataLayerImplementation from "../ShowDataLayer/ShowDataLayerImplementation"
import FilteredLayer from "../../Models/FilteredLayer"
import ScrollableFullScreen from "./ScrollableFullScreen"
import Constants from "../../Models/Constants"
import StrayClickHandler from "../../Logic/Actors/StrayClickHandler"

/**
 * The stray-click-hanlders adds a marker to the map if no feature was clicked.
 * Shows the given uiToShow-element in the messagebox
 */
class StrayClickHandlerImplementation {
    private _lastMarker

    constructor(
        state: {
            LastClickLocation: UIEventSource<{ lat: number; lon: number }>
            selectedElement: UIEventSource<string>
            filteredLayers: UIEventSource<FilteredLayer[]>
            leafletMap: UIEventSource<L.Map>
        },
        uiToShow: ScrollableFullScreen,
        iconToShow: BaseUIElement
    ) {
        const self = this
        const leafletMap = state.leafletMap
        state.filteredLayers.data.forEach((filteredLayer) => {
            filteredLayer.isDisplayed.addCallback((isEnabled) => {
                if (isEnabled && self._lastMarker && leafletMap.data !== undefined) {
                    // When a layer is activated, we remove the 'last click location' in order to force the user to reclick
                    // This reclick might be at a location where a feature now appeared...
                    state.leafletMap.data.removeLayer(self._lastMarker)
                }
            })
        })

        state.LastClickLocation.addCallback(function (lastClick) {
            if (self._lastMarker !== undefined) {
                state.leafletMap.data?.removeLayer(self._lastMarker)
            }

            if (lastClick === undefined) {
                return
            }

            state.selectedElement.setData(undefined)
            const clickCoor: [number, number] = [lastClick.lat, lastClick.lon]
            self._lastMarker = L.marker(clickCoor, {
                icon: L.divIcon({
                    html: iconToShow.ConstructElement(),
                    iconSize: [50, 50],
                    iconAnchor: [25, 50],
                    popupAnchor: [0, -45],
                }),
            })

            self._lastMarker.addTo(leafletMap.data)

            self._lastMarker.on("click", () => {
                if (leafletMap.data.getZoom() < Constants.userJourney.minZoomLevelToAddNewPoints) {
                    leafletMap.data.flyTo(
                        clickCoor,
                        Constants.userJourney.minZoomLevelToAddNewPoints
                    )
                    return
                }

                uiToShow.Activate()
            })
        })

        state.selectedElement.addCallback(() => {
            if (self._lastMarker !== undefined) {
                leafletMap.data.removeLayer(self._lastMarker)
                this._lastMarker = undefined
            }
        })
    }
}

export default class MinimapImplementation extends BaseUIElement implements MinimapObj {
    private static _nextId = 0
    public readonly leafletMap: UIEventSource<Map>
    public readonly location: UIEventSource<Loc>
    public readonly bounds: UIEventSource<BBox> | undefined
    private readonly _id: string
    private readonly _background: UIEventSource<BaseLayer>
    private _isInited = false
    private _allowMoving: boolean
    private readonly _leafletoptions: any
    private readonly _onFullyLoaded: (leaflet: L.Map) => void
    private readonly _attribution: BaseUIElement | boolean
    private readonly _addLayerControl: boolean
    private readonly _options: MinimapOptions

    private constructor(options?: MinimapOptions) {
        super()
        options = options ?? {}
        this._id = "minimap" + MinimapImplementation._nextId
        MinimapImplementation._nextId++
        this.leafletMap = options.leafletMap ?? new UIEventSource<Map>(undefined)
        this._background =
            options?.background ?? new UIEventSource<BaseLayer>(AvailableBaseLayers.osmCarto)
        this.location = options?.location ?? new UIEventSource<Loc>({ lat: 0, lon: 0, zoom: 1 })
        this.bounds = options?.bounds
        this._allowMoving = options.allowMoving ?? true
        this._leafletoptions = options.leafletOptions ?? {}
        this._onFullyLoaded = options.onFullyLoaded
        this._attribution = options.attribution
        this._addLayerControl = options.addLayerControl ?? false
        this._options = options
        this.SetClass("relative")
    }

    public static initialize() {
        AvailableBaseLayers.implement(new AvailableBaseLayersImplementation())
        Minimap.createMiniMap = (options) => new MinimapImplementation(options)
        ShowDataLayer.actualContstructor = (options) => new ShowDataLayerImplementation(options)
        StrayClickHandler.construct = (
            state: {
                LastClickLocation: UIEventSource<{ lat: number; lon: number }>
                selectedElement: UIEventSource<string>
                filteredLayers: UIEventSource<FilteredLayer[]>
                leafletMap: UIEventSource<L.Map>
            },
            uiToShow: ScrollableFullScreen,
            iconToShow: BaseUIElement
        ) => {
            return new StrayClickHandlerImplementation(state, uiToShow, iconToShow)
        }
    }

    public installBounds(factor: number | BBox, showRange?: boolean) {
        this.leafletMap.addCallbackD((leaflet) => {
            let bounds: { getEast(); getNorth(); getWest(); getSouth() }
            if (typeof factor === "number") {
                const lbounds = leaflet.getBounds().pad(factor)
                leaflet.setMaxBounds(lbounds)
                bounds = lbounds
            } else {
                // @ts-ignore
                leaflet.setMaxBounds(factor.toLeaflet())
                bounds = factor
            }

            if (showRange) {
                const data = {
                    type: "FeatureCollection",
                    features: [
                        {
                            type: "Feature",
                            geometry: {
                                type: "LineString",
                                coordinates: [
                                    [bounds.getEast(), bounds.getNorth()],
                                    [bounds.getWest(), bounds.getNorth()],
                                    [bounds.getWest(), bounds.getSouth()],

                                    [bounds.getEast(), bounds.getSouth()],
                                    [bounds.getEast(), bounds.getNorth()],
                                ],
                            },
                        },
                    ],
                }
                // @ts-ignore
                L.geoJSON(data, {
                    style: {
                        color: "#f44",
                        weight: 4,
                        opacity: 0.7,
                    },
                }).addTo(leaflet)
            }
        })
    }

    Destroy() {
        super.Destroy()
        console.warn("Decomissioning minimap", this._id)
        const mp = this.leafletMap.data
        this.leafletMap.setData(null)
        mp.off()
        mp.remove()
    }

    /**
     * Takes a screenshot of the current map
     * @param format: image: give a base64 encoded png image;
     * @constructor
     */
    public async TakeScreenshot(): Promise<string>
    public async TakeScreenshot(format: "image"): Promise<string>
    public async TakeScreenshot(format: "blob"): Promise<Blob>
    public async TakeScreenshot(format: "image" | "blob"): Promise<string | Blob>
    public async TakeScreenshot(format: "image" | "blob" = "image"): Promise<string | Blob> {
        console.log("Taking a screenshot...")
        const screenshotter = new SimpleMapScreenshoter()
        screenshotter.addTo(this.leafletMap.data)
        const result = <any>await screenshotter.takeScreen(<any>format ?? "image")
        if (format === "image" && typeof result === "string") {
            return result
        }
        if (format === "blob" && result instanceof Blob) {
            return result
        }
        throw "Something went wrong while creating the screenshot: " + result
    }

    protected InnerConstructElement(): HTMLElement {
        const div = document.createElement("div")
        div.id = this._id
        div.style.height = "100%"
        div.style.width = "100%"
        div.style.minWidth = "40px"
        div.style.minHeight = "40px"
        div.style.position = "relative"
        const wrapper = document.createElement("div")
        wrapper.appendChild(div)
        const self = this
        // @ts-ignore
        const resizeObserver = new ResizeObserver((_) => {
            if (wrapper.clientHeight === 0 || wrapper.clientWidth === 0) {
                return
            }
            if (
                wrapper.offsetParent === null ||
                window.getComputedStyle(wrapper).display === "none"
            ) {
                // Not visible
                return
            }
            try {
                self.InitMap()
            } catch (e) {
                console.debug("Could not construct a minimap:", e)
            }

            try {
                self.leafletMap?.data?.invalidateSize()
            } catch (e) {
                console.debug("Could not invalidate size of a minimap:", e)
            }
        })

        resizeObserver.observe(div)

        if (this._addLayerControl) {
            const switcher = new BackgroundMapSwitch(
                {
                    locationControl: this.location,
                    backgroundLayer: this._background,
                },
                this._background
            ).SetClass("top-0 right-0 z-above-map absolute")
            wrapper.appendChild(switcher.ConstructElement())
        }

        return wrapper
    }

    private InitMap() {
        if (this._constructedHtmlElement === undefined) {
            // This element isn't initialized yet
            return
        }

        if (document.getElementById(this._id) === null) {
            // not yet attached, we probably got some other event
            return
        }

        if (this._isInited) {
            return
        }
        this._isInited = true
        const location = this.location
        const self = this
        let currentLayer = this._background.data.layer()
        let latLon = <[number, number]>[location.data?.lat ?? 0, location.data?.lon ?? 0]
        if (isNaN(latLon[0]) || isNaN(latLon[1])) {
            latLon = [0, 0]
        }
        const options = {
            center: latLon,
            zoom: location.data?.zoom ?? 2,
            layers: [currentLayer],
            zoomControl: false,
            attributionControl: this._attribution !== undefined,
            dragging: this._allowMoving,
            scrollWheelZoom: this._allowMoving,
            doubleClickZoom: this._allowMoving,
            keyboard: this._allowMoving,
            touchZoom: this._allowMoving,
            // Disabling this breaks the geojson layer - don't ask me why!  zoomAnimation: this._allowMoving,
            fadeAnimation: this._allowMoving,
            maxZoom: 21,
        }

        Utils.Merge(this._leafletoptions, options)
        /*
         * Somehow, the element gets '_leaflet_id' set on chrome.
         * When attempting to init this leaflet map, it'll throw an exception and the map won't show up.
         * Simply removing '_leaflet_id' fixes the issue.
         * See https://github.com/pietervdvn/MapComplete/issues/726
         * */
        delete document.getElementById(this._id)["_leaflet_id"]

        const map = L.map(this._id, options)
        if (self._onFullyLoaded !== undefined) {
            currentLayer.on("load", () => {
                console.log("Fully loaded all tiles!")
                self._onFullyLoaded(map)
            })
        }

        // Users are not allowed to zoom to the 'copies' on the left and the right, stuff goes wrong then
        // We give a bit of leeway for people on the edges
        // Also see: https://www.reddit.com/r/openstreetmap/comments/ih4zzc/mapcomplete_a_new_easytouse_editor/g31ubyv/

        map.setMaxBounds([
            [-100, -200],
            [100, 200],
        ])

        if (this._attribution !== undefined) {
            if (this._attribution === true) {
                map.attributionControl.setPrefix(false)
            } else {
                map.attributionControl.setPrefix("<span id='leaflet-attribution'></span>")
            }
        }

        this._background.addCallbackAndRun((layer) => {
            const newLayer = layer.layer()
            if (currentLayer !== undefined) {
                map.removeLayer(currentLayer)
            }
            currentLayer = newLayer
            if (self._onFullyLoaded !== undefined) {
                currentLayer.on("load", () => {
                    console.log("Fully loaded all tiles!")
                    self._onFullyLoaded(map)
                })
            }
            map.addLayer(newLayer)
            if (self._attribution !== true && self._attribution !== false) {
                self._attribution?.AttachTo("leaflet-attribution")
            }
        })

        let isRecursing = false
        map.on("moveend", function () {
            if (isRecursing) {
                return
            }
            if (
                map.getZoom() === location.data.zoom &&
                map.getCenter().lat === location.data.lat &&
                map.getCenter().lng === location.data.lon
            ) {
                return
            }
            location.data.zoom = map.getZoom()
            location.data.lat = map.getCenter().lat
            location.data.lon = map.getCenter().lng
            isRecursing = true
            location.ping()

            if (self.bounds !== undefined) {
                self.bounds.setData(BBox.fromLeafletBounds(map.getBounds()))
            }

            isRecursing = false // This is ugly, I know
        })

        location.addCallback((loc) => {
            const mapLoc = map.getCenter()
            const dlat = Math.abs(loc.lat - mapLoc[0])
            const dlon = Math.abs(loc.lon - mapLoc[1])

            if (dlat < 0.000001 && dlon < 0.000001 && map.getZoom() === loc.zoom) {
                return
            }
            map.setView([loc.lat, loc.lon], loc.zoom)
        })

        if (self.bounds !== undefined) {
            self.bounds.setData(BBox.fromLeafletBounds(map.getBounds()))
        }

        if (this._options.lastClickLocation) {
            const lastClickLocation = this._options.lastClickLocation
            map.addEventListener("click", function (e: LeafletMouseEvent) {
                if (e.originalEvent["dismissed"]) {
                    return
                }
                lastClickLocation?.setData({ lat: e.latlng.lat, lon: e.latlng.lng })
            })

            map.on("contextmenu", function (e) {
                // @ts-ignore
                lastClickLocation?.setData({ lat: e.latlng.lat, lon: e.latlng.lng })
                map.setZoom(map.getZoom() + 1)
            })
        }

        this.leafletMap.setData(map)
    }
}
