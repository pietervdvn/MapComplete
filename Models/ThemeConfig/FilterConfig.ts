import {Translation} from "../../UI/i18n/Translation";
import {TagsFilter} from "../../Logic/Tags/TagsFilter";
import FilterConfigJson from "./Json/FilterConfigJson";
import Translations from "../../UI/i18n/Translations";
import {TagUtils} from "../../Logic/Tags/TagUtils";

export default class FilterConfig {
    public readonly id: string
    public readonly options: {
        question: Translation;
        osmTags: TagsFilter;
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
            const question = Translations.T(
                option.question,
                context + ".options-[" + i + "].question"
            );
            const osmTags = TagUtils.Tag(
                option.osmTags ?? {and: []},
                `${context}.options-[${i}].osmTags`
            );
            if (question === undefined) {
                throw `Invalid filter: no question given at ${context}[${i}]`
            }

            return {question: question, osmTags: osmTags};
        });

        if (this.options.length > 1 && this.options[0].osmTags["and"]?.length !== 0) {
            throw "Error in " + context + "." + this.id + ": the first option of a multi-filter should always be the 'reset' option and not have any filters"
        }
    }
}