import { TagRenderingOptions } from "../TagRendering";
import {UIElement} from "../../UI/UIElement";

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