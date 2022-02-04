import {Conversion, DesugaringContext, DesugaringStep, Fuse, OnEvery, OnEveryConcat, SetDefault} from "./Conversion";
import {LayoutConfigJson} from "../Json/LayoutConfigJson";
import {PrepareLayer} from "./PrepareLayer";
import {LayerConfigJson} from "../Json/LayerConfigJson";
import {Utils} from "../../../Utils";
import Constants from "../../Constants";
import {AllKnownLayouts} from "../../../Customizations/AllKnownLayouts";
import CreateNoteImportLayer from "./CreateNoteImportLayer";
import LayerConfig from "../LayerConfig";
import {TagRenderingConfigJson} from "../Json/TagRenderingConfigJson";
import {SubstitutedTranslation} from "../../../UI/SubstitutedTranslation";
import DependencyCalculator from "../DependencyCalculator";
import {ValidateThemeAndLayers} from "./Validation";

class SubstituteLayer extends Conversion<(string | LayerConfigJson), LayerConfigJson[]> {
    private readonly _state: DesugaringContext;
    constructor(
        state: DesugaringContext,
    ) {
        super("Converts the identifier of a builtin layer into the actual layer, or converts a 'builtin' syntax with override in the fully expanded form", []);
        this._state = state;
    }
    
    convert(json: string | LayerConfigJson, context: string): { result: LayerConfigJson[]; errors: string[] } {
        const errors = []
        const state= this._state
        function reportNotFound(name: string){
            const knownLayers = Array.from(state.sharedLayers.keys())
            const withDistance = knownLayers.map(lname => [lname,  Utils.levenshteinDistance(name, lname)])
            withDistance.sort((a, b) => a[1] - b[1])
            const ids = withDistance.map(n => n[0])
           // Known builtin layers are "+.join(",")+"\n    For more information, see "
            errors.push(`${context}: The layer with name ${name} was not found as a builtin layer. Perhaps you meant ${ids[0]}, ${ids[1]} or ${ids[2]}?
 For an overview of all available layers, refer to https://github.com/pietervdvn/MapComplete/blob/develop/Docs/BuiltinLayers.md`)
        }
        
        
        if (typeof json === "string") {
            const found = state.sharedLayers.get(json)
            if (found === undefined) {
                reportNotFound(json)
                return {
                    result: null,
                    errors,
                }
            }
            return {
                result: [found],
                errors
            }
        }

        if (json["builtin"] !== undefined) {
            let names = json["builtin"]
            if (typeof names === "string") {
                names = [names]
            }
            const layers = []
            for (const name of names) {
                const found = Utils.Clone(state.sharedLayers.get(name))
                if (found === undefined) {
                    reportNotFound(name)
                    continue
                }
                if (json["override"]["tagRenderings"] !== undefined && (found["tagRenderings"] ?? []).length > 0) {
                    errors.push(`At ${context}: when overriding a layer, an override is not allowed to override into tagRenderings. Use "+tagRenderings" or "tagRenderings+" instead to prepend or append some questions.`)
                }
                try {
                    Utils.Merge(json["override"], found);
                    layers.push(found)
                } catch (e) {
                    errors.push(`At ${context}: could not apply an override due to: ${e}.\nThe override is: ${JSON.stringify(json["override"],)}`)
                }
            }
            return {
                result: layers,
                errors
            }

        }

        return {
            result: [json],
            errors
        };
    }

}

class AddDefaultLayers extends DesugaringStep<LayoutConfigJson> {
    private _state: DesugaringContext;

    constructor(state: DesugaringContext) {
        super("Adds the default layers, namely: " + Constants.added_by_default.join(", "), ["layers"]);
        this._state = state;
    }

    convert(json: LayoutConfigJson, context: string): { result: LayoutConfigJson; errors: string[]; warnings: string[] } {
        const errors = []
        const warnings = []
        const state = this._state
        json.layers = [...json.layers]
        const alreadyLoaded = new Set(json.layers.map(l => l["id"]))

        if (json.id === "personal") {
            json.layers = []
            for (const publicLayer of AllKnownLayouts.AllPublicLayers()) {
                const id = publicLayer.id
                const config = state.sharedLayers.get(id)
                if (Constants.added_by_default.indexOf(id) >= 0) {
                    continue;
                }
                if (config === undefined) {
                    // This is a layer which is coded within a public theme, not as separate .json
                    continue
                }
                json.layers.push(config)
            }
            const publicIds = AllKnownLayouts.AllPublicLayers().map(l => l.id)
            publicIds.map(id => state.sharedLayers.get(id))
        }

        for (const layerName of Constants.added_by_default) {
            const v = state.sharedLayers.get(layerName)
            if (v === undefined) {
                errors.push("Default layer " + layerName + " not found")
            }
            if(alreadyLoaded.has(v.id)){
                warnings.push("Layout "+context+" already has a layer with name "+v.id+"; skipping inclusion of this builtin layer")
                continue
            }
            json.layers.push(v)
        }

        return {
            result: json,
            errors,
            warnings
        };
    }

}

