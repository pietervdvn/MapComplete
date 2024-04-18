import { QueryParameters } from "../Web/QueryParameters"
import { BBox } from "../BBox"
import Constants from "../../Models/Constants"
import { GeoLocationState } from "../State/GeoLocationState"
import { UIEventSource } from "../UIEventSource"
import { Feature, LineString, Point } from "geojson"
import { FeatureSource, WritableFeatureSource } from "../FeatureSource/FeatureSource"
import { LocalStorageSource } from "../Web/LocalStorageSource"
import { GeoOperations } from "../GeoOperations"
import { OsmTags } from "../../Models/OsmFeature"
import StaticFeatureSource from "../FeatureSource/Sources/StaticFeatureSource"
import { MapProperties } from "../../Models/MapProperties"
import { Orientation } from "../../Sensors/Orientation"

/**
 * The geolocation-handler takes a map-location and a geolocation state.
 * It'll move the map as appropriate given the state of the geolocation-API
 * It will also copy the geolocation into the appropriate FeatureSource to display on the map
 */
export default class GeoLocationHandler {
    public readonly geolocationState: GeoLocationState

    /**
     * The location as delivered by the GPS, wrapped as FeatureSource
     */
    public currentUserLocation: FeatureSource

    /**
     * All previously visited points (as 'Point'-objects), with their metadata
     */
    public historicalUserLocations: WritableFeatureSource<Feature<Point>>

    /**
     * A featureSource containing a single linestring which has the GPS-history of the user.
     * However, metadata (such as when every single point was visited) is lost here (but is kept in `historicalUserLocations`.
     * Note that this featureSource is _derived_ from 'historicalUserLocations'
     */
    public readonly historicalUserLocationsTrack: FeatureSource

    /**
     * The last moment that the map has moved
     */
    public readonly mapHasMoved: UIEventSource<Date | undefined> = new UIEventSource<
        Date | undefined
    >(undefined)
    private readonly selectedElement: UIEventSource<any>
    private readonly mapProperties?: MapProperties
    private readonly gpsLocationHistoryRetentionTime?: UIEventSource<number>

    constructor(
        geolocationState: GeoLocationState,
        selectedElement: UIEventSource<any>,
        mapProperties?: MapProperties,
        gpsLocationHistoryRetentionTime?: UIEventSource<number>
    ) {
        this.geolocationState = geolocationState
        const mapLocation = mapProperties.location
        this.selectedElement = selectedElement
        this.mapProperties = mapProperties
        this.gpsLocationHistoryRetentionTime = gpsLocationHistoryRetentionTime
        // Did an interaction move the map?
        let self = this
        let initTime = new Date()
        mapLocation.addCallbackD((_) => {
            if (new Date().getTime() - initTime.getTime() < 250) {
                return
            }
            self.mapHasMoved.setData(new Date())
            return true // Unsubscribe
        })

        const latLonGivenViaUrl =
            QueryParameters.wasInitialized("lat") || QueryParameters.wasInitialized("lon")
        if (latLonGivenViaUrl) {
            // The URL counts as a 'user interaction'
            this.mapHasMoved.setData(new Date())
        }

        this.geolocationState.currentGPSLocation.addCallbackAndRunD((_) => {
            const timeSinceLastRequest =
                (new Date().getTime() - geolocationState.requestMoment.data?.getTime() ?? 0) / 1000
            if (!this.mapHasMoved.data) {
                // The map hasn't moved yet; we received our first coordinates, so let's move there!
                self.MoveMapToCurrentLocation()
            }
            if (
                timeSinceLastRequest < Constants.zoomToLocationTimeout &&
                (this.mapHasMoved.data === undefined ||
                    this.mapHasMoved.data.getTime() <
                        geolocationState.requestMoment.data?.getTime())
            ) {
                // still within request time and the map hasn't moved since requesting to jump to the current location
                self.MoveMapToCurrentLocation()
            }

            if (!this.geolocationState.allowMoving.data) {
                // Jup, the map is locked to the bound location: move automatically
                self.MoveMapToCurrentLocation(0)
                return
            }
        })

        geolocationState.allowMoving.syncWith(mapProperties.allowMoving, true)

        this.CopyGeolocationIntoMapstate()
        this.historicalUserLocationsTrack = this.initUserLocationTrail()
    }

