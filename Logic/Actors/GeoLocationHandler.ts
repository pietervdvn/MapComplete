import * as L from "leaflet";
import {UIEventSource} from "../UIEventSource";
import {UIElement} from "../../UI/UIElement";
import {Utils} from "../../Utils";
import Svg from "../../Svg";
import Img from "../../UI/Base/Img";
import {LocalStorageSource} from "../Web/LocalStorageSource";

export default class GeoLocationHandler extends UIElement {

    /**
     * Wether or not the geolocation is active, aka the user requested the current location
     * @private
     */
    private readonly _isActive: UIEventSource<boolean> = new UIEventSource<boolean>(false);

    /**
     * The callback over the permission API
     * @private
     */
    private readonly _permission: UIEventSource<string> = new UIEventSource<string>("");
    /***
     * The marker on the map, in order to update it
     * @private
     */
    private _marker: L.Marker;
    /**
     * Literally: _currentGPSLocation.data != undefined
     * @private
     */
    private readonly _hasLocation: UIEventSource<boolean>;
    private readonly _currentGPSLocation: UIEventSource<{ latlng: any; accuracy: number }>;
    /**
     * Kept in order to update the marker
     * @private
     */
    private readonly _leafletMap: UIEventSource<L.Map>;
    /**
     * The date when the user requested the geolocation. If we have a location, it'll autozoom to it the first 30 secs
     * @private
     */
    private _lastUserRequest: Date;
    /**
     * A small flag on localstorage. If the user previously granted the geolocation, it will be set.
     * On firefox, the permissions api is broken (probably fingerprint resistiance) and "granted + don't ask again" doesn't stick between sessions.
     *
     * Instead, we set this flag. If this flag is set upon loading the page, we start geolocating immediately.
     * If the user denies the geolocation this time, we unset this flag
     * @private
     */
    private readonly _previousLocationGrant: UIEventSource<string> = LocalStorageSource.Get("geolocation-permissions");

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

        const currentPointer = this._isActive.map(isActive => {
            if (isActive && !self._hasLocation.data) {
                return "cursor-wait"
            }
            return "cursor-pointer"
        }, [this._hasLocation])
        currentPointer.addCallbackAndRun(pointerClass => {
            self.SetClass(pointerClass);
            self.Update()
        })
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

    private init() {
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
            self._previousLocationGrant.setData("granted");

            const timeSinceRequest = (new Date().getTime() - (self._lastUserRequest?.getTime() ?? 0)) / 1000;
            if (timeSinceRequest < 30) {
                self._lastUserRequest = undefined;
                this._leafletMap.data.setView(
                    this._currentGPSLocation.data.latlng, this._leafletMap.data.getZoom()
                );
            }

            let color = "#1111cc";
            try {
                color = getComputedStyle(document.body).getPropertyValue("--catch-detail-color")
            } catch (e) {
                console.error(e)
            }
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

        try {

            navigator?.permissions?.query({name: 'geolocation'})
                ?.then(function (status) {
                    console.log("Geolocation is already", status)
                    if (status.state === "granted") {
                        self.StartGeolocating(19, false);
                    }
                    self._permission.setData(status.state);
                    status.onchange = function () {
                        self._permission.setData(status.state);
                    }
                });

        } catch (e) {
            console.log(e)
            self.StartGeolocating()
        }
        if (this._previousLocationGrant.data === "granted") {
            this._previousLocationGrant.setData("");
            self.StartGeolocating();
        }

        this.HideOnEmpty(true);
    }

    private locate() {
        const self = this;
        const map: any = this._leafletMap.data;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                self._currentGPSLocation.setData({
                    latlng: [position.coords.latitude, position.coords.longitude],
                    accuracy: position.coords.accuracy
                });
            }, function () {
                console.warn("Could not get location with navigator.geolocation")
            });
            return;
        } else {
            map.findAccuratePosition({
                maxWait: 10000, // defaults to 10000
                desiredAccuracy: 50 // defaults to 20
            });
        }
    }

    private StartGeolocating(zoomlevel = 19, zoomToGPS = true) {
        const self = this;
        console.log("Starting geolocation")

        this._lastUserRequest = zoomToGPS ? new Date() : new Date(0);
        if (self._permission.data === "denied") {
            self._previousLocationGrant.setData("");
            return "";
        }
        if (this._currentGPSLocation.data !== undefined) {
            this._leafletMap.data.setView(
                this._currentGPSLocation.data.latlng, zoomlevel
            );
        }


        console.log("Searching location using GPS")
        this.locate();


        if (!self._isActive.data) {
            self._isActive.setData(true);
            Utils.DoEvery(60000, () => {

                if (document.visibilityState !== "visible") {
                    console.log("Not starting gps: document not visible")
                    return;
                }
                this.locate();
            })
        }
    }

}