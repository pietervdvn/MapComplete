import { Translation, TypedTranslation } from "../../UI/i18n/Translation"
import { TagsFilter } from "../../Logic/Tags/TagsFilter"
import Translations from "../../UI/i18n/Translations"
import { TagUtils, UploadableTag } from "../../Logic/Tags/TagUtils"
import { And } from "../../Logic/Tags/And"
import { Utils } from "../../Utils"
import { Tag } from "../../Logic/Tags/Tag"
import BaseUIElement from "../../UI/BaseUIElement"
import Combine from "../../UI/Base/Combine"
import Title from "../../UI/Base/Title"
import Link from "../../UI/Base/Link"
import List from "../../UI/Base/List"
import {
    MappingConfigJson,
    QuestionableTagRenderingConfigJson,
} from "./Json/QuestionableTagRenderingConfigJson"
import { FixedUiElement } from "../../UI/Base/FixedUiElement"
import Validators, { ValidatorType } from "../../UI/InputElement/Validators"
import { TagRenderingConfigJson } from "./Json/TagRenderingConfigJson"
import { RegexTag } from "../../Logic/Tags/RegexTag"

export interface Icon {}

export interface Mapping {
    readonly if: UploadableTag
    readonly alsoShowIf: Tag | undefined
    readonly ifnot?: UploadableTag
    readonly then: TypedTranslation<object>
    readonly icon: string
    readonly iconClass:
        | string
        | "small"
        | "medium"
        | "large"
        | "small-height"
        | "medium-height"
        | "large-height"
    readonly hideInAnswer: boolean | TagsFilter
    readonly addExtraTags: Tag[]
    readonly searchTerms?: Record<string, string[]>
    readonly priorityIf?: TagsFilter
}

/***
 * The parsed version of TagRenderingConfigJSON
 * Identical data, but with some methods and validation
 */
export default class TagRenderingConfig {
    public readonly id: string
    public readonly render?: TypedTranslation<object>
    public readonly renderIcon?: string
    public readonly renderIconClass?: string
    public readonly question?: TypedTranslation<object>
    public readonly questionhint?: TypedTranslation<object>
    public readonly questionHintIsMd?: boolean
    public readonly condition?: TagsFilter
    public readonly invalidValues?: TagsFilter
    /**
     * Evaluated against the current 'usersettings'-state
     */
    public readonly metacondition?: TagsFilter
    public readonly description?: Translation

    public readonly configuration_warnings: string[] = []

    public readonly freeform?: {
        readonly key: string
        readonly type: ValidatorType
        readonly placeholder: Translation
        readonly addExtraTags: UploadableTag[]
        readonly inline: boolean
        readonly default?: string
        readonly helperArgs?: (string | number | boolean)[]
    }

    public readonly multiAnswer: boolean

    public readonly mappings?: Mapping[]
    public readonly editButtonAriaLabel?: Translation
    public readonly labels: string[]
    public readonly classes: string[] | undefined

