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
        this.options = json.options.map((option, i) => {
            const question = Translations.T(
                option.question,
                context + ".options-[" + i + "].question"
            );
            const osmTags = TagUtils.Tag(
                option.osmTags ?? {and: []},
                `${context}.options-[${i}].osmTags`
            );

            return {question: question, osmTags: osmTags};
        });
    }
}