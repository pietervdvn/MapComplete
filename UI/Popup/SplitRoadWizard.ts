import {VariableUiElement} from "../Base/VariableUIElement";
import Toggle from "../Input/Toggle";
import Translations from "../i18n/Translations";
import Svg from "../../Svg";
import {UIEventSource} from "../../Logic/UIEventSource";
import {TagsFilter} from "../../Logic/Tags/TagsFilter";
import TagRenderingConfig from "../../Customizations/JSON/TagRenderingConfig";
import Combine from "../Base/Combine";
import {SubtleButton} from "../Base/SubtleButton";
import {FixedUiElement} from "../Base/FixedUiElement";
import {Translation} from "../i18n/Translation";
import {AndOrTagConfigJson} from "../../Customizations/JSON/TagConfigJson";
import BaseUIElement from "../BaseUIElement";
import SplitRoadAction from "../../Logic/Osm/SplitRoadAction";
import Minimap from "../Base/Minimap";
import State from "../../State";

export default class SplitRoadWizard extends Toggle {
    /**
     * A UI Element used for splitting roads
     *
     * @param id: The id of the road to remove
     */
    constructor(id: string) {


        const splitClicked = new UIEventSource<boolean>(false);

        const splitButton = new SubtleButton(Svg.scissors_ui(), "Split road");
        splitButton.onClick(
            () => {
                splitClicked.setData(true)
            }
        )

        // const isShown = new UIEventSource<boolean>(id.indexOf("-") < 0)

        const miniMap = new Minimap({background: State.state.backgroundLayer});

        super(miniMap, splitButton, splitClicked);

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


    private static constructExplanation(tags: UIEventSource<TagsFilter>, deleteAction: SplitRoadAction) {
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
        const softDeletionTagsStr = []
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