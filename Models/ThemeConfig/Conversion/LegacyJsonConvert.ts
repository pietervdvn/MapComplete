import {LayoutConfigJson} from "../Json/LayoutConfigJson";
import LayerConfig from "../LayerConfig";
import {Translation} from "../../../UI/i18n/Translation";
import LayoutConfig from "../LayoutConfig";
import {Utils} from "../../../Utils";
import LineRenderingConfigJson from "../Json/LineRenderingConfigJson";
import {LayerConfigJson} from "../Json/LayerConfigJson";
import Constants from "../../Constants";
import {DesugaringContext, DesugaringStep, Fuse, OnEvery} from "./Conversion";
import {ApplyOverrideAll} from "./ApplyOverrideAll";


export class UpdateLegacyLayer extends DesugaringStep<LayerConfigJson | string | { builtin, override }> {

    constructor() {
        super("Updates various attributes from the old data format to the new to provide backwards compatibility with the formats",
            ["overpassTags", "source.osmtags", "tagRenderings[*].id", "mapRendering"]);
    }

    convert(state: {}, json: LayerConfigJson, context: string): { result: LayerConfigJson; errors: string[]; warnings: string[] } {
        const warnings = []
        if (typeof json === "string") {
            return json
        }
        if (json["builtin"] !== undefined) {
            // @ts-ignore
            return json;
        }
        let config: any = {...json};

        if (config["overpassTags"]) {
            config.source = config.source ?? {}
            config.source.osmTags = config["overpassTags"]
            delete config["overpassTags"]
        }

        if (config.tagRenderings !== undefined) {
            let i = 0;
            for (const tagRendering of config.tagRenderings) {
                i++;
                if (typeof tagRendering === "string" || tagRendering["builtin"] !== undefined) {
                    continue
                }
                if (tagRendering["id"] === undefined) {

                    if (tagRendering["#"] !== undefined) {
                        tagRendering["id"] = tagRendering["#"]
                        delete tagRendering["#"]
                    } else if (tagRendering["freeform"]?.key !== undefined) {
                        tagRendering["id"] = config.id + "-" + tagRendering["freeform"]["key"]
                    } else {
                        tagRendering["id"] = "tr-" + i
                    }
                }
            }
        }


        if (config.mapRendering === undefined) {
            config.mapRendering = []
            // This is a legacy format, lets create a pointRendering
            let location: ("point" | "centroid")[] = ["point"]
            let wayHandling: number = config["wayHandling"] ?? 0
            if (wayHandling !== 0) {
                location = ["point", "centroid"]
            }
            if (config["icon"] ?? config["label"] !== undefined) {

                const pointConfig = {
                    icon: config["icon"],
                    iconBadges: config["iconOverlays"],
                    label: config["label"],
                    iconSize: config["iconSize"],
                    location,
                    rotation: config["rotation"]
                }
                config.mapRendering.push(pointConfig)
            }

            if (wayHandling !== 1) {
                const lineRenderConfig = <LineRenderingConfigJson>{
                    color: config["color"],
                    width: config["width"],
                    dashArray: config["dashArray"]
                }
                if (Object.keys(lineRenderConfig).length > 0) {
                    config.mapRendering.push(lineRenderConfig)
                }
            }
            if (config.mapRendering.length === 0) {
                throw "Could not convert the legacy theme into a new theme: no renderings defined for layer " + config.id
            }

        }


        delete config["color"]
        delete config["width"]
        delete config["dashArray"]

        delete config["icon"]
        delete config["iconOverlays"]
        delete config["label"]
        delete config["iconSize"]
        delete config["rotation"]
        delete config["wayHandling"]
        delete config["hideUnderlayingFeaturesMinPercentage"]

        for (const mapRenderingElement of config.mapRendering) {
            if (mapRenderingElement["iconOverlays"] !== undefined) {
                mapRenderingElement["iconBadges"] = mapRenderingElement["iconOverlays"]
            }
            for (const overlay of mapRenderingElement["iconBadges"] ?? []) {
                if (overlay["badge"] !== true) {
                    warnings.push("Warning: non-overlay element for ", config.id)
                }
                delete overlay["badge"]
            }
        }

        return {
            result: config,
            errors: [],
            warnings
        };
    }

}

class UpdateLegacyTheme extends DesugaringStep<LayoutConfigJson> {
    constructor() {
        super("Small fixes in the theme config", ["roamingRenderings"]);
    }

