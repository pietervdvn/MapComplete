import {Conversion, DesugaringContext, DesugaringStep, Fuse, OnEvery, OnEveryConcat, SetDefault} from "./Conversion";
import {LayerConfigJson} from "../Json/LayerConfigJson";
import {TagRenderingConfigJson} from "../Json/TagRenderingConfigJson";
import {Utils} from "../../../Utils";
import RewritableConfigJson from "../Json/RewritableConfigJson";
import SpecialVisualizations from "../../../UI/SpecialVisualizations";
import Translations from "../../../UI/i18n/Translations";
import {Translation} from "../../../UI/i18n/Translation";
import * as tagrenderingconfigmeta from "../../../assets/tagrenderingconfigmeta.json"

class ExpandTagRendering extends Conversion<string | TagRenderingConfigJson | { builtin: string | string[], override: any }, TagRenderingConfigJson[]> {
    private readonly _state: DesugaringContext;

    constructor(state: DesugaringContext) {
        super("Converts a tagRenderingSpec into the full tagRendering", [], "ExpandTagRendering");
        this._state = state;
    }

    convert(json: string | TagRenderingConfigJson | { builtin: string | string[]; override: any }, context: string): { result: TagRenderingConfigJson[]; errors: string[]; warnings: string[] } {
        const errors = []
        const warnings = []

        return {
            result: this.convertUntilStable(json, warnings, errors, context),
            errors, warnings
        };
    }

    private lookup(name: string): TagRenderingConfigJson[] {
        const state = this._state;
        if (state.tagRenderings.has(name)) {
            return [state.tagRenderings.get(name)]
        }
        if (name.indexOf(".") >= 0) {
            const spl = name.split(".");
            const layer = state.sharedLayers.get(spl[0])
            if (spl.length === 2 && layer !== undefined) {
                const id = spl[1];

                const layerTrs = <TagRenderingConfigJson[]>layer.tagRenderings.filter(tr => tr["id"] !== undefined)
                let matchingTrs: TagRenderingConfigJson[]
                if (id === "*") {
                    matchingTrs = layerTrs
                } else if (id.startsWith("*")) {
                    const id_ = id.substring(1)
                    matchingTrs = layerTrs.filter(tr => tr.group === id_)
                } else {
                    matchingTrs = layerTrs.filter(tr => tr.id === id)
                }


                for (let i = 0; i < matchingTrs.length; i++) {
                    // The matched tagRenderings are 'stolen' from another layer. This means that they must match the layer condition before being shown
                    const found = Utils.Clone(matchingTrs[i]);
                    if (found.condition === undefined) {
                        found.condition = layer.source.osmTags
                    } else {
                        found.condition = {and: [found.condition, layer.source.osmTags]}
                    }
                    matchingTrs[i] = found
                }

                if (matchingTrs.length !== 0) {
                    return matchingTrs
                }
            }
        }
        return undefined;
    }

    private convertOnce(tr: string | any, warnings: string[], errors: string[], ctx: string): TagRenderingConfigJson[] {
        const state = this._state
        if (tr === "questions") {
            return [{
                id: "questions"
            }]
        }


        if (typeof tr === "string") {
            const lookup = this.lookup(tr);
            if (lookup === undefined) {
                warnings.push(ctx + "A literal rendering was detected: " + tr)
                return [{
                    render: tr,
                    id: tr.replace(/![a-zA-Z0-9]/g, "")
                }]
            }
            return lookup
        }

        if (tr["builtin"] !== undefined) {
            let names = tr["builtin"]
            if (typeof names === "string") {
                names = [names]
            }

            for (const key of Object.keys(tr)) {
                if (key === "builtin" || key === "override" || key === "id" || key.startsWith("#")) {
                    continue
                }
                errors.push("At " + ctx + ": an object calling a builtin can only have keys `builtin` or `override`, but a key with name `" + key + "` was found. This won't be picked up! The full object is: " + JSON.stringify(tr))
            }

            const trs: TagRenderingConfigJson[] = []
            for (const name of names) {
                const lookup = this.lookup(name)
                if (lookup === undefined) {
                    errors.push(ctx + ": The tagRendering with identifier " + name + " was not found.\n\tDid you mean one of " + Array.from(state.tagRenderings.keys()).join(", ") + "?")
                    continue
                }
                for (let foundTr of lookup) {
                    foundTr = Utils.Clone<any>(foundTr)
                    Utils.Merge(tr["override"] ?? {}, foundTr)
                    trs.push(foundTr)
                }
            }
            return trs;
        }

        return [tr]
    }

