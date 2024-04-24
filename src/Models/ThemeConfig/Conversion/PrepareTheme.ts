import {
    Concat,
    Conversion,
    DesugaringContext,
    DesugaringStep,
    Each,
    Fuse,
    On,
    Pass,
    SetDefault,
} from "./Conversion"
import { LayoutConfigJson } from "../Json/LayoutConfigJson"
import { PrepareLayer } from "./PrepareLayer"
import { LayerConfigJson } from "../Json/LayerConfigJson"
import { Utils } from "../../../Utils"
import Constants from "../../Constants"
import CreateNoteImportLayer from "./CreateNoteImportLayer"
import LayerConfig from "../LayerConfig"
import { TagRenderingConfigJson } from "../Json/TagRenderingConfigJson"
import DependencyCalculator from "../DependencyCalculator"
import { AddContextToTranslations } from "./AddContextToTranslations"
import ValidationUtils from "./ValidationUtils"
import { ConversionContext } from "./ConversionContext"

class SubstituteLayer extends Conversion<string | LayerConfigJson, LayerConfigJson[]> {
    private readonly _state: DesugaringContext

    constructor(state: DesugaringContext) {
        super(
            "Converts the identifier of a builtin layer into the actual layer, or converts a 'builtin' syntax with override in the fully expanded form. Note that 'tagRenderings+' will be inserted before 'leftover-questions'",
            [],
            "SubstituteLayer"
        )
        this._state = state
    }

    convert(json: string | LayerConfigJson, context: ConversionContext): LayerConfigJson[] {
        const state = this._state

        function reportNotFound(name: string) {
            const knownLayers = Array.from(state.sharedLayers.keys())
            const withDistance = knownLayers.map((lname) => [
                lname,
                Utils.levenshteinDistance(name, lname),
            ])
            withDistance.sort((a, b) => a[1] - b[1])
            const ids = withDistance.map((n) => n[0])
            // Known builtin layers are "+.join(",")+"\n    For more information, see "
            context.err(`The layer with name ${name} was not found as a builtin layer. Perhaps you meant ${ids[0]}, ${ids[1]} or ${ids[2]}?
 For an overview of all available layers, refer to https://github.com/pietervdvn/MapComplete/blob/develop/Docs/BuiltinLayers.md`)
        }

        if (typeof json === "string") {
            const found = state.sharedLayers.get(json)
            if (found === undefined) {
                reportNotFound(json)
                return null
            }
            return [found]
        }

        if (json["builtin"] === undefined) {
            return [json]
        }

        let names = json["builtin"]
        if (typeof names === "string") {
            names = [names]
        }
        const layers = []

        for (const name of names) {
            const found = Utils.Clone(state.sharedLayers.get(name))
            found["_basedOn"] = name
            if (found === undefined) {
                reportNotFound(name)
                continue
            }
            if (
                json["override"]["tagRenderings"] !== undefined &&
                (found["tagRenderings"] ?? []).length > 0
            ) {
                context.err(
                    `When overriding a layer, an override is not allowed to override into tagRenderings. Use "+tagRenderings" or "tagRenderings+" instead to prepend or append some questions.`
                )
            }
            try {
                const trPlus = json["override"]["tagRenderings+"]
                if (trPlus) {
                    let index = found.tagRenderings.findIndex(
                        (tr) => tr["id"] === "leftover-questions"
                    )
                    if (index < 0) {
                        index = found.tagRenderings.length
                    }
                    found.tagRenderings.splice(index, 0, ...trPlus)
                    delete json["override"]["tagRenderings+"]
                }

                context.MergeObjectsForOverride(json["override"], found)
                layers.push(found)
            } catch (e) {
                context.err(
                    `Could not apply an override due to: ${e}.\nThe override is: ${JSON.stringify(
                        json["override"]
                    )}`
                )
            }

            if (json["hideTagRenderingsWithLabels"]) {
                if (typeof json["hideTagRenderingsWithLabels"] === "string") {
                    throw (
                        "At " +
                        context +
                        ".hideTagRenderingsWithLabels should be a list containing strings, you specified a string"
                    )
                }
                const hideLabels: Set<string> = new Set(json["hideTagRenderingsWithLabels"])
                // These labels caused at least one deletion
                const usedLabels: Set<string> = new Set<string>()
                const filtered = []
                for (const tr of found.tagRenderings) {
                    const labels = tr["labels"]
                    if (labels !== undefined) {
                        const forbiddenLabel = labels.findIndex((l) => hideLabels.has(l))
                        if (forbiddenLabel >= 0) {
                            usedLabels.add(labels[forbiddenLabel])
                            context.info(
                                "Dropping tagRendering " +
                                    tr["id"] +
                                    " as it has a forbidden label: " +
                                    labels[forbiddenLabel]
                            )
                            continue
                        }
                    }

                    if (hideLabels.has(tr["id"])) {
                        usedLabels.add(tr["id"])
                        context.info(
                            "Dropping tagRendering " + tr["id"] + " as its id is a forbidden label"
                        )
                        continue
                    }

                    if (hideLabels.has(tr["group"])) {
                        usedLabels.add(tr["group"])
                        context.info(
                            "Dropping tagRendering " +
                                tr["id"] +
                                " as its group `" +
                                tr["group"] +
                                "` is a forbidden label"
                        )
                        continue
                    }

                    filtered.push(tr)
                }
                const unused = Array.from(hideLabels).filter((l) => !usedLabels.has(l))
                if (unused.length > 0) {
                    context.err(
                        "This theme specifies that certain tagrenderings have to be removed based on forbidden layers. One or more of these layers did not match any tagRenderings and caused no deletions: " +
                            unused.join(", ") +
                            "\n   This means that this label can be removed or that the original tagRendering that should be deleted does not have this label anymore"
                    )
                }
                found.tagRenderings = filtered
            }
        }
        return layers
    }
}