    convert(state: DesugaringContext, json: LayoutConfigJson, context: string): { result: LayoutConfigJson; errors: string[]; warnings: string[] } {
        const oldThemeConfig = {...json}
        if (oldThemeConfig["roamingRenderings"] !== undefined) {

            if (oldThemeConfig["roamingRenderings"].length == 0) {
                delete oldThemeConfig["roamingRenderings"]
            } else {
                return {
                    result: null,
                    errors: [context + ": The theme contains roamingRenderings. These are not supported anymore"],
                    warnings: []
                }
            }
        }
        return {
            errors: [],
            warnings: [],
            result: oldThemeConfig
        }
    }
}

export class FixLegacyTheme extends Fuse<LayoutConfigJson> {
    constructor() {
        super(
            "Fixes a legacy theme to the modern JSON format geared to humans. Syntactic sugars are kept (i.e. no tagRenderings are expandend, no dependencies are automatically gathered)",
            new UpdateLegacyTheme(),
            new OnEvery("layers", new UpdateLegacyLayer())
        );
    }
}

export class ValidateLayer extends DesugaringStep<LayerConfigJson> {
    /**
     * The paths where this layer is originally saved. Triggers some extra checks
     * @private
     */
    private readonly _path?: string;
    private readonly knownImagePaths?: Set<string>;
    private readonly _isBuiltin: boolean;

    constructor(knownImagePaths: Set<string>, path: string, isBuiltin: boolean) {
        super("Doesn't change anything, but emits warnings and errors", []);
        this.knownImagePaths = knownImagePaths;
        this._path = path;
        this._isBuiltin = isBuiltin;
    }

    convert(state: DesugaringContext, json: LayerConfigJson, context: string): { result: LayerConfigJson; errors: string[]; warnings: string[] } {
        const errors = []
        const warnings = []

        if (typeof json === "string") {
            errors.push(context + ": This layer hasn't been expanded: " + json)
            return {
                result: null,
                warnings: [],
                errors
            }
        }

        if (json["builtin"] !== undefined) {
            errors.push(context + ": This layer hasn't been expanded: " + json)
            return {
                result: null,
                warnings: [],
                errors
            }
        }

        try {
            {
                // Some checks for legacy elements

                if (json["overpassTags"] !== undefined) {
                    errors.push("Layer " + json.id + "still uses the old 'overpassTags'-format. Please use \"source\": {\"osmTags\": <tags>}' instead of \"overpassTags\": <tags> (note: this isn't your fault, the custom theme generator still spits out the old format)")
                }
                const forbiddenTopLevel = ["icon", "wayHandling", "roamingRenderings", "roamingRendering", "label", "width", "color", "colour", "iconOverlays"]
                for (const forbiddenKey of forbiddenTopLevel) {
                    if (json[forbiddenKey] !== undefined)
                        errors.push(context + ": layer " + json.id + " still has a forbidden key " + forbiddenKey)
                }
                if (json["hideUnderlayingFeaturesMinPercentage"] !== undefined) {
                    errors.push(context + ": layer " + json.id + " contains an old 'hideUnderlayingFeaturesMinPercentage'")
                }
            }
            {
                const layer = new LayerConfig(json, "test", true)
                const images = Array.from(layer.ExtractImages())
                const remoteImages = images.filter(img => img.indexOf("http") == 0)
                for (const remoteImage of remoteImages) {
                    errors.push("Found a remote image: " + remoteImage + " in layer " + layer.id + ", please download it. You can use the fixTheme script to automate this")
                }
                for (const image of images) {
                    if (image.indexOf("{") >= 0) {
                        warnings.push("Ignoring image with { in the path: ", image)
                        continue
                    }

                    if (this.knownImagePaths !== undefined && !this.knownImagePaths.has(image)) {
                        const ctx = context === undefined ? "" : ` in a layer defined in the theme ${context}`
                        errors.push(`Image with path ${image} not found or not attributed; it is used in ${layer.id}${ctx}`)
                    }
                }

            }
            {
                // CHeck location
                const expected: string = `assets/layers/${json.id}/${json.id}.json`
                if (this._path != undefined && this._path.indexOf(expected) < 0) {
                    errors.push("Layer is in an incorrect place. The path is " + this._path + ", but expected " + expected)
                }
            }


            if (this._isBuiltin) {
                if (json.tagRenderings?.some(tr => tr["id"] === "")) {
                    const emptyIndexes: number[] = []
                    for (let i = 0; i < json.tagRenderings.length; i++) {
                        const tagRendering = json.tagRenderings[i];
                        if (tagRendering["id"] === "") {
                            emptyIndexes.push(i)
                        }
                    }
                    errors.push(`Some tagrendering-ids are empty or have an emtpy string; this is not allowed (at ${context}.tagRenderings.[${emptyIndexes.join(",")}])`)
                }

                const duplicateIds = Utils.Dupiclates((json.tagRenderings ?? [])?.map(f => f["id"]).filter(id => id !== "questions"))
                if (duplicateIds.length > 0 && !Utils.runningFromConsole) {
                    errors.push(`Some tagRenderings have a duplicate id: ${duplicateIds} (at ${context}.tagRenderings)`)
                }


                if (json.description === undefined) {

                    if (Constants.priviliged_layers.indexOf(json.id) >= 0) {
                        errors.push(
                            context + ": A priviliged layer must have a description"
                        )
                    } else {
                        warnings.push(
                            context + ": A builtin layer should have a description"
                        )
                    }
                }
            }
        } catch (e) {
            errors.push(e)
        }
        return {
            result: undefined,
            errors,
            warnings
        };
    }
}

