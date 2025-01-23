import ImportFlow, { ImportFlowArguments } from "./ImportFlow"
import { Store, UIEventSource } from "../../../Logic/UIEventSource"
import { OsmObject, OsmWay } from "../../../Logic/Osm/OsmObject"
import CreateNewNodeAction from "../../../Logic/Osm/Actions/CreateNewNodeAction"
import { Feature, Point } from "geojson"
import Maproulette from "../../../Logic/Maproulette"
import { GeoOperations } from "../../../Logic/GeoOperations"
import { Tag } from "../../../Logic/Tags/Tag"
import ThemeViewState from "../../../Models/ThemeViewState"

export interface PointImportFlowArguments extends ImportFlowArguments {
    max_snap_distance?: string
    snap_onto_layers?: string
    icon?: string
    targetLayer: string
    note_id?: string
    maproulette_id?: string
}

export class PointImportFlowState extends ImportFlow<PointImportFlowArguments> {
    public readonly startCoordinate: [number, number]

    constructor(
        state: ThemeViewState,
        originalFeature: Feature<Point>,
        args: PointImportFlowArguments,
        tagsToApply: Store<Tag[]>,
        originalFeatureTags: UIEventSource<Record<string, string>>
    ) {
        super(state, args, tagsToApply, originalFeatureTags)
        this.startCoordinate = GeoOperations.centerpointCoordinates(originalFeature)
    }

    /**
     * Creates a new point on OSM, closes (if applicable) the OSM-note or the MapRoulette-challenge
     *
     * Gives back the id of the newly created element
     */

    async onConfirm(
        location: { lat: number; lon: number },
        snapOntoWayId: string
    ): Promise<string> {
        const tags = this.tagsToApply.data
        const originalFeatureTags = this._originalFeatureTags
        originalFeatureTags.data["_imported"] = "yes"
        originalFeatureTags.ping() // will set isImported as per its definition
        let snapOnto: OsmObject | "deleted" = undefined
        if (snapOntoWayId !== undefined) {
            snapOnto = await this.state.osmObjectDownloader.DownloadObjectAsync(snapOntoWayId)
        }
        if (snapOnto === "deleted") {
            snapOnto = undefined
        }
        let specialMotivation = undefined

        let note_id = this.args.note_id
        if (note_id !== undefined && isNaN(Number(note_id))) {
            note_id = originalFeatureTags.data[this.args.note_id]
            specialMotivation = "source: https://osm.org/note/" + note_id
        }

        const newElementAction = new CreateNewNodeAction(tags, location.lat, location.lon, {
            theme: this.state.theme.id,
            changeType: "import",
            snapOnto: <OsmWay>snapOnto,
            specialMotivation: specialMotivation,
        })

        await this.state.changes.applyAction(newElementAction)
        this.state.selectedElement.setData(
            this.state.indexedFeatures.featuresById.data.get(newElementAction.newElementId)
        )

        if (note_id !== undefined) {
            await this.state.osmConnection.closeNote(note_id, "imported")
            originalFeatureTags.data["closed_at"] = new Date().toISOString()
            originalFeatureTags.ping()
        }

        const maproulette_id = originalFeatureTags.data[this.args.maproulette_id]
        if (maproulette_id !== undefined) {
            if (this.state.featureSwitchIsTesting.data) {
                console.log(
                    "Not marking maproulette task " +
                        maproulette_id +
                        " as fixed, because we are in testing mode"
                )
            } else {
                console.log("Marking maproulette task as fixed")
                await Maproulette.singleton.closeTask(
                    Number(maproulette_id),
                    Maproulette.STATUS_FIXED,
                    this.state
                )
                originalFeatureTags.data["mr_taskStatus"] = "Fixed"
                originalFeatureTags.ping()
            }
        }
        this.state.mapProperties.location.setData(location)
        return newElementAction.newElementId
    }
}
