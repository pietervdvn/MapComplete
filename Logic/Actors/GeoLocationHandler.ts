import { QueryParameters } from "../Web/QueryParameters"
import { BBox } from "../BBox"
import Constants from "../../Models/Constants"
import { GeoLocationPointProperties, GeoLocationState } from "../State/GeoLocationState"
import { UIEventSource } from "../UIEventSource"
import Loc from "../../Models/Loc"
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"
import SimpleFeatureSource from "../FeatureSource/Sources/SimpleFeatureSource"

/**
 * The geolocation-handler takes a map-location and a geolocation state.
 * It'll move the map as appropriate given the state of the geolocation-API
 * It will also copy the geolocation into the appropriate FeatureSource to display on the map
 */
export default class GeoLocationHandler {
    public readonly geolocationState: GeoLocationState
    private readonly _state: {
        currentUserLocation: SimpleFeatureSource
        layoutToUse: LayoutConfig
        locationControl: UIEventSource<Loc>
        selectedElement: UIEventSource<any>
        leafletMap?: UIEventSource<any>
    }
    public readonly mapHasMoved: UIEventSource<boolean> = new UIEventSource<boolean>(false)

    constructor(
        geolocationState: GeoLocationState,
        state: {
            locationControl: UIEventSource<Loc>
            currentUserLocation: SimpleFeatureSource
            layoutToUse: LayoutConfig
            selectedElement: UIEventSource<any>
            leafletMap?: UIEventSource<any>
        }
    ) {
        this.geolocationState = geolocationState
        this._state = state
        const mapLocation = state.locationControl
        // Did an interaction move the map?
        let self = this
        let initTime = new Date()
        mapLocation.addCallbackD((_) => {
            if (new Date().getTime() - initTime.getTime() < 250) {
                return
            }
            self.mapHasMoved.setData(true)
            return true // Unsubscribe
        })

        const latLonGivenViaUrl =
            QueryParameters.wasInitialized("lat") || QueryParameters.wasInitialized("lon")
        if (latLonGivenViaUrl) {
            // The URL counts as a 'user interaction'
            this.mapHasMoved.setData(true)
        }

        this.geolocationState.currentGPSLocation.addCallbackAndRunD((newLocation) => {
            const timeSinceLastRequest =
                (new Date().getTime() - geolocationState.requestMoment.data?.getTime() ?? 0) / 1000
            if (!this.mapHasMoved.data) {
                // The map hasn't moved yet; we received our first coordinates, so let's move there!
                console.log(
                    "Moving the map to an initial location; time since last request is",
                    timeSinceLastRequest
                )
                if (timeSinceLastRequest < Constants.zoomToLocationTimeout) {
                    self.MoveMapToCurrentLocation()
                }
            }

            if (this.geolocationState.isLocked.data) {
                // Jup, the map is locked to the bound location: move automatically
                self.MoveMapToCurrentLocation()
                return
            }
        })

        geolocationState.isLocked.map(
            (isLocked) => {
                if (isLocked) {
                    state.leafletMap?.data?.dragging?.disable()
                } else {
                    state.leafletMap?.data?.dragging?.enable()
                }
            },
            [state.leafletMap]
        )

        this.CopyGeolocationIntoMapstate()
    }

    /**
     * Move the map to the GPS-location, except:
     * - If there is a selected element
     * - The location is out of the locked bound
     * - The GPS-location iss NULL-island
     * @constructor
     */
    public MoveMapToCurrentLocation() {
        const newLocation = this.geolocationState.currentGPSLocation.data
        const mapLocation = this._state.locationControl
        const state = this._state
        // We got a new location.
        // Do we move the map to it?

        if (state.selectedElement.data !== undefined) {
            // Nope, there is something selected, so we don't move to the current GPS-location
            return
        }
        if (newLocation.latitude === 0 && newLocation.longitude === 0) {
            console.debug("Not moving to GPS-location: it is null island")
            return
        }

        // We check that the GPS location is not out of bounds
        const bounds = state.layoutToUse.lockLocation
        if (bounds && bounds !== true) {
            // B is an array with our lock-location
            const inRange = new BBox(bounds).contains([newLocation.longitude, newLocation.latitude])
            if (!inRange) {
                return
            }
        }

        mapLocation.setData({
            zoom: mapLocation.data.zoom,
            lon: newLocation.longitude,
            lat: newLocation.latitude,
        })
        this.mapHasMoved.setData(true)
    }

    private CopyGeolocationIntoMapstate() {
        const state = this._state
        this.geolocationState.currentGPSLocation.addCallbackAndRun((location) => {
            if (location === undefined) {
                return
            }
            const feature = {
                type: "Feature",
                properties: <GeoLocationPointProperties>{
                    id: "gps",
                    "user:location": "yes",
                    date: new Date().toISOString(),
                    ...location,
                },
                geometry: {
                    type: "Point",
                    coordinates: [location.longitude, location.latitude],
                },
            }

            state.currentUserLocation?.features?.setData([{ feature, freshness: new Date() }])
        })
    }
}