    private convertUntilStable(spec: string | any, warnings: string[], errors: string[], ctx: string): TagRenderingConfigJson[] {
        const trs = this.convertOnce(spec, warnings, errors, ctx);

        const result = []
        for (const tr of trs) {
            if (typeof tr === "string" || tr["builtin"] !== undefined) {
                const stable = this.convertUntilStable(tr, warnings, errors, ctx + "(RECURSIVE RESOLVE)")
                result.push(...stable)
            } else {
                result.push(tr)
            }
        }

        return result;
    }
}

class ExpandGroupRewrite extends Conversion<{
    rewrite: {
        sourceString: string,
        into: string[]
    }[],
    renderings: (string | { builtin: string, override: any } | TagRenderingConfigJson)[]
} | TagRenderingConfigJson, TagRenderingConfigJson[]> {


    private _expandSubTagRenderings;

    constructor(state: DesugaringContext) {
        super(
            "Converts a rewrite config for tagRenderings into the expanded form", [],
            "ExpandGroupRewrite"
        );
        this._expandSubTagRenderings = new ExpandTagRendering(state)
    }

    convert(json:
                {
                    rewrite:
                        { sourceString: string; into: string[] }[]; renderings: (string | { builtin: string; override: any } | TagRenderingConfigJson)[]
                } | TagRenderingConfigJson, context: string): { result: TagRenderingConfigJson[]; errors: string[]; warnings?: string[] } {

        if (json["rewrite"] === undefined) {
            return {result: [<TagRenderingConfigJson>json], errors: [], warnings: []}
        }
        let config = <{
            rewrite:
                { sourceString: string[]; into: (string | any)[][] };
            renderings: (string | { builtin: string; override: any } | TagRenderingConfigJson)[]
        }>json;


        {
            const errors = []

            if (!Array.isArray(config.rewrite.sourceString)) {
                let extra = "";
                if (typeof config.rewrite.sourceString === "string") {
                    extra = `<br/>Try <span class='literal-code'>"sourceString": [ "${config.rewrite.sourceString}" ] </span> instead (note the [ and ])`
                }
                const msg = context + "<br/>Invalid format: a rewrite block is defined, but the 'sourceString' should be an array of strings, but it is a " + typeof config.rewrite.sourceString + extra
                errors.push(msg)
            }


            const expectedLength = config.rewrite.sourceString.length
            for (let i = 0; i < config.rewrite.into.length; i++) {
                const targets = config.rewrite.into[i];
                if (!Array.isArray(targets)) {
                    errors.push(`${context}.rewrite.into[${i}] should be an array of values, but it is a ` + typeof targets)
                } else if (targets.length !== expectedLength) {
                    errors.push(`${context}.rewrite.into[${i}]:<br/>The rewrite specified ${config.rewrite.sourceString} as sourcestring, which consists of ${expectedLength} values. The target ${JSON.stringify(targets)} has ${targets.length} items`)
                    if (typeof targets[0] !== "string") {
                        errors.push(context + ".rewrite.into[" + i + "]: expected a string as first rewrite value values, but got " + targets[0])

                    }
                }
            }

            if (errors.length > 0) {
                return {
                    errors,
                    warnings: [],
                    result: undefined
                }
            }
        }

        const subRenderingsRes = <{ result: TagRenderingConfigJson[][], errors, warnings }>this._expandSubTagRenderings.convertAll(config.renderings, context);
        const subRenderings: TagRenderingConfigJson[] = [].concat(...subRenderingsRes.result);
        const errors = subRenderingsRes.errors;
        const warnings = subRenderingsRes.warnings;


        const rewrittenPerGroup = new Map<string, TagRenderingConfigJson[]>()

        // The actual rewriting
        const sourceStrings = config.rewrite.sourceString;
        for (const targets of config.rewrite.into) {
            const groupName = targets[0];
            if (typeof groupName !== "string") {
                throw "The first string of 'targets' should always be a string"
            }
            const trs: TagRenderingConfigJson[] = []

            for (const tr of subRenderings) {
                let rewritten = tr;
                for (let i = 0; i < sourceStrings.length; i++) {
                    const source = sourceStrings[i]
                    const target = targets[i] // This is a string OR a translation
                    rewritten = ExpandRewrite.RewriteParts(source, target, rewritten)
                }
                rewritten.group = rewritten.group ?? groupName
                trs.push(rewritten)
            }

            if (rewrittenPerGroup.has(groupName)) {
                rewrittenPerGroup.get(groupName).push(...trs)
            } else {
                rewrittenPerGroup.set(groupName, trs)

            }
        }

        // Add questions box for this category
        rewrittenPerGroup.forEach((group, groupName) => {
            group.push(<TagRenderingConfigJson>{
                id: "questions",
                group: groupName
            })
        })


        rewrittenPerGroup.forEach((group, _) => {
            group.forEach(tr => {
                if (tr.id === undefined || tr.id === "") {
                    errors.push("A tagrendering has an empty ID after expanding the tag; the tagrendering is: " + JSON.stringify(tr))
                }
            })
        })

        return {
            result: [].concat(...Array.from(rewrittenPerGroup.values())),
            errors, warnings
        };
    }

}