    constructor(
        config: string | TagRenderingConfigJson | (QuestionableTagRenderingConfigJson & {questionHintIsMd?: boolean}),
        context?: string
    ) {
        let json = <string | QuestionableTagRenderingConfigJson>config
        if (json === undefined) {
            throw "Initing a TagRenderingConfig with undefined in " + context
        }

        if (typeof json === "number") {
            json = "" + json
        }

        let translationKey = context
        if (json["id"] !== undefined) {
            const layerId = (context ?? "").split(".")[0]
            if (json["source"]) {
                let src = json["source"] + ":"
                if (json["source"] === "shared-questions") {
                    src += "shared_questions."
                }
                translationKey = `${src}${json["id"] ?? ""}`
            } else {
                translationKey = `layers:${layerId}.tagRenderings.${json["id"] ?? ""}`
            }
        }

        if (typeof json === "string") {
            this.render = Translations.T(json, translationKey + ".render")
            this.multiAnswer = false
            return
        }

        this.id = json.id ?? "" // Some tagrenderings - especially for the map rendering - don't need an ID
        if (this.id.match(/^[a-zA-Z0-9 ()?/=:;,_-]*$/) === null) {
            throw (
                "Invalid ID in " +
                context +
                ": an id can only contain [a-zA-Z0-0_-] as characters. The offending id is: " +
                this.id
            )
        }

        this.labels = json.labels ?? []
        if (typeof json.classes === "string") {
            this.classes = (<string>json.classes).split(" ")
        } else {
            this.classes = json.classes ?? []
        }
        this.classes = [].concat(...this.classes.map((cl) => cl.split(" ")))
        if (this.classes.length === 0) {
            this.classes = undefined
        }

        this.render = Translations.T(<any>json.render, translationKey + ".render")
        this.question = Translations.T(json.question, translationKey + ".question")
        this.questionhint = Translations.T(json.questionHint, translationKey + ".questionHint")
        this.questionHintIsMd = json["questionHintIsMd"] ?? false
        this.description = Translations.T(json.description, translationKey + ".description")
        this.editButtonAriaLabel = Translations.T(
            json.editButtonAriaLabel,
            translationKey + ".editButtonAriaLabel"
        )

        this.condition = TagUtils.Tag(json.condition ?? { and: [] }, `${context}.condition`)
        this.invalidValues = json["invalidValues"]
            ? TagUtils.Tag(json["invalidValues"], `${context}.invalidValues`)
            : undefined
        if (typeof json.icon === "string") {
            this.renderIcon = json.icon
            this.renderIconClass = "small"
        } else if (typeof json.icon === "object") {
            this.renderIcon = json.icon.path
            this.renderIconClass = json.icon.class ?? "small"
        }
        this.metacondition = TagUtils.Tag(
            json.metacondition ?? { and: [] },
            `${context}.metacondition`
        )
        if (json.freeform) {
            if (
                json.freeform.addExtraTags !== undefined &&
                json.freeform.addExtraTags.map === undefined
            ) {
                throw `Freeform.addExtraTags should be a list of strings - not a single string (at ${context})`
            }
            if (
                json.freeform.type &&
                Validators.availableTypes.indexOf(<any>json.freeform.type) < 0
            ) {
                throw `At ${context}: invalid type ${
                    json.freeform.type
                }, perhaps you meant ${Utils.sortedByLevenshteinDistance(
                    json.freeform.key,
                    <any>Validators.availableTypes,
                    (s) => <any>s
                )}`
            }
            const type: ValidatorType = <any>json.freeform.type ?? "string"

            let placeholder: Translation = Translations.T(json.freeform.placeholder)
            if (placeholder === undefined) {
                const typeDescription = <Translation>Translations.t.validation[type]?.description
                const key = json.freeform.key
                if (typeDescription !== undefined) {
                    placeholder = typeDescription.OnEveryLanguage((l) => key + " (" + l + ")")
                } else {
                    placeholder = Translations.T(key + " (" + type + ")")
                }
            }

            this.freeform = {
                key: json.freeform.key,
                type,
                placeholder,
                addExtraTags:
                    json.freeform.addExtraTags?.map((tg, i) =>
                        TagUtils.ParseUploadableTag(tg, `${context}.extratag[${i}]`)
                    ) ?? [],
                inline: json.freeform.inline ?? false,
                default: json.freeform.default,
                helperArgs: json.freeform.helperArgs,
            }
            if (json.freeform["extraTags"] !== undefined) {
                throw `Freeform.extraTags is defined. This should probably be 'freeform.addExtraTag' (at ${context})`
            }
            if (this.freeform.key === undefined || this.freeform.key === "") {
                throw `Freeform.key is undefined or the empty string - this is not allowed; either fill out something or remove the freeform block alltogether. Error in ${context}`
            }
            if (json.freeform["args"] !== undefined) {
                throw `Freeform.args is defined. This should probably be 'freeform.helperArgs' (at ${context})`
            }

            if (json.freeform.key === "questions") {
                if (this.id !== "questions") {
                    throw `If you use a freeform key 'questions', the ID must be 'questions' too to trigger the special behaviour. The current id is '${this.id}' (at ${context})`
                }
            }

            // freeform.type is validated in Validation.ts so that we don't need ValidatedTextFields here
            if (this.freeform.addExtraTags) {
                const usedKeys = new And(this.freeform.addExtraTags).usedKeys()
                if (usedKeys.indexOf(this.freeform.key) >= 0) {
                    throw `The freeform key ${this.freeform.key} will be overwritten by one of the extra tags, as they use the same key too. This is in ${context}`
                }
            }
        }

        this.multiAnswer = json.multiAnswer ?? false
        if (json.mappings) {
            if (!Array.isArray(json.mappings)) {
                throw "Tagrendering has a 'mappings'-object, but expected a list (" + context + ")"
            }

            const firstMappingSize: string = json.mappings
                .map((m) => m?.icon?.["class"])
                .find((c) => !!c)
            const commonIconSize = firstMappingSize ?? json["#iconsize"] ?? "small"
            this.mappings = json.mappings.map((m, i) =>
                TagRenderingConfig.ExtractMapping(
                    m,
                    i,
                    translationKey,
                    context,
                    this.multiAnswer,
                    this.question !== undefined,
                    commonIconSize
                )
            )
        }

        if (!json.multiAnswer && this.mappings !== undefined && this.question !== undefined) {
            let keys = []
            for (let i = 0; i < this.mappings.length; i++) {
                const mapping = this.mappings[i]
                if (mapping.if === undefined) {
                    throw `${context}.mappings[${i}].if is undefined`
                }
                keys.push(...mapping.if.usedKeys())
            }
            keys = Utils.Dedup(keys)
            for (let i = 0; i < this.mappings.length; i++) {
                const mapping = this.mappings[i]
                if (mapping.hideInAnswer) {
                    continue
                }

                const usedKeys = mapping.if.usedKeys()
                for (const expectedKey of keys) {
                    if (usedKeys.indexOf(expectedKey) < 0) {
                        const msg = `${context}.mappings[${i}]: This mapping only defines values for ${usedKeys.join(
                            ", "
                        )}, but it should also give a value for ${expectedKey}`
                        this.configuration_warnings.push(msg)
                    }
                }
            }
        }

        if (this.question !== undefined && json.multiAnswer) {
            if ((this.mappings?.length ?? 0) === 0) {
                throw `${context} MultiAnswer is set, but no mappings are defined`
            }

            let allKeys = []
            let allHaveIfNot = true
            for (const mapping of this.mappings) {
                if (mapping.hideInAnswer) {
                    continue
                }
                if (mapping.ifnot === undefined) {
                    allHaveIfNot = false
                }
                allKeys = allKeys.concat(mapping.if.usedKeys())
            }
            allKeys = Utils.Dedup(allKeys)
            if (allKeys.length > 1 && !allHaveIfNot) {
                throw `${context}: A multi-answer is defined, which generates values over multiple keys. Please define ifnot-tags too on every mapping`
            }

            if (allKeys.length > 1 && this.freeform?.key !== undefined) {
                throw `${context}: A multi-answer is defined, which generates values over multiple keys. This is incompatible with having a freeform key`
            }
        }
    }

