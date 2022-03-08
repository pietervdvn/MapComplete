import {Conversion, DesugaringContext, Fuse, OnEvery, OnEveryConcat, SetDefault} from "./Conversion";
import {LayerConfigJson} from "../Json/LayerConfigJson";
import {TagRenderingConfigJson} from "../Json/TagRenderingConfigJson";
import {Utils} from "../../../Utils";
import Translations from "../../../UI/i18n/Translations";
import {Translation} from "../../../UI/i18n/Translation";
import RewritableConfigJson from "../Json/RewritableConfigJson";

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

class ExpandRewrite<T> extends Conversion<T | RewritableConfigJson<T>, T[]> {

    constructor() {
        super("Applies a rewrite", [], "ExpandRewrite");
    }


    /* Used for left|right group creation and replacement.
    * Every 'keyToRewrite' will be replaced with 'target' recursively. This substitution will happen in place in the object 'tr' */
    public static RewriteParts<T>(keyToRewrite: string, target: string | any, tr: T): T {

        function replaceRecursive(transl: string | any) {
            
            if(transl === keyToRewrite){
                return target
            }
            
            if (typeof transl === "string") {
                // This is a simple string - we do a simple replace
                return transl.replace(keyToRewrite, target)
            }
            if (Array.isArray(transl)) {
                // This is a list of items
                return transl.map(o => replaceRecursive(o))
            }

            if(typeof transl === "object"){
                transl = {...transl}
                for (const key in transl) {
                    transl[key] = replaceRecursive(transl[key])
                }
                return transl
            }
            return transl
        }

        return replaceRecursive(tr)
    }

    convert(json: T | RewritableConfigJson<T>, context: string): { result: T[]; errors?: string[]; warnings?: string[]; information?: string[] } {

        if(json === null || json === undefined){
            return {result: []}
        }
        
        if (json["rewrite"] === undefined) {
            
            // not a rewrite
            return {result: [(<T>json)]}
        }

        const rewrite = <RewritableConfigJson<T>>json;
        const keysToRewrite  = rewrite.rewrite
        const ts : T[] = []

        for (let i = 0; i < keysToRewrite.sourceString.length; i++){
            const guard = keysToRewrite.sourceString[i];
            for (let j = i + 1; j < keysToRewrite.sourceString.length; j++) {
                const toRewrite = keysToRewrite.sourceString[j]
                if(toRewrite.indexOf(guard) >= 0){
                    throw `${context} Error in rewrite: sourcestring[${i}] is a substring of sourcestring[${j}]: ${guard} will be substituted away before ${toRewrite} is reached.`
                }
            }
        }

        for (let i = 0; i < keysToRewrite.into[0].length; i++){
            let t = Utils.Clone(rewrite.renderings)
            for (let i1 = 0; i1 < keysToRewrite.sourceString.length; i1++){
                const key = keysToRewrite.sourceString[i1];
                const target = keysToRewrite.into[i1][i]
                t = ExpandRewrite.RewriteParts(key, target, t)
            }
            ts.push(t)
        }


        return {result: ts};
    }

}


class ExpandRewriteWithFlatten<T> extends Conversion<T | RewritableConfigJson<T | T[]>, T[]> {

    private _rewrite = new ExpandRewrite<T>()

    constructor() {
        super("Applies a rewrite, the result is flattened if it is an array", [], "ExpandRewriteWithFlatten");
    }

    convert(json: RewritableConfigJson<T[] | T> | T, context: string): { result: T[]; errors?: string[]; warnings?: string[]; information?: string[] } {
        return undefined;
    }


}

export class PrepareLayer extends Fuse<LayerConfigJson> {
    constructor(state: DesugaringContext) {
        super(
            "Fully prepares and expands a layer for the LayerConfig.",
            new OnEveryConcat("tagRenderings", new ExpandGroupRewrite(state)),
            new OnEveryConcat("tagRenderings", new ExpandTagRendering(state)),
            new OnEveryConcat("mapRendering", new ExpandRewrite()),
            new SetDefault("titleIcons", ["defaults"]),
            new OnEveryConcat("titleIcons", new ExpandTagRendering(state))
        );
    }
}