class ValidateLanguageCompleteness extends DesugaringStep<any> {
    private readonly _languages: string[];

    constructor(...languages: string[]) {
        super("Checks that the given object is fully translated in the specified languages", []);
        this._languages = languages;
    }

    convert(state: DesugaringContext, obj: any, context: string): { result: LayerConfig; errors: string[]; warnings: string[] } {
        const errors = []
        const translations = Translation.ExtractAllTranslationsFrom(
            obj
        )
        for (const neededLanguage of this._languages) {
            translations
                .filter(t => t.tr.translations[neededLanguage] === undefined && t.tr.translations["*"] === undefined)
                .forEach(missing => {
                    errors.push(context + "A theme should be translation-complete for " + neededLanguage + ", but it lacks a translation for " + missing.context + ".\n\tThe english translation is " + missing.tr.textFor('en'))
                })
        }

        return {
            result: obj,
            warnings: [], errors
        };
    }
}

class ValidateTheme extends DesugaringStep<LayoutConfigJson> {
    /**
     * The paths where this layer is originally saved. Triggers some extra checks
     * @private
     */
    private readonly _path?: string;
    private readonly knownImagePaths: Set<string>;
    private readonly _isBuiltin: boolean;

    constructor(knownImagePaths: Set<string>, path: string, isBuiltin: boolean) {
        super("Doesn't change anything, but emits warnings and errors", []);
        this.knownImagePaths = knownImagePaths;
        this._path = path;
        this._isBuiltin = isBuiltin;
    }

    convert(state: DesugaringContext, json: LayoutConfigJson, context: string): { result: LayoutConfigJson; errors: string[]; warnings: string[] } {
        const errors = []
        const warnings = []
        {
            // Legacy format checks  
            if (this._isBuiltin) {
                if (typeof json.language === "string") {
                    errors.push("The theme " + json.id + " has a string as language. Please use a list of strings")
                }
                if (json["units"] !== undefined) {
                    errors.push("The theme " + json.id + " has units defined - these should be defined on the layer instead. (Hint: use overrideAll: { '+units': ... }) ")
                }
                if (json["roamingRenderings"] !== undefined) {
                    errors.push("Theme " + json.id + " contains an old 'roamingRenderings'. Use an 'overrideAll' instead")
                }
            }
        }

        try {
            const theme = new LayoutConfig(json, true, "test")
            if (theme.id !== theme.id.toLowerCase()) {
                errors.push("Theme ids should be in lowercase, but it is " + theme.id)
            }

            const filename = this._path.substring(this._path.lastIndexOf("/") + 1, this._path.length - 5)
            if (theme.id !== filename) {
                errors.push("Theme ids should be the same as the name.json, but we got id: " + theme.id + " and filename " + filename + " (" + this._path + ")")
            }
            if (!this.knownImagePaths.has(theme.icon)) {
                errors.push("The theme image " + theme.icon + " is not attributed or not saved locally")
            }
            const dups = Utils.Dupiclates(json.layers.map(layer => layer["id"]))
            if (dups.length > 0) {
                errors.push(`The theme ${json.id} defines multiple layers with id ${dups.join(", ")}`)
            }
            if (json["mustHaveLanguage"] !== undefined) {
                const checked = new ValidateLanguageCompleteness(...json["mustHaveLanguage"])
                    .convert(state, theme, theme.id)
                errors.push(...checked.errors)
                warnings.push(...checked.warnings)
            }

        } catch (e) {
            errors.push(e)
        }

        return {
            result: json,
            errors,
            warnings
        };
    }
}

