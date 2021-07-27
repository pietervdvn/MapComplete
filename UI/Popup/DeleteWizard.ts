import {VariableUiElement} from "../Base/VariableUIElement";
import State from "../../State";
import Toggle from "../Input/Toggle";
import Translations from "../i18n/Translations";
import Svg from "../../Svg";
import DeleteAction from "../../Logic/Osm/Actions/DeleteAction";
import {Tag} from "../../Logic/Tags/Tag";
import {UIEventSource} from "../../Logic/UIEventSource";
import {TagsFilter} from "../../Logic/Tags/TagsFilter";
import TagRenderingQuestion from "./TagRenderingQuestion";
import TagRenderingConfig from "../../Customizations/JSON/TagRenderingConfig";
import Combine from "../Base/Combine";
import {SubtleButton} from "../Base/SubtleButton";
import {FixedUiElement} from "../Base/FixedUiElement";
import {Translation} from "../i18n/Translation";
import {AndOrTagConfigJson} from "../../Customizations/JSON/TagConfigJson";
import BaseUIElement from "../BaseUIElement";
import {Changes} from "../../Logic/Osm/Changes";
import {And} from "../../Logic/Tags/And";
import Constants from "../../Models/Constants";
import DeleteConfig from "../../Customizations/JSON/DeleteConfig";
import ChangeTagAction from "../../Logic/Osm/Actions/ChangeTagAction";

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

        const deleteAction = new DeleteAction(id, options.neededChangesets);
        const tagsSource = State.state.allElements.getEventSourceById(id)

        const allowSoftDeletion = !!options.softDeletionTags

        const confirm = new UIEventSource<boolean>(false)


        function softDelete(reason: string, tagsToApply: { k: string, v: string }[]) {
            if (reason !== undefined) {
                tagsToApply.splice(0, 0, {
                    k: "fixme",
                    v: `A mapcomplete user marked this feature to be deleted (${reason})`
                })
            }
            (State.state?.changes ?? new Changes())
                .applyAction(new ChangeTagAction(
                   id, new And(tagsToApply.map(kv => new Tag(kv.k, kv.v))), tagsSource.data
                ))
        }

        function doDelete(selected: TagsFilter) {
            const tgs = selected.asChange(tagsSource.data)
            const deleteReasonMatch = tgs.filter(kv => kv.k === "_delete_reason")
            if (deleteReasonMatch.length > 0) {
                // We should actually delete!
                const deleteReason = deleteReasonMatch[0].v
                deleteAction.DoDelete(deleteReason, () => {
                    // The user doesn't have sufficient permissions to _actually_ delete the feature
                    // We 'soft delete' instead (and add a fixme)
                    softDelete(deleteReason, tgs.filter(kv => kv.k !== "_delete_reason"))

                });
                return
            } else {
                // This is a 'non-delete'-option that was selected
                softDelete(undefined, tgs)
            }

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
                    bottomText: (v) => DeleteWizard.constructExplanation(v, deleteAction)
                }
            )
        }))


        /**
         * The button which is shown first. Opening it will trigger the check for deletions
         */
        const deleteButton = new SubtleButton(
            Svg.delete_icon_ui().SetStyle("width: 2rem; height: 2rem;"), t.delete.Clone()).onClick(
            () => {
                deleteAction.CheckDeleteability(true)
                confirm.setData(true);
            }
        ).SetClass("w-1/2 float-right");

        const isShown = new UIEventSource<boolean>(id.indexOf("-")< 0)
        
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
                    new VariableUiElement(deleteAction.canBeDeleted.map(cbd => new Combine([cbd.reason.Clone(), t.useSomethingElse.Clone()]))),
                    deleteAction.canBeDeleted.map(cbd => allowSoftDeletion || cbd.canBeDeleted !== false)),

                t.loginToDelete.Clone().onClick(State.state.osmConnection.AttemptLogin),
                State.state.osmConnection.isLoggedIn
            ),
            deleteAction.isDeleted),
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


    private static constructExplanation(tags: UIEventSource<TagsFilter>, deleteAction: DeleteAction) {
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