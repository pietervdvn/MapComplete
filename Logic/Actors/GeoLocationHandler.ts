import * as L from "leaflet";
import {UIEventSource} from "../UIEventSource";
import Svg from "../../Svg";
import Img from "../../UI/Base/Img";
import {LocalStorageSource} from "../Web/LocalStorageSource";
import LayoutConfig from "../../Customizations/JSON/LayoutConfig";
import {VariableUiElement} from "../../UI/Base/VariableUIElement";
import BaseUIElement from "../../UI/BaseUIElement";

export default class GeoLocationHandler extends VariableUiElement {
    /**
     * Wether or not the geolocation is active, aka the user requested the current location
     * @private
     */
    private readonly _isActive: UIEventSource<boolean>;

    /**
     * Wether or not the geolocation is locked, aka the user requested the current location and wants the crosshair to follow the user
     * @private
     */
    private readonly _isLocked: UIEventSource<boolean>;

    /**
     * The callback over the permission API
     * @private
     */
    private readonly _permission: UIEventSource<string>;
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
    private readonly _currentGPSLocation: UIEventSource<{
        latlng: any;
        accuracy: number;
    }>;
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
    private readonly _previousLocationGrant: UIEventSource<string>;
    private readonly _layoutToUse: UIEventSource<LayoutConfig>;

    constructor(
        currentGPSLocation: UIEventSource<{ latlng: any; accuracy: number }>,
        leafletMap: UIEventSource<L.Map>,
        layoutToUse: UIEventSource<LayoutConfig>
    ) {
        const hasLocation = currentGPSLocation.map(
            (location) => location !== undefined
        );
        const previousLocationGrant = LocalStorageSource.Get(
            "geolocation-permissions"
        );
        const isActive = new UIEventSource<boolean>(false);
        const isLocked = new UIEventSource<boolean>(false);

        super(
            hasLocation.map(
                (hasLocationData) => {
                    let icon: BaseUIElement;

                    if (isLocked.data) {
                        icon = Svg.location_svg();
                    } else if (hasLocationData) {
                        icon = Svg.location_empty_svg();
                    } else if (isActive.data) {
                        icon = Svg.location_empty_svg();
                    } else {
                        icon = Svg.location_circle_svg();
                    }
                    return icon
                },
                [isActive, isLocked]
            )
        );
        this.SetClass("mapcontrol")
        this._isActive = isActive;
        this._isLocked = isLocked;
        this._permission = new UIEventSource<string>("");
        this._previousLocationGrant = previousLocationGrant;
        this._currentGPSLocation = currentGPSLocation;
        this._leafletMap = leafletMap;
        this._layoutToUse = layoutToUse;
        this._hasLocation = hasLocation;
        const self = this;

        const currentPointer = this._isActive.map(
            (isActive) => {
                if (isActive && !self._hasLocation.data) {
                    return "cursor-wait";
                }
                return "cursor-pointer";
            },
            [this._hasLocation]
        );
        currentPointer.addCallbackAndRun((pointerClass) => {
            self.SetClass(pointerClass);
        });

        this.onClick(() => {
            if (self._hasLocation.data) {
                self._isLocked.setData(!self._isLocked.data);
            }
            self.init(true);
        });
        this.init(false);

        this._currentGPSLocation.addCallback((location) => {
            self._previousLocationGrant.setData("granted");

            const timeSinceRequest =
                (new Date().getTime() - (self._lastUserRequest?.getTime() ?? 0)) / 1000;
            if (timeSinceRequest < 30) {
                self.MoveToCurrentLoction(16);
            } else if (self._isLocked.data) {
                self.MoveToCurrentLoction();
            }

            let color = "#1111cc";
            try {
                color = getComputedStyle(document.body).getPropertyValue(
                    "--catch-detail-color"
                );
            } catch (e) {
                console.error(e);
            }
            const icon = L.icon({
                iconUrl: Img.AsData(Svg.crosshair.replace(/#000000/g, color)),
                iconSize: [40, 40], // size of the icon
                iconAnchor: [20, 20], // point of the icon which will correspond to marker's location
            });

            const map = self._leafletMap.data;

            const newMarker = L.marker(location.latlng, {icon: icon});
            newMarker.addTo(map);

            if (self._marker !== undefined) {
                map.removeLayer(self._marker);
            }
            self._marker = newMarker;
        });
    }

    private init(askPermission: boolean) {
        const self = this;

        if (self._isActive.data) {
            self.MoveToCurrentLoction(16);
            return;
        }

        try {
            navigator?.permissions
                ?.query({name: "geolocation"})
                ?.then(function (status) {
                    console.log("Geolocation is already", status);
                    if (status.state === "granted") {
                        self.StartGeolocating(false);
                    }
                    self._permission.setData(status.state);
                    status.onchange = function () {
                        self._permission.setData(status.state);
                    };
                });
        } catch (e) {
            console.error(e);
        }

        if (askPermission) {
            self.StartGeolocating(true);
        } else if (this._previousLocationGrant.data === "granted") {
            this._previousLocationGrant.setData("");
            self.StartGeolocating(false);
        }
    }

    private MoveToCurrentLoction(targetZoom?: number) {
        const location = this._currentGPSLocation.data;
        this._lastUserRequest = undefined;

        if (
            this._currentGPSLocation.data.latlng[0] === 0 &&
            this._currentGPSLocation.data.latlng[1] === 0
        ) {
            console.debug("Not moving to GPS-location: it is null island");
            return;
        }

        // We check that the GPS location is not out of bounds
        const b = this._layoutToUse.data.lockLocation;
        let inRange = true;
        if (b) {
            if (b !== true) {
                // B is an array with our locklocation
                inRange =
                    b[0][0] <= location.latlng[0] &&
                    location.latlng[0] <= b[1][0] &&
                    b[0][1] <= location.latlng[1] &&
                    location.latlng[1] <= b[1][1];
            }
        }
        if (!inRange) {
            console.log(
                "Not zooming to GPS location: out of bounds",
                b,
                location.latlng
            );
        } else {
            this._leafletMap.data.setView(location.latlng, targetZoom);
        }
    }

    private StartGeolocating(zoomToGPS = true) {
        const self = this;
        console.log("Starting geolocation");

        this._lastUserRequest = zoomToGPS ? new Date() : new Date(0);
        if (self._permission.data === "denied") {
            self._previousLocationGrant.setData("");
            return "";
        }
        if (this._currentGPSLocation.data !== undefined) {
            this.MoveToCurrentLoction(16);
        }

        console.log("Searching location using GPS");

        if (self._isActive.data) {
            return;
        }
        self._isActive.setData(true);

        navigator.geolocation.watchPosition(
            function (position) {
                self._currentGPSLocation.setData({
                    latlng: [position.coords.latitude, position.coords.longitude],
                    accuracy: position.coords.accuracy,
                });
            },
            function () {
                console.warn("Could not get location with navigator.geolocation");
            },
            {
                enableHighAccuracy: true
            }
        );
    }
}
