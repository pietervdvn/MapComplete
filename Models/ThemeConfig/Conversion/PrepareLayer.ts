import {Conversion, DesugaringContext, Fuse, OnEveryConcat, SetDefault} from "./Conversion";
import {LayerConfigJson} from "../Json/LayerConfigJson";
import {TagRenderingConfigJson} from "../Json/TagRenderingConfigJson";
import {Utils} from "../../../Utils";
import Translations from "../../../UI/i18n/Translations";
import {Translation} from "../../../UI/i18n/Translation";

class ExpandTagRendering extends Conversion<string | TagRenderingConfigJson | { builtin: string | string[], override: any }, TagRenderingConfigJson[]> {
    private readonly _state: DesugaringContext;
    constructor(state: DesugaringContext) {
        super("Converts a tagRenderingSpec into the full tagRendering", []);
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
            if (lookup !== undefined) {
                return lookup
            }
            warnings.push(ctx + "A literal rendering was detected: " + tr)
            return [{
                render: tr,
                id: tr.replace(/![a-zA-Z0-9]/g, "")
            }]
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
            if (tr["builtin"] !== undefined) {
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
            "Converts a rewrite config for tagRenderings into the expanded form"
        );
        this._expandSubTagRenderings = new ExpandTagRendering(state)
    }

    convert( json:
        {
            rewrite:
                { sourceString: string; into: string[] }[]; renderings: (string | { builtin: string; override: any } | TagRenderingConfigJson)[]
        } | TagRenderingConfigJson, context: string): { result: TagRenderingConfigJson[]; errors: string[]; warnings: string[] } {

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
  
            const expectedLength = config.rewrite.sourceString.length
            for (let i = 0; i < config.rewrite.into.length; i++){
                const targets = config.rewrite.into[i];
                if(targets.length !== expectedLength){
                    errors.push(context+".rewrite.into["+i+"]: expected "+expectedLength+" values, but got "+targets.length)
                }
                if(typeof targets[0] !== "string"){
                    errors.push(context+".rewrite.into["+i+"]: expected a string as first rewrite value values, but got "+targets[0])

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

        const subRenderingsRes = <{ result: TagRenderingConfigJson[][], errors, warnings }> this._expandSubTagRenderings.convertAll(config.renderings, context);
        const subRenderings: TagRenderingConfigJson[] = [].concat(...subRenderingsRes.result);
        const errors = subRenderingsRes.errors;
        const warnings = subRenderingsRes.warnings;


        const rewrittenPerGroup = new Map<string, TagRenderingConfigJson[]>()

        // The actual rewriting
        const sourceStrings = config.rewrite.sourceString;
        for (const targets of config.rewrite.into) {
            const groupName = targets[0];
            if(typeof groupName !== "string"){
                throw "The first string of 'targets' should always be a string"
            }
            const trs: TagRenderingConfigJson[] = []

            for (const tr of subRenderings) {
                let rewritten = tr;
                for (let i = 0; i < sourceStrings.length; i++) {
                    const source = sourceStrings[i]
                    const target = targets[i] // This is a string OR a translation
                    rewritten = this.prepConfig(source, target, rewritten)
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
                    errors.push("A tagrendering has an empty ID after expanding the tag; the tagrendering is: "+JSON.stringify(tr))
                }
            })
        })

        return {
            result: [].concat(...Array.from(rewrittenPerGroup.values())),
            errors, warnings
        };
    }

    /* Used for left|right group creation and replacement.
    * Every 'keyToRewrite' will be replaced with 'target' recursively. This substitution will happen in place in the object 'tr' */
    private prepConfig(keyToRewrite: string, target: string | any, tr: TagRenderingConfigJson): TagRenderingConfigJson {

        const isTranslation = typeof target !== "string"

        function replaceRecursive(transl: string | any) {
            if (typeof transl === "string") {
                // This is a simple string - we do a simple replace
                return transl.replace(keyToRewrite, target)
            }
            if (transl.map !== undefined) {
                // This is a list of items
                return transl.map(o => replaceRecursive(o))
            }

            if (Translations.isProbablyATranslation(transl) && isTranslation) {
                return Translations.T(transl).Fuse(new Translation(target), keyToRewrite).translations
            }

            transl = {...transl}
            for (const key in transl) {
                transl[key] = replaceRecursive(transl[key])
            }
            return transl
        }

        return replaceRecursive(tr)
    }
}


export class PrepareLayer extends Fuse<LayerConfigJson> {
    constructor(state: DesugaringContext) {
        super(
            "Fully prepares and expands a layer for the LayerConfig.",
            new OnEveryConcat("tagRenderings", new ExpandGroupRewrite(state)),
            new OnEveryConcat("tagRenderings", new ExpandTagRendering(state)),
            new SetDefault("titleIcons", ["defaults"]),
            new OnEveryConcat("titleIcons", new ExpandTagRendering(state))
        );
    }
}