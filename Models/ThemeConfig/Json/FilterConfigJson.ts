import { TagConfigJson } from "./TagConfigJson"

export default interface FilterConfigJson {
    /**
     * An id/name for this filter, used to set the URL parameters
     */
    id: string
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
    options: {
        question: string | any
        osmTags?: TagConfigJson
        default?: boolean
        fields?: {
            /**
             * If name is `search`, use  "_first_comment~.*{search}.*" as osmTags
             */
            name: string
            type?: string | "string"
        }[]
    }[]
}
