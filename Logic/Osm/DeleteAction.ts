import {UIEventSource} from "../UIEventSource";
import {Translation} from "../../UI/i18n/Translation";
import Translations from "../../UI/i18n/Translations";
import {OsmObject} from "./OsmObject";
import State from "../../State";
import Constants from "../../Models/Constants";

export default class DeleteAction {

    public readonly canBeDeleted: UIEventSource<{ canBeDeleted?: boolean, reason: Translation }>;
    private readonly _id: string;

    constructor(id: string) {
        this._id = id;

        this.canBeDeleted = new UIEventSource<{canBeDeleted?: boolean; reason: Translation}>({
            canBeDeleted : false,
            reason: Translations.t.delete.loading
        })
        
        this.CheckDeleteability()
    }


    public DoDelete(reason: string): UIEventSource<boolean> {
        const isDeleted = new UIEventSource<boolean>(false)

        const self = this;
        let deletionStarted = false;
        this.canBeDeleted.addCallbackAndRun(
            canBeDeleted => {
                if (!canBeDeleted) {
                    // We are not allowed to delete (yet), this might change in the future though
                    return;
                }

                if (isDeleted.data) {
                    // Already deleted...
                    return;
                }

                if (deletionStarted) {
                    // Deletion is already running...
                    return;
                }
                deletionStarted = true;
                OsmObject.DownloadObject(self._id).addCallbackAndRun(obj => {
                    if(obj === undefined){
                        return;
                    }
                    State.state.osmConnection.changesetHandler.DeleteElement(
                        obj,
                        State.state.layoutToUse.data,
                        reason,
                        State.state.allElements,
                        () => {
                            isDeleted.setData(true)
                        }
                    )
                })
              
            }
        )

        return isDeleted;
    }

    /**
     * Checks if the currently logged in user can delete the current point.
     * State is written into this._canBeDeleted
     * @constructor
     * @private
     */
    private CheckDeleteability(): void {
        const t = Translations.t.delete;
        const id = this._id;
        const state = this.canBeDeleted
        if (!id.startsWith("node")) {
            this.canBeDeleted.setData({
                canBeDeleted: false,
                reason: t.isntAPoint
            })
            return;
        }

        // Does the currently logged in user have enough experience to delete this point?

        const deletingPointsOfOtherAllowed = State.state.osmConnection.userDetails.map(ud => {
            if (ud === undefined) {
                return undefined;
            }
            if(!ud.loggedIn){
                return false;
            }
            return ud.csCount >= Constants.userJourney.deletePointsOfOthersUnlock;
        })

        const previousEditors = new UIEventSource<number[]>(undefined)

        const allByMyself = previousEditors.map(previous => {
            if (previous === null || previous === undefined) {
                // Not yet downloaded
                return null;
            }
            const userId = State.state.osmConnection.userDetails.data.uid;
            return !previous.some(editor => editor !== userId)
        }, [State.state.osmConnection.userDetails])


        // User allowed OR only edited by self?
        const deletetionAllowed = deletingPointsOfOtherAllowed.map(isAllowed => {
            if (isAllowed === undefined) {
                // No logged in user => definitively not allowed to delete!
                return false;
            }
            if (isAllowed === true) {
                return true;
            }

            // At this point, the logged in user is not allowed to delete points created/edited by _others_
            // however, we query OSM and if it turns out the current point has only be edited by the current user, deletion is allowed after all!

            if (allByMyself.data === null) {
                // We kickoff the download here as it hasn't yet been downloaded. Note that this is mapped onto 'all by myself' above
                OsmObject.DownloadHistory(id).map(versions => versions.map(version => version.tags["_last_edit:contributor:uid"])).syncWith(previousEditors)
            }
            if (allByMyself.data === true) {
                // Yay! We can download!
                return true;
            }
            if (allByMyself.data === false) {
                // Nope, downloading not allowed...
                return false;
            }


            // At this point, we don't have enough information yet to decide if the user is allowed to delete the current point...
            return undefined;
        }, [allByMyself])


        const hasRelations: UIEventSource<boolean> = new UIEventSource<boolean>(null)
        const hasWays: UIEventSource<boolean> = new UIEventSource<boolean>(null)
        deletetionAllowed.addCallbackAndRunD(deletetionAllowed => {
            
            if (deletetionAllowed === false) {
                // Nope, we are not allowed to delete
                state.setData({
                    canBeDeleted: false,
                    reason: t.notEnoughExperience
                })
                return;
            }


            // All right! We have arrived at a point that we should query OSM again to check that the point isn't a part of ways or relations
            OsmObject.DownloadReferencingRelations(id).addCallbackAndRunD(rels => {
                hasRelations.setData(rels.length > 0)
            })

            OsmObject.DownloadReferencingWays(id).addCallbackAndRunD(ways => {
                hasWays.setData(ways.length > 0)
            })
        })


        const hasWaysOrRelations = hasRelations.map(hasRelationsData => {
            if (hasRelationsData === true) {
                return true;
            }
            if (hasWays.data === true) {
                return true;
            }
            if (hasWays.data === false && hasRelationsData === false) {
                return false;
            }
            return null;
        }, [hasWays])

        hasWaysOrRelations.addCallbackAndRun(
            waysOrRelations => {
                if (waysOrRelations == null) {
                    // Not yet loaded - we still wait a little bit
                    return;
                }
                if (waysOrRelations) {
                    // not deleteble by mapcomplete
                    state.setData({
                        canBeDeleted: false,
                        reason: t.partOfOthers
                    })
                }

                // alright, this point can be safely deleted!
                state.setData({
                    canBeDeleted: true,
                    reason: allByMyself.data === true ? t.onlyEditedByLoggedInUser : t.safeDelete
                })

            }
        )


    }


}