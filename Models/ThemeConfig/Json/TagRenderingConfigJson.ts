import {AndOrTagConfigJson} from "./TagConfigJson";

/**
 * A TagRenderingConfigJson is a single piece of code which converts one ore more tags into a HTML-snippet.
 * For an _editable_ tagRenerdering, use 'QuestionableTagRenderingConfigJson' instead, which extends this one
 */
export interface TagRenderingConfigJson {

    /**
     * The id of the tagrendering, should be an unique string.
     * Used to keep the translations in sync. Only used in the tagRenderings-array of a layerConfig, not requered otherwise.
     *
     * Use 'questions' to trigger the question box of this group (if a group is defined)
     */
    id?: string,

    /**
     * If 'group' is defined on many tagRenderings, these are grouped together when shown. The questions are grouped together as well.
     * The first tagRendering of a group will always be a sticky element.
     */
    group?: string

    /**
     * A list of labels. These are strings that are used for various purposes, e.g. to filter them away
     */
    labels?: string[]

    /**
     * Renders this value. Note that "{key}"-parts are substituted by the corresponding values of the element.
     * If neither 'textFieldQuestion' nor 'mappings' are defined, this text is simply shown as default value.
     *
     * Note that this is a HTML-interpreted value, so you can add links as e.g. '<a href='{website}'>{website}</a>' or include images such as `This is of type A <br><img src='typeA-icon.svg' />`
     * type: rendered
     */
    render?: string | any,
    
    /**
     * Only show this tagrendering (or question) if the object also matches the following tags.
     *
     * This is useful to ask a follow-up question. E.g. if there is a diaper table, then ask a follow-up question on diaper tables...
     * */
    condition?: AndOrTagConfigJson | string;

    /**
     * Allow freeform text input from the user
     */
    freeform?: {

        /**
         * If this key is present, then 'render' is used to display the value.
         * If this is undefined, the rendering is _always_ shown
         */
        key: string,
    },

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
        if: AndOrTagConfigJson | string,
        /**
         * If the condition `if` is met, the text `then` will be rendered.
         * If not known yet, the user will be presented with `then` as an option
         * Type: rendered
         */
        then: string | any,
        /**
         * An icon supporting this mapping; typically shown pretty small
         * Type: icon
         */
        icon?: string | {
            /**
             * The path to the icon
             * Type: icon
             */
            path: string,
            /**
             * A hint to mapcomplete on how to render this icon within the mapping.
             * This is translated to 'mapping-icon-<classtype>', so defining your own in combination with a custom CSS is possible (but discouraged)
             */
            class: "small" | "medium" | "large" | string
        }

    }[]
}