class AddDefaultLayers extends DesugaringStep<LayoutConfigJson> {
    private readonly _state: DesugaringContext

    constructor(state: DesugaringContext) {
        super(
            "Adds the default layers, namely: " + Constants.added_by_default.join(", "),
            ["layers"],
            "AddDefaultLayers"
        )
        this._state = state
    }

    convert(json: LayoutConfigJson, context: ConversionContext): LayoutConfigJson {
        const state = this._state
        json.layers = Utils.NoNull([...(json.layers ?? [])])
        const alreadyLoaded = new Set(json.layers.map((l) => l["id"]))

        for (const layerName of Constants.added_by_default) {
            const v = state.sharedLayers.get(layerName)
            if (v === undefined) {
                const msg = `Default layer ${layerName} not found. ${state.sharedLayers.size} layers are available`
                if (layerName === "favourite") {
                    continue
                }
                context.err(msg)
                continue
            }
            if (alreadyLoaded.has(v.id)) {
                context.warn(
                    "Layout " +
                        context +
                        " already has a layer with name " +
                        v.id +
                        "; skipping inclusion of this builtin layer"
                )
                continue
            }
            json.layers.push(v)
        }

        return json
    }
}

class AddImportLayers extends DesugaringStep<LayoutConfigJson> {
    constructor() {
        super(
            "For every layer in the 'layers'-list, create a new layer which'll import notes. (Note that priviliged layers and layers which have a geojson-source set are ignored)",
            ["layers"],
            "AddImportLayers"
        )
    }

    convert(json: LayoutConfigJson, context: ConversionContext): LayoutConfigJson {
        if (!(json.enableNoteImports ?? true)) {
            context.info(
                "Not creating a note import layers for theme " + json.id + " as they are disabled"
            )
            return json
        }

        json = { ...json }
        const allLayers: LayerConfigJson[] = <LayerConfigJson[]>json.layers
        json.layers = [...json.layers]

        const creator = new CreateNoteImportLayer()
        for (let i1 = 0; i1 < allLayers.length; i1++) {
            const layer = allLayers[i1]
            if (layer.source === undefined) {
                // Priviliged layers are skipped
                continue
            }

            if (layer.source["geoJson"] !== undefined) {
                // Layer which don't get their data from OSM are skipped
                continue
            }

            if (layer.title === undefined || layer.name === undefined) {
                // Anonymous layers and layers without popup are skipped
                continue
            }

            if (layer.presets === undefined || layer.presets.length == 0) {
                // A preset is needed to be able to generate a new point
                continue
            }

            try {
                const importLayerResult = creator.convert(
                    layer,
                    context.inOperation(this.name).enter(i1)
                )
                if (importLayerResult !== undefined) {
                    json.layers.push(importLayerResult)
                }
            } catch (e) {
                context.err("Could not generate an import-layer for " + layer.id + " due to " + e)
            }
        }

        return json
    }
}

class AddContextToTranslationsInLayout extends DesugaringStep<LayoutConfigJson> {
    constructor() {
        super(
            "Adds context to translations, including the prefix 'themes:json.id'; this is to make sure terms in an 'overrides' or inline layer are linkable too",
            ["_context"],
            "AddContextToTranlationsInLayout"
        )
    }

