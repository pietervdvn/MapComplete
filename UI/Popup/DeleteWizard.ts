import {VariableUiElement} from "../Base/VariableUIElement";
import State from "../../State";
import Toggle from "../Input/Toggle";
import Translations from "../i18n/Translations";
import Svg from "../../Svg";
import DeleteAction from "../../Logic/Osm/Actions/DeleteAction";
import {UIEventSource} from "../../Logic/UIEventSource";
import {TagsFilter} from "../../Logic/Tags/TagsFilter";
import TagRenderingQuestion from "./TagRenderingQuestion";
import Combine from "../Base/Combine";
import {SubtleButton} from "../Base/SubtleButton";
import {FixedUiElement} from "../Base/FixedUiElement";
import {Translation} from "../i18n/Translation";
import BaseUIElement from "../BaseUIElement";
import Constants from "../../Models/Constants";
import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig";
import {AndOrTagConfigJson} from "../../Models/ThemeConfig/Json/TagConfigJson";
import DeleteConfig from "../../Models/ThemeConfig/DeleteConfig";
import {OsmObject} from "../../Logic/Osm/OsmObject";

export default class DeleteWizard extends Toggle {
    /**
     * The UI-element which triggers 'deletion' (either soft or hard).
     *
     * - A 'hard deletion' is if the point is actually deleted from the OSM database
     * - A 'soft deletion' is if the point is not deleted, but the tagging is modified which will result in the point not being picked up by the filters anymore.
     *    Apart having needing theme-specific tags added (which must be supplied by the theme creator), fixme='marked for deletion' will be added too
     *
     * A deletion is only possible if the user is logged in.
     * A soft deletion is only possible if tags are provided
     * A hard deletion is only possible if the user has sufficient rigts
     *
     * There is also the possibility to have a 'trojan horse' option. If the user selects that option, it is NEVER removed, but the tags are applied.
     * Ideal for the case of "THIS PATH IS ON MY GROUND AND SHOULD BE DELETED IMMEDIATELY OR I WILL GET MY LAWYER" but to mark it as private instead.
     * (Note that _delete_reason is used as trigger to do actual deletion - setting such a tag WILL delete from the database with that as changeset comment)
     *
     * @param id: The id of the element to remove
     * @param options softDeletionTags: the tags to apply if the user doesn't have permission to delete, e.g. 'disused:amenity=public_bookcase', 'amenity='. After applying, the element should not be picked up on the map anymore. If undefined, the wizard will only show up if the point can be (hard) deleted
     */
    constructor(id: string,
                options: DeleteConfig) {

        const deleteAbility = new DeleteabilityChecker(id, options.neededChangesets)
        const tagsSource = State.state.allElements.getEventSourceById(id)

        const isDeleted = new UIEventSource(false)
        const allowSoftDeletion = !!options.softDeletionTags

        const confirm = new UIEventSource<boolean>(false)


        function doDelete(selected: TagsFilter) {
            // Selected == the reasons, not the tags of the object
            const tgs = selected.asChange(tagsSource.data)
            const deleteReasonMatch = tgs.filter(kv => kv.k === "_delete_reason")
            if (deleteReasonMatch.length === 0) {
                return;
            }
            const deleteAction = new DeleteAction(id,
                options.softDeletionTags,
                {
                    theme: State.state?.layoutToUse?.id ?? "unkown",
                    specialMotivation: deleteReasonMatch[0]?.v
                },
                deleteAbility.canBeDeleted.data.canBeDeleted
            )
            State.state.changes.applyAction(deleteAction)
            isDeleted.setData(true)

        }


        const t = Translations.t.delete
        const cancelButton = t.cancel.Clone().SetClass("block btn btn-secondary").onClick(() => confirm.setData(false));
        const question = new VariableUiElement(tagsSource.map(currentTags => {
            const config = DeleteWizard.generateDeleteTagRenderingConfig(options.softDeletionTags, options.nonDeleteMappings, options.extraDeleteReasons, currentTags)
            return new TagRenderingQuestion(
                tagsSource,
                config,
                {
                    cancelButton: cancelButton,
                    /*Using a custom save button constructor erases all logic to actually save, so we have to listen for the click!*/
                    saveButtonConstr: (v) => DeleteWizard.constructConfirmButton(v).onClick(() => {
                        doDelete(v.data)
                    }),
                    bottomText: (v) => DeleteWizard.constructExplanation(v, deleteAbility)
                }
            )
        }))


        /**
         * The button which is shown first. Opening it will trigger the check for deletions
         */
        const deleteButton = new SubtleButton(
            Svg.delete_icon_ui().SetStyle("width: auto; height: 1.5rem;"), t.delete.Clone()).onClick(
            () => {
                deleteAbility.CheckDeleteability(true)
                confirm.setData(true);
            }
        )

        const isShown = new UIEventSource<boolean>(id.indexOf("-") < 0)

        super(
            new Toggle(
                new Combine([Svg.delete_icon_svg().SetClass("h-16 w-16 p-2 m-2 block bg-gray-300 rounded-full"),
                    t.isDeleted.Clone()]).SetClass("flex m-2 rounded-full"),
                new Toggle(
                    new Toggle(
                        new Toggle(
                            new Toggle(
                                question,
                                new SubtleButton(Svg.envelope_ui(), t.readMessages.Clone()),
                                State.state.osmConnection.userDetails.map(ud => ud.csCount > Constants.userJourney.addNewPointWithUnreadMessagesUnlock || ud.unreadMessages == 0)
                            ),

                            deleteButton,
                            confirm),
                        new VariableUiElement(deleteAbility.canBeDeleted.map(cbd => new Combine([cbd.reason.Clone(), t.useSomethingElse.Clone()]))),
                        deleteAbility.canBeDeleted.map(cbd => allowSoftDeletion || cbd.canBeDeleted !== false)),

                    t.loginToDelete.Clone().onClick(State.state.osmConnection.AttemptLogin),
                    State.state.osmConnection.isLoggedIn
                ),
                isDeleted),
            undefined,
            isShown)

    }