export class ExpandRewrite<T> extends Conversion<T | RewritableConfigJson<T>, T[]> {

    constructor() {
        super("Applies a rewrite", [], "ExpandRewrite");
    }


    /**
     * Used for left|right group creation and replacement.
     * Every 'keyToRewrite' will be replaced with 'target' recursively. This substitution will happen in place in the object 'tr'
     *
     * // should substitute strings
     * const spec = {
     *   "someKey": "somevalue {xyz}"
     * }
     * ExpandRewrite.RewriteParts("{xyz}", "rewritten", spec) // => {"someKey": "somevalue rewritten"}
     *
     */
    public static RewriteParts<T>(keyToRewrite: string, target: string | any, tr: T): T {
        
        const targetIsTranslation = Translations.isProbablyATranslation(target)

        function replaceRecursive(obj: string | any, target) {

            if (obj === keyToRewrite) {
                return target
            }

            if (typeof obj === "string") {
                // This is a simple string - we do a simple replace
                return obj.replace(keyToRewrite, target)
            }
            if (Array.isArray(obj)) {
                // This is a list of items
                return obj.map(o => replaceRecursive(o, target))
            }

            if (typeof obj === "object") {
                obj = {...obj}
                
                const isTr = targetIsTranslation && Translations.isProbablyATranslation(obj)
                
                for (const key in obj) {
                    let subtarget = target
                    if(isTr && target[key] !== undefined){
                        // The target is a translation AND the current object is a translation
                        // This means we should recursively replace with the translated value
                        subtarget = target[key]
                    }
                    
                    obj[key] = replaceRecursive(obj[key], subtarget)
                }
                return obj
            }
            return obj
        }

        return replaceRecursive(tr, target)
    }

    /**
     * // should convert simple strings
     * const spec = <RewritableConfigJson<string>>{
     *     rewrite: {
     *         sourceString: ["xyz","abc"],
     *         into: [
     *             ["X", "A"],
     *             ["Y", "B"], 
     *             ["Z", "C"]],
     *     },
     *     renderings: "The value of xyz is abc"
     * }
     * new ExpandRewrite().convertStrict(spec, "test") // => ["The value of X is A", "The value of Y is B", "The value of Z is C"]
     * 
     * // should rewrite with translations
     * const spec = <RewritableConfigJson<any>>{
     *     rewrite: {
     *         sourceString: ["xyz","abc"],
     *         into: [
     *             ["X", {en: "value", nl: "waarde"}],
     *             ["Y", {en: "some other value", nl: "een andere waarde"}],
     *     },
     *     renderings: {en: "The value of xyz is abc", nl: "De waarde van xyz is abc"}
     * }
     * const expected = [
     *  {
     *      en: "The value of X is value",
     *      nl: "De waarde van X is waarde"
     *  },
     *  {
     *      en: "The value of Y is some other value",
     *      nl: "De waarde van Y is een andere waarde"
     *  }
     * ]
     * new ExpandRewrite().convertStrict(spec, "test") // => expected
     */
    convert(json: T | RewritableConfigJson<T>, context: string): { result: T[]; errors?: string[]; warnings?: string[]; information?: string[] } {

        if (json === null || json === undefined) {
            return {result: []}
        }

        if (json["rewrite"] === undefined) {

            // not a rewrite
            return {result: [(<T>json)]}
        }

        const rewrite = <RewritableConfigJson<T>>json;
        const keysToRewrite = rewrite.rewrite
        const ts: T[] = []

        {// sanity check: rewrite: ["xyz", "longer_xyz"] is not allowed as "longer_xyz" will never be triggered
            for (let i = 0; i < keysToRewrite.sourceString.length; i++) {
                const guard = keysToRewrite.sourceString[i];
                for (let j = i + 1; j < keysToRewrite.sourceString.length; j++) {
                    const toRewrite = keysToRewrite.sourceString[j]
                    if (toRewrite.indexOf(guard) >= 0) {
                        throw `${context} Error in rewrite: sourcestring[${i}] is a substring of sourcestring[${j}]: ${guard} will be substituted away before ${toRewrite} is reached.`
                    }
                }
            }
        }

        {// sanity check: {rewrite: ["a", "b"] should have the right amount of 'intos' in every case
            for (let i = 0; i < rewrite.rewrite.into.length; i++) {
                const into = keysToRewrite.into[i]
                if(into.length !== rewrite.rewrite.sourceString.length){
                throw `${context}.into.${i} Error in rewrite: there are ${rewrite.rewrite.sourceString.length} keys to rewrite, but entry ${i} has only ${into.length} values`
                    
                }
            }
        }

        for (let i = 0; i < keysToRewrite.into.length; i++) {
            let t = Utils.Clone(rewrite.renderings)
            for (let j = 0; j < keysToRewrite.sourceString.length; j++) {
                const key = keysToRewrite.sourceString[j];
                const target = keysToRewrite.into[i][j]
                t = ExpandRewrite.RewriteParts(key, target, t)
            }
            ts.push(t)
        }


        return {result: ts};
    }

}