    /**
     * const tr = TagRenderingConfig.ExtractMapping({if: "a=b", then: "x", priorityIf: "_country=be"}, 0, "test","test", false,true)
     * tr.if // => new Tag("a","b")
     * tr.priorityIf // => new Tag("_country","be")
     */
    public static ExtractMapping(
        mapping: MappingConfigJson,
        i: number,
        translationKey: string,
        context: string,
        multiAnswer?: boolean,
        isQuestionable?: boolean,
        commonSize: string = "small"
    ) {
        const ctx = `${translationKey}.mappings.${i}`
        if (mapping.if === undefined) {
            throw `Invalid mapping: "if" is not defined`
        }
        if (mapping.then === undefined) {
            if (mapping["render"] !== undefined) {
                throw `${ctx}: Invalid mapping: no 'then'-clause found. You might have typed 'render' instead of 'then', change it in ${JSON.stringify(
                    mapping
                )}`
            }
            throw `${ctx}: Invalid mapping: no 'then'-clause found in ${JSON.stringify(mapping)}`
        }
        if (mapping.ifnot !== undefined && !multiAnswer) {
            throw `${ctx}: Invalid mapping: 'ifnot' is defined, but the tagrendering is not a multianswer. Either remove ifnot or set 'multiAnswer:true' to enable checkboxes instead of radiobuttons`
        }

        if (mapping["render"] !== undefined) {
            throw `${ctx}: Invalid mapping: a 'render'-key is present, this is probably a bug: ${JSON.stringify(
                mapping
            )}`
        }
        if (typeof mapping.if !== "string" && mapping.if["length"] !== undefined) {
            throw `${ctx}: Invalid mapping: "if" is defined as an array. Use {"and": <your conditions>} or {"or": <your conditions>} instead`
        }

        if (mapping.addExtraTags !== undefined && multiAnswer) {
            throw `${ctx}: Invalid mapping: got a multi-Answer with addExtraTags; this is not allowed`
        }

        let hideInAnswer: boolean | TagsFilter = false
        if (typeof mapping.hideInAnswer === "boolean") {
            hideInAnswer = mapping.hideInAnswer
        } else if (mapping.hideInAnswer !== undefined) {
            hideInAnswer = TagUtils.Tag(
                mapping.hideInAnswer,
                `${context}.mapping[${i}].hideInAnswer`
            )
        }
        const addExtraTags = (mapping.addExtraTags ?? []).map((str, j) =>
            TagUtils.SimpleTag(str, `${ctx}.addExtraTags[${j}]`)
        )
        if (hideInAnswer === true && addExtraTags.length > 0) {
            throw `${ctx}: Invalid mapping: 'hideInAnswer' is set to 'true', but 'addExtraTags' is enabled as well. This means that extra tags will be applied if this mapping is chosen as answer, but it cannot be chosen as answer. This either indicates a thought error or obsolete code that must be removed.`
        }

        let icon = undefined
        let iconClass = commonSize
        if (!!mapping.icon) {
            if (typeof mapping.icon === "string" && mapping.icon !== "") {
                icon = mapping.icon.trim()
            } else if (mapping.icon["path"]) {
                icon = mapping.icon["path"].trim()
                iconClass = mapping.icon["class"] ?? iconClass
            }
        }
        const prioritySearch =
            mapping.priorityIf !== undefined
                ? TagUtils.Tag(mapping.priorityIf, `${ctx}.priorityIf`)
                : undefined
        const mp = <Mapping>{
            if: TagUtils.Tag(mapping.if, `${ctx}.if`),
            ifnot:
                mapping.ifnot !== undefined
                    ? TagUtils.Tag(mapping.ifnot, `${ctx}.ifnot`)
                    : undefined,
            then: Translations.T(mapping.then, `${ctx}.then`),
            alsoShowIf:
                mapping.alsoShowIf !== undefined
                    ? TagUtils.Tag(mapping.alsoShowIf, `${ctx}.alsoShowIf`)
                    : undefined,
            hideInAnswer,
            icon,
            iconClass,
            addExtraTags,
            searchTerms: mapping.searchTerms,
            priorityIf: prioritySearch,
        }
        if (isQuestionable) {
            if (hideInAnswer !== true && mp.if !== undefined && !mp.if.isUsableAsAnswer()) {
                throw `${context}.mapping[${i}].if: This value cannot be used to answer a question, probably because it contains a regex or an OR. Either change it or set 'hideInAnswer'`
            }

            if (hideInAnswer !== true && !(mp.ifnot?.isUsableAsAnswer() ?? true)) {
                throw `${context}.mapping[${i}].ifnot: This value cannot be used to answer a question, probably because it contains a regex or an OR. If a contributor were to pick this as an option, MapComplete wouldn't be able to determine which tags to add.\n    Either change it or set 'hideInAnswer'`
            }
        }

        return mp
    }