    private static constructConfirmButton(deleteReasons: UIEventSource<TagsFilter>): BaseUIElement {
        const t = Translations.t.delete;
        const btn = new Combine([
            Svg.delete_icon_ui().SetClass("w-6 h-6 mr-3 block"),
            t.delete.Clone()
        ]).SetClass("flex btn bg-red-500")


        const btnNonActive = new Combine([
            Svg.delete_icon_ui().SetClass("w-6 h-6 mr-3 block"),
            t.delete.Clone()
        ]).SetClass("flex btn btn-disabled bg-red-200")

        return new Toggle(
            btn,
            btnNonActive,
            deleteReasons.map(reason => reason !== undefined)
        )

    }


    private static constructExplanation(tags: UIEventSource<TagsFilter>, deleteAction: DeleteabilityChecker) {
        const t = Translations.t.delete;
        return new VariableUiElement(tags.map(
            currentTags => {
                const cbd = deleteAction.canBeDeleted.data;
                if (currentTags === undefined) {
                    return t.explanations.selectReason.Clone().SetClass("subtle");
                }

                const hasDeletionTag = currentTags.asChange(currentTags).some(kv => kv.k === "_delete_reason")

                if (cbd.canBeDeleted && hasDeletionTag) {
                    return t.explanations.hardDelete.Clone()
                }
                return new Combine([t.explanations.softDelete.Subs({reason: cbd.reason}),
                    new FixedUiElement(currentTags.asHumanString(false, true, currentTags)).SetClass("subtle")
                ]).SetClass("flex flex-col")


            }
            , [deleteAction.canBeDeleted]
        )).SetClass("block")
    }

