import { Store, UIEventSource } from "../Logic/UIEventSource"
import LayerConfig from "./ThemeConfig/LayerConfig"
import { OsmConnection } from "../Logic/Osm/OsmConnection"
import { LocalStorageSource } from "../Logic/Web/LocalStorageSource"
import { QueryParameters } from "../Logic/Web/QueryParameters"
import { FilterConfigOption } from "./ThemeConfig/FilterConfig"
import { TagsFilter } from "../Logic/Tags/TagsFilter"
import { Utils } from "../Utils"
import { TagUtils } from "../Logic/Tags/TagUtils"
import { And } from "../Logic/Tags/And"
import { GlobalFilter } from "./GlobalFilter"

export default class FilteredLayer {
    /**
     * Whether the specified layer is enabled by the user
     */
    readonly isDisplayed: UIEventSource<boolean>
    /**
     * Maps the filter.option.id onto the actual used state.
     * This state is either the chosen option (as number) or a representation of the fields
     */
    readonly appliedFilters: ReadonlyMap<string, UIEventSource<undefined | number | string>>
    readonly layerDef: LayerConfig

    /**
     * Indicates if some filter is set.
     * If this is the case, adding a new element of this type might be a bad idea
     */
    readonly hasFilter: Store<boolean>

    /**
     * Contains the current properties a feature should fulfill in order to match the filter
     */
    readonly currentFilter: Store<TagsFilter | undefined>

    constructor(
        layer: LayerConfig,
        appliedFilters?: ReadonlyMap<string, UIEventSource<undefined | number | string>>,
        isDisplayed?: UIEventSource<boolean>
    ) {
        this.layerDef = layer
        this.isDisplayed = isDisplayed ?? new UIEventSource(true)
        if (!appliedFilters) {
            const appliedFiltersWritable = new Map<
                string,
                UIEventSource<number | string | undefined>
            >()
            for (const filter of this.layerDef.filters) {
                appliedFiltersWritable.set(filter.id, new UIEventSource(undefined))
            }
            appliedFilters = appliedFiltersWritable
        }
        this.appliedFilters = appliedFilters

        const currentTags = new UIEventSource<TagsFilter>(undefined)
        this.appliedFilters.forEach((filterSrc) => {
            filterSrc.addCallbackAndRun(() => {
                currentTags.setData(this.calculateCurrentTags())
            })
        })
        this.hasFilter = currentTags.map((ct) => ct !== undefined)
        this.currentFilter = currentTags
    }

    public static fieldsToString(values: Record<string, string>): string {
        for (const key in values) {
            if (values[key] === "") {
                delete values[key]
            }
        }
        return JSON.stringify(values)
    }

    public static queryParameterKey(layer: LayerConfig) {
        return "layer-" + layer.id
    }

    /**
     * Creates a FilteredLayer which is tied into the QueryParameters and/or user preferences
     */
    public static initLinkedState(
        layer: LayerConfig,
        context: string,
        osmConnection: OsmConnection
    ) {
        let isDisplayed: UIEventSource<boolean>
        if (layer.syncSelection === "local") {
            isDisplayed = LocalStorageSource.GetParsed(
                context + "-layer-" + layer.id + "-enabled",
                layer.shownByDefault
            )
        } else if (layer.syncSelection === "theme-only") {
            isDisplayed = FilteredLayer.getPref(
                osmConnection,
                context + "-layer-" + layer.id + "-enabled",
                layer
            )
        } else if (layer.syncSelection === "global") {
            isDisplayed = FilteredLayer.getPref(
                osmConnection,
                "layer-" + layer.id + "-enabled",
                layer
            )
        } else {
            isDisplayed = QueryParameters.GetBooleanQueryParameter(
                FilteredLayer.queryParameterKey(layer),
                layer.shownByDefault,
                "Whether or not layer " + layer.id + " is shown"
            )
        }

        const appliedFilters = new Map<string, UIEventSource<undefined | number | string>>()
        for (const subfilter of layer.filters) {
            appliedFilters.set(subfilter.id, subfilter.initState(layer.id))
        }
        return new FilteredLayer(layer, appliedFilters, isDisplayed)
    }

    private static stringToFieldProperties(value: string): Record<string, string> {
        const values = JSON.parse(value)
        for (const key in values) {
            if (values[key] === "") {
                delete values[key]
            }
        }
        return values
    }

    private static fieldsToTags(
        option: FilterConfigOption,
        fieldstate: string | Record<string, string>
    ): TagsFilter | undefined {
        let properties: Record<string, string>
        if (typeof fieldstate === "string") {
            properties = FilteredLayer.stringToFieldProperties(fieldstate)
        } else {
            properties = fieldstate
        }
        const missingKeys = option.fields
            .map((f) => f.name)
            .filter((key) => properties[key] === undefined)
        if (missingKeys.length > 0) {
            return undefined
        }
        const tagsSpec = Utils.WalkJson(option.originalTagsSpec, (v) => {
            if (typeof v !== "string") {
                return v
            }

            for (const key in properties) {
                v = (<string>v).replace("{" + key + "}", properties[key])
            }

            return v
        })
        return TagUtils.Tag(tagsSpec)
    }

    private static getPref(
        osmConnection: OsmConnection,
        key: string,
        layer: LayerConfig
    ): UIEventSource<boolean> {
        return osmConnection.GetPreference(key, layer.shownByDefault + "").sync(
            (v) => {
                if (v === undefined) {
                    return undefined
                }
                return v === "true"
            },
            [],
            (b) => {
                if (b === undefined) {
                    return undefined
                }
                return "" + b
            }
        )
    }

    public disableAllFilters(): void {
        this.appliedFilters.forEach((value) => value.setData(undefined))
    }

    /**
     * Returns true if the given tags match
     * - the current filters
     * - the specified 'global filters'
     * - the 'isShown'-filter set by the layer
     */
    public isShown(properties: Record<string, string>, globalFilters?: GlobalFilter[]): boolean {
        if (properties._deleted === "yes") {
            return false
        }
        for (const globalFilter of globalFilters ?? []) {
            const neededTags = globalFilter.osmTags
            if (neededTags !== undefined && !neededTags.matchesProperties(properties)) {
                return false
            }
        }
        {
            const isShown: TagsFilter = this.layerDef.isShown
            if (isShown !== undefined && !isShown.matchesProperties(properties)) {
                return false
            }
        }

        {
            const neededTags: TagsFilter = this.currentFilter.data
            if (neededTags !== undefined && !neededTags.matchesProperties(properties)) {
                return false
            }
        }

        return true
    }

    private calculateCurrentTags(): TagsFilter {
        let needed: TagsFilter[] = []
        for (const filter of this.layerDef.filters) {
            const state = this.appliedFilters.get(filter.id)
            if (state.data === undefined) {
                continue
            }
            if (filter.options[0].fields.length > 0) {
                // This is a filter with fields
                // We calculate the fields
                const fieldProperties = FilteredLayer.stringToFieldProperties(<string>state.data)
                const asTags = FilteredLayer.fieldsToTags(filter.options[0], fieldProperties)
                if (asTags) {
                    needed.push(asTags)
                }
                continue
            }
            needed.push(filter.options[state.data].osmTags)
        }
        needed = Utils.NoNull(needed)
        if (needed.length == 0) {
            return undefined
        }
        let tags: TagsFilter

        if (needed.length == 1) {
            tags = needed[0]
        } else {
            tags = new And(needed)
        }
        const optimized = tags.optimize()
        if (optimized === true) {
            return undefined
        }
        if (optimized === false) {
            return tags
        }
        return optimized
    }
}
