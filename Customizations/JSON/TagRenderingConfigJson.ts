import {AndOrTagConfigJson} from "./TagConfigJson";

/**
 * A TagRenderingConfigJson is a single piece of code which converts one ore more tags into a HTML-snippet.
 * If the desired tags are missing and a question is defined, a question will be shown instead.
 */
export interface TagRenderingConfigJson {
    /**
     * Renders this value. Note that "{key}"-parts are substituted by the corresponding values of the element.
     * If neither 'textFieldQuestion' nor 'mappings' are defined, this text is simply shown as default value.
     * 
     * Note that this is a HTML-interpreted value, so you can add links as e.g. '<a href='{website}'>{website}</a>' or include images such as `This is of type A <br><img src='typeA-icon.svg' />`
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
         * See Docs/SpecialInputElements.md and UI/Input/ValidatedTextField.ts for supported values
         */
        type?: string,
        /**
         * If a value is added with the textfield, these extra tag is addded.
         * Useful to add a 'fixme=freeform textfield used - to be checked'
         **/
        addExtraTags?: string[];
    },

    /**
     * If true, use checkboxes instead of radio buttons when asking the question
     */
    multiAnswer?: boolean,

    /**
     * Allows fixed-tag inputs, shown either as radiobuttons or as checkboxes
     */
    mappings?: {
        /**
         * If this condition is met, then the text under `then` will be shown.
         * If no value matches, and the user selects this mapping as an option, then these tags will be uploaded to OSM.
         */
        if: AndOrTagConfigJson | string,
        /**
         * If the condition `if` is met, the text `then` will be rendered.
         * If not known yet, the user will be presented with `then` as an option
         */
        then: string | any,
        /**
         * In some cases, multiple taggings exist (e.g. a default assumption, or a commonly mapped abbreviation and a fully written variation).
         * 
         * In the latter case, a correct text should be shown, but only a single, canonical tagging should be selectable by the user.
         * In this case, one of the mappings can be hiden by setting this flag.
         * 
         * To demonstrate an example making a default assumption:
         * 
         * mappings: [
         *  {
         *      if: "access=", -- no access tag present, we assume accessible
         *      then: "Accessible to the general public",
         *      hideInAnswer: true
         *  },
         *  {
         *      if: "access=yes",
         *      then: "Accessible to the general public", -- the user selected this, we add that to OSM
         *  },
         *  {
         *      if: "access=no",
         *      then: "Not accessible to the public"
         *  }
         * ]
         * 
         * 
         * For example, for an operator, we have `operator=Agentschap Natuur en Bos`, which is often abbreviated to `operator=ANB`.
         * Then, we would add two mappings:
         * {
         *     if: "operator=Agentschap Natuur en Bos" -- the non-abbreviated version which should be uploaded
         *     then: "Maintained by Agentschap Natuur en Bos"
         * },
         * {
         *     if: "operator=ANB", -- we don't want to upload abbreviations
         *     then: "Maintained by Agentschap Natuur en Bos"
         *     hideInAnswer: true
         * }
         * 
         * Hide in answer can also be a tagsfilter, e.g. to make sure an option is only shown when appropriate.
         * Keep in mind that this is reverse logic: it will be hidden in the answer if the condition is true, it will thus only show in the case of a mismatch
         * 
         * e.g., for toilets: if "wheelchair=no", we know there is no wheelchair dedicated room.
         * For the location of the changing table, the option "in the wheelchair accessible toilet is weird", so we write:
         * 
         * {
         *     "question": "Where is the changing table located?"
         *     "mappings": [
         *         {"if":"changing_table:location=female","then":"In the female restroom"},
         *        {"if":"changing_table:location=male","then":"In the male restroom"},
         *        {"if":"changing_table:location=wheelchair","then":"In the wheelchair accessible restroom", "hideInAnswer": "wheelchair=no"},
         *         
         *     ]
         * }
         * 
         * Also have a look for the meta-tags
         * {
         *     if: "operator=Agentschap Natuur en Bos",
         *     then: "Maintained by Agentschap Natuur en Bos",
         *     hideInAnswer: "_country!=be"
         * }
         */
        hideInAnswer?: boolean | string | AndOrTagConfigJson,
        /**
         * Only applicable if 'multiAnswer' is set.
         * This is for situations such as:
         * `accepts:coins=no` where one can select all the possible payment methods. However, we want to make explicit that some options _were not_ selected.
         * This can be done with `ifnot`
         * Note that we can not explicitly render this negative case to the user, we cannot show `does _not_ accept coins`.
         * If this is important to your usecase, consider using multiple radiobutton-fields without `multiAnswer`
         */
        ifnot?: AndOrTagConfigJson | string
        
    }[]

    /**
     * If set to true, this tagRendering will escape the current layer and attach itself to all the other layers too.
     * However, it will _only_ be shown if it matches the overpass-tags of the layer it was originally defined in.
     */
    roaming?: boolean
}
