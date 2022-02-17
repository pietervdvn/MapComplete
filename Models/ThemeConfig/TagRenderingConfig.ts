import {Translation} from "../../UI/i18n/Translation";
import {TagsFilter} from "../../Logic/Tags/TagsFilter";
import {TagRenderingConfigJson} from "./Json/TagRenderingConfigJson";
import Translations from "../../UI/i18n/Translations";
import {TagUtils} from "../../Logic/Tags/TagUtils";
import {And} from "../../Logic/Tags/And";
import ValidatedTextField from "../../UI/Input/ValidatedTextField";
import {Utils} from "../../Utils";
import {Tag} from "../../Logic/Tags/Tag";
import BaseUIElement from "../../UI/BaseUIElement";
import Combine from "../../UI/Base/Combine";
import Title from "../../UI/Base/Title";
import Link from "../../UI/Base/Link";
import List from "../../UI/Base/List";

/***
 * The parsed version of TagRenderingConfigJSON
 * Identical data, but with some methods and validation
 */
export default class TagRenderingConfig {

    public readonly id: string;
    public readonly group: string;
    public readonly render?: Translation;
    public readonly question?: Translation;
    public readonly condition?: TagsFilter;

    public readonly configuration_warnings: string[] = []

    public readonly freeform?: {
        readonly key: string,
        readonly type: string,
        readonly placeholder: Translation,
        readonly addExtraTags: TagsFilter[];
        readonly inline: boolean,
        readonly default?: string,
        readonly helperArgs?: (string | number | boolean)[]
    };

    public readonly multiAnswer: boolean;

    public readonly mappings?: {
        readonly if: TagsFilter,
        readonly ifnot?: TagsFilter,
        readonly then: Translation,
        readonly icon: string,
        readonly iconClass: string
        readonly hideInAnswer: boolean | TagsFilter
        readonly addExtraTags: Tag[]
    }[]
    public readonly labels: string[]

