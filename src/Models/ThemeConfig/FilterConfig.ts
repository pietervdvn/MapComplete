import { Translation } from "../../UI/i18n/Translation"
import { TagsFilter } from "../../Logic/Tags/TagsFilter"
import FilterConfigJson from "./Json/FilterConfigJson"
import Translations from "../../UI/i18n/Translations"
import { TagUtils } from "../../Logic/Tags/TagUtils"
import { TagConfigJson } from "./Json/TagConfigJson"
import { UIEventSource } from "../../Logic/UIEventSource"
import { QueryParameters } from "../../Logic/Web/QueryParameters"
import { Utils } from "../../Utils"
import { RegexTag } from "../../Logic/Tags/RegexTag"
import MarkdownUtils from "../../Utils/MarkdownUtils"
import Validators, { ValidatorType } from "../../UI/InputElement/Validators"

export type FilterConfigOption = {
    question: Translation
    searchTerms: Record<string, string[]>
    icon?: string
    emoji?: string
    osmTags: TagsFilter | undefined
    /* Only set if fields are present. Used to create `osmTags` (which are used to _actually_ filter) when the field is written*/
    readonly originalTagsSpec: TagConfigJson
    fields: { name: string; type: ValidatorType }[]
}
export default class FilterConfig {
    public readonly id: string
    public readonly options: FilterConfigOption[]
    public readonly defaultSelection?: number

    constructor(json: FilterConfigJson, context: string) {
        if (typeof json === "string") {
            throw "Got a non-expanded filter, just a string: " + json
        }
        if (json.options === undefined) {
            throw `A filter without options was given at ${context}. The ID is ${JSON.stringify(
                json
            )}`
        }
        if (json.id === undefined) {
            throw `A filter without id was found at ${context}`
        }
        if (json.id.match(/^[a-zA-Z0-9_-]*$/) === null) {
            throw `A filter with invalid id was found at ${context}. Ids should only contain letters, numbers or - _`
        }

        if (json.options.map === undefined) {
            throw `A filter was given where the options aren't a list at ${context}`
        }
        this.id = json.id
        let defaultSelection: number = undefined
        this.options = json.options.map((option, i) => {
            const ctx = `${context}.options.${i}`
            const question = Translations.T(option.question, `${ctx}.question`)
            let osmTags: undefined | TagsFilter = undefined
            if ((option.fields?.length ?? 0) == 0 && option.osmTags !== undefined) {
                osmTags = TagUtils.Tag(option.osmTags, `${ctx}.osmTags`)
                FilterConfig.validateSearch(osmTags, ctx)
            }
            if (question === undefined) {
                throw `Invalid filter: no question given at ${ctx}`
            }

            const fields: { name: string; type: ValidatorType }[] = (option.fields ?? []).map(
                (f, i) => {
                    const type = <ValidatorType>f.type ?? "regex"
                    if (Validators.availableTypes.indexOf(type) < 0) {
                        throw `Invalid filter: type is not a valid validator. Did you mean one of ${Utils.sortedByLevenshteinDistance(
                            type,
                            <ReadonlyArray<string>>Validators.availableTypes,
                            (x) => x
                        ).slice(0, 3)}`
                    }
                    // Type is validated against 'ValidatedTextField' in Validation.ts, in ValidateFilterConfig
                    if (
                        f.name === undefined ||
                        f.name === "" ||
                        f.name.match(/[a-z0-9_-]+/) == null
                    ) {
                        throw `Invalid filter: a variable name should match [a-z0-9_-]+ at ${ctx}.fields[${i}]`
                    }
                    return {
                        name: f.name,
                        type,
                    }
                }
            )

            for (const field of fields) {
                for (const ln in question.translations) {
                    const txt = question.translations[ln]
                    if (ln.startsWith("_")) {
                        continue
                    }
                    if (txt.indexOf("{" + field.name + "}") < 0) {
                        throw (
                            "Error in filter with fields at " +
                            context +
                            ".question." +
                            ln +
                            ": The question text should contain every field, but it doesn't contain `{" +
                            field +
                            "}`: " +
                            txt
                        )
                    }
                }
            }

            if (option.default) {
                if (defaultSelection === undefined) {
                    defaultSelection = i
                } else {
                    throw `Invalid filter: multiple filters are set as default, namely ${i} and ${defaultSelection} at ${context}`
                }
            }

            if (option.osmTags !== undefined) {
                FilterConfig.validateSearch(TagUtils.Tag(option.osmTags), ctx)
            }

            return {
                question: question,
                osmTags: osmTags,
                searchTerms: option.searchTerms,
                fields,
                originalTagsSpec: option.osmTags,
                icon: option.icon,
                emoji: option.emoji,
            }
        })

        this.defaultSelection = defaultSelection

        if (this.options.some((o) => o.fields.length > 0) && this.options.length > 1) {
            throw `Invalid filter at ${context}: a filter with textfields should only offer a single option.`
        }

        if (this.options.length > 1 && this.options[0].osmTags !== undefined) {
            throw (
                "Error in " +
                context +
                "." +
                this.id +
                ": the first option of a multi-filter should always be the 'reset' option and not have any filters"
            )
        }
    }

