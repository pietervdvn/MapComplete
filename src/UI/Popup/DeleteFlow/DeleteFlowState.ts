import { Translation } from "../../i18n/Translation"
import OsmObjectDownloader from "../../../Logic/Osm/OsmObjectDownloader"
import { UIEventSource } from "../../../Logic/UIEventSource"
import { OsmId } from "../../../Models/OsmFeature"
import { OsmConnection } from "../../../Logic/Osm/OsmConnection"
import { SpecialVisualizationState } from "../../SpecialVisualization"
import Translations from "../../i18n/Translations"
import Constants from "../../../Models/Constants"

export class DeleteFlowState {
    public readonly canBeDeleted: UIEventSource<boolean | undefined> = new UIEventSource<
        boolean | undefined
    >(undefined)
    public readonly canBeDeletedReason: UIEventSource<Translation | undefined> =
        new UIEventSource<Translation>(undefined)
    private readonly objectDownloader: OsmObjectDownloader
    private readonly _id: OsmId
    private readonly _allowDeletionAtChangesetCount: number
    private readonly _osmConnection: OsmConnection
    private readonly state: SpecialVisualizationState

    constructor(
        id: OsmId,
        state: SpecialVisualizationState,
        allowDeletionAtChangesetCount?: number
    ) {
        this.state = state
        this.objectDownloader = state.osmObjectDownloader
        this._id = id
        this._osmConnection = state.osmConnection
        this._allowDeletionAtChangesetCount = allowDeletionAtChangesetCount ?? Number.MAX_VALUE

        this.CheckDeleteability(false)
    }

    /**
     * Checks if the currently logged in user can delete the current point.
     * State is written into this._canBeDeleted
     * @constructor
     * @private
     */
    public CheckDeleteability(useTheInternet: boolean): void {
        console.log("Checking deleteability (internet?", useTheInternet, ")")
        const t = Translations.t.delete
        const id = this._id
        if (!id.startsWith("node")) {
            this.canBeDeleted.setData(false)
            this.canBeDeletedReason.setData(t.isntAPoint)
            return
        }

        // Does the currently logged-in user have enough experience to delete this point?
        const deletingPointsOfOtherAllowed = this._osmConnection.userDetails.map((ud) => {
            if (ud === undefined) {
                return undefined
            }
            if (!ud.loggedIn) {
                return false
            }
            return (
                ud.csCount >=
                Math.min(
                    Constants.userJourney.deletePointsOfOthersUnlock,
                    this._allowDeletionAtChangesetCount
                )
            )
        })

        const previousEditors = new UIEventSource<number[]>(undefined)
        const allByMyself = previousEditors.map(
            (previous) => {
                if (previous === null || previous === undefined) {
                    // Not yet downloaded
                    return null
                }
                const userId = this._osmConnection.userDetails.data.uid
                return !previous.some((editor) => editor !== userId)
            },
            [this._osmConnection.userDetails]
        )

        // User allowed OR only edited by self?
        const deletetionAllowed = deletingPointsOfOtherAllowed.map(
            (isAllowed) => {
                if (isAllowed === undefined) {
                    // No logged in user => definitively not allowed to delete!
                    return false
                }
                if (isAllowed === true) {
                    return true
                }

                // At this point, the logged in user is not allowed to delete points created/edited by _others_
                // however, we query OSM and if it turns out the current point has only be edited by the current user, deletion is allowed after all!

                if (allByMyself.data === null && useTheInternet) {
                    // We kickoff the download here as it hasn't yet been downloaded. Note that this is mapped onto 'all by myself' above
                    UIEventSource.FromPromise(this.objectDownloader
                        .downloadHistory(id))
                        .mapD((versions) =>
                            versions.map((version) =>
                                Number(version.tags["_last_edit:contributor:uid"])
                            )
                        ).addCallbackAndRunD((hist) => previousEditors.setData(hist))
                }

                if (allByMyself.data === true) {
                    // Yay! We can download!
                    return true
                }
                if (allByMyself.data === false) {
                    // Nope, downloading not allowed...
                    return false
                }

                // At this point, we don't have enough information yet to decide if the user is allowed to delete the current point...
                return undefined
            },
            [allByMyself]
        )

        const hasRelations: UIEventSource<boolean> = new UIEventSource<boolean>(null)
        const hasWays: UIEventSource<boolean> = new UIEventSource<boolean>(null)
        deletetionAllowed.addCallbackAndRunD((deletetionAllowed) => {
            if (deletetionAllowed === false) {
                // Nope, we are not allowed to delete

                this.canBeDeleted.setData(false)
                this.canBeDeletedReason.setData(t.notEnoughExperience)
                return true // unregister this caller!
            }

            if (!useTheInternet) {
                return
            }

            // All right! We have arrived at a point that we should query OSM again to check that the point isn't a part of ways or relations
            this.objectDownloader.DownloadReferencingRelations(id).then((rels) => {
                hasRelations.setData(rels.length > 0)
            })

            this.objectDownloader.DownloadReferencingWays(id).then((ways) => {
                hasWays.setData(ways.length > 0)
            })
            return true // unregister to only run once
        })

        const hasWaysOrRelations = hasRelations.map(
            (hasRelationsData) => {
                if (hasRelationsData === true) {
                    return true
                }
                if (hasWays.data === true) {
                    return true
                }
                if (hasWays.data === null || hasRelationsData === null) {
                    return null
                }
                if (hasWays.data === false && hasRelationsData === false) {
                    return false
                }
                return null
            },
            [hasWays]
        )

        hasWaysOrRelations.addCallbackAndRun((waysOrRelations) => {
            if (waysOrRelations == null) {
                // Not yet loaded - we still wait a little bit
                return
            }
            if (waysOrRelations) {
                // not deleteable by mapcomplete
                this.canBeDeleted.setData(false)
                this.canBeDeletedReason.setData(t.partOfOthers)
            } else {
                // alright, this point can be safely deleted!
                this.canBeDeleted.setData(true)
                this.canBeDeletedReason.setData(
                    allByMyself.data ? t.onlyEditedByLoggedInUser : t.safeDelete
                )
            }
        })
    }
}