    /**
     * Move the map to the GPS-location, except:
     * - If there is a selected element
     * - The location is out of the locked bound
     * - The GPS-location iss NULL-island
     * @constructor
     */
    public MoveMapToCurrentLocation(zoomToAtLeast: number = 14) {
        const newLocation = this.geolocationState.currentGPSLocation.data
        const mapLocation = this.mapProperties.location
        // We got a new location.
        // Do we move the map to it?

        if (this.selectedElement.data !== undefined) {
            // Nope, there is something selected, so we don't move to the current GPS-location
            return
        }
        if (newLocation.latitude === 0 && newLocation.longitude === 0) {
            console.debug("Not moving to GPS-location: it is null island")
            return
        }

        // We check that the GPS location is not out of bounds
        const bounds: BBox = this.mapProperties.maxbounds.data
        if (bounds !== undefined) {
            // B is an array with our lock-location
            const inRange = bounds.contains([newLocation.longitude, newLocation.latitude])
            if (!inRange) {
                return
            }
        }

        mapLocation.setData({
            lon: newLocation.longitude,
            lat: newLocation.latitude,
        })
        const zoom = this.mapProperties.zoom
        zoom.setData(Math.min(Math.max(zoom.data, zoomToAtLeast), 18))

        this.mapHasMoved.setData(new Date())
        this.geolocationState.requestMoment.setData(undefined)
    }

    private CopyGeolocationIntoMapstate() {
        const features: UIEventSource<Feature[]> = new UIEventSource<Feature[]>([])
        this.currentUserLocation = new StaticFeatureSource(features)
        let i = 0
        this.geolocationState.currentGPSLocation.addCallbackAndRunD((location) => {
            const properties = {
                id: "gps-" + i,
                "user:location": "yes",
                date: new Date().toISOString(),
                // GeolocationObject behaves really weird when indexing, so copying it one by one is the most stable
                accuracy: location.accuracy,
                speed: location.speed,
                altitude: location.altitude,
                altitudeAccuracy: location.altitudeAccuracy,
                heading: location.heading,
                alpha: Orientation.singleton.gotMeasurement.data
                    ? "" + Orientation.singleton.alpha.data
                    : undefined,
            }
            i++

            const feature = <Feature>{
                type: "Feature",
                properties,
                geometry: {
                    type: "Point",
                    coordinates: [location.longitude, location.latitude],
                },
            }
            features.setData([feature])
        })
    }

    private initUserLocationTrail() {
        const features = LocalStorageSource.GetParsed<Feature[]>("gps_location_history", [])
        const now = new Date().getTime()
        features.data = features.data.filter((ff) => {
            if (ff.properties === undefined) {
                return false
            }
            const point_time = new Date(ff.properties["date"])
            return (
                now - point_time.getTime() <
                1000 * (this.gpsLocationHistoryRetentionTime?.data ?? 24 * 60 * 60 * 1000)
            )
        })
        features.ping()
        this.currentUserLocation?.features?.addCallbackAndRunD(([location]: [Feature<Point>]) => {
            if (location === undefined) {
                return
            }

            const previousLocation = <Feature<Point>>features.data[features.data.length - 1]
            if (previousLocation !== undefined) {
                const previousLocationFreshness = new Date(previousLocation.properties.date)
                const d = GeoOperations.distanceBetween(
                    <[number, number]>previousLocation.geometry.coordinates,
                    <[number, number]>location.geometry.coordinates
                )
                let timeDiff = Number.MAX_VALUE // in seconds
                const olderLocation = features.data[features.data.length - 2]

                if (olderLocation !== undefined) {
                    const olderLocationFreshness = new Date(olderLocation.properties.date)
                    timeDiff =
                        (new Date(previousLocationFreshness).getTime() -
                            new Date(olderLocationFreshness).getTime()) /
                        1000
                }
                if (d < 20 && timeDiff < 60) {
                    // Do not append changes less then 20m - it's probably noise anyway
                    return
                }
            }

            const feature = JSON.parse(JSON.stringify(location))
            feature.properties.id = "gps/" + features.data.length
            features.data.push(feature)
            features.ping()
        })

        this.historicalUserLocations = <any>new StaticFeatureSource(features)

        const asLine = features.map((allPoints) => {
            if (allPoints === undefined || allPoints.length < 2) {
                return []
            }

            const feature: Feature<LineString, OsmTags> = {
                type: "Feature",
                properties: {
                    id: "location_track",
                    "_date:now": new Date().toISOString(),
                },
                geometry: {
                    type: "LineString",
                    coordinates: allPoints.map(
                        (ff: Feature<Point>) => <[number, number]>ff.geometry.coordinates
                    ),
                },
            }
            return [feature]
        })
        return new StaticFeatureSource(asLine)
    }
}
