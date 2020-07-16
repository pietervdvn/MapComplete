import { TagRenderingOptions } from "../TagRendering";

export default class FixedText extends TagRenderingOptions {
    constructor(category: string) {
        super({
            mappings: [
                {
                    k: null, txt: category
                }
            ]
        })
    }
}