/**
 * Converts a 'special' translation into a regular translation which uses parameters
 * E.g.
 * 
 * const tr = <TagRenderingJson> {
 *     "special": 
 * }
 */
export class RewriteSpecial extends DesugaringStep<TagRenderingConfigJson> {
    constructor() {
        super("Converts a 'special' translation into a regular translation which uses parameters", ["special"],"RewriteSpecial");
    }

    /**
     * Does the heavy lifting and conversion
     * 
     * // should not do anything if no 'special'-key is present
     * RewriteSpecial.convertIfNeeded({"en": "xyz", "nl": "abc"}, [], "test") // => {"en": "xyz", "nl": "abc"}
     * 
     * // should handle a simple special case
     * RewriteSpecial.convertIfNeeded({"special": {"type":"image_carousel"}}, [], "test") // => {'*': "{image_carousel()}"}
     * 
     * // should handle special case with a parameter
     * RewriteSpecial.convertIfNeeded({"special": {"type":"image_carousel", "image_key": "some_image_key"}}, [], "test") // =>  {'*': "{image_carousel(some_image_key)}"}
     * 
     * // should handle special case with a translated parameter
     * const spec = {"special": {"type":"image_upload", "label": {"en": "Add a picture to this object", "nl": "Voeg een afbeelding toe"}}}
     * const r = RewriteSpecial.convertIfNeeded(spec, [], "test")
     * r // => {"en": "{image_upload(,Add a picture to this object)}", "nl": "{image_upload(,Voeg een afbeelding toe)}" }
     * 
     * // should warn for unexpected keys
     * const errors = []
     * RewriteSpecial.convertIfNeeded({"special": {type: "image_carousel"}, "en": "xyz"}, errors, "test") // =>  {'*': "{image_carousel()}"}
     * errors // => ["At test: Unexpected key in a special block: en"]
     * 
     * // should give an error on unknown visualisations
     * const errors = []
     * RewriteSpecial.convertIfNeeded({"special": {type: "qsdf"}}, errors, "test") // => undefined
     * errors.length // => 1
     * errors[0].indexOf("Special visualisation 'qsdf' not found") >= 0 // => true
     * 
     * // should give an error is 'type' is missing
     * const errors = []
     * RewriteSpecial.convertIfNeeded({"special": {}}, errors, "test") // => undefined
     * errors // => ["A 'special'-block should define 'type' to indicate which visualisation should be used"]
     */
    private static convertIfNeeded(input: (object & {special : {type: string}}) | any, errors: string[], context: string): any {
        const special = input["special"]
        if(special === undefined){
            return input
        }

        for (const wrongKey of Object.keys(input).filter(k => k !== "special")) {
            errors.push(`At ${context}: Unexpected key in a special block: ${wrongKey}`)
        }

        const type = special["type"]
        if(type === undefined){
            errors.push("A 'special'-block should define 'type' to indicate which visualisation should be used")
            return undefined
        }
        const vis = SpecialVisualizations.specialVisualizations.find(sp => sp.funcName === type)
        if(vis === undefined){
            const options = Utils.sortedByLevenshteinDistance(type, SpecialVisualizations.specialVisualizations, sp => sp.funcName)
            errors.push(`Special visualisation '${type}' not found. Did you perhaps mean ${options[0].funcName}, ${options[1].funcName} or ${options[2].funcName}?\n\tFor all known special visualisations, please see https://github.com/pietervdvn/MapComplete/blob/develop/Docs/SpecialRenderings.md`)
            return undefined
        }
        
        const argNamesList = vis.args.map(a => a.name)
        const argNames = new Set<string>(argNamesList)
        // Check for obsolete and misspelled arguments
        errors.push(...Object.keys(special)
            .filter(k => !argNames.has(k))
            .filter(k => k !== "type")
            .map(wrongArg => {
            const byDistance = Utils.sortedByLevenshteinDistance(wrongArg, argNamesList, x => x)
            return `Unexpected argument with name '${wrongArg}'. Did you mean ${byDistance[0]}?\n\tAll known arguments are ${ argNamesList.join(", ")}` ;
        }))
        
        // Check that all obligated arguments are present. They are obligated if they don't have a preset value
        for (const arg of vis.args) {
            if (arg.required !== true) {
                continue;
            }
            const param = special[arg.name]
            if(param === undefined){
                errors.push(`Obligated parameter '${arg.name}' not found`)
            }
        }
        
        const foundLanguages = new Set<string>()
        const translatedArgs = argNamesList.map(nm => special[nm])
            .filter(v => v !== undefined)
            .filter(v => Translations.isProbablyATranslation(v))
        for (const translatedArg of translatedArgs) {
            for (const ln of Object.keys(translatedArg)) {
                foundLanguages.add(ln)
            }  
        }
        
        if(foundLanguages.size === 0){
           const args=   argNamesList.map(nm => special[nm] ?? "").join(",")
            return {'*': `{${type}(${args})}`
        }
        }
        
        const result = {}
        const languages = Array.from(foundLanguages)
        languages.sort()
        for (const ln of languages) {
            const args = []
            for (const argName of argNamesList) {
                const v = special[argName] ?? ""
                if(Translations.isProbablyATranslation(v)){
                    args.push(new Translation(v).textFor(ln))
                }else{
                    args.push(v)
                }
            }
            result[ln] = `{${type}(${args.join(",")})}`
        }
        return result
    }

