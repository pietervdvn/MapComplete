import { Conversion, DesugaringContext } from "./Conversion"
import { TagRenderingConfigJson } from "../Json/TagRenderingConfigJson"
import { LayerConfigJson } from "../Json/LayerConfigJson"
import { ConversionContext } from "./ConversionContext"
import { QuestionableTagRenderingConfigJson } from "../Json/QuestionableTagRenderingConfigJson"
import { TagUtils } from "../../../Logic/Tags/TagUtils"
import { Utils } from "../../../Utils"
import { AddContextToTranslations } from "./AddContextToTranslations"

export class ExpandTagRendering extends Conversion<
    | string
    | TagRenderingConfigJson
    | {
          builtin: string | string[]
          override: any
      },
    TagRenderingConfigJson[]
> {
    private readonly _state: DesugaringContext
    private readonly _tagRenderingsByLabel: Map<string, (TagRenderingConfigJson & { id: string })[]>
    // Only used for self-reference
    private readonly _self: LayerConfigJson
    private readonly _options: {
        /* If true, will copy the 'osmSource'-tags into the condition */
        applyCondition?: true | boolean
        noHardcodedStrings?: false | boolean
        addToContext?: false | boolean
    }

    constructor(
        state: DesugaringContext,
        self: LayerConfigJson,
        options?: {
            applyCondition?: true | boolean
            noHardcodedStrings?: false | boolean
            // If set, a question will be added to the 'sharedTagRenderings'. Should only be used for 'questions.json'
            addToContext?: false | boolean
        }
    ) {
        super(
            "Converts a tagRenderingSpec into the full tagRendering, e.g. by substituting the tagRendering by the shared-question and reusing the builtins",
            [],
            "ExpandTagRendering"
        )
        this._state = state
        this._self = self
        this._options = options
        this._tagRenderingsByLabel = new Map<string, (TagRenderingConfigJson & { id: string })[]>()
        for (const trconfig of state.tagRenderings?.values() ?? []) {
            for (const label of trconfig["labels"] ?? []) {
                let withLabel = this._tagRenderingsByLabel.get(label)
                if (withLabel === undefined) {
                    withLabel = []
                    this._tagRenderingsByLabel.set(label, withLabel)
                }
                withLabel.push(trconfig)
            }
        }
    }

    public convert(
        spec: string | { builtin: string | string[] } | TagRenderingConfigJson,
        ctx: ConversionContext
    ): QuestionableTagRenderingConfigJson[] {
        const trs = this.convertOnce(<any>spec, ctx)?.map((tr) =>
            this.pruneMappings<TagRenderingConfigJson & { id: string }>(tr, ctx)
        )
        if (!Array.isArray(trs)) {
            ctx.err("Result of lookup for " + spec + " is not iterable; got " + trs)
            return undefined
        }
        const result = []
        for (const tr of trs) {
            if (typeof tr === "string" || tr["builtin"] !== undefined) {
                const stable = this.convert(tr, ctx.inOperation("recursive_resolve")).map((tr) =>
                    this.pruneMappings(tr, ctx)
                )
                result.push(...stable)
                if (this._options?.addToContext) {
                    for (const tr of stable) {
                        this._state.tagRenderings?.set(tr.id, tr)
                    }
                }
            } else {
                result.push(tr)
                if (this._options?.addToContext) {
                    this._state.tagRenderings?.set(tr["id"], <QuestionableTagRenderingConfigJson>tr)
                }
            }
        }

        return result
    }

    private pruneMappings<
        T extends TagRenderingConfigJson & {
            id: string
        }
    >(tagRendering: T, ctx: ConversionContext): T {
        if (!tagRendering["strict"]) {
            return tagRendering
        }
        if (!this._self.source["osmTags"]) {
            return tagRendering
        }
        ctx.inOperation("expandTagRendering:pruning")
            .enters(tagRendering.id)
            .info(
                `PRUNING! Tagrendering to prune: ${tagRendering.id} in the context of layer ${this._self.id} Sourcetags: ${this._self.source["osmTags"]}`
            )
        const before = tagRendering.mappings?.length ?? 0

        const alwaysTags = TagUtils.Tag(this._self.source["osmTags"])
        const newMappings = tagRendering.mappings
            ?.filter((mapping) => {
                const condition = TagUtils.Tag(mapping.if)
                return condition.shadows(alwaysTags)
            })
            .map((mapping) => {
                const newIf = TagUtils.removeKnownParts(TagUtils.Tag(mapping.if), alwaysTags)
                if (typeof newIf === "boolean") {
                    throw "Invalid removeKnownParts"
                }
                return {
                    ...mapping,
                    if: newIf.asJson(),
                }
            })
        const after = newMappings?.length ?? 0
        if (before - after > 0) {
            ctx.info(
                `Pruned mappings for ${tagRendering.id}, from ${before} to ${after} (removed ${
                    before - after
                })`
            )
        }
        const tr = {
            ...tagRendering,
            mappings: newMappings,
        }
        delete tr["strict"]
        return tr
    }

    private lookup(
        name: string,
        ctx: ConversionContext
    ): (TagRenderingConfigJson & { id: string })[] | undefined {
        const direct = this.directLookup(name)

        if (direct === undefined) {
            return undefined
        }
        const result: (TagRenderingConfigJson & { id: string })[] = []
        for (const tagRenderingConfigJson of direct) {
            const nm: string | string[] | undefined = tagRenderingConfigJson["builtin"]
            if (nm !== undefined) {
                let indirect: (TagRenderingConfigJson & { id: string })[]
                if (typeof nm === "string") {
                    indirect = this.lookup(nm, ctx)
                } else {
                    indirect = [].concat(...nm.map((n) => this.lookup(n, ctx)))
                }
                for (let foundTr of indirect) {
                    foundTr = Utils.Clone(foundTr)
                    ctx.MergeObjectsForOverride(tagRenderingConfigJson["override"] ?? {}, foundTr)
                    foundTr["id"] = tagRenderingConfigJson["id"] ?? foundTr["id"]
                    result.push(foundTr)
                }
            } else {
                result.push(tagRenderingConfigJson)
            }
        }
        return result
    }

    /**
     * Looks up a tagRendering or group of tagRenderings based on the name.
     */
    private directLookup(name: string): (TagRenderingConfigJson & { id: string })[] | undefined {
        const state = this._state
        if (state.tagRenderings.has(name)) {
            return [state.tagRenderings.get(name)]
        }
        if (this._tagRenderingsByLabel.has(name)) {
            return this._tagRenderingsByLabel.get(name)
        }

        if (name.indexOf(".") < 0) {
            return undefined
        }

        const spl = name.split(".")
        let layer = state.sharedLayers?.get(spl[0])
        if (spl[0] === this._self?.id) {
            layer = this._self
        }

        if (spl.length !== 2 || !layer) {
            return undefined
        }

        const id = spl[1]

        const layerTrs = <(TagRenderingConfigJson & { id: string })[]>(
            layer.tagRenderings.filter((tr) => tr["id"] !== undefined)
        )
        let matchingTrs: (TagRenderingConfigJson & { id: string })[]
        if (id === "*") {
            matchingTrs = layerTrs
        } else if (id.startsWith("*")) {
            const id_ = id.substring(1)
            matchingTrs = layerTrs.filter((tr) => tr["labels"]?.indexOf(id_) >= 0)
        } else {
            matchingTrs = layerTrs.filter((tr) => tr["id"] === id || tr["labels"]?.indexOf(id) >= 0)
        }

        const contextWriter = new AddContextToTranslations<TagRenderingConfigJson & { id: string }>(
            "layers:"
        )
        for (let i = 0; i < matchingTrs.length; i++) {
            let found: TagRenderingConfigJson & { id: string } = Utils.Clone(matchingTrs[i])
            if (this._options?.applyCondition) {
                // The matched tagRenderings are 'stolen' from another layer. This means that they must match the layer condition before being shown
                if (typeof layer.source !== "string") {
                    if (found.condition === undefined) {
                        found.condition = layer.source["osmTags"]
                    } else {
                        found.condition = { and: [found.condition, layer.source["osmTags"]] }
                    }
                }
            }

            found = contextWriter.convertStrict(
                found,
                ConversionContext.construct(
                    [layer.id, "tagRenderings", found["id"]],
                    ["AddContextToTranslations"]
                )
            )
            matchingTrs[i] = found
        }

        if (matchingTrs.length !== 0) {
            return matchingTrs
        }
        return undefined
    }

    private convertOnce(
        tr: string | { builtin: string } | TagRenderingConfigJson,
        ctx: ConversionContext
    ): TagRenderingConfigJson[] {
        const state = this._state

        if (tr === undefined) {
            return []
        }

        if (typeof tr === "string") {
            if (this._state.tagRenderings !== null) {
                const lookup = this.lookup(tr, ctx)
                if (lookup) {
                    return lookup
                }
            }
            if (
                this._state.sharedLayers?.size > 0 &&
                ctx.path.at(-1) !== "icon" &&
                !ctx.path.find((p) => p === "pointRendering")
            ) {
                ctx.warn(
                    `A literal rendering was detected: ${tr}
                      Did you perhaps forgot to add a layer name as 'layername.${tr}'? ` +
                        Array.from(state.sharedLayers.keys()).join(", ")
                )
            }

            if (this._options?.noHardcodedStrings && this._state?.sharedLayers?.size > 0) {
                ctx.err(
                    "Detected an invocation to a builtin tagRendering, but this tagrendering was not found: " +
                        tr +
                        " \n    Did you perhaps forget to add the layer as prefix, such as `icons." +
                        tr +
                        "`? "
                )
            }

            return [
                <TagRenderingConfigJson & { id: string }>{
                    render: tr,
                    id: tr.replace(/[^a-zA-Z0-9]/g, ""),
                },
            ]
        }

        if (tr["builtin"] !== undefined) {
            let names: string | string[] = tr["builtin"]
            if (typeof names === "string") {
                names = [names]
            }

            if (this._state.tagRenderings === null) {
                return []
            }

            for (const key of Object.keys(tr)) {
                if (
                    key === "builtin" ||
                    key === "override" ||
                    key === "id" ||
                    key.startsWith("#")
                ) {
                    continue
                }
                ctx.err(
                    "An object calling a builtin can only have keys `builtin` or `override`, but a key with name `" +
                        key +
                        "` was found. This won't be picked up! The full object is: " +
                        JSON.stringify(tr)
                )
            }

            const trs: (TagRenderingConfigJson & { id: string })[] = []
            for (const name of names) {
                const lookup = this.lookup(name, ctx)
                if (lookup === undefined) {
                    let candidates = Array.from(state.tagRenderings.keys())
                    if (name.indexOf(".") > 0) {
                        const [layerName] = name.split(".")
                        if (layerName === undefined) {
                            ctx.err("Layername is undefined", name)
                        }
                        let layer = state.sharedLayers.get(layerName)
                        if (layerName === this._self?.id) {
                            layer = this._self
                        }
                        if (layer === undefined) {
                            const candidates = Utils.sortedByLevenshteinDistance(
                                layerName,
                                Utils.NoNull(Array.from(state.sharedLayers.keys())),
                                (s) => s
                            )
                            if (state.sharedLayers.size === 0) {
                                ctx.warn(
                                    "BOOTSTRAPPING. Rerun generate layeroverview. While reusing tagrendering: " +
                                        name +
                                        ": layer " +
                                        layerName +
                                        " not found for now, but ignoring as this is a bootstrapping run. "
                                )
                            } else {
                                ctx.err(
                                    ": While reusing tagrendering: " +
                                        name +
                                        ": layer " +
                                        layerName +
                                        " not found. Maybe you meant one of " +
                                        candidates.slice(0, 3).join(", ")
                                )
                            }
                            continue
                        }
                        candidates = Utils.NoNull(layer.tagRenderings.map((tr) => tr["id"])).map(
                            (id) => layerName + "." + id
                        )
                    }
                    candidates = Utils.sortedByLevenshteinDistance(name, candidates, (i) => i)
                    ctx.err(
                        "The tagRendering with identifier " +
                            name +
                            " was not found.\n\tDid you mean one of " +
                            candidates.join(", ") +
                            "?\n(Hint: did you add a new label and are you trying to use this label at the same time? Run 'reset:layeroverview' first"
                    )
                    continue
                }
                for (let foundTr of lookup) {
                    foundTr = Utils.Clone(foundTr)
                    ctx.MergeObjectsForOverride(tr["override"] ?? {}, foundTr)
                    if (names.length == 1) {
                        foundTr["id"] = tr["id"] ?? foundTr["id"]
                    }
                    trs.push(foundTr)
                }
            }
            return trs
        }

        return [<TagRenderingConfigJson & { id: string }>tr]
    }
}