class AddImportLayers extends DesugaringStep<LayoutConfigJson> {
    constructor() {
        super("For every layer in the 'layers'-list, create a new layer which'll import notes. (Note that priviliged layers and layers which have a geojson-source set are ignored)", ["layers"]);
    }

    convert(json: LayoutConfigJson, context: string): { result: LayoutConfigJson; errors: string[]; warnings: string[] } {
        const errors = []
        const warnings = []

        json = {...json}
        const allLayers: LayerConfigJson[] = <LayerConfigJson[]>json.layers;
        json.layers = [...json.layers]


        if(json.enableNoteImports ?? true) {
            const creator = new CreateNoteImportLayer()
            for (let i1 = 0; i1 < allLayers.length; i1++) {
                const layer = allLayers[i1];
                if (Constants.priviliged_layers.indexOf(layer.id) >= 0) {
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
                    continue;
                }

                try {

                    const importLayerResult = creator.convert(layer, context + ".(noteimportlayer)[" + i1 + "]")
                    errors.push(...importLayerResult.errors)
                    warnings.push(...importLayerResult.warnings)
                    if (importLayerResult.result !== undefined) {
                        json.layers.push(importLayerResult.result)
                    }
                } catch (e) {
                    errors.push("Could not generate an import-layer for " + layer.id + " due to " + e)
                }
            }
        }

        return {
            errors,
            warnings,
            result: json
        };
    }
}


export class AddMiniMap extends DesugaringStep<LayerConfigJson> {
    private readonly _state: DesugaringContext;
    constructor(state: DesugaringContext, ) {
        super("Adds a default 'minimap'-element to the tagrenderings if none of the elements define such a minimap", ["tagRenderings"]);
        this._state = state;
    }

    /**
     * Returns true if this tag rendering has a minimap in some language.
     * Note: this minimap can be hidden by conditions
     */
    static hasMinimap(renderingConfig: TagRenderingConfigJson): boolean {
        const translations: any[] = Utils.NoNull([renderingConfig.render, ...(renderingConfig.mappings ?? []).map(m => m.then)]);
        for (let translation of translations) {
            if (typeof translation == "string") {
                translation = {"*": translation}
            }

            for (const key in translation) {
                if (!translation.hasOwnProperty(key)) {
                    continue
                }
                const template = translation[key]
                const parts = SubstitutedTranslation.ExtractSpecialComponents(template)
                const hasMiniMap = parts.filter(part => part.special !== undefined).some(special => special.special.func.funcName === "minimap")
                if (hasMiniMap) {
                    return true;
                }
            }
        }
        return false;
    }

    convert(layerConfig: LayerConfigJson, context: string): { result: LayerConfigJson; errors: string[]; warnings: string[] } {

        const state = this._state;
        const hasMinimap = layerConfig.tagRenderings?.some(tr => AddMiniMap.hasMinimap(<TagRenderingConfigJson>tr)) ?? true
        if (!hasMinimap) {
            layerConfig = {...layerConfig}
            layerConfig.tagRenderings = [...layerConfig.tagRenderings]
            layerConfig.tagRenderings.push(state.tagRenderings.get("questions"))
            layerConfig.tagRenderings.push(state.tagRenderings.get("minimap"))
        }

        return {
            errors: [],
            warnings: [],
            result: layerConfig
        };
    }
}


class ApplyOverrideAll extends DesugaringStep<LayoutConfigJson> {

    constructor() {
        super("Applies 'overrideAll' onto every 'layer'. The 'overrideAll'-field is removed afterwards", ["overrideAll", "layers"]);
    }