    private static validateSearch(osmTags: TagsFilter, ctx: string) {
        osmTags.visit((t) => {
            if (!(t instanceof RegexTag)) {
                return
            }
            if (typeof t.value == "string") {
                return
            }

            if (
                t.value.source == "^..*$" ||
                t.value.source == ".+" ||
                t.value.source == "^[\\s\\S][\\s\\S]*$" /*Compiled regex with 'm'*/
            ) {
                return
            }

            if (!t.value.ignoreCase) {
                throw `At ${ctx}: The filter for key '${t.key}' uses a regex '${t.value}', but you should use a case invariant regex with ~i~ instead, as search should be case insensitive`
            }
        })
    }

    public initState(layerId: string): UIEventSource<undefined | number | string> {
        let defaultValue: string
        if (this.options.length > 1) {
            defaultValue = "" + (this.defaultSelection ?? 0)
        } else if (this.options[0].fields?.length > 0) {
            defaultValue = "{}"
        } else {
            // Only a single option
            if (this.defaultSelection === 0) {
                defaultValue = "true"
            } else {
                defaultValue = "false"
            }
        }
        const qp = QueryParameters.GetQueryParameter(
            `filter-${layerId}-${this.id}`,
            defaultValue,
            "State of filter " + this.id
        )

        if (this.options.length > 1) {
            // We map the query parameter for this case
            return qp.sync(
                (str) => {
                    const parsed = Number(str)
                    if (isNaN(parsed)) {
                        // Nope, not a correct number!
                        return undefined
                    }
                    return parsed
                },
                [],
                (n) => "" + n
            )
        }

        const option = this.options[0]

        if (option.fields.length > 0) {
            return qp
        }

        return qp.sync(
            (str) => {
                // Only a single option exists here
                if (str === "true") {
                    return 0
                }
                return undefined
            },
            [],
            (n) => (n === undefined ? "false" : "true")
        )
    }

    public GenerateDocs(): string {
        const hasField = this.options.some((opt) => opt.fields?.length > 0)
        return MarkdownUtils.table(
            Utils.NoNull(["id", "question", "osmTags", hasField ? "fields" : undefined]),
            this.options.map((opt, i) => {
                const isDefault = this.options.length > 1 && (this.defaultSelection ?? 0) == i
                return <string[]>(
                    Utils.NoNull([
                        this.id + "." + i,
                        isDefault ? `*${opt.question.txt}* (default)` : opt.question,
                        opt.osmTags?.asHumanString() ?? "",
                        opt.fields?.length > 0
                            ? opt.fields.map((f) => f.name + " (" + f.type + ")").join(" ")
                            : undefined,
                    ])
                )
            })
        )
    }
}