    constructor(json: string | TagRenderingConfigJson, context?: string) {
        if (json === undefined) {
            throw "Initing a TagRenderingConfig with undefined in " + context;
        }

        if (json === "questions") {
            // Very special value
            this.render = null;
            this.question = null;
            this.condition = null;
            this.id = "questions"
            this.group = ""
            return;
        }


        if (typeof json === "number") {
            json = "" + json
        }


        if (typeof json === "string") {
            this.render = Translations.T(json, context + ".render");
            this.multiAnswer = false;
            return;
        }


        this.id = json.id ?? ""; // Some tagrenderings - especially for the map rendering - don't need an ID
        if (this.id.match(/^[a-zA-Z0-9 ()?\/=:;,_-]*$/) === null) {
            throw "Invalid ID in " + context + ": an id can only contain [a-zA-Z0-0_-] as characters. The offending id is: " + this.id
        }


        this.group = json.group ?? "";
        this.labels = json.labels ?? []
        this.render = Translations.T(json.render, context + ".render");
        this.question = Translations.T(json.question, context + ".question");
        this.condition = TagUtils.Tag(json.condition ?? {"and": []}, `${context}.condition`);
        if (json.freeform) {

            if (json.freeform.addExtraTags !== undefined && json.freeform.addExtraTags.map === undefined) {
                throw `Freeform.addExtraTags should be a list of strings - not a single string (at ${context})`
            }
           const type = json.freeform.type ?? "string"

            let placeholder = Translations.T(json.freeform.placeholder)
            if (placeholder === undefined) {
                const typeDescription = Translations.t.validation[type]?.description
                placeholder = Translations.T(json.freeform.key+" ("+type+")")
                if(typeDescription !== undefined){
                    placeholder = placeholder.Fuse(typeDescription, type)
                }
            }

            this.freeform = {
                key: json.freeform.key,
                type,
                placeholder,
                addExtraTags: json.freeform.addExtraTags?.map((tg, i) =>
                    TagUtils.Tag(tg, `${context}.extratag[${i}]`)) ?? [],
                inline: json.freeform.inline ?? false,
                default: json.freeform.default,
                helperArgs: json.freeform.helperArgs

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


            if (!ValidatedTextField.ForType(this.freeform.key) === undefined) {
                const knownKeys = ValidatedTextField.AvailableTypes().join(", ");
                throw `Freeform.key ${this.freeform.key} is an invalid type. Known keys are ${knownKeys}`
            }
            if (this.freeform.addExtraTags) {
                const usedKeys = new And(this.freeform.addExtraTags).usedKeys();
                if (usedKeys.indexOf(this.freeform.key) >= 0) {
                    throw `The freeform key ${this.freeform.key} will be overwritten by one of the extra tags, as they use the same key too. This is in ${context}`;
                }
            }
        }

        this.multiAnswer = json.multiAnswer ?? false
        if (json.mappings) {

            if (!Array.isArray(json.mappings)) {
                throw "Tagrendering has a 'mappings'-object, but expected a list (" + context + ")"
            }

            this.mappings = json.mappings.map((mapping, i) => {

                const ctx = `${context}.mapping[${i}]`
                if (mapping.then === undefined) {
                    throw `${ctx}: Invalid mapping: if without body`
                }
                if (mapping.ifnot !== undefined && !this.multiAnswer) {
                    throw `${ctx}: Invalid mapping: ifnot defined, but the tagrendering is not a multianswer`
                }

                if (mapping.if === undefined) {
                    throw `${ctx}: Invalid mapping: "if" is not defined, but the tagrendering is not a multianswer`
                }
                if (typeof mapping.if !== "string" && mapping.if["length"] !== undefined) {
                    throw `${ctx}: Invalid mapping: "if" is defined as an array. Use {"and": <your conditions>} or {"or": <your conditions>} instead`
                }

                if (mapping.addExtraTags !== undefined && this.multiAnswer) {
                    throw `${ctx}: Invalid mapping: got a multi-Answer with addExtraTags; this is not allowed`
                }

                let hideInAnswer: boolean | TagsFilter = false;
                if (typeof mapping.hideInAnswer === "boolean") {
                    hideInAnswer = mapping.hideInAnswer;
                } else if (mapping.hideInAnswer !== undefined) {
                    hideInAnswer = TagUtils.Tag(mapping.hideInAnswer, `${context}.mapping[${i}].hideInAnswer`);
                }
                let icon = undefined;
                let iconClass = "small"
                if(mapping.icon !== undefined){
                    if (typeof mapping.icon === "string" && mapping.icon !== "") {
                        icon = mapping.icon
                    }else{
                        icon = mapping.icon["path"]
                        iconClass = mapping.icon["class"] ?? iconClass
                    }
                }
                const mp = {
                    if: TagUtils.Tag(mapping.if, `${ctx}.if`),
                    ifnot: (mapping.ifnot !== undefined ? TagUtils.Tag(mapping.ifnot, `${ctx}.ifnot`) : undefined),
                    then: Translations.T(mapping.then, `${ctx}.then`),
                    hideInAnswer,
                    icon,
                    iconClass,
                    addExtraTags: (mapping.addExtraTags ?? []).map((str, j) => TagUtils.SimpleTag(str, `${ctx}.addExtraTags[${j}]`))
                };
                if (this.question) {
                    if (hideInAnswer !== true && mp.if !== undefined && !mp.if.isUsableAsAnswer()) {
                        throw `${context}.mapping[${i}].if: This value cannot be used to answer a question, probably because it contains a regex or an OR. Either change it or set 'hideInAnswer'`
                    }

                    if (hideInAnswer !== true && !(mp.ifnot?.isUsableAsAnswer() ?? true)) {
                        throw `${context}.mapping[${i}].ifnot: This value cannot be used to answer a question, probably because it contains a regex or an OR. Either change it or set 'hideInAnswer'`
                    }
                }

                return mp;
            });
        }

        if (this.question && this.freeform?.key === undefined && this.mappings === undefined) {
            throw `${context}: A question is defined, but no mappings nor freeform (key) are. The question is ${this.question.txt} at ${context}`
        }

        if (this.id === "questions" && this.render !== undefined) {
            for (const ln in this.render.translations) {
                const txt: string = this.render.translations[ln]
                if (txt.indexOf("{questions}") >= 0) {
                    continue
                }
                throw `${context}: The rendering for language ${ln} does not contain {questions}. This is a bug, as this rendering should include exactly this to trigger those questions to be shown!`

            }
            if (this.freeform?.key !== undefined && this.freeform?.key !== "questions") {
                throw `${context}: If the ID is questions to trigger a question box, the only valid freeform value is 'questions' as well. Set freeform to questions or remove the freeform all together`
            }
        }


        if (this.freeform) {
            if (this.render === undefined) {
                throw `${context}: Detected a freeform key without rendering... Key: ${this.freeform.key} in ${context}`
            }
            for (const ln in this.render.translations) {
                const txt: string = this.render.translations[ln]
                if (txt === "") {
                    throw context + " Rendering for language " + ln + " is empty"
                }
                if (txt.indexOf("{" + this.freeform.key + "}") >= 0) {
                    continue
                }
                if (txt.indexOf("{" + this.freeform.key + ":") >= 0) {
                    continue
                }
                if (txt.indexOf("{canonical(" + this.freeform.key + ")") >= 0) {
                    continue
                }
                if (this.freeform.type === "opening_hours" && txt.indexOf("{opening_hours_table(") >= 0) {
                    continue
                }
                if (this.freeform.type === "wikidata" && txt.indexOf("{wikipedia(" + this.freeform.key) >= 0) {
                    continue
                }
                if (this.freeform.key === "wikidata" && txt.indexOf("{wikipedia()") >= 0) {
                    continue
                }
                throw `${context}: The rendering for language ${ln} does not contain the freeform key {${this.freeform.key}}. This is a bug, as this rendering should show exactly this freeform key!\nThe rendering is ${txt} `

            }
        }


        if (this.render && this.question && this.freeform === undefined) {
            throw `${context}: Detected a tagrendering which takes input without freeform key in ${context}; the question is ${this.question.txt}`
        }

        if (!json.multiAnswer && this.mappings !== undefined && this.question !== undefined) {
            let keys = []
            for (let i = 0; i < this.mappings.length; i++) {
                const mapping = this.mappings[i];
                if (mapping.if === undefined) {
                    throw `${context}.mappings[${i}].if is undefined`
                }
                keys.push(...mapping.if.usedKeys())
            }
            keys = Utils.Dedup(keys)
            for (let i = 0; i < this.mappings.length; i++) {
                const mapping = this.mappings[i];
                if (mapping.hideInAnswer) {
                    continue
                }

                const usedKeys = mapping.if.usedKeys();
                for (const expectedKey of keys) {
                    if (usedKeys.indexOf(expectedKey) < 0) {
                        const msg = `${context}.mappings[${i}]: This mapping only defines values for ${usedKeys.join(', ')}, but it should also give a value for ${expectedKey}`
                        this.configuration_warnings.push(msg)
                    }
                }
            }
        }

        if (this.question !== undefined && json.multiAnswer) {
            if ((this.mappings?.length ?? 0) === 0) {
                throw `${context} MultiAnswer is set, but no mappings are defined`
            }

            let allKeys = [];
            let allHaveIfNot = true;
            for (const mapping of this.mappings) {
                if (mapping.hideInAnswer) {
                    continue;
                }
                if (mapping.ifnot === undefined) {
                    allHaveIfNot = false;
                }
                allKeys = allKeys.concat(mapping.if.usedKeys());
            }
            allKeys = Utils.Dedup(allKeys);
            if (allKeys.length > 1 && !allHaveIfNot) {
                throw `${context}: A multi-answer is defined, which generates values over multiple keys. Please define ifnot-tags too on every mapping`
            }

        }
    }

    /**
     * Returns true if it is known or not shown, false if the question should be asked
     * @constructor
     */
    public IsKnown(tags: any): boolean {
        if (this.condition &&
            !this.condition.matchesProperties(tags)) {
            // Filtered away by the condition, so it is kindof known
            return true;
        }
        if (this.multiAnswer) {
            for (const m of this.mappings ?? []) {
                if (TagUtils.MatchesMultiAnswer(m.if, tags)) {
                    return true;
                }
            }

            const free = this.freeform?.key
            if (free !== undefined) {
                return tags[free] !== undefined
            }
            return false

        }

        if (this.GetRenderValue(tags) !== undefined) {
            // This value is known and can be rendered
            return true;
        }

        return false;
    }

    /**
     * Gets all the render values. Will return multiple render values if 'multianswer' is enabled.
     * The result will equal [GetRenderValue] if not 'multiAnswer'
     * @param tags
     * @constructor
     */
    public GetRenderValues(tags: any): { then: Translation, icon?: string, iconClass?: string }[] {
        if (!this.multiAnswer) {
            return [this.GetRenderValueWithImage(tags)]
        }

        // A flag to check that the freeform key isn't matched multiple times 
        // If it is undefined, it is "used" already, or at least we don't have to check for it anymore
        let freeformKeyUsed = this.freeform?.key === undefined;
        // We run over all the mappings first, to check if the mapping matches
        const applicableMappings: { then: Translation, img?: string }[] = Utils.NoNull((this.mappings ?? [])?.map(mapping => {
            if (mapping.if === undefined) {
                return mapping;
            }
            if (TagUtils.MatchesMultiAnswer(mapping.if, tags)) {
                if (!freeformKeyUsed) {
                    if (mapping.if.usedKeys().indexOf(this.freeform.key) >= 0) {
                        // This mapping matches the freeform key - we mark the freeform key to be ignored!
                        freeformKeyUsed = true;
                    }
                }
                return mapping;
            }
            return undefined;
        }))


        if (!freeformKeyUsed
            && tags[this.freeform.key] !== undefined) {
            applicableMappings.push({then: this.render})
        }
        return applicableMappings
    }

    public GetRenderValue(tags: any, defltValue: any = undefined): Translation {
        return this.GetRenderValueWithImage(tags, defltValue).then
    }

    /**
     * Gets the correct rendering value (or undefined if not known)
     * Not compatible with multiAnswer - use GetRenderValueS instead in that case
     * @constructor
     */
    public GetRenderValueWithImage(tags: any, defltValue: any = undefined): { then: Translation, icon?: string } {
        if (this.mappings !== undefined && !this.multiAnswer) {
            for (const mapping of this.mappings) {
                if (mapping.if === undefined) {
                    return mapping;
                }
                if (mapping.if.matchesProperties(tags)) {
                    return mapping;
                }
            }
        }

        if (this.id === "questions" ||
            this.freeform?.key === undefined ||
            tags[this.freeform.key] !== undefined
        ) {
            return {then: this.render}
        }

        return {then: defltValue};
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
                continue;
            }
            const o = this[key]
            if (o instanceof Translation) {
                translations.push(o)
            }
        }
        return translations;
    }

    FreeformValues(): { key: string, type?: string, values?: string [] } {
        try {

            const key = this.freeform?.key
            const answerMappings = this.mappings?.filter(m => m.hideInAnswer !== true)
            if (key === undefined) {

                let values: { k: string, v: string }[][] = Utils.NoNull(answerMappings?.map(m => m.if.asChange({})) ?? [])
                if (values.length === 0) {
                    return;
                }

                const allKeys = values.map(arr => arr.map(o => o.k))
                let common = allKeys[0];
                for (const keyset of allKeys) {
                    common = common.filter(item => keyset.indexOf(item) >= 0)
                }
                const commonKey = common[0]
                if (commonKey === undefined) {
                    return undefined;
                }
                return {
                    key: commonKey,
                    values: Utils.NoNull(values.map(arr => arr.filter(item => item.k === commonKey)[0]?.v))
                }

            }

            let values = Utils.NoNull(answerMappings?.map(m => m.if.asChange({}).filter(item => item.k === key)[0]?.v) ?? [])
            if (values.length === undefined) {
                values = undefined
            }
            return {
                key,
                type: this.freeform.type,
                values
            }
        } catch (e) {
            console.error("Could not create FreeformValues for tagrendering", this.id)
            return undefined
        }
    }

    GenerateDocumentation(): BaseUIElement {

        let withRender: (BaseUIElement | string)[] = [];
        if (this.freeform?.key !== undefined) {
            withRender = [
                `This rendering asks information about the property `,
                Link.OsmWiki(this.freeform.key),
                `\nThis is rendered with \`${this.render.txt}\``

            ]
        }

        let mappings: BaseUIElement = undefined;
        if (this.mappings !== undefined) {
            mappings = new List(
                this.mappings.map(m => {
                        let txt = "**" + m.then.txt + "** corresponds with " + m.if.asHumanString(true, false, {});
                        if (m.hideInAnswer === true) {
                            txt += "_This option cannot be chosen as answer_"
                        }
                        if (m.ifnot !== undefined) {
                            txt += "Unselecting this answer will add " + m.ifnot.asHumanString(true, false, {})
                        }
                        return txt;
                    }
                )
            )
        }

        return new Combine([
            new Title(this.id, 3),
            this.question !== undefined ? "The question is **" + this.question.txt + "**" : "_This tagrendering has no question and is thus read-only_",
            new Combine(withRender),
            mappings
        ]).SetClass("flex-col");
    }
}