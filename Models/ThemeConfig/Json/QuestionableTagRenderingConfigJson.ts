import {AndOrTagConfigJson} from "./TagConfigJson";
import {TagRenderingConfigJson} from "./TagRenderingConfigJson";

/**
 * A QuestionableTagRenderingConfigJson is a single piece of code which converts one ore more tags into a HTML-snippet.
 * If the desired tags are missing and a question is defined, a question will be shown instead.
 */
export interface QuestionableTagRenderingConfigJson extends TagRenderingConfigJson {

    /**
     * If it turns out that this tagRendering doesn't match _any_ value, then we show this question.
     * If undefined, the question is never asked and this tagrendering is read-only
     */
    question?: string | any,


    /**
     * Allow freeform text input from the user
     */
    freeform?: {

        /**
         * @inheritDoc
         */
        key: string

        /**
         * The type of the text-field, e.g. 'string', 'nat', 'float', 'date',...
         * See Docs/SpecialInputElements.md and UI/Input/ValidatedTextField.ts for supported values
         */
        type?: string,
        /**
         * A (translated) text that is shown (as gray text) within the textfield
         */
        placeholder?: string | any

        /**
         * Extra parameters to initialize the input helper arguments.
         * For semantics, see the 'SpecialInputElements.md'
         */
        helperArgs?: (string | number | boolean | any)[];
        /**
         * If a value is added with the textfield, these extra tag is addded.
         * Useful to add a 'fixme=freeform textfield used - to be checked'
         **/
        addExtraTags?: string[];

        /**
         * When set, influences the way a question is asked.
         * Instead of showing a full-widht text field, the text field will be shown within the rendering of the question.
         *
         * This combines badly with special input elements, as it'll distort the layout.
         */
        inline?: boolean

        /**
         * default value to enter if no previous tagging is present.
         * Normally undefined (aka do not enter anything)
         */
        default?: string
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
         * @inheritDoc
         */
        if: AndOrTagConfigJson | string,
        /**
         * Shown if the 'if is fulfilled
         * Type: rendered
         */
        then: string | any,
        /**
         * An extra icon supporting the choice
         * Type: icon
         */
        icon?: string | {
            /**
             * The path to the  icon
             * Type: icon
             */
            path: string,
            /**
             * Size of the image
             */
            class: "small" | "medium" | "large" | string
        }

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

        /**
         * If chosen as answer, these tags will be applied as well onto the object.
         * Not compatible with multiAnswer
         */
        addExtraTags?: string[]

    }[]
}