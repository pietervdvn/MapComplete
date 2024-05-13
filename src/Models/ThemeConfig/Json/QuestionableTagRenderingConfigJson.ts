import { TagConfigJson } from "./TagConfigJson"
import { TagRenderingConfigJson } from "./TagRenderingConfigJson"
import type { Translatable } from "./Translatable"

export interface MappingConfigJson {
    /**
     * question: What tags should be matched to show this option?
     *
     * If in 'question'-mode and the contributor selects this option, these tags will be applied to the object
     */
    if: TagConfigJson

    /**
     * Question: What corresponding text should be shown?
     * Shown if the `if` is fulfilled
     * Type: rendered
     */
    then: string | Record<string, string>
    /**
     * question: What icon should be shown next to this mapping?
     *
     * This icon will only be shown if the value is known, it is not displayed in the options (but might be in the future)
     *
     * ifunset: Show no icon
     * Type: icon
     */
    icon?:
        | string
        | {
              /**
               * The path to the  icon
               * Type: icon
               */
              path: string
              /**
               * Size of the image
               */
              class?: "small" | "medium" | "large" | string
          }

    /**
     * question: Under what circumstances should this mapping be <b>hidden</b> from the possibilities a contributor can pick?
     * iftrue: Never show this mapping as option to pick
     * ifunset: Always show this mapping as option to pick
     * type: tag
     *
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
    hideInAnswer?: boolean | TagConfigJson

    /**
     * question: In what other cases should this item be rendered?
     *
     * Also show this 'then'-option if the feature matches these tags.
     * Ideal for outdated tags or default assumptions. The tags from this options will <b>not</b> be set if the option is chosen!
     *
     * ifunset: No other cases when this text is shown
     */
    alsoShowIf?: TagConfigJson

    /**
     * question: What tags should be applied if this mapping is _not_ chosen?
     *
     * Only applicable if 'multiAnswer' is set.
     * This is for situations such as:
     * `accepts:coins=no` where one can select all the possible payment methods. However, we want to make explicit that some options _were not_ selected.
     * This can be done with `ifnot`
     * Note that we can not explicitly render this negative case to the user, we cannot show `does _not_ accept coins`.
     * If this is important to your usecase, consider using multiple radiobutton-fields without `multiAnswer`
     *
     * ifunset: Do not apply a tag if a different mapping is chosen.
     */
    ifnot?: TagConfigJson

    /**
     * question: What extra tags should be added to the object if this object is chosen?
     * type: simple_tag
     *
     * If chosen as answer, these tags will be applied onto the object, together with the tags from the `if`
     * Not compatible with multiAnswer.
     *
     * This can be used e.g. to erase other keys which indicate the 'not' value:
     *```json
     * {
     *     "if": "crossing:marking=rainbow",
     *     "then": "This is a rainbow crossing",
     *     "addExtraTags": ["not:crossing:marking="]
     * }
     * ```
     *
     */
    addExtraTags?: string[]

    /**
     * question: If there are many options, what search terms match too?
     * If there are many options, the mappings-radiobuttons will be replaced by an element with a searchfunction
     *
     * Searchterms (per language) allow to easily find an option if there are many options
     * group: hidden
     */
    searchTerms?: Record<string, string[]>

    /**
     * If the searchable selector is picked, mappings with this item will have priority and show up even if the others are hidden
     * Use this sparingly
     * group: hidden
     */
    priorityIf?: TagConfigJson

    /**
     * Used for comments or to disable a validation
     *
     * group: hidden
     * ignore-image-in-then: normally, a `then`-clause is not allowed to have an `img`-html-element as icons are preferred. In some cases (most notably title-icons), this is allowed
     */
    "#"?: string | "ignore-image-in-then"
}

/**
 * A QuestionableTagRenderingConfigJson is a single piece of code which converts one ore more tags into a HTML-snippet.
 * If the desired tags are missing and a question is defined, a question will be shown instead.
 */
