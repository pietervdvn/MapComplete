import {DesugaringStep} from "./Conversion";
import {Utils} from "../../../Utils";
import Translations from "../../../UI/i18n/Translations";

export class AddContextToTranslations<T> extends DesugaringStep<T> {
    private readonly _prefix: string;

    constructor(prefix = "") {
        super("Adds a '_context' to every object that is probably a translation", ["_context"], "AddContextToTranslation");
        this._prefix = prefix;
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
     * const rewritten = new AddContextToTranslations<any>("prefix:").convert(theme, "context").result
     * const expected = {
     *   layers: [
     *       {
     *           builtin: ["abc"],
     *           override: {
     *               title:{
     *                  _context: "prefix:context.layers.0.override.title"
     *                   en: "Some title"
     *               }
     *           }
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
     * const rewritten = new AddContextToTranslations<any>("prefix:").convert(theme, "context").result
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
     */
    convert(json: T, context: string): { result: T; errors?: string[]; warnings?: string[]; information?: string[] } {

        const result = Utils.WalkJson(json, (leaf, path) => {
            if(leaf === undefined || leaf === null){
                return leaf
            }
            if (typeof leaf === "object") {
                return {...leaf, _context: this._prefix + context + "." + path.join(".")}
            } else {
                return leaf
            }
        }, obj => obj === undefined || obj === null || Translations.isProbablyATranslation(obj))

        return {
            result
        };
    }

}