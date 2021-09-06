import {Translation} from "../../UI/i18n/Translation";
import {TagsFilter} from "../../Logic/Tags/TagsFilter";
import FilterConfigJson from "./Json/FilterConfigJson";
import Translations from "../../UI/i18n/Translations";
import {TagUtils} from "../../Logic/Tags/TagUtils";

export default class FilterConfig {
    readonly options: {
        question: Translation;
        osmTags: TagsFilter;
    }[];

    constructor(json: FilterConfigJson, context: string) {
        if(json.options === undefined){
            throw `A filter without options was given at ${context}`
        }

        if(json.options.map === undefined){
            throw `A filter was given where the options aren't a list at ${context}`
        }
        
        this.options = json.options.map((option, i) => {
            const question = Translations.T(
                option.question,
                context + ".options-[" + i + "].question"
            );
            const osmTags = TagUtils.Tag(
                option.osmTags ?? {and: []},
                `${context}.options-[${i}].osmTags`
            );
            if(question === undefined){
                throw `Invalid filter: no question given at ${context}[${i}]`
            }

            return {question: question, osmTags: osmTags};
        });
    }
}