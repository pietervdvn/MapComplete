import {TagRenderingOptions} from "../TagRenderingOptions";
import Translation from "../../UI/i18n/Translation";

export default class FixedText extends TagRenderingOptions {
    constructor(category: string | Translation) {
        super({
            mappings: [
                {
                    k: null, txt: category
                }
            ]
        })
    }
}