    /**
     * Returns true if it is known or not shown, false if the question should be asked
     * @constructor
     */
    public IsKnown(tags: Record<string, string>): boolean {
        if (this.condition && !this.condition.matchesProperties(tags)) {
            // Filtered away by the condition, so it is kind of known
            return true
        }
        if (this.invalidValues && this.invalidValues.matchesProperties(tags)) {
            return false
        }
        if (this.multiAnswer) {
            for (const m of this.mappings ?? []) {
                if (TagUtils.MatchesMultiAnswer(m.if, tags)) {
                    return true
                }
            }

            const free = this.freeform?.key
            if (free !== undefined) {
                const value = tags[free]
                if (typeof value === "object") {
                    return Object.keys(value).length > 0
                }
                return value !== undefined && value !== ""
            }
            return false
        }

        if (this.GetRenderValue(tags) !== undefined) {
            // This value is known and can be rendered
            return true
        }

        return false
    }

    /**
     * Gets all the render values. Will return multiple render values if 'multianswer' is enabled.
     * The result will equal [GetRenderValue] if not 'multiAnswer'
     * @param tags
     * @constructor
     */
    public GetRenderValues(
        tags: Record<string, string>
    ): { then: Translation; icon?: string; iconClass?: string }[] {
        if (!this.multiAnswer) {
            return [this.GetRenderValueWithImage(tags)]
        }

        // A flag to check that the freeform key isn't matched multiple times
        // If it is undefined, it is "used" already, or at least we don't have to check for it anymore
        let freeformKeyDefined = this.freeform?.key !== undefined
        let usedFreeformValues = new Set<string>()
        // We run over all the mappings first, to check if the mapping matches
        const applicableMappings: {
            then: TypedTranslation<Record<string, string>>
            img?: string
        }[] = Utils.NoNull(
            (this.mappings ?? [])?.map((mapping) => {
                if (mapping.if === undefined) {
                    return mapping
                }
                if (TagUtils.MatchesMultiAnswer(mapping.if, tags)) {
                    if (freeformKeyDefined && mapping.if.isUsableAsAnswer()) {
                        // THe freeform key is defined: what value does it use though?
                        // We mark the value to see if we have any leftovers
                        const value = mapping.if
                            .asChange({})
                            .find((kv) => kv.k === this.freeform.key).v
                        usedFreeformValues.add(value)
                    }
                    return mapping
                }
                return undefined
            })
        )

        if (freeformKeyDefined && tags[this.freeform.key] !== undefined) {
            const freeformValues = tags[this.freeform.key].split(";")
            const leftovers = freeformValues.filter((v) => !usedFreeformValues.has(v))
            for (const leftover of leftovers) {
                applicableMappings.push({
                    then: new TypedTranslation<object>(
                        this.render.replace("{" + this.freeform.key + "}", leftover).translations,
                        this.render.context
                    ),
                })
            }
        }
        return applicableMappings
    }

