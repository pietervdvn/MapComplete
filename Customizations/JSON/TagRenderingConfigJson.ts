import {AndOrTagConfigJson} from "./TagConfigJson";

export interface TagRenderingConfigJson {
    /**
     * Renders this value. Note that "{key}"-parts are substituted by the corresponding values of the element.
     * If neither 'textFieldQuestion' nor 'mappings' are defined, this text is simply shown as default value.
     */
    render?: string | any,

    /**
     * If it turns out that this tagRendering doesn't match _any_ value, then we show this question.
     * If undefined, the question is never asked and this tagrendering is read-only
     */
    question?: string | any,

    /**
     * Only show this question if the object also matches the following tags.
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
        /**
         * The type of the text-field, e.g. 'string', 'nat', 'float', 'date',...
         */
        type?: string,
        /**
         * If a value is added with the textfield, these extra tag is addded.
         * Usefull to add a 'fixme=freeform textfield used - to be checked'
         **/
        addExtraTags?: AndOrTagConfigJson | string;
    }

    /**
     * Allows fixed-tag inputs, shown either as radiobuttons or as checkboxes
     */
    mappings?: {
        if: AndOrTagConfigJson | string,
        then: string | any
        hideInAnswer?: boolean
    }[]
}