    convert(json: LayoutConfigJson, context: string): { result: LayoutConfigJson; errors: string[]; warnings: string[] } {

        const overrideAll = json.overrideAll;
        if (overrideAll === undefined) {
            return {result: json, warnings: [], errors: []}
        }

        json = {...json}

        delete json.overrideAll
        const newLayers = []
        for (let layer of json.layers) {
            layer = {...<LayerConfigJson>layer}
            Utils.Merge(overrideAll, layer)
            newLayers.push(layer)
        }
        json.layers = newLayers


        return {result: json, warnings: [], errors: []};
    }

}

class AddDependencyLayersToTheme extends DesugaringStep<LayoutConfigJson> {
    private readonly _state: DesugaringContext;
    constructor(state: DesugaringContext, ) {
        super("If a layer has a dependency on another layer, these layers are added automatically on the theme. (For example: defibrillator depends on 'walls_and_buildings' to snap onto. This layer is added automatically)", ["layers"]);
        this._state = state;
    }

    private static CalculateDependencies(alreadyLoaded: LayerConfigJson[], allKnownLayers: Map<string, LayerConfigJson>, themeId: string): LayerConfigJson[] {
        const dependenciesToAdd: LayerConfigJson[] = []
        const loadedLayerIds: Set<string> = new Set<string>(alreadyLoaded.map(l => l.id));

        // Verify cross-dependencies
        let unmetDependencies: { neededLayer: string, neededBy: string, reason: string, context?: string }[] = []
        do {
            const dependencies: { neededLayer: string, reason: string, context?: string, neededBy: string }[] = []

            for (const layerConfig of alreadyLoaded) {
                const layerDeps = DependencyCalculator.getLayerDependencies(new LayerConfig(layerConfig))
                dependencies.push(...layerDeps)
            }

            // During the generate script, builtin layers are verified but not loaded - so we have to add them manually here
            // Their existance is checked elsewhere, so this is fine
            unmetDependencies = dependencies.filter(dep => !loadedLayerIds.has(dep.neededLayer))
            for (const unmetDependency of unmetDependencies) {
                if (loadedLayerIds.has(unmetDependency.neededLayer)) {
                    continue
                }
                const dep = allKnownLayers.get(unmetDependency.neededLayer)
                if (dep === undefined) {
                    const message =
                        ["Loading a dependency failed: layer " + unmetDependency.neededLayer + " is not found, neither as layer of " + themeId + " nor as builtin layer.",
                            "This layer is needed by " + unmetDependency.neededBy,
                            unmetDependency.reason + " (at " + unmetDependency.context + ")",
                            "Loaded layers are: " + alreadyLoaded.map(l => l.id).join(",")

                        ]
                    throw message.join("\n\t");
                }
                dependenciesToAdd.unshift(dep)
                loadedLayerIds.add(dep.id);
                unmetDependencies = unmetDependencies.filter(d => d.neededLayer !== unmetDependency.neededLayer)
            }

        } while (unmetDependencies.length > 0)

        return dependenciesToAdd;
    }

    convert(theme: LayoutConfigJson, context: string): { result: LayoutConfigJson; errors: string[]; warnings: string[] } {
        const state = this._state
        const allKnownLayers: Map<string, LayerConfigJson> = state.sharedLayers;
        const knownTagRenderings: Map<string, TagRenderingConfigJson> = state.tagRenderings;
        const errors = [];
        const warnings = [];
        const layers: LayerConfigJson[] = <LayerConfigJson[]>theme.layers; // Layers should be expanded at this point

        knownTagRenderings.forEach((value, key) => {
            value.id = key;
        })

        const dependencies = AddDependencyLayersToTheme.CalculateDependencies(layers, allKnownLayers, theme.id);
        if (dependencies.length > 0) {

            warnings.push(context + ": added " + dependencies.map(d => d.id).join(", ") + " to the theme as they are needed")
        }
        layers.unshift(...dependencies);

        return {
            result: {
                ...theme,
                layers: layers
            },
            errors,
            warnings
        };
    }
}


export class PrepareTheme extends Fuse<LayoutConfigJson> {
    constructor(state: DesugaringContext) {
        super(
            "Fully prepares and expands a theme",

            new OnEveryConcat("layers", new SubstituteLayer(state)),
            new SetDefault("socialImage", "assets/SocialImage.png", true),
            new OnEvery("layers", new PrepareLayer(state)),
            new ApplyOverrideAll(),
            new AddDefaultLayers(state),
            new AddDependencyLayersToTheme(state),
            new AddImportLayers(),
            new OnEvery("layers", new AddMiniMap(state))
        );
    }
}