    public GetRenderValue(tags: Record<string, string>): TypedTranslation<any> | undefined {
        return this.GetRenderValueWithImage(tags)?.then
    }

    /**
     * Gets the correct rendering value (or undefined if not known)
     * Not compatible with multiAnswer - use GetRenderValueS instead in that case
     * @constructor
     */
    public GetRenderValueWithImage(
        tags: Record<string, string>
    ): { then: TypedTranslation<any>; icon?: string; iconClass?: string } | undefined {
        if (this.condition !== undefined) {
            if (!this.condition.matchesProperties(tags)) {
                return undefined
            }
        }

        if (this.mappings !== undefined && !this.multiAnswer) {
            for (const mapping of this.mappings) {
                if (mapping.if === undefined) {
                    return mapping
                }
                if (mapping.if.matchesProperties(tags)) {
                    return mapping
                }
                if (mapping.alsoShowIf?.matchesProperties(tags)) {
                    return mapping
                }
            }
        }

        if (this.freeform?.key === undefined || tags[this.freeform.key] !== undefined) {
            return { then: this.render, icon: this.renderIcon, iconClass: this.renderIconClass }
        }

        return undefined
    }

    /**
     * Gets all translations that might be rendered in all languages
     * USed for static analysis
     * @constructor
     * @private
     */
    EnumerateTranslations(): Translation[] {
        const translations: Translation[] = []
        for (const key in this) {
            if (!this.hasOwnProperty(key)) {
                continue
            }
            const o = this[key]
            if (o instanceof Translation) {
                translations.push(o)
            }
        }
        return translations
    }