    private static generateDeleteTagRenderingConfig(softDeletionTags: TagsFilter,
                                                    nonDeleteOptions: { if: TagsFilter; then: Translation }[],
                                                    extraDeleteReasons: { explanation: Translation; changesetMessage: string }[],
                                                    currentTags: any) {
        const t = Translations.t.delete
        nonDeleteOptions = nonDeleteOptions ?? []
        let softDeletionTagsStr = []
        if (softDeletionTags !== undefined) {
            softDeletionTags.asChange(currentTags)
        }
        const extraOptionsStr: { if: AndOrTagConfigJson, then: any }[] = []
        for (const nonDeleteOption of nonDeleteOptions) {
            const newIf: string[] = nonDeleteOption.if.asChange({}).map(kv => kv.k + "=" + kv.v)

            extraOptionsStr.push({
                if: {and: newIf},
                then: nonDeleteOption.then
            })
        }

        for (const extraDeleteReason of (extraDeleteReasons ?? [])) {
            extraOptionsStr.push({
                if: {and: ["_delete_reason=" + extraDeleteReason.changesetMessage]},
                then: extraDeleteReason.explanation
            })
        }
        return new TagRenderingConfig(
            {
                question: t.whyDelete,
                render: "Deleted because {_delete_reason}",
                freeform: {
                    key: "_delete_reason",
                    addExtraTags: softDeletionTagsStr
                },
                mappings: [

                    ...extraOptionsStr,

                    {
                        if: {
                            and: [
                                "_delete_reason=testing point",
                                ...softDeletionTagsStr
                            ]
                        },
                        then: t.reasons.test
                    },
                    {
                        if: {
                            and: [
                                "_delete_reason=disused",
                                ...softDeletionTagsStr
                            ]
                        },
                        then: t.reasons.disused
                    },
                    {
                        if: {
                            and: [
                                "_delete_reason=not found",
                                ...softDeletionTagsStr
                            ]
                        },
                        then: t.reasons.notFound
                    }
                ]


            }, undefined, "Delete wizard"
        )
    }

}

class DeleteabilityChecker {

    public readonly canBeDeleted: UIEventSource<{ canBeDeleted?: boolean, reason: Translation }>;
    private readonly _id: string;
    private readonly _allowDeletionAtChangesetCount: number;


    constructor(id: string,
                allowDeletionAtChangesetCount?: number) {
        this._id = id;
        this._allowDeletionAtChangesetCount = allowDeletionAtChangesetCount ?? Number.MAX_VALUE;

        this.canBeDeleted = new UIEventSource<{ canBeDeleted?: boolean; reason: Translation }>({
            canBeDeleted: undefined,
            reason: Translations.t.delete.loading
        })
        this.CheckDeleteability(false)
    }

    /**
     * Checks if the currently logged in user can delete the current point.
     * State is written into this._canBeDeleted
     * @constructor
     * @private
     */
    public CheckDeleteability(useTheInternet: boolean): void {
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
            if (!ud.loggedIn) {
                return false;
            }
            return ud.csCount >= Math.min(Constants.userJourney.deletePointsOfOthersUnlock, this._allowDeletionAtChangesetCount);
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

            if (allByMyself.data === null && useTheInternet) {
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
                return true; // unregister this caller!
            }

            if (!useTheInternet) {
                return;
            }

            // All right! We have arrived at a point that we should query OSM again to check that the point isn't a part of ways or relations
            OsmObject.DownloadReferencingRelations(id).then(rels => {
                hasRelations.setData(rels.length > 0)
            })

            OsmObject.DownloadReferencingWays(id).then(ways => {
                hasWays.setData(ways.length > 0)
            })
            return true; // unregister to only run once
        })


        const hasWaysOrRelations = hasRelations.map(hasRelationsData => {
            if (hasRelationsData === true) {
                return true;
            }
            if (hasWays.data === true) {
                return true;
            }
            if (hasWays.data === null || hasRelationsData === null) {
                return null;
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
                } else {
                    // alright, this point can be safely deleted!
                    state.setData({
                        canBeDeleted: true,
                        reason: allByMyself.data === true ? t.onlyEditedByLoggedInUser : t.safeDelete
                    })
                }


            }
        )


    }


}