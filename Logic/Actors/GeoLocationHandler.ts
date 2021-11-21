import {UIEventSource} from "../UIEventSource";
import Svg from "../../Svg";
import {LocalStorageSource} from "../Web/LocalStorageSource";
import {VariableUiElement} from "../../UI/Base/VariableUIElement";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import {QueryParameters} from "../Web/QueryParameters";
import FeatureSource from "../FeatureSource/FeatureSource";

export interface GeoLocationPointProperties {
    id: "gps",
    "user:location": "yes",
    "date": string,
    "latitude": number
    "longitude":number,
    "speed": number,
    "accuracy": number
    "heading": number
    "altitude":number
}

export default class GeoLocationHandler extends VariableUiElement {

    private readonly currentLocation: FeatureSource

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
    /**
     * Literally: _currentGPSLocation.data != undefined
     * @private
     */
    private readonly _hasLocation: UIEventSource<boolean>;
    private readonly _currentGPSLocation: UIEventSource<Coordinates>;
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
    private readonly _layoutToUse: LayoutConfig;

    constructor(
        state: {
            selectedElement: UIEventSource<any>;
            currentUserLocation: FeatureSource,
            leafletMap: UIEventSource<any>,
            layoutToUse: LayoutConfig,
            featureSwitchGeolocation: UIEventSource<boolean>
        }
    ) {
        const currentGPSLocation = new UIEventSource<Coordinates>(undefined, "GPS-coordinate")
        const leafletMap = state.leafletMap
        const hasLocation = currentGPSLocation.map(
            (location) => location !== undefined
        );
        const previousLocationGrant = LocalStorageSource.Get(
            "geolocation-permissions"
        );
        const isActive = new UIEventSource<boolean>(false);
        const isLocked = new UIEventSource<boolean>(false);
        const permission = new UIEventSource<string>("");
        const lastClick = new UIEventSource<Date>(undefined);
        const lastClickWithinThreeSecs = lastClick.map(lastClick => {
            if (lastClick === undefined) {
                return false;
            }
            const timeDiff = (new Date().getTime() - lastClick.getTime()) / 1000
            return timeDiff <= 3
        })
        lastClick.addCallbackAndRunD(_ => {
            window.setTimeout(() => {
                if (lastClickWithinThreeSecs.data) {
                    lastClick.ping()
                }
            }, 500)
        })
        super(
            hasLocation.map(
                (hasLocationData) => {
                    if (permission.data === "denied") {
                        return Svg.location_refused_svg();
                    }

                    if (!isActive.data) {
                        return Svg.location_empty_svg()
                    }
                    if (!hasLocationData) {
                        // Position not yet found but we are active: we spin to indicate activity
                        const icon = Svg.location_empty_svg()
                        icon.SetStyle("animation: spin 4s linear infinite;")
                        return icon;
                    }
                    if (isLocked.data) {
                        return Svg.location_locked_svg()
                    }
                    if (lastClickWithinThreeSecs.data) {
                        return Svg.location_unlocked_svg()
                    }

                    // We have a location, so we show a dot in the center
                    return Svg.location_svg();
                },
                [isActive, isLocked, permission, lastClickWithinThreeSecs]
            )
        );
        this.SetClass("mapcontrol")
        this._isActive = isActive;
        this._isLocked = isLocked;
        this._permission = permission
        this._previousLocationGrant = previousLocationGrant;
        this._currentGPSLocation = currentGPSLocation;
        this._leafletMap = leafletMap;
        this._layoutToUse = state.layoutToUse;
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
            self.RemoveClass("cursor-wait")
            self.RemoveClass("cursor-pointer")
            self.SetClass(pointerClass);
        });


        this.onClick(() => {
            /*
             * If the previous click was within 3 seconds (and we have an active location), then we lock to the location 
             */
            if (self._hasLocation.data) {
                if (isLocked.data) {
                    isLocked.setData(false)
                } else if (lastClick.data !== undefined) {
                    const timeDiff = (new Date().getTime() - lastClick.data.getTime()) / 1000
                    if (timeDiff <= 3) {
                        isLocked.setData(true)
                        lastClick.setData(undefined)
                    } else {
                        lastClick.setData(new Date())
                    }
                } else {
                    lastClick.setData(new Date())
                }
            }

            self.init(true, true);
        });

        const latLonGiven = QueryParameters.wasInitialized("lat") && QueryParameters.wasInitialized("lon")

        const doAutoZoomToLocation = !latLonGiven && state.featureSwitchGeolocation.data && state.selectedElement.data !== undefined
        this.init(false, doAutoZoomToLocation);

        isLocked.addCallbackAndRunD(isLocked => {
            if (isLocked) {
                leafletMap.data?.dragging?.disable()
            } else {
                leafletMap.data?.dragging?.enable()
            }
        })

        this.currentLocation = state.currentUserLocation
        this._currentGPSLocation.addCallback((location) => {
            self._previousLocationGrant.setData("granted");
            const feature = {
                "type": "Feature",
                properties: <GeoLocationPointProperties>{
                    id: "gps",
                    "user:location": "yes",
                    "date": new Date().toISOString(),
                    "latitude": location.latitude,
                    "longitude": location.longitude,
                    "speed": location.speed,
                    "accuracy": location.accuracy,
                    "heading": location.heading,
                    "altitude": location.altitude
                },
                geometry: {
                    type: "Point",
                    coordinates: [location.longitude, location.latitude],
                }
            }

            self.currentLocation.features.setData([{feature, freshness: new Date()}])

            const timeSinceRequest =
                (new Date().getTime() - (self._lastUserRequest?.getTime() ?? 0)) / 1000;
            if (timeSinceRequest < 30) {
                self.MoveToCurrentLoction(16);
            } else if (self._isLocked.data) {
                self.MoveToCurrentLoction();
            }

        });

    }

    private init(askPermission: boolean, zoomToLocation: boolean) {
        const self = this;

        if (self._isActive.data) {
            self.MoveToCurrentLoction(16);
            return;
        }

        try {
            navigator?.permissions
                ?.query({name: "geolocation"})
                ?.then(function (status) {
                    console.log("Geolocation permission is ", status.state);
                    if (status.state === "granted") {
                        self.StartGeolocating(zoomToLocation);
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
            self.StartGeolocating(zoomToLocation);
        } else if (this._previousLocationGrant.data === "granted") {
            this._previousLocationGrant.setData("");
            self.StartGeolocating(zoomToLocation);
        }
    }

    private MoveToCurrentLoction(targetZoom?: number) {
        const location = this._currentGPSLocation.data;
        this._lastUserRequest = undefined;

        if (
            this._currentGPSLocation.data.latitude === 0 &&
            this._currentGPSLocation.data.longitude === 0
        ) {
            console.debug("Not moving to GPS-location: it is null island");
            return;
        }

        // We check that the GPS location is not out of bounds
        const b = this._layoutToUse.lockLocation;
        let inRange = true;
        if (b) {
            if (b !== true) {
                // B is an array with our locklocation
                inRange =
                    b[0][0] <= location.latitude &&
                    location.latitude <= b[1][0] &&
                    b[0][1] <= location.longitude &&
                    location.longitude <= b[1][1];
            }
        }
        if (!inRange) {
            console.log(
                "Not zooming to GPS location: out of bounds",
                b,
                location
            );
        } else {
            const currentZoom = this._leafletMap.data.getZoom()

            this._leafletMap.data.setView([location.latitude, location.longitude], Math.max(targetZoom ?? 0, currentZoom));
        }
    }

    private StartGeolocating(zoomToGPS = true) {
        const self = this;

        this._lastUserRequest = zoomToGPS ? new Date() : new Date(0);
        if (self._permission.data === "denied") {
            self._previousLocationGrant.setData("");
            self._isActive.setData(false)
            return "";
        }
        if (this._currentGPSLocation.data !== undefined) {
            this.MoveToCurrentLoction(16);
        }

        if (self._isActive.data) {
            return;
        }
        self._isActive.setData(true);

        navigator.geolocation.watchPosition(
            function (position) {
                self._currentGPSLocation.setData(position.coords);
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