    convert(json: LayoutConfigJson): LayoutConfigJson {
        const conversion = new AddContextToTranslations<LayoutConfigJson>("themes:")
        // The context is used to generate the 'context' in the translation .It _must_ be `json.id` to correctly link into weblate
        return conversion.convert(
            json,
            ConversionContext.construct([json.id], ["AddContextToTranslation"])
        )
    }
}

class ApplyOverrideAll extends DesugaringStep<LayoutConfigJson> {
    constructor() {
        super(
            "Applies 'overrideAll' onto every 'layer'. The 'overrideAll'-field is removed afterwards",
            ["overrideAll", "layers"],
            "ApplyOverrideAll"
        )
    }

    convert(json: LayoutConfigJson, ctx: ConversionContext): LayoutConfigJson {
        const overrideAll = json.overrideAll
        if (overrideAll === undefined) {
            return json
        }

        json = { ...json }

        delete json.overrideAll
        const newLayers = []

        let tagRenderingsPlus = undefined
        if (overrideAll["tagRenderings+"] !== undefined) {
            tagRenderingsPlus = overrideAll["tagRenderings+"]
            delete overrideAll["tagRenderings+"]
        }

        for (let layer of json.layers) {
            layer = Utils.Clone(<LayerConfigJson>layer)
            ctx.MergeObjectsForOverride(overrideAll, layer)
            if (tagRenderingsPlus) {
                if (!layer.tagRenderings) {
                    layer.tagRenderings = tagRenderingsPlus
                } else {
                    let index = layer.tagRenderings.findIndex(
                        (tr) => tr["id"] === "leftover-questions"
                    )
                    if (index < 0) {
                        index = layer.tagRenderings.length - 1
                    }
                    layer.tagRenderings.splice(index, 0, ...tagRenderingsPlus)
                }
            }

            newLayers.push(layer)
        }
        json.layers = newLayers
        return json
    }
}

class AddDependencyLayersToTheme extends DesugaringStep<LayoutConfigJson> {
    private readonly _state: DesugaringContext

    constructor(state: DesugaringContext) {
        super(
            `If a layer has a dependency on another layer, these layers are added automatically on the theme. (For example: defibrillator depends on 'walls_and_buildings' to snap onto. This layer is added automatically)

            Note that these layers are added _at the start_ of the layer list, meaning that they will see _every_ feature.
            Furthermore, \`passAllFeatures\` will be set, so that they won't steal away features from further layers.
            Some layers (e.g. \`all_buildings_and_walls\' or \'streets_with_a_name\') are invisible, so by default, \'force_load\' is set too.
            `,
            ["layers"],
            "AddDependencyLayersToTheme"
        )
        this._state = state
    }

    private static CalculateDependencies(
        alreadyLoaded: LayerConfigJson[],
        allKnownLayers: Map<string, LayerConfigJson>,
        themeId: string
    ): { config: LayerConfigJson; reason: string }[] {
        const dependenciesToAdd: { config: LayerConfigJson; reason: string }[] = []
        const loadedLayerIds: Set<string> = new Set<string>(alreadyLoaded.map((l) => l?.id))

        // Verify cross-dependencies
        let unmetDependencies: {
            neededLayer: string
            neededBy: string
            reason: string
            context?: string
        }[] = []
        do {
            const dependencies: {
                neededLayer: string
                reason: string
                context?: string
                neededBy: string
            }[] = []

            for (const layerConfig of alreadyLoaded) {
                try {
                    const layerDeps = DependencyCalculator.getLayerDependencies(
                        new LayerConfig(layerConfig, themeId + "(dependencies)")
                    )
                    dependencies.push(...layerDeps)
                } catch (e) {
                    console.error(e)
                    throw (
                        "Detecting layer dependencies for " + layerConfig.id + " failed due to " + e
                    )
                }
            }

            for (const dependency of dependencies) {
                if (loadedLayerIds.has(dependency.neededLayer)) {
                    // We mark the needed layer as 'mustLoad'
                    alreadyLoaded.find((l) => l.id === dependency.neededLayer).forceLoad = true
                }
            }

            // During the generate script, builtin layers are verified but not loaded - so we have to add them manually here
            // Their existence is checked elsewhere, so this is fine
            unmetDependencies = dependencies.filter((dep) => !loadedLayerIds.has(dep.neededLayer))
            for (const unmetDependency of unmetDependencies) {
                if (loadedLayerIds.has(unmetDependency.neededLayer)) {
                    continue
                }
                const dep = Utils.Clone(allKnownLayers.get(unmetDependency.neededLayer))
                const reason =
                    "This layer is needed by " +
                    unmetDependency.neededBy +
                    " because " +
                    unmetDependency.reason +
                    " (at " +
                    unmetDependency.context +
                    ")"
                if (dep === undefined) {
                    const message = [
                        "Loading a dependency failed: layer " +
                            unmetDependency.neededLayer +
                            " is not found, neither as layer of " +
                            themeId +
                            " nor as builtin layer.",
                        reason,
                        "Loaded layers are: " + alreadyLoaded.map((l) => l.id).join(","),
                    ]
                    throw message.join("\n\t")
                }

                dep.forceLoad = true
                dep.passAllFeatures = true
                dep.description = reason
                dependenciesToAdd.unshift({
                    config: dep,
                    reason,
                })
                loadedLayerIds.add(dep.id)
                unmetDependencies = unmetDependencies.filter(
                    (d) => d.neededLayer !== unmetDependency.neededLayer
                )
            }
        } while (unmetDependencies.length > 0)

        return dependenciesToAdd
    }

