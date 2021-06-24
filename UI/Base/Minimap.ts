import BaseUIElement from "../BaseUIElement";
import * as L from "leaflet";
import {UIEventSource} from "../../Logic/UIEventSource";
import Loc from "../../Models/Loc";
import BaseLayer from "../../Models/BaseLayer";
import AvailableBaseLayers from "../../Logic/Actors/AvailableBaseLayers";
import {Map} from "leaflet";

export default class Minimap extends BaseUIElement {

    private static _nextId = 0;
    public readonly leafletMap: UIEventSource<Map> = new UIEventSource<Map>(undefined)
    private readonly _id: string;
    private readonly _background: UIEventSource<BaseLayer>;
    private readonly _location: UIEventSource<Loc>;
    private _isInited = false;
    private _allowMoving: boolean;

    constructor(options?: {
                    background?: UIEventSource<BaseLayer>,
                    location?: UIEventSource<Loc>,
                    allowMoving?: boolean
                }
    ) {
        super()
        options = options ?? {}
        this._background = options?.background ?? new UIEventSource<BaseLayer>(AvailableBaseLayers.osmCarto)
        this._location = options?.location ?? new UIEventSource<Loc>(undefined)
        this._id = "minimap" + Minimap._nextId;
        this._allowMoving = options.allowMoving ?? true;
        Minimap._nextId++

    }
    
    protected InnerConstructElement(): HTMLElement {
        const div = document.createElement("div")
        div.id = this._id;
        div.style.height = "100%"
        div.style.width = "100%"
        div.style.minWidth = "40px"
        div.style.minHeight = "40px"
        const wrapper = document.createElement("div")
        wrapper.appendChild(div)
        const self = this;
        // @ts-ignore
        const resizeObserver = new ResizeObserver(_ => {
            console.log("Change in size detected!")
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

        let currentLayer = this._background.data.layer()
        const map = L.map(this._id, {
            center: [location.data?.lat ?? 0, location.data?.lon ?? 0],
            zoom: location.data?.zoom ?? 2,
            layers: [currentLayer],
            zoomControl: false,
            attributionControl: false,
            dragging: this._allowMoving,
            scrollWheelZoom: this._allowMoving,
            doubleClickZoom: this._allowMoving,
            keyboard: this._allowMoving,
            touchZoom: this._allowMoving
        });

        map.setMaxBounds(
            [[-100, -200], [100, 200]]
        );

        this._background.addCallbackAndRun(layer => {
            const newLayer = layer.layer()
            if (currentLayer !== undefined) {
                map.removeLayer(currentLayer);
            }
            currentLayer = newLayer;
            map.addLayer(newLayer);
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


        this.leafletMap.setData(map)
    }
}