    /**
     * const tr = {
     *     render: {special: {type: "image_carousel", image_key: "image" }},
     *     mappings: [
     *         {
     *             if: "other_image_key",
     *             then: {special: {type: "image_carousel", image_key: "other_image_key"}}
     *         }
     *     ]
     * }
     * const result = new RewriteSpecial().convert(tr,"test").result
     * const expected = {render:  {'*': "{image_carousel(image)}"}, mappings: [{if: "other_image_key", then:  {'*': "{image_carousel(other_image_key)}"}} ]}
     * result // => expected
     */
    convert(json: TagRenderingConfigJson, context: string): { result: TagRenderingConfigJson; errors?: string[]; warnings?: string[]; information?: string[] } {
        const errors = []
        json = Utils.Clone(json)
        const paths : {path: string[], type?: any, typeHint?: string}[] = tagrenderingconfigmeta["default"] ?? tagrenderingconfigmeta
        for (const path of paths) {
            if(path.typeHint !== "rendered"){
                continue
            }
            Utils.WalkPath(path.path, json, ((leaf, travelled) => RewriteSpecial.convertIfNeeded(leaf, errors, travelled.join("."))))
        }
        
        return {
            result:json,
            errors
        };
    }
    
}

export class PrepareLayer extends Fuse<LayerConfigJson> {
    constructor(state: DesugaringContext) {
        super(
            "Fully prepares and expands a layer for the LayerConfig.",
            new OnEvery("tagRenderings", new RewriteSpecial(), {ignoreIfUndefined: true}),
            new OnEveryConcat("tagRenderings", new ExpandGroupRewrite(state)),
            new OnEveryConcat("tagRenderings", new ExpandTagRendering(state)),
            new OnEveryConcat("mapRendering", new ExpandRewrite()),
            new SetDefault("titleIcons", ["defaults"]),
            new OnEveryConcat("titleIcons", new ExpandTagRendering(state))
        );
    }
}