    FreeformValues(): { key: string; type?: string; values?: string[] } {
        try {
            const key = this.freeform?.key
            const answerMappings = this.mappings?.filter((m) => m.hideInAnswer !== true)
            if (key === undefined) {
                let values: { k: string; v: string }[][] = Utils.NoNull(
                    answerMappings?.map((m) => m.if.asChange({})) ?? []
                )
                if (values.length === 0) {
                    return
                }

                const allKeys = values.map((arr) => arr.map((o) => o.k))
                let common = allKeys[0]
                for (const keyset of allKeys) {
                    common = common.filter((item) => keyset.indexOf(item) >= 0)
                }
                const commonKey = common[0]
                if (commonKey === undefined) {
                    return undefined
                }
                return {
                    key: commonKey,
                    values: Utils.NoNull(
                        values.map((arr) => arr.filter((item) => item.k === commonKey)[0]?.v)
                    ),
                }
            }

            let values = Utils.NoNull(
                answerMappings?.map(
                    (m) => m.if.asChange({}).filter((item) => item.k === key)[0]?.v
                ) ?? []
            )
            if (values.length === undefined) {
                values = undefined
            }
            return {
                key,
                type: this.freeform.type,
                values,
            }
        } catch (e) {
            console.error("Could not create FreeformValues for tagrendering", this.id)
            return undefined
        }
    }

