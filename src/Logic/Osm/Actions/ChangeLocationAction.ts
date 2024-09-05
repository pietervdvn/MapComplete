import { ChangeDescription } from "./ChangeDescription"
import OsmChangeAction from "./OsmChangeAction"
import { WayId } from "../../../Models/OsmFeature"
import InsertPointIntoWayAction from "./InsertPointIntoWayAction"
import { SpecialVisualizationState } from "../../../UI/SpecialVisualization"

export default class ChangeLocationAction extends OsmChangeAction {
    private readonly _id: number
    private readonly _newLonLat: [number, number]
    private readonly _meta: { theme: string; reason: string }
    private readonly state: SpecialVisualizationState
    private snapTo: WayId | undefined
    static metatags: {
        readonly key?: string
        readonly value?: string
        readonly docs: string
        readonly changeType: string[]
        readonly specialMotivation?: boolean
    }[] = [
        {
            value: "relocated|improve_accuraccy|...",
            docs: "Will appear if the point has been moved",
            changeType: ["move"],
            specialMotivation: true,
        },
    ]

    constructor(
        state: SpecialVisualizationState,
        id: string,
        newLonLat: [number, number],
        snapTo: WayId | undefined,
        meta: {
            theme: string
            reason: string
        },
    ) {
        super(id, true)
        this.state = state
        if (!id.startsWith("node/")) {
            throw "Invalid ID: only 'node/number' is accepted"
        }
        this._id = Number(id.substring("node/".length))
        this._newLonLat = newLonLat
        this.snapTo = snapTo
        this._meta = meta
    }

    protected async CreateChangeDescriptions(): Promise<ChangeDescription[]> {
        const [lon, lat] = this._newLonLat
        const d: ChangeDescription = {
            changes: { lon, lat },
            type: "node",
            id: this._id,
            meta: {
                changeType: "move",
                theme: this._meta.theme,
                specialMotivation: this._meta.reason,
            },
        }
        if (!this.snapTo) {
            return [d]
        }
        const snapToWay = await this.state.osmObjectDownloader.DownloadObjectAsync(this.snapTo, 0)
        if (snapToWay === "deleted") {
            return [d]
        }

        const insertIntoWay = new InsertPointIntoWayAction(
            lat, lon, this._id, snapToWay, {
                allowReuseOfPreviouslyCreatedPoints: false,
                reusePointWithinMeters: 0.25,
            },
        ).prepareChangeDescription()

        return [d, { ...insertIntoWay, meta: d.meta }]
    }
}