export interface QuestionableTagRenderingConfigJson extends TagRenderingConfigJson {
    /*
     * The id of the tagrendering, should be an unique string.
     * Used to keep the translations in sync. Only used in the tagRenderings-array of a layerConfig, not requered otherwise.
     *
     * question: What is the id of this tagRendering?
     */
    id: string

    /**
     * Allows fixed-tag inputs, shown either as radiobuttons or as checkboxes
     *
     * question: What are common options?
     */
    mappings?: MappingConfigJson[]

    /**
     * If true, use checkboxes instead of radio buttons when asking the question
     *
     * question: Should a contributor be allowed to select multiple mappings?
     *
     * iftrue: allow to select multiple mappings
     * iffalse: only allow to select a single mapping
     * ifunset: only allow to select a single mapping
     */
    multiAnswer?: boolean

    /**
     * Allow freeform text input from the user
     */
    freeform?: {
        /**
         * question: What is the name of the attribute that should be written to?
         * This is the OpenStreetMap-key that that value will be written to
         * ifunset: do not offer a freeform textfield as answer option
         *
         */
        key?: string

        /**
         * question: What is the input type?
         * The type of the text-field, e.g. 'string', 'nat', 'float', 'date',...
         * See Docs/SpecialInputElements.md and UI/Input/ValidatedTextField.ts for supported values
         * ifunset: use an unconstrained <b>string</b> as input (default)
         * suggestions: return validators.AllValidators.filter(type => !type.isMeta).map((type) => ({if: "value="+type.name, then: "<b>"+type.name+"</b> "+type.explanation.split("\n")[0]}))
         **/
        type?: string
        /**
         * question: What placeholder text should be shown in the input-element if there is no input?
         * A (translated) text that is shown (as gray text) within the textfield
         * type: translation
         * group: expert
         * ifunset: No specific placeholder is set, show the type of the textfield
         */
        placeholder?: Translatable

        /**
         * Extra parameters to initialize the input helper arguments.
         * For semantics, see the 'SpecialInputElements.md'
         * group: expert
         */
        helperArgs?: (string | number | boolean | any)[]
        /**
         * If a value is added with the textfield, these extra tag is addded.
         * Useful to add a 'fixme=freeform textfield used - to be checked'
         * group: expert
         **/
        addExtraTags?: string[]

        /**
         * question: Show the freeform as box within the question?
         * Instead of showing a full-width text field, the text field will be shown within the rendering of the question.
         *
         * This combines badly with special input elements, as it'll distort the layout.
         * ifunset: show the freeform input field full-width
         * iftrue: show the freeform input field as a small field within the question
         * group: expert
         */
        inline?: boolean

        /**
         * question: What value should be entered in the text field if no value is set?
         * This can help people to quickly enter the most common option
         * ifunset: do not prefill the textfield
         * group: expert
         */
        default?: string
        /**
         * question: What values of the freeform key should be interpreted as 'unknown'?
         * For example, if a feature has `shop=yes`, the question 'what type of shop is this?' should still asked
         * ifunset: The question will be considered answered if any value is set for the key
         * group: expert
         */
        invalidValues?: TagConfigJson
    }

    /**
     * question: What question should be shown to the contributor?
     *
     * A question is presented ot the user if no mapping matches and the 'freeform' key is not set as well.
     *
     * ifunset: This tagrendering will be shown if it is known, but cannot be edited by the contributor, effectively resutling in a read-only rendering
     */
    question?: Translatable

    /**
     * question: Should some extra information be shown to the contributor, alongside the question?
     * This hint is shown in subtle text under the question.
     * This can give some extra information on what the answer should ook like
     * ifunset: No extra hint is given
     */
    questionHint?: Translatable

    /**
     * When using a screenreader and selecting the 'edit' button, the current rendered value is read aloud in normal circumstances.
     * In some rare cases, this is not desirable. For example, if the rendered value is a link to a website, this link can be selected (and will be read aloud).
     * If the user presses _tab_ again, they'll select the button and have the link read aloud a second time.
     */
    editButtonAriaLabel?: Translatable

    /**
     * A list of labels. These are strings that are used for various purposes, e.g. to only include a subset of the tagRenderings when reusing a layer
     */
    labels?: string[]
}
