import { DesugaringContext, DesugaringStep } from "./Conversion"
import { LayerConfigJson } from "../Json/LayerConfigJson"
import FilterConfigJson, { FilterConfigOptionJson } from "../Json/FilterConfigJson"
import predifined_filters from "../../../../assets/layers/filters/filters.json"
import { TagRenderingConfigJson } from "../Json/TagRenderingConfigJson"
import { ConversionContext } from "./ConversionContext"
import { QuestionableTagRenderingConfigJson } from "../Json/QuestionableTagRenderingConfigJson"
import { Utils } from "../../../Utils"
import { TagUtils } from "../../../Logic/Tags/TagUtils"
import { Tag } from "../../../Logic/Tags/Tag"
import { RegexTag } from "../../../Logic/Tags/RegexTag"
import { Or } from "../../../Logic/Tags/Or"
import Translations from "../../../UI/i18n/Translations"
import { FlatTag, OptimizedTag, TagsFilterClosed } from "../../../Logic/Tags/TagTypes"
import { TagsFilter } from "../../../Logic/Tags/TagsFilter"
import { Translation } from "../../../UI/i18n/Translation"

export class PruneFilters extends DesugaringStep<LayerConfigJson> {
    constructor() {
        super(
            "Removes all filters which are impossible, e.g. because they conflict with the base tags",
            ["filter"],
            "PruneFilters"
        )
    }

    /**
     * Prunes a filter; returns null/undefined if keeping the filter is useless
     */
    private prune(
        sourceTags: FlatTag,
        filter: FilterConfigJson,
        context: ConversionContext
    ): FilterConfigJson {

        if (filter.options.length === 1) {
            const option = filter.options[0]
            const tags = TagUtils.Tag(option.osmTags)
            const optimized = TagUtils.removeKnownParts(tags, sourceTags, true)
            if (optimized === true) {
                context.warn("Removing filter as always known: ", new Translation(option.question).textFor("en"))
                return undefined
            }
            if (optimized === false) {
                context.warn("Removing filter as not possible: ", new Translation(option.question).textFor("en"))
                return undefined
            }
        }


        if (!filter.strict) {
            return filter
        }
        const countBefore = filter.options.length
        const newOptions: FilterConfigOptionJson[] = filter.options
            .filter((option) => {
                if (!option.osmTags) {
                    return true
                }
                const condition = <OptimizedTag & TagsFilterClosed>(
                    TagUtils.Tag(option.osmTags).optimize()
                )
                return condition.shadows(sourceTags)
            })
            .map((option) => {
                if (!option.osmTags) {
                    return option
                }
                const basetags = TagUtils.Tag(option.osmTags)
                return {
                    ...option,
                    osmTags: (<TagsFilter>TagUtils.removeKnownParts(basetags, sourceTags)).asJson(),
                }
            })
        const countAfter = newOptions.length
        if (countAfter !== countBefore) {
            context
                .enters("filter", filter.id)
                .info(
                    "Pruned " +
                        (countBefore - countAfter) +
                        " options away from filter (out of " +
                        countBefore +
                        ")"
                )
        }


        return { ...filter, options: newOptions, strict: undefined }
    }

    public convert(json: LayerConfigJson, context: ConversionContext): LayerConfigJson {
        if (!Array.isArray(json.filter) || typeof json.source === "string") {
            return json
        }
        if (!json.source["osmTags"]) {
            return json
        }
        const sourceTags = TagUtils.Tag(json.source["osmTags"])
        return {
            ...json,
            filter: Utils.NoNull(json.filter?.map((obj) =>
                this.prune(sourceTags, <FilterConfigJson>obj, context)
            )),
        }
    }
}
export class ExpandFilter extends DesugaringStep<LayerConfigJson> {
    private static readonly predefinedFilters = ExpandFilter.load_filters()
    private _state: DesugaringContext

    constructor(state: DesugaringContext) {
        super(
            [
                "Expands filters: replaces a shorthand by the value found in 'filters.json'.",
                "If the string is formatted 'layername.filtername, it will be looked up into that layer instead. Note that pruning should still be done",
            ].join(" "),
            ["filter"],
            "ExpandFilter"
        )
        this._state = state
    }