export class ValidateThemeAndLayers extends Fuse<LayoutConfigJson> {
    constructor(knownImagePaths: Set<string>, path: string, isBuiltin: boolean) {
        super("Validates a theme and the contained layers",
            new ValidateTheme(knownImagePaths, path, isBuiltin),
            new OnEvery("layers", new ValidateLayer(knownImagePaths, undefined, false))
        );
    }
}

<<<<<<< HEAD
=======
class AddDependencyLayersToTheme extends DesugaringStep<LayoutConfigJson> {
    constructor() {
        super("If a layer has a dependency on another layer, these layers are added automatically on the theme. (For example: defibrillator depends on 'walls_and_buildings' to snap onto. This layer is added automatically)", ["layers"]);
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

    convert(state: DesugaringContext, theme: LayoutConfigJson, context: string): { result: LayoutConfigJson; errors: string[]; warnings: string[] } {
        const allKnownLayers: Map<string, LayerConfigJson> = state.sharedLayers;
        const knownTagRenderings: Map<string, TagRenderingConfigJson> = state.tagRenderings;
        const errors = [];
        const warnings = [];
        const layers: LayerConfigJson[] = <LayerConfigJson[]> theme.layers; // Layers should be expanded at this point
        
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

class SetDefault<T> extends DesugaringStep<T> {
    private readonly value: any;
    private readonly key: string;
    private readonly _overrideEmptyString: boolean;

    constructor(key: string, value: any, overrideEmptyString = false) {
        super("Sets " + key + " to a default value if undefined");
        this.key = key;
        this.value = value;
        this._overrideEmptyString = overrideEmptyString;
    }

    convert(state: DesugaringContext, json: T, context: string): { result: T; errors: string[]; warnings: string[] } {
        if (json[this.key] === undefined || (json[this.key] === "" && this._overrideEmptyString)) {
            json = {...json}
            json[this.key] = this.value
        }

        return {
            errors: [], warnings: [],
            result: json
        };
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

class SubstituteLayer extends Conversion<(string | LayerConfigJson), LayerConfigJson[]> {
    constructor() {
        super("Converts the identifier of a builtin layer into the actual layer, or converts a 'builtin' syntax with override in the fully expanded form", []);
    }

    convert(state: DesugaringContext, json: string | LayerConfigJson, context: string): { result: LayerConfigJson[]; errors: string[]; warnings: string[] } {
        const errors = []
        const warnings = []
        if (typeof json === "string") {
            const found = state.sharedLayers.get(json)
            if (found === undefined) {
                return {
                    result: null,
                    errors: [context + ": The layer with name " + json + " was not found as a builtin layer"],
                    warnings
                }
            }
            return {
                result: [found],
                errors, warnings
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
                    errors.push(context + ": The layer with name " + json + " was not found as a builtin layer")
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
                errors, warnings
            }

        }

        return {
            result: [json],
            errors, warnings
        };
    }

}

class AddDefaultLayers extends DesugaringStep<LayoutConfigJson> {

    constructor() {
        super("Adds the default layers, namely: " + Constants.added_by_default.join(", "), ["layers"]);
    }

    convert(state: DesugaringContext, json: LayoutConfigJson, context: string): { result: LayoutConfigJson; errors: string[]; warnings: string[] } {
        const errors = []
        const warnings = []
        json.layers = [...json.layers]

        if (json.id === "personal") {
            json.layers = []
            for (const publicLayer of AllKnownLayouts.AllPublicLayers()) {
                const id = publicLayer.id
                const config = state.sharedLayers.get(id)
                if(Constants.added_by_default.indexOf(id) >= 0){
                    continue;
                }
                if(config === undefined){
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
            json.layers.push(v)
        }
        
        return {
            result: json,
            errors,
            warnings
        };
    }

}

export class PrepareTheme extends Fuse<LayoutConfigJson> {
    constructor() {
        super(
            "Fully prepares and expands a theme",
            new OnEveryConcat("layers", new SubstituteLayer()),
            new SetDefault("socialImage", "assets/SocialImage.png", true),
            new OnEvery("layers", new PrepareLayer()),
            new ApplyOverrideAll(),
            new AddDefaultLayers(),
            
            new AddDependencyLayersToTheme(),
            new OnEvery("layers", new AddMiniMap())
        );
    }
}
>>>>>>> master
