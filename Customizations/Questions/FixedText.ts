import {UIElement} from "../../UI/UIElement";
import {TagRenderingOptions} from "../TagRenderingOptions";

export default class FixedText extends TagRenderingOptions {
    constructor(category: string | UIElement) {
        super({
            mappings: [
                {
                    k: null, txt: category
                }
            ]
        })
    }
}