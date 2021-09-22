import {Tag} from "../../Tags/Tag";
import OsmChangeAction from "./OsmChangeAction";
import {Changes} from "../Changes";
import {ChangeDescription} from "./ChangeDescription";
import {And} from "../../Tags/And";
import {OsmWay} from "../OsmObject";
import {GeoOperations} from "../../GeoOperations";

export default class CreateNewNodeAction extends OsmChangeAction {

    public newElementId: string = undefined
    private readonly _basicTags: Tag[];
    private readonly _lat: number;
    private readonly _lon: number;
    private readonly _snapOnto: OsmWay;
    private readonly _reusePointDistance: number;

    constructor(basicTags: Tag[], lat: number, lon: number, options?: { snapOnto: OsmWay, reusePointWithinMeters?: number }) {
        super()
        this._basicTags = basicTags;
        this._lat = lat;
        this._lon = lon;
        if (lat === undefined || lon === undefined) {
            throw "Lat or lon are undefined!"
        }
        this._snapOnto = options?.snapOnto;
        this._reusePointDistance = options.reusePointWithinMeters ?? 1
    }

    CreateChangeDescriptions(changes: Changes): ChangeDescription[] {
        const id = changes.getNewID()
        const properties = {
            id: "node/" + id
        }
        this.newElementId = "node/" + id
        for (const kv of this._basicTags) {
            if (typeof kv.value !== "string") {
                throw "Invalid value: don't use a regex in a preset"
            }
            properties[kv.key] = kv.value;
        }

        const newPointChange: ChangeDescription = {
            tags: new And(this._basicTags).asChange(properties),
            type: "node",
            id: id,
            changes: {
                lat: this._lat,
                lon: this._lon
            }
        }
        if (this._snapOnto === undefined) {
            return [newPointChange]
        }


        // Project the point onto the way

        const geojson = this._snapOnto.asGeoJson()
        const projected = GeoOperations.nearestPoint(geojson, [this._lon, this._lat])
        const index = projected.properties.index
        // We check that it isn't close to an already existing point
        let reusedPointId = undefined;
        const prev = <[number, number]>geojson.geometry.coordinates[index]
        if (GeoOperations.distanceBetween(prev, <[number, number]>projected.geometry.coordinates) * 1000 < this._reusePointDistance) {
            // We reuse this point instead!
            reusedPointId = this._snapOnto.nodes[index]
        }
        const next = <[number, number]>geojson.geometry.coordinates[index + 1]
        if (GeoOperations.distanceBetween(next, <[number, number]>projected.geometry.coordinates) * 1000 < this._reusePointDistance) {
            // We reuse this point instead!
            reusedPointId = this._snapOnto.nodes[index + 1]
        }
        if (reusedPointId !== undefined) {
            console.log("Reusing an existing point:", reusedPointId)
            this.newElementId = "node/" + reusedPointId

            return [{
                tags: new And(this._basicTags).asChange(properties),
                type: "node",
                id: reusedPointId
            }]
        }

        const locations = [...this._snapOnto.coordinates]
        locations.forEach(coor => coor.reverse())
        console.log("Locations are: ", locations)
        const ids = [...this._snapOnto.nodes]

        locations.splice(index + 1, 0, [this._lon, this._lat])
        ids.splice(index + 1, 0, id)

        // Allright, we have to insert a new point in the way
        return [
            newPointChange,
            {
                type: "way",
                id: this._snapOnto.id,
                changes: {
                    locations: locations,
                    nodes: ids
                }
            }
        ]
    }


}