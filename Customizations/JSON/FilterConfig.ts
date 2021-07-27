import { TagsFilter } from "../../Logic/Tags/TagsFilter";
import { Translation } from "../../UI/i18n/Translation";
import Translations from "../../UI/i18n/Translations";
import FilterConfigJson from "./FilterConfigJson";
import { FromJSON } from "./FromJSON";

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
      const osmTags = FromJSON.Tag(
        option.osmTags ?? {and:[]},
        `${context}.options-[${i}].osmTags`
      );

      return { question: question, osmTags: osmTags };
    });
  }
}
