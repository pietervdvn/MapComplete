import BaseUIElement from "../BaseUIElement";
import * as L from "leaflet";
import {Map} from "leaflet";
import {UIEventSource} from "../../Logic/UIEventSource";
import Loc from "../../Models/Loc";
import BaseLayer from "../../Models/BaseLayer";
import AvailableBaseLayers from "../../Logic/Actors/AvailableBaseLayers";
import {Utils} from "../../Utils";

export default class Minimap extends BaseUIElement {

    private static _nextId = 0;
    public readonly leafletMap: UIEventSource<Map>
    private readonly _id: string;
    private readonly _background: UIEventSource<BaseLayer>;
    private readonly _location: UIEventSource<Loc>;
    private _isInited = false;
    private _allowMoving: boolean;
    private readonly _leafletoptions: any;
    private readonly _onFullyLoaded: (leaflet: L.Map) => void
    private readonly _attribution: BaseUIElement | boolean;
    private readonly _lastClickLocation: UIEventSource<{ lat: number; lon: number }>;

    constructor(options?: {
                    background?: UIEventSource<BaseLayer>,
                    location?: UIEventSource<Loc>,
                    allowMoving?: boolean,
                    leafletOptions?: any,
                    attribution?: BaseUIElement | boolean,
                    onFullyLoaded?: (leaflet: L.Map) => void,
                    leafletMap?: UIEventSource<Map>,
                    lastClickLocation?: UIEventSource<{ lat: number, lon: number }>
                }
    ) {
        super()
        options = options ?? {}
        this.leafletMap = options.leafletMap ?? new UIEventSource<Map>(undefined)
        this._background = options?.background ?? new UIEventSource<BaseLayer>(AvailableBaseLayers.osmCarto)
        this._location = options?.location ?? new UIEventSource<Loc>({lat: 0, lon: 0, zoom: 1})
        this._id = "minimap" + Minimap._nextId;
        this._allowMoving = options.allowMoving ?? true;
        this._leafletoptions = options.leafletOptions ?? {}
        this._onFullyLoaded = options.onFullyLoaded
        this._attribution = options.attribution
        this._lastClickLocation = options.lastClickLocation;
        Minimap._nextId++

    }

    protected InnerConstructElement(): HTMLElement {
        const div = document.createElement("div")
        div.id = this._id;
        div.style.height = "100%"
        div.style.width = "100%"
        div.style.minWidth = "40px"
        div.style.minHeight = "40px"
        div.style.position = "relative"
        const wrapper = document.createElement("div")
        wrapper.appendChild(div)
        const self = this;
        // @ts-ignore
        const resizeObserver = new ResizeObserver(_ => {
            self.InitMap();
            self.leafletMap?.data?.invalidateSize()
        });

        resizeObserver.observe(div);
        return wrapper;

    }

    private InitMap() {
        if (this._constructedHtmlElement === undefined) {
            // This element isn't initialized yet
            return;
        }

        if (document.getElementById(this._id) === null) {
            // not yet attached, we probably got some other event
            return;
        }

        if (this._isInited) {
            return;
        }
        this._isInited = true;
        const location = this._location;
        const self = this;
        let currentLayer = this._background.data.layer()
        const options = {
            center: <[number, number]>[location.data?.lat ?? 0, location.data?.lon ?? 0],
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
        }

        Utils.Merge(this._leafletoptions, options)

        const map = L.map(this._id, options);
        if (self._onFullyLoaded !== undefined) {

            currentLayer.on("load", () => {
                console.log("Fully loaded all tiles!")
                self._onFullyLoaded(map)
            })
        }

        // Users are not allowed to zoom to the 'copies' on the left and the right, stuff goes wrong then
        // We give a bit of leeway for people on the edges
        // Also see: https://www.reddit.com/r/openstreetmap/comments/ih4zzc/mapcomplete_a_new_easytouse_editor/g31ubyv/

        map.setMaxBounds(
            [[-100, -200], [100, 200]]
        );

        if (this._attribution !== undefined) {
            if (this._attribution === true) {
                map.attributionControl.setPrefix(false)
            } else {
                map.attributionControl.setPrefix(
                    "<span id='leaflet-attribution'></span>");
            }
        }

        this._background.addCallbackAndRun(layer => {
            const newLayer = layer.layer()
            if (currentLayer !== undefined) {
                map.removeLayer(currentLayer);
            }
            currentLayer = newLayer;
            if (self._onFullyLoaded !== undefined) {

                currentLayer.on("load", () => {
                    console.log("Fully loaded all tiles!")
                    self._onFullyLoaded(map)
                })
            }
            map.addLayer(newLayer);
            map.setMaxZoom(layer.max_zoom ?? map.getMaxZoom())
            if (self._attribution !== true && self._attribution !== false) {
                self._attribution?.AttachTo('leaflet-attribution')
            }

        })


        let isRecursing = false;
        map.on("moveend", function () {
            if (isRecursing) {
                return
            }
            if (map.getZoom() === location.data.zoom &&
                map.getCenter().lat === location.data.lat &&
                map.getCenter().lng === location.data.lon) {
                return;
            }
            location.data.zoom = map.getZoom();
            location.data.lat = map.getCenter().lat;
            location.data.lon = map.getCenter().lng;
            isRecursing = true;
            location.ping();
            isRecursing = false; // This is ugly, I know
        })


        location.addCallback(loc => {
            const mapLoc = map.getCenter()
            const dlat = Math.abs(loc.lat - mapLoc[0])
            const dlon = Math.abs(loc.lon - mapLoc[1])

            if (dlat < 0.000001 && dlon < 0.000001 && map.getZoom() === loc.zoom) {
                return;
            }
            map.setView([loc.lat, loc.lon], loc.zoom)
        })

        location.map(loc => loc.zoom)
            .addCallback(zoom => {
                if (Math.abs(map.getZoom() - zoom) > 0.1) {
                    map.setZoom(zoom, {});
                }
            })


        if (this._lastClickLocation) {
            const lastClickLocation = this._lastClickLocation
            map.on("click", function (e) {
                // @ts-ignore
                lastClickLocation?.setData({lat: e.latlng.lat, lon: e.latlng.lng})
            });

            map.on("contextmenu", function (e) {
                // @ts-ignore
                lastClickLocation?.setData({lat: e.latlng.lat, lon: e.latlng.lng});
            });
        }

        this.leafletMap.setData(map)
    }
}