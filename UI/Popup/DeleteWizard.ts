import {VariableUiElement} from "../Base/VariableUIElement";
import Toggle from "../Input/Toggle";
import Translations from "../i18n/Translations";
import Svg from "../../Svg";
import DeleteAction from "../../Logic/Osm/Actions/DeleteAction";
import {Store, UIEventSource} from "../../Logic/UIEventSource";
import {TagsFilter} from "../../Logic/Tags/TagsFilter";
import Combine from "../Base/Combine";
import {SubtleButton} from "../Base/SubtleButton";
import {Translation} from "../i18n/Translation";
import BaseUIElement from "../BaseUIElement";
import Constants from "../../Models/Constants";
import DeleteConfig from "../../Models/ThemeConfig/DeleteConfig";
import {OsmObject} from "../../Logic/Osm/OsmObject";
import {OsmConnection} from "../../Logic/Osm/OsmConnection";
import OsmChangeAction from "../../Logic/Osm/Actions/OsmChangeAction";
import ChangeTagAction from "../../Logic/Osm/Actions/ChangeTagAction";
import {InputElement} from "../Input/InputElement";
import {RadioButton} from "../Input/RadioButton";
import {FixedInputElement} from "../Input/FixedInputElement";
import Title from "../Base/Title";
import {SubstitutedTranslation} from "../SubstitutedTranslation";
import FeaturePipelineState from "../../Logic/State/FeaturePipelineState";
import TagRenderingQuestion from "./TagRenderingQuestion";

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
     * @param state: the state of the application
     * @param options softDeletionTags: the tags to apply if the user doesn't have permission to delete, e.g. 'disused:amenity=public_bookcase', 'amenity='. After applying, the element should not be picked up on the map anymore. If undefined, the wizard will only show up if the point can be (hard) deleted
     */
    constructor(id: string,
                state: FeaturePipelineState,
                options: DeleteConfig) {


        const deleteAbility = new DeleteabilityChecker(id, state, options.neededChangesets)
        const tagsSource = state.allElements.getEventSourceById(id)

        const isDeleted = new UIEventSource(false)
        const allowSoftDeletion = !!options.softDeletionTags

        const confirm = new UIEventSource<boolean>(false)


        /**
         * This function is the actual delete function
         */
        function doDelete(selected: { deleteReason: string } | { retagTo: TagsFilter }) {
            let actionToTake: OsmChangeAction;
            if (selected["retagTo"] !== undefined) {
                // no _delete_reason is given, which implies that this is _not_ a deletion but merely a retagging via a nonDeleteMapping
                actionToTake = new ChangeTagAction(
                    id,
                    selected["retagTo"],
                    tagsSource.data,
                    {
                        theme: state?.layoutToUse?.id ?? "unkown",
                        changeType: "special-delete"
                    }
                )
            } else {
                
                actionToTake = new DeleteAction(id,
                    options.softDeletionTags,
                    {
                        theme: state?.layoutToUse?.id ?? "unkown",
                        specialMotivation: selected["deleteReason"]
                    },
                    deleteAbility.canBeDeleted.data.canBeDeleted
                )
            }
            state.changes?.applyAction(actionToTake)
            isDeleted.setData(true)

        }


        const t = Translations.t.delete
        const cancelButton = t.cancel.SetClass("block btn btn-secondary").onClick(() => confirm.setData(false));

        /**
         * The button which is shown first. Opening it will trigger the check for deletions
         */
        const deleteButton = new SubtleButton(
            Svg.delete_icon_svg().SetStyle("width: 1.5rem; height: 1.5rem;"), t.delete)
            .onClick(
                () => {
                    deleteAbility.CheckDeleteability(true)
                    confirm.setData(true);
                }
            )

        const isShown: Store<boolean> = tagsSource.map(tgs => tgs.id.indexOf("-") < 0)

        const deleteOptionPicker = DeleteWizard.constructMultipleChoice(options, tagsSource, state);
        const deleteDialog = new Combine([


            new Title(new SubstitutedTranslation(t.whyDelete, tagsSource, state)
                .SetClass("question-text"), 3),
            deleteOptionPicker,
            new Combine([
                DeleteWizard.constructExplanation(deleteOptionPicker.GetValue(), deleteAbility, tagsSource, state),
                new Combine([
                    
                cancelButton,
                DeleteWizard.constructConfirmButton(deleteOptionPicker.GetValue())
                    .onClick(() => doDelete(deleteOptionPicker.GetValue().data))
                ]).SetClass("flex justify-end flex-wrap-reverse")
                
            ]).SetClass("flex mt-2 justify-between")


        ]).SetClass("question")


        super(
            new Toggle(
                new Combine([Svg.delete_icon_svg().SetClass("h-16 w-16 p-2 m-2 block bg-gray-300 rounded-full"),
                    t.isDeleted]).SetClass("flex m-2 rounded-full"),
                new Toggle(
                    new Toggle(
                        new Toggle(
                            new Toggle(
                                deleteDialog,
                                new SubtleButton(Svg.envelope_ui(), t.readMessages),
                                state.osmConnection.userDetails.map(ud => ud.csCount > Constants.userJourney.addNewPointWithUnreadMessagesUnlock || ud.unreadMessages == 0)
                            ),

                            deleteButton,
                            confirm),
                        new VariableUiElement(deleteAbility.canBeDeleted.map(cbd =>

                            new Combine([
                                Svg.delete_not_allowed_svg().SetStyle("height: 2rem; width: auto").SetClass("mr-2"),
                                new Combine([
                                    t.cannotBeDeleted,
                                    cbd.reason.SetClass("subtle"),
                                    t.useSomethingElse.SetClass("subtle")]).SetClass("flex flex-col")
                            ]).SetClass("flex m-2 p-2 rounded-lg bg-gray-200 bg-gray-200")))


                        ,
                        deleteAbility.canBeDeleted.map(cbd => allowSoftDeletion || cbd.canBeDeleted !== false)),

                    t.loginToDelete.onClick(state.osmConnection.AttemptLogin),
                    state.osmConnection.isLoggedIn
                ),
                isDeleted),
            undefined,
            isShown)

    }


    private static constructConfirmButton(deleteReasons: UIEventSource<any | undefined>): BaseUIElement {
        const t = Translations.t.delete;
        const btn = new Combine([
            Svg.delete_icon_ui().SetClass("w-6 h-6 mr-3 block"),
            t.delete
        ]).SetClass("flex btn bg-red-500")


        const btnNonActive = new Combine([
            Svg.delete_icon_ui().SetClass("w-6 h-6 mr-3 block"),
            t.delete
        ]).SetClass("flex btn btn-disabled bg-red-200")

        return new Toggle(
            btn,
            btnNonActive,
            deleteReasons.map(reason => reason !== undefined)
        )

    }


    private static constructExplanation(selectedOption: UIEventSource<
        {deleteReason: string} | {retagTo: TagsFilter}>, deleteAction: DeleteabilityChecker,
                                        currentTags: UIEventSource<object>,
                                        state?: {osmConnection?: OsmConnection}) {
        const t = Translations.t.delete;
        return new VariableUiElement(selectedOption.map(
            selectedOption => {
                if (selectedOption === undefined) {
                    return t.explanations.selectReason.SetClass("subtle");
                }

                const retag: TagsFilter | undefined = selectedOption["retagTo"]
                if(retag !== undefined) {
                    // This is a retagging, not a deletion of any kind
                    return new Combine([t.explanations.retagNoOtherThemes,
                    TagRenderingQuestion.CreateTagExplanation(new UIEventSource<TagsFilter>(retag),
                        currentTags, state
                        ).SetClass("subtle")
                    ])
                }

                const deleteReason = selectedOption["deleteReason"];
                if(deleteReason !== undefined){
                    return new VariableUiElement(deleteAction.canBeDeleted.map(({
                        canBeDeleted, reason
                    }) => {
                        if(canBeDeleted){
                            // This is a hard delete for which we give an explanation
                            return t.explanations.hardDelete;
                        }
                        // This is a soft deletion: we explain _why_ the deletion is soft
                        return  t.explanations.softDelete.Subs({reason: reason})

                    }))
                    
                }
            }
            , [deleteAction.canBeDeleted]
        )).SetClass("block")
    }

    private static constructMultipleChoice(config: DeleteConfig, tagsSource: UIEventSource<Record<string, string>>, state: FeaturePipelineState):
        InputElement<{ deleteReason: string } | { retagTo: TagsFilter }> {

        const elements: InputElement<{ deleteReason: string } | { retagTo: TagsFilter }>[ ] = []

        for (const nonDeleteOption of config.nonDeleteMappings) {
            elements.push(new FixedInputElement(
                new SubstitutedTranslation(nonDeleteOption.then, tagsSource, state),
                {
                    retagTo: nonDeleteOption.if
                }
            ))
        }

        for (const extraDeleteReason of (config.extraDeleteReasons ?? [])) {
            elements.push(new FixedInputElement(
                new SubstitutedTranslation(extraDeleteReason.explanation, tagsSource, state),
                {
                    deleteReason: extraDeleteReason.changesetMessage
                }
            ))
        }

        for (const extraDeleteReason of DeleteConfig.defaultDeleteReasons) {
            elements.push(new FixedInputElement(
                extraDeleteReason.explanation.Clone(/*Must clone here, as this explanation might be used on many locations*/),
                {
                    deleteReason: extraDeleteReason.changesetMessage
                }
            ))
        }

        return new RadioButton(elements, {selectFirstAsDefault: false});
    }


}

class DeleteabilityChecker {

    public readonly canBeDeleted: UIEventSource<{ canBeDeleted?: boolean, reason: Translation }>;
    private readonly _id: string;
    private readonly _allowDeletionAtChangesetCount: number;
    private readonly _state: {
        osmConnection: OsmConnection
    };


    constructor(id: string,
                state: { osmConnection: OsmConnection },
                allowDeletionAtChangesetCount?: number) {
        this._id = id;
        this._state = state;
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
        const self = this;
        if (!id.startsWith("node")) {
            this.canBeDeleted.setData({
                canBeDeleted: false,
                reason: t.isntAPoint
            })
            return;
        }

        // Does the currently logged in user have enough experience to delete this point?
        const deletingPointsOfOtherAllowed = this._state.osmConnection.userDetails.map(ud => {
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
            const userId = self._state.osmConnection.userDetails.data.uid;
            return !previous.some(editor => editor !== userId)
        }, [self._state.osmConnection.userDetails])


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
                const hist = OsmObject.DownloadHistory(id).map(versions => versions.map(version => version.tags["_last_edit:contributor:uid"]))
                hist.addCallbackAndRunD(hist => previousEditors.setData(hist))
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