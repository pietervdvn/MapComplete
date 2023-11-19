import TagRenderingConfig from "./TagRenderingConfig"
import { TagRenderingConfigJson } from "./Json/TagRenderingConfigJson"
import { Translatable } from "./Json/Translatable"
import { QuestionableTagRenderingConfigJson } from "./Json/QuestionableTagRenderingConfigJson"

export default class WithContextLoader {
    protected readonly _context: string
    private readonly _json: any

    constructor(json: any, context: string) {
        this._json = json
        this._context = context
    }

    /** Given a key, gets the corresponding property from the json (or the default if not found
     *
     * The found value is interpreted as a tagrendering and fetched/parsed
     * */
    public tr(key: string, deflt?: string, translationContext?: string) {
        let v: Translatable | TagRenderingConfigJson = this._json[key]
        if (v === undefined || v === null) {
            if (deflt === undefined) {
                return undefined
            }
            return new TagRenderingConfig(
                deflt,
                `${translationContext ?? this._context}.${key}.default value`
            )
        }

        return new TagRenderingConfig(
            <QuestionableTagRenderingConfigJson>v,
            `${translationContext ?? this._context}.${key}`
        )
    }

    /**
     * Converts a list of tagRenderingCOnfigJSON in to TagRenderingConfig
     * A string is interpreted as a name to call
     */
    public ParseTagRenderings(
        tagRenderings: TagRenderingConfigJson[],
        options?: {
            /**
             * Throw an error if 'question' is defined
             */
            readOnlyMode?: boolean
            requiresId?: boolean
            prepConfig?: (config: TagRenderingConfigJson) => TagRenderingConfigJson
        }
    ): TagRenderingConfig[] {
        if (tagRenderings === undefined) {
            return []
        }

        const context = this._context
        options = options ?? {}
        if (options.prepConfig === undefined) {
            options.prepConfig = (c) => c
        }
        const renderings: TagRenderingConfig[] = []
        for (let i = 0; i < tagRenderings.length; i++) {
            const preparedConfig = tagRenderings[i]
            const tr = new TagRenderingConfig(
                <QuestionableTagRenderingConfigJson>preparedConfig,
                `${context}.tagrendering[${i}]`
            )
            if (options.readOnlyMode && tr.question !== undefined) {
                throw (
                    "A question is defined for " +
                    `${context}.tagrendering[${i}], but this is not allowed at this position - probably because this rendering is an icon, badge or label`
                )
            }
            if (options.requiresId && tr.id === "") {
                throw `${context}.tagrendering[${i}] has an invalid ID - make sure it is defined and not empty`
            }

            renderings.push(tr)
        }

        return renderings
    }
}
