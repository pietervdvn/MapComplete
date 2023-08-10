import { TagConfigJson } from "./TagConfigJson"

/**
 * A TagRenderingConfigJson is a single piece of code which converts one ore more tags into a HTML-snippet.
 * For an _editable_ tagRendering, use 'QuestionableTagRenderingConfigJson' instead, which extends this one
 */
export interface TagRenderingConfigJson {
    /**
     * The id of the tagrendering, should be an unique string.
     * Used to keep the translations in sync. Only used in the tagRenderings-array of a layerConfig, not requered otherwise.
     *
     * Use 'questions' to trigger the question box of this group (if a group is defined)
     */
    id?: string

    /**
     * A list of labels. These are strings that are used for various purposes, e.g. to filter them away
     */
    labels?: string[]

    /**
     * A list of css-classes to apply to the entire tagRendering if the answer is known (not applied on the question).
     * This is only for advanced users
     */
    classes?: string | string[]

    /**
     * A human-readable text explaining what this tagRendering does
     */
    description?: string | Record<string, string>

    /**
     * Renders this value. Note that "{key}"-parts are substituted by the corresponding values of the element.
     * If neither 'textFieldQuestion' nor 'mappings' are defined, this text is simply shown as default value.
     *
     * Note that this is a HTML-interpreted value, so you can add links as e.g. '<a href='{website}'>{website}</a>' or include images such as `This is of type A <br><img src='typeA-icon.svg' />`
     * type: rendered
     */
    render?:
        | string
        | Record<string, string>
        | { special: Record<string, string | Record<string, string>> & { type: string } }

    /**
     * An icon shown next to the rendering; typically shown pretty small
     * This is only shown next to the "render" value
     * Type: icon
     */
    icon?:
        | string
        | {
        /**
         * The path to the icon
         * Type: icon
         */
        path: string
        /**
         * A hint to mapcomplete on how to render this icon within the mapping.
         * This is translated to 'mapping-icon-<classtype>', so defining your own in combination with a custom CSS is possible (but discouraged)
         */
        class?: "small" | "medium" | "large" | string
    }

    /**
     * Only show this tagrendering (or ask the question) if the selected object also matches the tags specified as `condition`.
     *
     * This is useful to ask a follow-up question.
     * For example, within toilets, asking _where_ the diaper changing table is is only useful _if_ there is one.
     * This can be done by adding `"condition": "changing_table=yes"`
     *
     * A full example would be:
     * ```json
     *     {
     *       "question": "Where is the changing table located?",
     *       "render": "The changing table is located at {changing_table:location}",
     *       "condition": "changing_table=yes",
     *       "freeform": {
     *         "key": "changing_table:location",
     *         "inline": true
     *       },
     *       "mappings": [
     *         {
     *           "then": "The changing table is in the toilet for women.",
     *           "if": "changing_table:location=female_toilet"
     *         },
     *         {
     *           "then": "The changing table is in the toilet for men.",
     *           "if": "changing_table:location=male_toilet"
     *         },
     *         {
     *           "if": "changing_table:location=wheelchair_toilet",
     *           "then": "The changing table is in the toilet for wheelchair users.",
     *         },
     *         {
     *           "if": "changing_table:location=dedicated_room",
     *           "then": "The changing table is in a dedicated room. ",
     *         }
     *       ],
     *       "id": "toilet-changing_table:location"
     *     },
     * ```
     * */
    condition?: TagConfigJson

    /**
     * If set, this tag will be evaluated agains the _usersettings/application state_ table.
     * Enable 'show debug info' in user settings to see available options.
     * Note that values with an underscore depicts _application state_ (including metainfo about the user) whereas values without an underscore depict _user settings_
     */
    metacondition?: TagConfigJson

    /**
     * Allow freeform text input from the user
     */
    freeform?: {
        /**
         * If this key is present, then 'render' is used to display the value.
         * If this is undefined, the rendering is _always_ shown
         */
        key: string
    }

    /**
     * Allows fixed-tag inputs, shown either as radiobuttons or as checkboxes
     */
    mappings?: {
        /**
         * If this condition is met, then the text under `then` will be shown.
         * If no value matches, and the user selects this mapping as an option, then these tags will be uploaded to OSM.
         *
         * For example: {'if': 'diet:vegetarion=yes', 'then':'A vegetarian option is offered here'}
         *
         * This can be an substituting-tag as well, e.g. {'if': 'addr:street:={_calculated_nearby_streetname}', 'then': '{_calculated_nearby_streetname}'}
         */
        if: TagConfigJson
        /**
         * If the condition `if` is met, the text `then` will be rendered.
         * If not known yet, the user will be presented with `then` as an option
         * Type: rendered
         */
        then: string | Record<string, string>
        /**
         * An icon supporting this mapping; typically shown pretty small
         * Type: icon
         */
        icon?:
            | string
            | {
                  /**
                   * The path to the icon
                   * Type: icon
                   */
                  path: string
                  /**
                   * A hint to mapcomplete on how to render this icon within the mapping.
                   * This is translated to 'mapping-icon-<classtype>', so defining your own in combination with a custom CSS is possible (but discouraged)
                   */
                  class?: "small" | "medium" | "large" | string
              }
    }[]
}
