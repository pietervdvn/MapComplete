import { TagRenderingOptions } from "../TagRendering";

export default class FixedName extends TagRenderingOptions {
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