    /**
     * Given a value for the freeform key and an overview of the selected mappings, construct the correct tagsFilter to apply
     *
     * const config = new TagRenderingConfig({"id":"bookcase-booktypes","render":{"en":"This place mostly serves {books}" },
     * "question":{"en":"What kind of books can be found in this public bookcase?"},
     * "freeform":{"key":"books","addExtraTags":["fixme=Freeform tag `books` used, to be doublechecked"],
     * "inline":true},
     * "multiAnswer":true,
     * "mappings":[{"if":"books=children","then":"Mostly children books"},
     * {"if":"books=adults","then": "Mostly books for adults"}]}
     * , "testcase")
     * config.constructChangeSpecification(undefined, undefined, [false, true, false], {amenity: "public_bookcase"}) // => new And([new Tag("books","adults")])
     *
     * const config = new TagRenderingConfig({"id":"capacity", "render": "Fits {capcity} books",freeform: {"key":"capacity",type:"pnat"} })
     * config.constructChangeSpecification("", undefined, undefined, {}) // => undefined
     * config.constructChangeSpecification("5", undefined, undefined, {}).optimize() // => new Tag("capacity", "5")
     *
     * // Should pick a mapping, even if freeform is used
     * const config = new TagRenderingConfig({"id": "shop-types", render: "Shop type is {shop}", freeform: {key: "shop", addExtraTags:["fixme=freeform shop type used"]}, mappings:[{if: "shop=second_hand", then: "Second hand shop"}]})
     * config.constructChangeSpecification("freeform", 1, undefined, {}).asHumanString(false,  false, {}) // => "shop=freeform & fixme=freeform shop type used"
     * config.constructChangeSpecification("freeform", undefined, undefined, {}).asHumanString(false,  false, {}) // => "shop=freeform & fixme=freeform shop type used"
     * config.constructChangeSpecification("second_hand", 1, undefined, {}).asHumanString(false,  false, {}) // => "shop=second_hand"
     *
     *
     * const config = new TagRenderingConfig({id: "oh", render: "{opening_hours}", question: {"en":"When open?"}, freeform: {key: "opening_hours"},
     *      mappings: [{  "if": "opening_hours=closed",
     *           "then": {
     *             "en": "Marked as closed for an unspecified time",
     *           },
     *           "hideInAnswer": true}] }
     * const tags = config.constructChangeSpecification("Tu-Fr 05:30-09:30", undefined, undefined, { }}
     * tags // =>new And([ new Tag("opening_hours", "Tu-Fr 05:30-09:30")])
     *
     * @param freeformValue The freeform value which will be applied as 'freeform.key'. Ignored if 'freeform.key' is not set
     *
     * @param singleSelectedMapping (Only used if multiAnswer == false): the single mapping to apply. Use (mappings.length) for the freeform
     * @param multiSelectedMapping (Only used if multiAnswer == true): all the mappings that must be applied. Set multiSelectedMapping[mappings.length] to use the freeform as well
     * @param currentProperties The current properties of the object for which the question should be answered
     */
    public constructChangeSpecification(
        freeformValue: string | undefined,
        singleSelectedMapping: number,
        multiSelectedMapping: boolean[] | undefined,
        currentProperties: Record<string, string>
    ): UploadableTag {
        if (typeof freeformValue === "string") {
            freeformValue = freeformValue?.trim()
        }
        const validator = Validators.get(<ValidatorType>this.freeform?.type)
        if (validator && freeformValue) {
            freeformValue = validator.reformat(freeformValue, () => currentProperties["_country"])
        }
        if (freeformValue === "") {
            freeformValue = undefined
        }
        if (
            freeformValue === undefined &&
            singleSelectedMapping === undefined &&
            multiSelectedMapping === undefined
        ) {
            return undefined
        }

        if (this.mappings === undefined && freeformValue === undefined) {
            return undefined
        }
        if (
            this.freeform !== undefined &&
            (this.mappings === undefined ||
                this.mappings.length == 0 ||
                (singleSelectedMapping === this.mappings.length && !this.multiAnswer))
        ) {
            const freeformOnly = { [this.freeform.key]: freeformValue }
            const matchingMapping = this.mappings?.find((m) => m.if.matchesProperties(freeformOnly))
            if (matchingMapping) {
                return new And([matchingMapping.if, ...(matchingMapping.addExtraTags ?? [])])
            }
            // Either no mappings, or this is a radio-button selected freeform value
            const tag = new And([
                new Tag(this.freeform.key, freeformValue),
                ...(this.freeform.addExtraTags ?? []),
            ])
            const newProperties = tag.applyOn(currentProperties)
            if (this.invalidValues?.matchesProperties(newProperties)) {
                return undefined
            }

            return tag
        }

        if (this.multiAnswer) {
            const selectedMappings: UploadableTag[] = this.mappings
                .filter((_, i) => multiSelectedMapping[i])
                .map((m) => new And([m.if, ...(m.addExtraTags ?? [])]))

            const unselectedMappings: UploadableTag[] = this.mappings
                .filter((_, i) => !multiSelectedMapping[i])
                .map((m) => m.ifnot)

            if (multiSelectedMapping.at(-1) && this.freeform) {
                // The freeform value was selected as well
                selectedMappings.push(
                    new And([
                        new Tag(this.freeform.key, freeformValue),
                        ...(this.freeform.addExtraTags ?? []),
                    ])
                )
            }
            const and = TagUtils.FlattenMultiAnswer([...selectedMappings, ...unselectedMappings])
            if (and.and.length === 0) {
                return undefined
            }
            return and
        }

        // Is at least one mapping shown in the answer?
        const someMappingIsShown = this.mappings.some((m) => {
            if (typeof m.hideInAnswer === "boolean") {
                return !m.hideInAnswer
            }
            const isHidden = m.hideInAnswer.matchesProperties(currentProperties)
            return !isHidden
        })
        // If all mappings are hidden for the current tags, we can safely assume that we should use the freeform key
        const useFreeform =
            freeformValue !== undefined &&
            (singleSelectedMapping === this.mappings.length ||
                !someMappingIsShown ||
                singleSelectedMapping === undefined)
        if (useFreeform) {
            return new And([
                new Tag(this.freeform.key, freeformValue),
                ...(this.freeform.addExtraTags ?? []),
            ])
        } else if (singleSelectedMapping !== undefined) {
            return new And([
                this.mappings[singleSelectedMapping].if,
                ...(this.mappings[singleSelectedMapping].addExtraTags ?? []),
            ])
        } else {
            console.error("TagRenderingConfig.ConstructSpecification has a weird fallback for", {
                freeformValue,
                singleSelectedMapping,
                multiSelectedMapping,
                currentProperties,
                useFreeform,
            })

            return undefined
        }
    }

