import {LayoutConfigJson} from "../Json/LayoutConfigJson";
import DependencyCalculator from "../DependencyCalculator";
import LayerConfig from "../LayerConfig";
import {Translation} from "../../../UI/i18n/Translation";
import LayoutConfig from "../LayoutConfig";
import {Utils} from "../../../Utils";
import {TagRenderingConfigJson} from "../Json/TagRenderingConfigJson";
import LineRenderingConfigJson from "../Json/LineRenderingConfigJson";
import {LayerConfigJson} from "../Json/LayerConfigJson";
import Constants from "../../Constants";
import {AllKnownLayouts} from "../../../Customizations/AllKnownLayouts";

export interface DesugaringContext {
    tagRenderings: Map<string, TagRenderingConfigJson>
    sharedLayers: Map<string, LayerConfigJson>
}

export abstract class Conversion<TIn, TOut> {
    public readonly modifiedAttributes: string[];
    protected readonly doc: string;

    constructor(doc: string, modifiedAttributes: string[] = []) {
        this.modifiedAttributes = modifiedAttributes;
        this.doc = doc + "\n\nModified attributes are\n" + modifiedAttributes.join(", ");
    }

    public static strict<T>(fixed: { errors: string[], warnings: string[], result?: T }): T {
        if (fixed?.errors?.length > 0) {
            throw fixed.errors.join("\n");
        }
        fixed.warnings?.forEach(w => console.warn(w))
        return fixed.result;
    }

    public convertStrict(state: DesugaringContext, json: TIn, context: string): TOut {
        const fixed = this.convert(state, json, context)
        return DesugaringStep.strict(fixed)
    }

    abstract convert(state: DesugaringContext, json: TIn, context: string): { result: TOut, errors: string[], warnings: string[] }

    public convertAll(state: DesugaringContext, jsons: TIn[], context: string): { result: TOut[], errors: string[], warnings: string[] } {
        const result = []
        const errors = []
        const warnings = []
        for (let i = 0; i < jsons.length; i++) {
            const json = jsons[i];
            const r = this.convert(state, json, context + "[" + i + "]")
            result.push(r.result)
            errors.push(...r.errors)
            warnings.push(...r.warnings)
        }
        return {
            result,
            errors,
            warnings
        }
    }

}

export abstract class DesugaringStep<T> extends Conversion<T, T> {
}

class OnEvery<X, T> extends DesugaringStep<T> {
    private readonly key: string;
    private readonly step: DesugaringStep<X>;

    constructor(key: string, step: DesugaringStep<X>) {
        super("Applies " + step.constructor.name + " onto every object of the list `key`", [key]);
        this.step = step;
        this.key = key;
    }

    convert(state: DesugaringContext, json: T, context: string): { result: T; errors: string[]; warnings: string[] } {
        json = {...json}
        const step = this.step
        const key = this.key;
        const r = step.convertAll(state, (<X[]>json[key]), context + "." + key)
        json[key] = r.result
        return {
            result: json,
            errors: r.errors,
            warnings: r.warnings
        };
    }
}

class OnEveryConcat<X, T> extends DesugaringStep<T> {
    private readonly key: string;
    private readonly step: Conversion<X, X[]>;

    constructor(key: string, step: Conversion<X, X[]>) {
        super(`Applies ${step.constructor.name} onto every object of the list \`${key}\``, [key]);
        this.step = step;
        this.key = key;
    }

    convert(state: DesugaringContext, json: T, context: string): { result: T; errors: string[]; warnings: string[] } {
        json = {...json}
        const step = this.step
        const key = this.key;
        const values = json[key]
        if (values === undefined) {
            // Move on - nothing to see here!
            return {
                result: json,
                errors: [],
                warnings: []
            }
        }
        const r = step.convertAll(state, (<X[]>values), context + "." + key)
        const vals: X[][] = r.result
        json[key] = [].concat(...vals)
        return {
            result: json,
            errors: r.errors,
            warnings: r.warnings
        };

    }
}

class Fuse<T> extends DesugaringStep<T> {
    private readonly steps: DesugaringStep<T>[];

    constructor(doc: string, ...steps: DesugaringStep<T>[]) {
        super((doc ?? "") + "This fused pipeline of the following steps: " + steps.map(s => s.constructor.name).join(", "),
            Utils.Dedup([].concat(...steps.map(step => step.modifiedAttributes)))
        );
        this.steps = steps;
    }

    convert(state: DesugaringContext, json: T, context: string): { result: T; errors: string[]; warnings: string[] } {
        const errors = []
        const warnings = []
        for (let i = 0; i < this.steps.length; i++) {
            const step = this.steps[i];
            let r = step.convert(state, json, context + "(fusion " + this.constructor.name + "." + i + ")")
            errors.push(...r.errors)
            warnings.push(...r.warnings)
            json = r.result
            if (errors.length > 0) {
                break;
            }
        }
        return {
            result: json,
            errors,
            warnings
        };
    }

}

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
                if (key === "builtin" || key === "override" || key === "id") {
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

class SetDefault extends DesugaringStep<LayerConfigJson> {
    private readonly value: object;
    private readonly key: string;

    constructor(key: string, value: object) {
        super("Sets " + key + " to a default value if undefined");
        this.key = key;
        this.value = value;
    }

    convert(state: DesugaringContext, json: LayerConfigJson, context: string): { result: LayerConfigJson; errors: string[]; warnings: string[] } {
        if (json[this.key] === undefined) {
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
        json.layers = [...json.layers]

        if (json.id === "personal") {
            const publicIds = AllKnownLayouts.AllPublicLayers().map(l => l.id)
            json.layers = publicIds.map(id => state.sharedLayers.get(id))
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
            warnings: []
        };
    }

}

export class PrepareTheme extends Fuse<LayoutConfigJson> {
    constructor() {
        super(
            "Fully prepares and expands a theme",
            new OnEveryConcat("layers", new SubstituteLayer()),
            new AddDefaultLayers(),
            new AddDependencyLayersToTheme(),
            new OnEvery("layers", new PrepareLayer()),
        );
    }
}