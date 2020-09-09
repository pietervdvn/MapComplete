import {RegexTag, Tag} from "../../Logic/Tags";
import Translations from "../../UI/i18n/Translations";
import {TagRenderingOptions} from "../TagRenderingOptions";
import Translation from "../../UI/i18n/Translation";


export class NameInline extends TagRenderingOptions{
    
    constructor(category: string | Translation ) {
        super({
            mappings: [
                {k: new Tag("noname", "yes"), txt: Translations.t.general.noNameCategory.Subs({category: category})},
                {k: new RegexTag("name", /.+/), txt: "{name}"},
                {k:new Tag("name",""), txt: category}
            ]
        });
    }
    
}