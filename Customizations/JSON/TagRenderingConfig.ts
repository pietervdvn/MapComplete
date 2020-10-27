import Translation from "../../UI/i18n/Translation";
import {TagsFilter} from "../../Logic/Tags";
import {TagRenderingConfigJson} from "./TagRenderingConfigJson";
import Translations from "../../UI/i18n/Translations";
import {FromJSON} from "./FromJSON";
import ValidatedTextField from "../../UI/Input/ValidatedTextField";

/***
 * The parsed version of TagRenderingConfigJSON
 * Identical data, but with some methods and validation
 */
export default class TagRenderingConfig {

    render?: Translation;
    question?: Translation;
    condition?: TagsFilter;

    freeform?: {
        key: string,
        type: string,
        addExtraTags: TagsFilter[];
    };

    multiAnswer: boolean;

    mappings?: {
        if: TagsFilter,
        then: Translation
        hideInAnswer: boolean
    }[]

    constructor(json: string | TagRenderingConfigJson, context?: string) {

        if(json === undefined){
            throw "Initing a TagRenderingConfig with undefined in "+context;
        }
        if (typeof json === "string") {
            this.render = Translations.T(json);
            this.multiAnswer = false;
            return;
        }

        this.render = Translations.T(json.render);
        this.question = Translations.T(json.question);
        this.condition = FromJSON.Tag(json.condition ?? {"and": []}, `${context}.condition`);
        if (json.freeform) {
            this.freeform = {
                key: json.freeform.key,
                type: json.freeform.type ?? "string",
                addExtraTags: json.freeform.addExtraTags?.map((tg, i) =>
                    FromJSON.Tag(tg, `${context}.extratag[${i}]`)) ?? []
            }
            if (ValidatedTextField.AllTypes[this.freeform.type] === undefined) {
                throw `Freeform.key ${this.freeform.key} is an invalid type`
            }
        }

        this.multiAnswer = json.multiAnswer ?? false
        if (json.mappings) {
            this.mappings = json.mappings.map((mapping, i) => {

                if (mapping.then === undefined) {
                    throw "Invalid mapping: if without body"
                }
                return {
                    if: FromJSON.Tag(mapping.if, `${context}.mapping[${i}]`),
                    then: Translations.T(mapping.then),
                    hideInAnswer: mapping.hideInAnswer ?? false
                };
            });
        }

        if (this.question && this.freeform?.key === undefined && this.mappings === undefined) {
            throw `A question is defined, but no mappings nor freeform (key) are. The question is ${this.question.txt} at ${context}`
        }

        if (json.multiAnswer) {
            if ((this.mappings?.length ?? 0) === 0) {
                throw "MultiAnswer is set, but no mappings are defined"
            }

        }
    }

    /**
     * Gets the correct rendering value (or undefined if not known)
     * @constructor
     */
    public GetRenderValue(tags: any): Translation {
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

        if (this.freeform?.key === undefined){
            return this.render;
        }

        if (tags[this.freeform.key] !== undefined) {
            return this.render;
        }
        return undefined;
    }


}