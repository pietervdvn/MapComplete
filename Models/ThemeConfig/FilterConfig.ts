import {Translation} from "../../UI/i18n/Translation";
import {TagsFilter} from "../../Logic/Tags/TagsFilter";
import FilterConfigJson from "./Json/FilterConfigJson";
import Translations from "../../UI/i18n/Translations";
import {TagUtils} from "../../Logic/Tags/TagUtils";
import ValidatedTextField from "../../UI/Input/ValidatedTextField";
import {Utils} from "../../Utils";
import {TagRenderingConfigJson} from "./Json/TagRenderingConfigJson";
import {AndOrTagConfigJson} from "./Json/TagConfigJson";

export default class FilterConfig {
    public readonly id: string
    public readonly options: {
        question: Translation;
        osmTags: TagsFilter;
        originalTagsSpec: string | AndOrTagConfigJson
        fields: { name: string, type: string }[]
    }[];
    
    constructor(json: FilterConfigJson, context: string) {
        if (json.options === undefined) {
            throw `A filter without options was given at ${context}`
        }
        if (json.id === undefined) {
            throw `A filter without id was found at ${context}`
        }
        if (json.id.match(/^[a-zA-Z0-9_-]*$/) === null) {
            throw `A filter with invalid id was found at ${context}. Ids should only contain letters, numbers or - _`

        }

        if (json.options.map === undefined) {
            throw `A filter was given where the options aren't a list at ${context}`
        }
        this.id = json.id;
        this.options = json.options.map((option, i) => {
            const ctx = `${context}.options[${i}]`;
            const question = Translations.T(
                option.question,
                `${ctx}.question`
            );
            let osmTags = TagUtils.Tag(
                    option.osmTags ?? {and: []},
                    `${ctx}.osmTags`
                );

            if (question === undefined) {
                throw `Invalid filter: no question given at ${ctx}`
            }

            const fields: { name: string, type: string }[] = ((option.fields) ?? []).map((f, i) => {
                const type = f.type ?? "string"
                if (!ValidatedTextField.AllTypes.has(type)) {
                    throw `Invalid filter: ${type} is not a valid validated textfield type (at ${ctx}.fields[${i}])\n\tTry one of ${Array.from(ValidatedTextField.AllTypes.keys()).join(",")}`
                }
                if (f.name === undefined || f.name === "" || f.name.match(/[a-z0-9_-]+/) == null) {
                    throw `Invalid filter: a variable name should match [a-z0-9_-]+ at ${ctx}.fields[${i}]`
                }
                return {
                    name: f.name,
                    type
                }
            })
            
            if(fields.length > 0){
                // erase the tags, they aren't needed
                osmTags = TagUtils.Tag({and:[]})
            }
            
            return {question: question, osmTags: osmTags, fields, originalTagsSpec: option.osmTags};
        });

        if (this.options.some(o => o.fields.length > 0) && this.options.length > 1) {
            throw `Invalid filter at ${context}: a filter with textfields should only offer a single option.`
        }

        if (this.options.length > 1 && this.options[0].osmTags["and"]?.length !== 0) {
            throw "Error in " + context + "." + this.id + ": the first option of a multi-filter should always be the 'reset' option and not have any filters"
        }
    }
    
}