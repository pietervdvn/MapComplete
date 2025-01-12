import { TagConfigJson } from "./TagConfigJson"
import { Translatable } from "./Translatable"
export interface FilterConfigOptionJson {
    question: Translatable
    searchTerms?: Record<string, string[]>
    emoji?: string
    icon?: string
    osmTags?: TagConfigJson
    default?: boolean
    fields?: {
        /**
         * If name is `search`, use  "_first_comment~.*{search}.*" as osmTags
         */
        name: string
        type?: string | "string"
    }[]
}
export default interface FilterConfigJson {
    /**
     * An id/name for this filter, used to set the URL parameters
     */
    id: string
    /**
     * If set, the options will be pruned. Only items for which the filter match the layer source will be kept.
     *
     * For example, we import types of brands from the nsi. This contains a ton of items, e.g.
     * [{question: "Brand X", osmTags: {"and": ["shop=clothes", "brand=Brand X]}, {osmTags: {"and": "shop=convenience", ...} ...} ]
     * Of course, when making a layer about `shop=clothes`, we'll only want to keep the clothes shops.
     * If set to strict and the source is `shop=clothes`, only those options which have shop=clothes will be returned
     */
    strict?: boolean
    /**
     * The options for a filter
     * If there are multiple options these will be a list of radio buttons
     * If there is only one option this will be a checkbox
     * Filtering is done based on the given osmTags that are compared to the objects in that layer.
     *
     * An example which searches by name:
     *
     * ```
     * {
     *       "id": "shop-name",
     *       "options": [
     *         {
     *           "fields": [
     *             {
     *               "name": "search",
     *               "type": "string"
     *             }
     *           ],
     *           "osmTags": "name~i~.*{search}.*",
     *           "question": {
     *             "en": "Only show shops with name {search}",
     *           }
     *         }
     *       ]
     *     }
     *     ```
     */
    options: FilterConfigOptionJson[]

    /**
     * Used for comments or to disable a check
     *
     * "ignore-possible-duplicate": disables a check in `DetectDuplicateFilters` which complains that a filter can be replaced by a filter from the `filters`-library-layer
     */
    "#"?: string | "ignore-possible-duplicate"
}