    convert(theme: LayoutConfigJson, context: ConversionContext): LayoutConfigJson {
        const state = this._state
        const allKnownLayers: Map<string, LayerConfigJson> = state.sharedLayers
        const knownTagRenderings: Map<string, TagRenderingConfigJson> = state.tagRenderings
        const layers: LayerConfigJson[] = <LayerConfigJson[]>theme.layers // Layers should be expanded at this point

        knownTagRenderings.forEach((value, key) => {
            value["id"] = key
        })

        const dependencies = AddDependencyLayersToTheme.CalculateDependencies(
            layers,
            allKnownLayers,
            theme.id
        )
        if (dependencies.length > 0) {
            for (const dependency of dependencies) {
                context.info(
                    "Added " + dependency.config.id + " to the theme. " + dependency.reason
                )
            }
        }
        /**
         * Must be added to the _end_ of the layer list:
         * - Imagine that 'walls_and_buildings' is added...
         * - but there is a layer about a specific type of building already
         * Adding it up front would cause 'walls_and_buildings' to be triggered
         */
        layers.push(...dependencies.map((l) => l.config))

        return {
            ...theme,
            layers: layers,
        }
    }
}

class PreparePersonalTheme extends DesugaringStep<LayoutConfigJson> {
    private readonly _state: DesugaringContext

    constructor(state: DesugaringContext) {
        super("Adds every public layer to the personal theme", ["layers"], "PreparePersonalTheme")
        this._state = state
    }

    convert(json: LayoutConfigJson, context: ConversionContext): LayoutConfigJson {
        if (json.id !== "personal") {
            return json
        }

        // The only thing this _really_ does, is adding the layer-ids into 'layers'
        // All other preparations are done by the 'override-all'-block in personal.json

        json.layers = Array.from(this._state.sharedLayers.keys())
            .filter((l) => this._state.sharedLayers.get(l).source !== null)
            .filter((l) => this._state.publicLayers.has(l))
        context.info("The personal theme has " + json.layers.length + " public layers")
        return json
    }
}

class WarnForUnsubstitutedLayersInTheme extends DesugaringStep<LayoutConfigJson> {
    constructor() {
        super(
            "Generates a warning if a theme uses an unsubstituted layer",
            ["layers"],
            "WarnForUnsubstitutedLayersInTheme"
        )
    }

    convert(json: LayoutConfigJson, context: ConversionContext): LayoutConfigJson {
        if (json.hideFromOverview === true) {
            return json
        }
        if ((json.layers ?? []).length === 0) {
            context
                .enter("layers")
                .err(
                    "No layers are defined. You must define at least one layer to have a valid theme"
                )
            return json
        }
        if (!Array.isArray(json.layers)) {
            context
                .enter("layers")
                .err("Can not iterate over layers in theme, it is a " + JSON.stringify(json.layers))
            return json
        }
        for (const layer of json.layers) {
            if (typeof layer === "string") {
                continue
            }
            if (layer["builtin"] !== undefined) {
                continue
            }
            if (layer["source"]["geojson"] !== undefined) {
                // We turn a blind eye for import layers
                continue
            }

            context.warn(
                "The theme " +
                    json.id +
                    " has an inline layer: " +
                    layer["id"] +
                    ". This is discouraged."
            )
        }
        return json
    }
}

