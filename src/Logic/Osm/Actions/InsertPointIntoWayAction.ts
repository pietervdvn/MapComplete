import { ChangeDescription } from "./ChangeDescription"
import { GeoOperations } from "../../GeoOperations"
import { OsmWay } from "../OsmObject"

export default class InsertPointIntoWayAction  {
    private readonly _lat: number
    private readonly _lon: number
    private readonly _idToInsert: number
    private readonly _snapOnto: OsmWay
    private readonly _options: {
        allowReuseOfPreviouslyCreatedPoints?: boolean
        reusePointWithinMeters?: number
    }

    constructor(
        lat: number,
        lon: number,
        idToInsert: number,
        snapOnto: OsmWay,
        options: {
            allowReuseOfPreviouslyCreatedPoints?: boolean
            reusePointWithinMeters?: number
        }
    ){
        this._lat = lat
        this._lon = lon
        this._idToInsert = idToInsert
        this._snapOnto = snapOnto
        this._options = options

    }

    /**
     * Tries to create the changedescription of the way where the point is inserted
     * Returns `undefined` if inserting failed
     */
    public prepareChangeDescription():  Omit<ChangeDescription, "meta"> | undefined {


        // Project the point onto the way
        console.log("Snapping a node onto an existing way...")
        const geojson = this._snapOnto.asGeoJson()
        const projected = GeoOperations.nearestPoint(GeoOperations.outerRing(geojson), [
            this._lon,
            this._lat,
        ])
        const projectedCoor = <[number, number]>projected.geometry.coordinates
        const index = projected.properties.index
        console.log("Attempting to snap:", { geojson, projected, projectedCoor, index })
        // We check that it isn't close to an already existing point
        let reusedPointId = undefined
        let reusedPointCoordinates: [number, number] = undefined
        let outerring: [number, number][]

        if (geojson.geometry.type === "LineString") {
            outerring = <[number, number][]>geojson.geometry.coordinates
        } else if (geojson.geometry.type === "Polygon") {
            outerring = <[number, number][]>geojson.geometry.coordinates[0]
        }

        const prev = outerring[index]
        if (GeoOperations.distanceBetween(prev, projectedCoor) < this._options.reusePointWithinMeters) {
            // We reuse this point instead!
            reusedPointId = this._snapOnto.nodes[index]
            reusedPointCoordinates = this._snapOnto.coordinates[index]
        }
        const next = outerring[index + 1]
        if (GeoOperations.distanceBetween(next, projectedCoor) < this._options.reusePointWithinMeters) {
            // We reuse this point instead!
            reusedPointId = this._snapOnto.nodes[index + 1]
            reusedPointCoordinates = this._snapOnto.coordinates[index + 1]
        }
        if (reusedPointId !== undefined) {
            return undefined
        }

        const locations = [
            ...this._snapOnto.coordinates?.map(([lat, lon]) => <[number, number]>[lon, lat]),
        ]
        const ids = [...this._snapOnto.nodes]

        locations.splice(index + 1, 0, [this._lon, this._lat])
        ids.splice(index + 1, 0, this._idToInsert)

        return  {
            type: "way",
            id: this._snapOnto.id,
            changes: {
                coordinates: locations,
                nodes: ids,
            }
        }

    }

}
