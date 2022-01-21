import {Conversion, DesugaringContext, Fuse, OnEveryConcat, SetDefault} from "./Conversion";
import {LayerConfigJson} from "../Json/LayerConfigJson";
import {TagRenderingConfigJson} from "../Json/TagRenderingConfigJson";
import {Utils} from "../../../Utils";

class ExpandTagRendering extends Conversion<string | TagRenderingConfigJson | { builtin: string | string[], override: any }, TagRenderingConfigJson[]> {
    constructor() {
        super("Converts a tagRenderingSpec into the full tagRendering", []);
    }

    convert(state: DesugaringContext, json: string | TagRenderingConfigJson | { builtin: string | string[]; override: any }, context: string): { result: TagRenderingConfigJson[]; errors: string[]; warnings: string[] } {
        const errors = []
        const warnings = []

        return {
            result: this.convertUntilStable(state, json, warnings, errors, context),
            errors, warnings
        };
    }

    private lookup(state: DesugaringContext, name: string): TagRenderingConfigJson[] {
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

    private convertOnce(state: DesugaringContext, tr: string | any, warnings: string[], errors: string[], ctx: string): TagRenderingConfigJson[] {
        if (tr === "questions") {
            return [{
                id: "questions"
            }]
        }


        if (typeof tr === "string") {
            const lookup = this.lookup(state, tr);
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
                const lookup = this.lookup(state, name)
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

    private convertUntilStable(state: DesugaringContext, spec: string | any, warnings: string[], errors: string[], ctx: string): TagRenderingConfigJson[] {
        const trs = this.convertOnce(state, spec, warnings, errors, ctx);

        const result = []
        for (const tr of trs) {
            if (tr["builtin"] !== undefined) {
                const stable = this.convertUntilStable(state, tr, warnings, errors, ctx + "(RECURSIVE RESOLVE)")
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


    private static expandSubTagRenderings = new ExpandTagRendering()

    constructor() {
        super(
            "Converts a rewrite config for tagRenderings into the expanded form"
        );
    }

    convert(state: DesugaringContext, json:
        {
            rewrite:
                { sourceString: string; into: string[] }[]; renderings: (string | { builtin: string; override: any } | TagRenderingConfigJson)[]
        } | TagRenderingConfigJson, context: string): { result: TagRenderingConfigJson[]; errors: string[]; warnings: string[] } {

        if (json["rewrite"] === undefined) {
            return {result: [<TagRenderingConfigJson>json], errors: [], warnings: []}
        }
        let config = <{
            rewrite:
                { sourceString: string; into: string[] }[];
            renderings: (string | { builtin: string; override: any } | TagRenderingConfigJson)[]
        }>json;


        const subRenderingsRes = ExpandGroupRewrite.expandSubTagRenderings.convertAll(state, config.renderings, context);
        const subRenderings: TagRenderingConfigJson[] = [].concat(subRenderingsRes.result);
        const errors = subRenderingsRes.errors;
        const warnings = subRenderingsRes.warnings;


        const rewrittenPerGroup = new Map<string, TagRenderingConfigJson[]>()

        // The actual rewriting
        for (const rewrite of config.rewrite) {
            const source = rewrite.sourceString;
            for (const target of rewrite.into) {
                const groupName = target;
                const trs: TagRenderingConfigJson[] = []

                for (const tr of subRenderings) {
                    trs.push(this.prepConfig(source, target, tr))
                }
                if (rewrittenPerGroup.has(groupName)) {
                    rewrittenPerGroup.get(groupName).push(...trs)

                } else {
                    rewrittenPerGroup.set(groupName, trs)

                }
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
                    errors.push("A tagrendering has an empty ID after expanding the tag")
                }
            })
        })

        return {
            result: [].concat(...Array.from(rewrittenPerGroup.values())),
            errors, warnings
        };
    }

    /* Used for left|right group creation and replacement */
    private prepConfig(keyToRewrite: string, target: string, tr: TagRenderingConfigJson) {

        function replaceRecursive(transl: string | any) {
            if (typeof transl === "string") {
                return transl.replace(keyToRewrite, target)
            }
            if (transl.map !== undefined) {
                return transl.map(o => replaceRecursive(o))
            }
            transl = {...transl}
            for (const key in transl) {
                transl[key] = replaceRecursive(transl[key])
            }
            return transl
        }

        const orig = tr;
        tr = replaceRecursive(tr)

        tr.id = target + "-" + orig.id
        tr.group = target
        return tr
    }
}


export class PrepareLayer extends Fuse<LayerConfigJson> {
    constructor() {
        super(
            "Fully prepares and expands a layer for the LayerConfig.",
            new OnEveryConcat("tagRenderings", new ExpandGroupRewrite()),
            new OnEveryConcat("tagRenderings", new ExpandTagRendering()),
            new SetDefault("titleIcons", ["defaults"]),
            new OnEveryConcat("titleIcons", new ExpandTagRendering())
        );
    }
}