    private static load_filters(): Map<string, FilterConfigJson> {
        const filters = new Map<string, FilterConfigJson>()
        for (const filter of <FilterConfigJson[]>predifined_filters.filter) {
            filters.set(filter.id, filter)
        }
        return filters
    }

    public static buildFilterFromTagRendering(
        tr: TagRenderingConfigJson,
        context: ConversionContext
    ): FilterConfigJson {
        if (!(tr.mappings?.length >= 1)) {
            context.err(
                "Found a matching tagRendering to base a filter on, but this tagRendering does not contain any mappings"
            )
        }
        const qtr = <QuestionableTagRenderingConfigJson>tr
        const options = qtr.mappings.map((mapping) => {
            let icon: string = mapping.icon?.["path"] ?? mapping.icon
            let emoji: string = undefined
            if (Utils.isEmoji(icon)) {
                emoji = icon
                icon = undefined
            }
            let osmTags = TagUtils.Tag(mapping.if)
            if (qtr.multiAnswer && osmTags instanceof Tag) {
                osmTags = new RegexTag(
                    osmTags.key,
                    new RegExp("^(.+;)?" + osmTags.value + "(;.+)$", "is")
                )
            }
            if (mapping.alsoShowIf) {
                osmTags = new Or([osmTags, TagUtils.Tag(mapping.alsoShowIf)])
            }

            return <FilterConfigOptionJson>{
                question: mapping.then,
                osmTags: osmTags.asJson(),
                searchTerms: mapping.searchTerms,
                icon,
                emoji,
            }
        })
        // Add default option
        options.unshift({
            question: tr["question"] ?? Translations.t.general.filterPanel.allTypes,
            osmTags: undefined,
            searchTerms: undefined,
        })
        return {
            id: tr["id"],
            options,
        }
    }

    convert(json: LayerConfigJson, context: ConversionContext): LayerConfigJson {
        if (json?.filter === undefined || json?.filter === null) {
            return json // Nothing to change here
        }

        if (json.filter["sameAs"] !== undefined) {
            return json // Nothing to change here
        }

        const newFilters: FilterConfigJson[] = []
        const filters = <(FilterConfigJson | string)[]>json.filter

        /**
         * Create filters based on builtin filters or create them based on the tagRendering
         */
        for (let i = 0; i < filters.length; i++) {
            const filter = filters[i]
            if (filter === undefined) {
                continue
            }
            if (typeof filter !== "string") {
                newFilters.push(filter)
                continue
            }

            const matchingTr = <TagRenderingConfigJson>(
                json.tagRenderings.find((tr) => !!tr && tr["id"] === filter)
            )
            if (matchingTr) {
                const filter = ExpandFilter.buildFilterFromTagRendering(
                    matchingTr,
                    context.enters("filter", i)
                )
                newFilters.push(filter)
                continue
            }

            if (filter.indexOf(".") > 0) {
                if (!(this._state.sharedLayers?.size > 0)) {
                    // This is a bootstrapping-run, we can safely ignore this
                    continue
                }
                const split = filter.split(".")
                if (split.length > 2) {
                    context.err(
                        "invalid filter name: " + filter + ", expected `layername.filterid`"
                    )
                }
                const layer = this._state.sharedLayers.get(split[0])
                if (layer === undefined) {
                    context.err("Layer '" + split[0] + "' not found")
                }
                const expectedId = split[1]
                const expandedFilter = (<(FilterConfigJson | string)[]>layer.filter).find(
                    (f) => typeof f !== "string" && f.id === expectedId
                )
                if (expandedFilter === undefined) {
                    context.err("Did not find filter with name " + filter)
                } else {
                    newFilters.push(<FilterConfigJson>expandedFilter)
                }
                continue
            }
            // Search for the filter:
            const found = ExpandFilter.predefinedFilters.get(filter)
            if (found === undefined) {
                const suggestions = Utils.sortedByLevenshteinDistance(
                    filter,
                    Array.from(ExpandFilter.predefinedFilters.keys()),
                    (t) => t
                )
                context
                    .enter(filter)
                    .err(
                        "While searching for predefined filter " +
                            filter +
                            ": this filter is not found. Perhaps you meant one of: " +
                            suggestions
                    )
            }
            newFilters.push(found)
        }
        return { ...json, filter: newFilters }
    }
}
