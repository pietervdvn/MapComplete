import {Translation} from "../../UI/i18n/Translation";
import {TagsFilter} from "../../Logic/Tags/TagsFilter";
import {TagRenderingConfigJson} from "./Json/TagRenderingConfigJson";
import Translations from "../../UI/i18n/Translations";
import {TagUtils} from "../../Logic/Tags/TagUtils";
import {And} from "../../Logic/Tags/And";
import ValidatedTextField from "../../UI/Input/ValidatedTextField";
import {Utils} from "../../Utils";
import {Tag} from "../../Logic/Tags/Tag";

/***
 * The parsed version of TagRenderingConfigJSON
 * Identical data, but with some methods and validation
 */
export default class TagRenderingConfig {

    readonly id: string;
    readonly group: string;
    readonly render?: Translation;
    readonly question?: Translation;
    readonly condition?: TagsFilter;

    readonly configuration_warnings: string[] = []

    readonly freeform?: {
        readonly key: string,
        readonly type: string,
        readonly addExtraTags: TagsFilter[];
        readonly inline: boolean,
        readonly default?: string,
        readonly helperArgs?: (string | number | boolean)[]
    };

    readonly multiAnswer: boolean;

    readonly mappings?: {
        readonly if: TagsFilter,
        readonly ifnot?: TagsFilter,
        readonly then: Translation
        readonly hideInAnswer: boolean | TagsFilter
        readonly addExtraTags: Tag[]
    }[]

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
            json = ""+json
        }



        if (typeof json === "string") {
            this.render = Translations.T(json, context + ".render");
            this.multiAnswer = false;
            return;
        }


        this.id = json.id ?? "";
        if(this.id.match(/^[a-zA-Z0-9 ()?\/=:;,_-]*$/) === null){
            throw "Invalid ID in "+context+": an id can only contain [a-zA-Z0-0_-] as characters. The offending id is: "+this.id
        }
        
        
        
        this.group = json.group ?? "";
        this.render = Translations.T(json.render, context + ".render");
        this.question = Translations.T(json.question, context + ".question");
        this.condition = TagUtils.Tag(json.condition ?? {"and": []}, `${context}.condition`);
        if (json.freeform) {

            if (json.freeform.addExtraTags !== undefined && json.freeform.addExtraTags.map === undefined) {
                throw `Freeform.addExtraTags should be a list of strings - not a single string (at ${context})`
            }
            this.freeform = {
                key: json.freeform.key,
                type: json.freeform.type ?? "string",
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
            
            if(json.freeform.key === "questions"){
                if(this.id !== "questions"){
                    throw `If you use a freeform key 'questions', the ID must be 'questions' too to trigger the special behaviour. The current id is '${this.id}' (at ${context})`
                }
            }


            if (ValidatedTextField.AllTypes[this.freeform.type] === undefined) {
                const knownKeys = ValidatedTextField.tpList.map(tp => tp.name).join(", ");
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
                const mp = {
                    if: TagUtils.Tag(mapping.if, `${ctx}.if`),
                    ifnot: (mapping.ifnot !== undefined ? TagUtils.Tag(mapping.ifnot, `${ctx}.ifnot`) : undefined),
                    then: Translations.T(mapping.then, `${ctx}.then`),
                    hideInAnswer: hideInAnswer,
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
                const txt :string = this.render.translations[ln]
                if(txt.indexOf("{questions}") >= 0){
                    continue
                }
                throw `${context}: The rendering for language ${ln} does not contain {questions}. This is a bug, as this rendering should include exactly this to trigger those questions to be shown!`

            }
            if(this.freeform?.key !== undefined && this.freeform?.key !== "questions"){
                throw `${context}: If the ID is questions to trigger a question box, the only valid freeform value is 'questions' as well. Set freeform to questions or remove the freeform all together`
            }
        }


        if (this.freeform) {
            if(this.render === undefined){
                throw `${context}: Detected a freeform key without rendering... Key: ${this.freeform.key} in ${context}`
            }
            for (const ln in this.render.translations) {
                const txt :string = this.render.translations[ln]
                if(txt === ""){
                    throw context+" Rendering for language "+ln+" is empty"
                }
                if(txt.indexOf("{"+this.freeform.key+"}") >= 0){
                    continue
                }
                if(txt.indexOf("{"+this.freeform.key+":") >= 0){
                    continue
                }
                if(txt.indexOf("{canonical("+this.freeform.key+")") >= 0){
                    continue
                }
                if(this.freeform.type === "opening_hours" && txt.indexOf("{opening_hours_table(") >= 0){
                    continue
                }
                if(this.freeform.type === "wikidata" && txt.indexOf("{wikipedia("+this.freeform.key) >= 0){
                    continue
                }
                if(this.freeform.key === "wikidata" && txt.indexOf("{wikipedia()") >= 0){
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
    public GetRenderValues(tags: any): Translation[] {
        if (!this.multiAnswer) {
            return [this.GetRenderValue(tags)]
        }

        // A flag to check that the freeform key isn't matched multiple times 
        // If it is undefined, it is "used" already, or at least we don't have to check for it anymore
        let freeformKeyUsed = this.freeform?.key === undefined;
        // We run over all the mappings first, to check if the mapping matches
        const applicableMappings: Translation[] = Utils.NoNull((this.mappings ?? [])?.map(mapping => {
            if (mapping.if === undefined) {
                return mapping.then;
            }
            if (TagUtils.MatchesMultiAnswer(mapping.if, tags)) {
                if (!freeformKeyUsed) {
                    if (mapping.if.usedKeys().indexOf(this.freeform.key) >= 0) {
                        // This mapping matches the freeform key - we mark the freeform key to be ignored!
                        freeformKeyUsed = true;
                    }
                }
                return mapping.then;
            }
            return undefined;
        }))


        if (!freeformKeyUsed
            && tags[this.freeform.key] !== undefined) {
            applicableMappings.push(this.render)
        }
        return applicableMappings
    }

    /**
     * Gets the correct rendering value (or undefined if not known)
     * Not compatible with multiAnswer - use GetRenderValueS instead in that case
     * @constructor
     */
    public GetRenderValue(tags: any, defltValue: any = undefined): Translation {
        if (this.mappings !== undefined && !this.multiAnswer) {
            for (const mapping of this.mappings) {
                if (mapping.if === undefined) {
                    return mapping.then;
                }
                if (mapping.if.matchesProperties(tags)) {
                    return mapping.then;
                }
            }
        }

        if(this.id === "questions"){
            return this.render
        }

        if (this.freeform?.key === undefined) {
            return this.render;
        }

        if (tags[this.freeform.key] !== undefined) {
            return this.render;
        }
        return defltValue;
    }

    public ExtractImages(isIcon: boolean): Set<string> {

        const usedIcons = new Set<string>()
        this.render?.ExtractImages(isIcon)?.forEach(usedIcons.add, usedIcons)

        for (const mapping of this.mappings ?? []) {
            mapping.then.ExtractImages(isIcon).forEach(usedIcons.add, usedIcons)
        }

        return usedIcons;
    }


}