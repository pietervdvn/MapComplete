import TagRenderingConfig from "./TagRenderingConfig";
import SharedTagRenderings from "../../Customizations/SharedTagRenderings";
import {TagRenderingConfigJson} from "./Json/TagRenderingConfigJson";
import {Utils} from "../../Utils";

export default class WithContextLoader {
    private readonly _json: any;
    protected readonly _context: string;

    constructor(json: any, context: string) {
        this._json = json;
        this._context = context;
    }

    /** Given a key, gets the corresponding property from the json (or the default if not found
     *
     * The found value is interpreted as a tagrendering and fetched/parsed
     * */
    public tr(key: string, deflt) {
        const v = this._json[key];
        if (v === undefined || v === null) {
            if (deflt === undefined) {
                return undefined;
            }
            return new TagRenderingConfig(
                deflt,
                `${this._context}.${key}.default value`
            );
        }
        if (typeof v === "string") {
            const shared = SharedTagRenderings.SharedTagRendering.get(v);
            if (shared) {
                return shared;
            }
        }
        return new TagRenderingConfig(
            v,
            `${this._context}.${key}`
        );
    }

    /**
     * Converts a list of tagRenderingCOnfigJSON in to TagRenderingConfig
     * A string is interpreted as a name to call
     */
    public ParseTagRenderings(
        tagRenderings?: (string | { builtin: string, override: any } | TagRenderingConfigJson)[],
        readOnly = false,
        prepConfig: ((config: TagRenderingConfigJson) => TagRenderingConfigJson) = undefined
    ) : TagRenderingConfig[]{
        if (tagRenderings === undefined) {
            return [];
        }

        const context = this._context
        const renderings: TagRenderingConfig[] = []
        if (prepConfig === undefined) {
            prepConfig = c => c
        }
        for (let i = 0; i < tagRenderings.length; i++) {
            let renderingJson = tagRenderings[i]
            if (typeof renderingJson === "string") {
                renderingJson = {builtin: renderingJson, override: undefined}
            }

            if (renderingJson["builtin"] !== undefined) {
                const renderingId = renderingJson["builtin"]
                if (renderingId === "questions") {
                    if (readOnly) {
                        throw `A tagrendering has a question, but asking a question does not make sense here: is it a title icon or a geojson-layer? ${context}. The offending tagrendering is ${JSON.stringify(
                            renderingJson
                        )}`;
                    }

                    const tr = new TagRenderingConfig("questions", context);
                    renderings.push(tr)
                    continue;
                }

                let sharedJson = SharedTagRenderings.SharedTagRenderingJson.get(renderingId)
                if (sharedJson === undefined) {
                    const keys = Array.from(SharedTagRenderings.SharedTagRenderingJson.keys());
                    throw `Predefined tagRendering ${renderingId} not found in ${context}.\n    Try one of ${keys.join(
                        ", "
                    )}\n    If you intent to output this text literally, use {\"render\": <your text>} instead"}`;
                }
                if (renderingJson["override"] !== undefined) {
                    sharedJson = Utils.Merge(renderingJson["override"], JSON.parse(JSON.stringify(sharedJson)))
                }
                renderingJson = sharedJson
            }


            const patchedConfig = prepConfig(<TagRenderingConfigJson>renderingJson)

            const tr = new TagRenderingConfig(patchedConfig, `${context}.tagrendering[${i}]`);
            renderings.push(tr)
        }

        return renderings;
    }
}