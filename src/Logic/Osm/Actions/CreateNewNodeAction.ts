import { Tag } from "../../Tags/Tag"
import { OsmCreateAction } from "./OsmChangeAction"
import { Changes } from "../Changes"
import { ChangeDescription } from "./ChangeDescription"
import { And } from "../../Tags/And"
import { OsmWay } from "../OsmObject"
import { GeoOperations } from "../../GeoOperations"
import InsertPointIntoWayAction from "./InsertPointIntoWayAction"

export default class CreateNewNodeAction extends OsmCreateAction {
    /**
     * Maps previously created points onto their assigned ID, to reuse the point if uplaoded
     * "lat,lon" --> id
     */
    private static readonly previouslyCreatedPoints = new Map<string, number>()
    public newElementId: string = undefined
    public newElementIdNumber: number = undefined
    private readonly _basicTags: Tag[]
    private readonly _lat: number
    private readonly _lon: number
    private readonly _snapOnto: OsmWay
    private readonly _reusePointDistance: number
    private readonly meta: {
        changeType: "create" | "import"
        theme: string
        specialMotivation?: string
    }
    private readonly _reusePreviouslyCreatedPoint: boolean

    constructor(
        basicTags: Tag[],
        lat: number,
        lon: number,
        options: {
            allowReuseOfPreviouslyCreatedPoints?: boolean
            snapOnto?: OsmWay
            reusePointWithinMeters?: number
            theme: string
            changeType: "create" | "import" | null
            specialMotivation?: string
        }
    ) {
        super(null, basicTags !== undefined && basicTags.length > 0)
        this._basicTags = basicTags
        this._lat = lat
        this._lon = lon
        if (lat === undefined || lon === undefined) {
            throw "Lat or lon are undefined!"
        }
        this._snapOnto = options?.snapOnto
        this._reusePointDistance = options?.reusePointWithinMeters ?? 1
        this._reusePreviouslyCreatedPoint =
            options?.allowReuseOfPreviouslyCreatedPoints ?? basicTags.length === 0
        this.meta = {
            theme: options.theme,
            changeType: options.changeType,
            specialMotivation: options.specialMotivation,
        }
    }

    async CreateChangeDescriptions(changes: Changes): Promise<ChangeDescription[]> {
        if (this._reusePreviouslyCreatedPoint) {
            const key = this._lat + "," + this._lon
            const prev = CreateNewNodeAction.previouslyCreatedPoints
            if (prev.has(key)) {
                this.newElementIdNumber = prev.get(key)
                this.newElementId = "node/" + this.newElementIdNumber
                return []
            }
        }

        const id = changes.getNewID()
        const properties = {
            id: "node/" + id,
        }
        this.setElementId(id)
        for (const kv of this._basicTags) {
            if (typeof kv.value !== "string") {
                throw (
                    "Invalid value: don't use non-string value in a preset. The tag " +
                    kv.key +
                    "=" +
                    kv.value +
                    " is not a string, the value is a " +
                    typeof kv.value
                )
            }
            properties[kv.key] = kv.value
        }

        const newPointChange: ChangeDescription = {
            tags: new And(this._basicTags).asChange(properties),
            type: "node",
            id: id,
            changes: {
                lat: this._lat,
                lon: this._lon,
            },
            meta: this.meta,
        }
        if (this._snapOnto?.coordinates === undefined) {
            return [newPointChange]
        }

        const change = new InsertPointIntoWayAction(this._lat, this._lon, id, this._snapOnto, {
            reusePointWithinMeters: this._reusePointDistance,
            allowReuseOfPreviouslyCreatedPoints: this._reusePreviouslyCreatedPoint,
        }).prepareChangeDescription()

        return [newPointChange, { ...change, meta: this.meta }]
    }

    private setElementId(id: number) {
        this.newElementIdNumber = id
        this.newElementId = "node/" + id
        if (!this._reusePreviouslyCreatedPoint) {
            return
        }
        const key = this._lat + "," + this._lon
        CreateNewNodeAction.previouslyCreatedPoints.set(key, id)
    }
}
