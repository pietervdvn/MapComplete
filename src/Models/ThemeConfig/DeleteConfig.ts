import { Translation, TypedTranslation } from "../../UI/i18n/Translation"
import { TagsFilter } from "../../Logic/Tags/TagsFilter"
import { DeleteConfigJson } from "./Json/DeleteConfigJson"
import Translations from "../../UI/i18n/Translations"
import { TagUtils } from "../../Logic/Tags/TagUtils"
import TagRenderingConfig from "./TagRenderingConfig"
import { QuestionableTagRenderingConfigJson } from "./Json/QuestionableTagRenderingConfigJson"
import { TagConfigJson } from "./Json/TagConfigJson"

export default class DeleteConfig {
    public static readonly deleteReasonKey = "_delete_reason"
    private static readonly defaultDeleteReasons: {
        changesetMessage: string
        explanation: Translation
    }[] = [
        {
            changesetMessage: "testing point",
            explanation: Translations.t.delete.reasons.test,
        },
        {
            changesetMessage: "disused",
            explanation: Translations.t.delete.reasons.disused,
        },
        {
            changesetMessage: "not found",
            explanation: Translations.t.delete.reasons.notFound,
        },
        {
            changesetMessage: "duplicate",
            explanation: Translations.t.delete.reasons.duplicate,
        },
    ]

    public readonly deleteReasons?: {
        explanation: TypedTranslation<object> | Translation
        changesetMessage: string
    }[]
    public readonly softDeletionTags?: TagsFilter
    public readonly neededChangesets?: number
    private readonly nonDeleteMappings?: { if: TagConfigJson; then: Translation }[]

    constructor(json: DeleteConfigJson, context: string) {
        this.deleteReasons = (json.extraDeleteReasons ?? []).map((reason, i) => {
            const ctx = `${context}.extraDeleteReasons[${i}]`
            if ((reason.changesetMessage ?? "").length <= 5) {
                throw `${ctx}.explanation is too short, needs at least 4 characters`
            }
            return {
                explanation: Translations.T(reason.explanation, ctx + ".explanation"),
                changesetMessage: reason.changesetMessage,
            }
        })

        {
            let deleteReasons = DeleteConfig.defaultDeleteReasons
            if (json.omitDefaultDeleteReasons === true) {
                deleteReasons = []
            } else if (json.omitDefaultDeleteReasons) {
                const forbidden = <string[]>json.omitDefaultDeleteReasons
                deleteReasons = deleteReasons.filter(
                    (dl) => forbidden.indexOf(dl.changesetMessage) < 0
                )
            }
            for (const defaultDeleteReason of deleteReasons) {
                this.deleteReasons.push({
                    changesetMessage: defaultDeleteReason.changesetMessage,
                    explanation:
                        defaultDeleteReason.explanation.Clone(/*Must clone, hides translation otherwise*/),
                })
            }
        }

        this.nonDeleteMappings = (json.nonDeleteMappings ?? []).map((nonDelete, i) => {
            const ctx = `${context}.extraDeleteReasons[${i}]`
            TagUtils.Tag(nonDelete.if, ctx + ".if") // for validation only
            return {
                if: nonDelete.if,
                then: Translations.T(nonDelete.then, ctx + ".then"),
            }
        })

        if (this.nonDeleteMappings.length + this.deleteReasons.length == 0) {
            throw (
                "At " +
                context +
                ": a deleteconfig should have some reasons to delete: either the default delete reasons or a nonDeleteMapping or extraDeletereason should be given"
            )
        }

        this.softDeletionTags = undefined
        if (json.softDeletionTags !== undefined) {
            this.softDeletionTags = TagUtils.Tag(
                json.softDeletionTags,
                `${context}.softDeletionTags`
            )
        }

        if (json["hardDeletionTags"] !== undefined) {
            throw `You probably meant 'softDeletionTags' instead of 'hardDeletionTags' (at ${context})`
        }
        this.neededChangesets = json.neededChangesets
    }

    public constructTagRendering(): TagRenderingConfig {
        const t = Translations.t.delete

        const mappings: { if: TagConfigJson; then: Record<string, string> }[] = []
        for (const nonDeleteMapping of this.nonDeleteMappings) {
            mappings.push({
                if: nonDeleteMapping.if,
                then: nonDeleteMapping.then.translations,
            })
        }

        for (const deleteReason of this.deleteReasons) {
            mappings.push({
                if: DeleteConfig.deleteReasonKey + "=" + deleteReason.changesetMessage,
                then: deleteReason.explanation.translations,
            })
        }

        const config: QuestionableTagRenderingConfigJson = {
            question: t.whyDelete.translations,
            mappings,
            id: "why-delete",
        }
        console.log("Delete config", config)
        return new TagRenderingConfig(config)
    }
}