class PostvalidateTheme extends DesugaringStep<LayoutConfigJson> {
    private readonly _state: DesugaringContext
    constructor(state: DesugaringContext) {
        super("Various validation steps when everything is done", [], "PostvalidateTheme")
        this._state = state
    }

    convert(json: LayoutConfigJson, context: ConversionContext): LayoutConfigJson {
        for (const l of json.layers) {
            const layer = <LayerConfigJson>l
            const basedOn = <string>layer["_basedOn"]
            const basedOnDef = this._state.sharedLayers.get(basedOn)
            if (!basedOn) {
                continue
            }
            if (layer["name"] === null) {
                continue
            }
            const sameBasedOn = <LayerConfigJson[]>(
                json.layers.filter(
                    (l) => l["_basedOn"] === layer["_basedOn"] && l["id"] !== layer.id
                )
            )
            const minZoomAll = Math.min(...sameBasedOn.map((sbo) => sbo.minzoom))

            const sameNameDetected = sameBasedOn.some(
                (same) => JSON.stringify(layer["name"]) === JSON.stringify(same["name"])
            )
            if (!sameNameDetected) {
                // The name is unique, so it'll won't be confusing
                continue
            }
            if (minZoomAll < layer.minzoom) {
                context.err(
                    "There are multiple layers based on " +
                        basedOn +
                        ". The layer with id " +
                        layer.id +
                        " has a minzoom of " +
                        layer.minzoom +
                        ", and has a name set. Another similar layer has a lower minzoom. As such, the layer selection might show 'zoom in to see features' even though some of the features are already visible. Set `\"name\": null` for this layer and eventually remove the 'name':null for the other layer."
                )
            }
        }

        for (const layer of json.layers) {
            if (typeof layer === "string") {
                continue
            }
            const config = <LayerConfigJson>layer
            const sameAs = config.filter?.["sameAs"]
            if (!sameAs) {
                continue
            }

            const matchingLayer = json.layers.find((l) => l["id"] === sameAs)
            if (!matchingLayer) {
                const closeLayers = Utils.sortedByLevenshteinDistance(
                    sameAs,
                    json.layers,
                    (l) => l["id"]
                ).map((l) => l["id"])
                context
                    .enters("layers", config.id, "filter", "sameAs")
                    .err(
                        "The layer " +
                            config.id +
                            " follows the filter state of layer " +
                            sameAs +
                            ", but no layer with this name was found.\n\tDid you perhaps mean one of: " +
                            closeLayers.slice(0, 3).join(", ")
                    )
            }
        }

        return json
    }
}
export class PrepareTheme extends Fuse<LayoutConfigJson> {
    private state: DesugaringContext

    constructor(
        state: DesugaringContext,
        options?: {
            skipDefaultLayers: false | boolean
        }
    ) {
        super(
            "Fully prepares and expands a theme",

            new AddContextToTranslationsInLayout(),
            new PreparePersonalTheme(state),
            new WarnForUnsubstitutedLayersInTheme(),
            new On("layers", new Concat(new SubstituteLayer(state))),
            new SetDefault("socialImage", "assets/SocialImage.png", true),
            // We expand all tagrenderings first...
            new On("layers", new Each(new PrepareLayer(state))),
            // Then we apply the override all. We must first expand everything in case that we override something in an expanded tag
            // Note that it'll cheat with tagRenderings+
            new ApplyOverrideAll(),
            // And then we prepare all the layers _again_ in case that an override all contained unexpanded tagrenderings!
            new On("layers", new Each(new PrepareLayer(state))),
            options?.skipDefaultLayers
                ? new Pass("AddDefaultLayers is disabled due to the set flag")
                : new AddDefaultLayers(state),
            new AddDependencyLayersToTheme(state),
            new AddImportLayers(),
            new PostvalidateTheme(state)
        )
        this.state = state
    }

    convert(json: LayoutConfigJson, context: ConversionContext): LayoutConfigJson {
        const result = super.convert(json, context)
        if ((this.state.publicLayers?.size ?? 0) === 0) {
            // THis is a bootstrapping run, no need to already set this flag
            return result
        }

        const needsNodeDatabase = result.layers?.some((l: LayerConfigJson) =>
            l.tagRenderings?.some((tr) =>
                ValidationUtils.getSpecialVisualisations(<any>tr)?.some(
                    (special) => special.needsNodeDatabase
                )
            )
        )
        if (needsNodeDatabase) {
            context.info(
                "Setting 'enableNodeDatabase' as this theme uses a special visualisation which needs to keep track of _all_ nodes"
            )
            result.enableNodeDatabase = true
        }

        return result
    }
}