    GenerateDocumentation(): BaseUIElement {
        let withRender: (BaseUIElement | string)[] = []
        if (this.freeform?.key !== undefined) {
            withRender = [
                `This rendering asks information about the property `,
                Link.OsmWiki(this.freeform.key),
                new Combine([
                    "This is rendered with ",
                    new FixedUiElement(this.render.txt).SetClass("code font-bold"),
                ]),
            ]
        }

        let mappings: BaseUIElement = undefined
        if (this.mappings !== undefined) {
            mappings = new List(
                [].concat(
                    ...this.mappings.map((m) => {
                        const msgs: (string | BaseUIElement)[] = [
                            new Combine([
                                new FixedUiElement(m.then.txt).SetClass("font-bold"),
                                " corresponds with ",
                                m.if.asHumanString(true, false, {}),
                            ]),
                        ]
                        if (m.hideInAnswer === true) {
                            msgs.push("_This option cannot be chosen as answer_")
                        }
                        if (m.ifnot !== undefined) {
                            msgs.push(
                                "Unselecting this answer will add " +
                                    m.ifnot.asHumanString(true, false, {})
                            )
                        }
                        return msgs
                    })
                )
            )
        }

        let condition: BaseUIElement = undefined
        if (this.condition !== undefined && !this.condition?.matchesProperties({})) {
            condition = new Combine([
                "This tagrendering is only visible in the popup if the following condition is met:",
                new FixedUiElement(
                    (<TagsFilter>this.condition.optimize()).asHumanString(true, false, {})
                ).SetClass("code"),
            ])
        }

        let labels: BaseUIElement = undefined
        if (this.labels?.length > 0) {
            labels = new Combine([
                "This tagrendering has labels ",
                ...this.labels.map((label) => new FixedUiElement(label).SetClass("code")),
            ]).SetClass("flex")
        }

        return new Combine([
            new Title(this.id, 3),
            this.description,
            this.question !== undefined
                ? new Combine([
                      "The question is ",
                      new FixedUiElement(this.question.txt).SetClass("font-bold bold"),
                  ])
                : new FixedUiElement(
                      "This tagrendering has no question and is thus read-only"
                  ).SetClass("italic"),
            new Combine(withRender),
            mappings,
            condition,
            labels,
        ]).SetClass("flex flex-col")
    }

    public usedTags(): TagsFilter[] {
        const tags: TagsFilter[] = []
        tags.push(
            this.metacondition,
            this.condition,
            this.freeform?.key ? new RegexTag(this.freeform?.key, /.*/) : undefined,
            this.invalidValues
        )
        for (const m of this.mappings ?? []) {
            tags.push(m.if)
            tags.push(m.priorityIf)
            tags.push(m.alsoShowIf)
            tags.push(...(m.addExtraTags ?? []))
            if (typeof m.hideInAnswer !== "boolean") {
                tags.push(m.hideInAnswer)
            }
            tags.push(m.ifnot)
        }

        return Utils.NoNull(tags)
    }
}
