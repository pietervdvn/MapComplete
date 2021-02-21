import * as L from "leaflet";
import {UIEventSource} from "../UIEventSource";
import {UIElement} from "../../UI/UIElement";
import {Utils} from "../../Utils";
import Svg from "../../Svg";
import Img from "../../UI/Base/Img";

export default class GeoLocationHandler extends UIElement {

    private readonly _isActive: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    private readonly _permission: UIEventSource<string> = new UIEventSource<string>("");
    private _marker: L.Marker;
    private readonly _hasLocation: UIEventSource<boolean>;
    private readonly _currentGPSLocation: UIEventSource<{ latlng: any; accuracy: number }>;
    private readonly _leafletMap: UIEventSource<L.Map>;

    constructor(currentGPSLocation: UIEventSource<{ latlng: any; accuracy: number }>,
                leafletMap: UIEventSource<L.Map>) {
        super(undefined);
        this._currentGPSLocation = currentGPSLocation;
        this._leafletMap = leafletMap;
        this._hasLocation = currentGPSLocation.map((location) => location !== undefined);
        this.dumbMode = false;
        const self = this;
        import("../../vendor/Leaflet.AccuratePosition.js").then(() => {
            self.init();
        })
    }


    public init() {
        this.ListenTo(this._hasLocation);
        this.ListenTo(this._isActive);
        this.ListenTo(this._permission);

        const self = this;


        function onAccuratePositionProgress(e) {
            self._currentGPSLocation.setData({latlng: e.latlng, accuracy: e.accuracy});
        }

        function onAccuratePositionFound(e) {
            self._currentGPSLocation.setData({latlng: e.latlng, accuracy: e.accuracy});
        }

        function onAccuratePositionError(e) {
            console.log("onerror", e.message);

        }

        const map = this._leafletMap.data;
        map.on('accuratepositionprogress', onAccuratePositionProgress);
        map.on('accuratepositionfound', onAccuratePositionFound);
        map.on('accuratepositionerror', onAccuratePositionError);


        this._currentGPSLocation.addCallback((location) => {

            const color = getComputedStyle(document.body).getPropertyValue("--catch-detail-color")
            const icon = L.icon(
                {
                    iconUrl: Img.AsData(Svg.crosshair.replace(/#000000/g, color)),
                    iconSize: [40, 40], // size of the icon
                    iconAnchor: [20, 20], // point of the icon which will correspond to marker's location
                })

            const newMarker = L.marker(location.latlng, {icon: icon});
            newMarker.addTo(map);

            if (self._marker !== undefined) {
                map.removeLayer(self._marker);
            }
            self._marker = newMarker;
        });

        navigator?.permissions?.query({name: 'geolocation'})
            ?.then(function (status) {
                console.log("Geolocation is already", status)
                if (status.state === "granted") {
                    self.StartGeolocating();
                }
                self._permission.setData(status.state);
                status.onchange = function () {
                    self._permission.setData(status.state);
                }
            });

        this.HideOnEmpty(true);
    }

    InnerRender(): string {
        if (this._hasLocation.data) {
            return Svg.crosshair_blue_img;
        }
        if (this._isActive.data) {
            return Svg.crosshair_blue_center_img;
        }

        return Svg.crosshair_img;
    }

    InnerUpdate(htmlElement: HTMLElement) {
        super.InnerUpdate(htmlElement);

        const self = this;
        htmlElement.onclick = function () {
            self.StartGeolocating(19);
        }

        htmlElement.oncontextmenu = function (e) {
            self.StartGeolocating(15);
            e.preventDefault();
            return false;
        }

    }

    private StartGeolocating(zoomlevel = 19) {
        const self = this;
        console.log("Starting geolocation")
        const map: any = this._leafletMap.data;
        if (self._permission.data === "denied") {
            return "";
        }
        if (this._currentGPSLocation.data !== undefined) {
            this._leafletMap.data.setView(
                this._currentGPSLocation.data.latlng, zoomlevel
            );
        }


        console.log("Searching location using GPS")
        map.findAccuratePosition({
            maxWait: 10000, // defaults to 10000
            desiredAccuracy: 50 // defaults to 20
        });


        if (!self._isActive.data) {
            self._isActive.setData(true);
            Utils.DoEvery(60000, () => {

                if (document.visibilityState !== "visible") {
                    console.log("Not starting gps: document not visible")
                    return;
                }

                map.findAccuratePosition({
                    maxWait: 10000, // defaults to 10000
                    desiredAccuracy: 50 // defaults to 20
                });
            })
        }
    }

}