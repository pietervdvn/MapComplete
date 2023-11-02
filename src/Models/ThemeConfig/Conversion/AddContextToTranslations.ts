import { DesugaringStep } from "./Conversion"
import { Utils } from "../../../Utils"
import Translations from "../../../UI/i18n/Translations"
import { ConversionContext } from "./ConversionContext"

export class AddContextToTranslations<T> extends DesugaringStep<T> {
    private readonly _prefix: string

    constructor(prefix = "") {
        super(
            "Adds a '_context' to every object that is probably a translation",
            ["_context"],
            "AddContextToTranslation"
        )
        this._prefix = prefix
    }

    /**
     * const theme = {
     *   layers: [
     *       {
     *           builtin: ["abc"],
     *           override: {
     *               title:{
     *                   en: "Some title"
     *               }
     *           }
     *       }
     *   ]
     * }
     * const rewritten = new AddContextToTranslations<any>("prefix:").convertStrict(theme, ConversionContext.test())
     * const expected = {
     *   layers: [
     *       {
     *           builtin: ["abc"],
     *           override: {
     *               title:{
     *                  _context: "prefix:layers.0.override.title"
     *                   en: "Some title"
     *               }
     *           }
     *       }
     *   ]
     * }
     * rewritten // => expected
     *
     * // should use the ID if one is present instead of the index
     * const theme = {
     *   layers: [
     *       {
     *           tagRenderings:[
     *               {id: "some-tr",
     *               question:{
     *                   en:"Question?"
     *               }
     *               }
     *           ]
     *       }
     *   ]
     * }
     * const rewritten = new AddContextToTranslations<any>("prefix:").convertStrict(theme, ConversionContext.test())
     * const expected = {
     *   layers: [
     *       {
     *           tagRenderings:[
     *               {id: "some-tr",
     *               question:{
     *                  _context: "prefix:layers.0.tagRenderings.some-tr.question"
     *                   en:"Question?"
     *               }
     *               }
     *           ]
     *       }
     *   ]
     * }
     * rewritten // => expected
     *
     * // should preserve nulls
     * const theme = {
     *   layers: [
     *       {
     *           builtin: ["abc"],
     *           override: {
     *               name:null
     *           }
     *       }
     *   ]
     * }
     * const rewritten = new AddContextToTranslations<any>("prefix:").convertStrict(theme, ConversionContext.test())
     * const expected = {
     *   layers: [
     *       {
     *           builtin: ["abc"],
     *           override: {
     *               name: null
     *           }
     *       }
     *   ]
     * }
     * rewritten // => expected
     *
     *
     * // Should ignore all if '#dont-translate' is set
     * const theme = {
     *  "#dont-translate": "*",
     *   layers: [
     *       {
     *           builtin: ["abc"],
     *           override: {
     *               title:{
     *                   en: "Some title"
     *               }
     *           }
     *       }
     *   ]
     * }
     * const rewritten = new AddContextToTranslations<any>("prefix:").convertStrict(theme, ConversionContext.test())
     * rewritten // => theme
     *
     */
    convert(json: T, context: ConversionContext): T {
        if (json["#dont-translate"] === "*") {
            return json
        }

        return Utils.WalkJson(
            json,
            (leaf, path) => {
                if (leaf === undefined || leaf === null) {
                    return leaf
                }
                if (typeof leaf === "object") {
                    // follow the path. If we encounter a number, check that there is no ID we can use instead
                    let breadcrumb = json
                    for (let i = 0; i < path.length; i++) {
                        const pointer = path[i]
                        breadcrumb = breadcrumb[pointer]
                        if (pointer.match("[0-9]+") && breadcrumb["id"] !== undefined) {
                            path[i] = breadcrumb["id"]
                        }
                    }

                    return {
                        ...leaf,
                        _context: this._prefix + context.path.concat(path).join("."),
                    }
                } else {
                    return leaf
                }
            },
            (obj) => obj === undefined || obj === null || Translations.isProbablyATranslation(obj)
        )
    }
}
