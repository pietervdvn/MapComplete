import {DesugaringStep, Fuse, OnEvery} from "./Conversion";
import {LayerConfigJson} from "../Json/LayerConfigJson";
import LayerConfig from "../LayerConfig";
import {Utils} from "../../../Utils";
import Constants from "../../Constants";
import {Translation} from "../../../UI/i18n/Translation";
import {LayoutConfigJson} from "../Json/LayoutConfigJson";
import LayoutConfig from "../LayoutConfig";
import {TagRenderingConfigJson} from "../Json/TagRenderingConfigJson";
import {TagUtils} from "../../../Logic/Tags/TagUtils";
import {ExtractImages} from "./FixImages";
import ScriptUtils from "../../../scripts/ScriptUtils";
import {And} from "../../../Logic/Tags/And";
import Translations from "../../../UI/i18n/Translations";
import Svg from "../../../Svg";
import {QuestionableTagRenderingConfigJson} from "../Json/QuestionableTagRenderingConfigJson";


class ValidateLanguageCompleteness extends DesugaringStep<any> {
    private readonly _languages: string[];

    constructor(...languages: string[]) {
        super("Checks that the given object is fully translated in the specified languages", [], "ValidateLanguageCompleteness");
        this._languages = languages;
    }

    convert(obj: any, context: string): { result: LayerConfig; errors: string[] } {
        const errors = []
        const translations = Translation.ExtractAllTranslationsFrom(
            obj
        )
        for (const neededLanguage of this._languages ?? ["en"]) {
            translations
                .filter(t => t.tr.translations[neededLanguage] === undefined && t.tr.translations["*"] === undefined)
                .forEach(missing => {
                    errors.push(context + "A theme should be translation-complete for " + neededLanguage + ", but it lacks a translation for " + missing.context + ".\n\tThe known translation is " + missing.tr.textFor('en'))
                })
        }

        return {
            result: obj,
            errors
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
    private _sharedTagRenderings: Map<string, any>;

    constructor(knownImagePaths: Set<string>, path: string, isBuiltin: boolean, sharedTagRenderings: Map<string, any>) {
        super("Doesn't change anything, but emits warnings and errors", [], "ValidateTheme");
        this.knownImagePaths = knownImagePaths;
        this._path = path;
        this._isBuiltin = isBuiltin;
        this._sharedTagRenderings = sharedTagRenderings;
    }

    convert(json: LayoutConfigJson, context: string): { result: LayoutConfigJson; errors: string[], warnings: string[], information: string[] } {
        const errors = []
        const warnings = []
        const information = []

        const theme = new LayoutConfig(json, true, "test")

        {
            // Legacy format checks  
            if (this._isBuiltin) {
                if (json["units"] !== undefined) {
                    errors.push("The theme " + json.id + " has units defined - these should be defined on the layer instead. (Hint: use overrideAll: { '+units': ... }) ")
                }
                if (json["roamingRenderings"] !== undefined) {
                    errors.push("Theme " + json.id + " contains an old 'roamingRenderings'. Use an 'overrideAll' instead")
                }
            }
        }
        {
            // Check images: are they local, are the licenses there, is the theme icon square, ...
            const images = new ExtractImages(this._isBuiltin, this._sharedTagRenderings).convertStrict(json, "validation")
            const remoteImages = images.filter(img => img.indexOf("http") == 0)
            for (const remoteImage of remoteImages) {
                errors.push("Found a remote image: " + remoteImage + " in theme " + json.id + ", please download it.")
            }
            for (const image of images) {
                if (image.indexOf("{") >= 0) {
                    information.push("Ignoring image with { in the path: " + image)
                    continue
                }

                if (image === "assets/SocialImage.png") {
                    continue
                }
                if (image.match(/[a-z]*/)) {
                    
                    if(Svg.All[image + ".svg"] !== undefined){
                        // This is a builtin img, e.g. 'checkmark' or 'crosshair'
                        continue;
                    }
                }

                if (this.knownImagePaths !== undefined && !this.knownImagePaths.has(image)) {
                    const ctx = context === undefined ? "" : ` in a layer defined in the theme ${context}`
                    errors.push(`Image with path ${image} not found or not attributed; it is used in ${json.id}${ctx}`)
                }
            }

            if (json.icon.endsWith(".svg")) {
                try {
                    ScriptUtils.ReadSvgSync(json.icon, svg => {
                        const width: string = svg.$.width;
                        const height: string = svg.$.height;
                        if (width !== height) {
                            const e = `the icon for theme ${json.id} is not square. Please square the icon at ${json.icon}` +
                                ` Width = ${width} height = ${height}`;
                            (json.hideFromOverview ? warnings : errors).push(e)
                        }
                    })
                } catch (e) {
                    console.error("Could not read " + json.icon + " due to " + e)
                }
            }

        }

        try {
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
                    .convert(theme, theme.id)
                errors.push(...checked.errors)
            }
            if (!json.hideFromOverview && theme.id !== "personal") {
                // Official, public themes must have a full english translation
                const checked = new ValidateLanguageCompleteness("en")
                    .convert(theme, theme.id)
                errors.push(...checked.errors)
            }

        } catch (e) {
            errors.push(e)
        }

        return {
            result: json,
            errors,
            warnings,
            information
        };
    }
}

export class ValidateThemeAndLayers extends Fuse<LayoutConfigJson> {
    constructor(knownImagePaths: Set<string>, path: string, isBuiltin: boolean, sharedTagRenderings: Map<string, any>) {
        super("Validates a theme and the contained layers",
            new ValidateTheme(knownImagePaths, path, isBuiltin, sharedTagRenderings),
            new OnEvery("layers", new ValidateLayer(undefined, false))
        );
    }
}


class OverrideShadowingCheck extends DesugaringStep<LayoutConfigJson> {

    constructor() {
        super("Checks that an 'overrideAll' does not override a single override", [], "OverrideShadowingCheck");
    }

    convert(json: LayoutConfigJson, context: string): { result: LayoutConfigJson; errors?: string[]; warnings?: string[] } {

        const overrideAll = json.overrideAll;
        if (overrideAll === undefined) {
            return {result: json}
        }

        const errors = []
        const withOverride = json.layers.filter(l => l["override"] !== undefined)

        for (const layer of withOverride) {
            for (const key in overrideAll) {
                if (layer["override"][key] !== undefined || layer["override"]["=" + key] !== undefined) {
                    const w = "The override of layer " + JSON.stringify(layer["builtin"]) + " has a shadowed property: " + key + " is overriden by overrideAll of the theme";
                    errors.push(w)
                }
            }
        }

        return {result: json, errors}
    }

}

class MiscThemeChecks extends DesugaringStep<LayoutConfigJson>{
    constructor() {
        super("Miscelleanous checks on the theme", [],"MiscThemesChecks");
    }
    
    convert(json: LayoutConfigJson, context: string): { result: LayoutConfigJson; errors?: string[]; warnings?: string[]; information?: string[] } {
        const warnings = []
        if(json.socialImage === ""){
            warnings.push("Social image for theme "+json.id+" is the emtpy string")
        }
        return {
            result :json,
            warnings
        };
    }
}

export class PrevalidateTheme extends Fuse<LayoutConfigJson> {

    constructor() {
        super("Various consistency checks on the raw JSON",
            new OverrideShadowingCheck(),
            new MiscThemeChecks()
        );

    }

}

export class DetectShadowedMappings extends DesugaringStep<QuestionableTagRenderingConfigJson> {
    constructor() {
        super("Checks that the mappings don't shadow each other", [], "DetectShadowedMappings");
    }

    convert(json: QuestionableTagRenderingConfigJson, context: string): { result: QuestionableTagRenderingConfigJson; errors?: string[]; warnings?: string[] } {
        const errors = []
        const warnings = []
        if (json.mappings === undefined || json.mappings.length === 0) {
            return {result: json}
        }
        const parsedConditions = json.mappings.map(m => {
            const ifTags = TagUtils.Tag(m.if);
            if(m.hideInAnswer !== undefined && m.hideInAnswer !== false && m.hideInAnswer !== true){
                let conditionTags = TagUtils.Tag( m.hideInAnswer)
                // Merge the condition too!
                return new And([conditionTags, ifTags])
            }
            return ifTags
        })
        for (let i = 0; i < json.mappings.length; i++) {
            if(!parsedConditions[i].isUsableAsAnswer()){
                // There is no straightforward way to convert this mapping.if into a properties-object, so we simply skip this one
                // Yes, it might be shadowed, but running this check is to difficult right now
                continue
            }
            const keyValues = parsedConditions[i].asChange({});
            const properties = {}
            keyValues.forEach(({k, v}) => {
                properties[k] = v
            })
            for (let j = 0; j < i; j++) {
                const doesMatch = parsedConditions[j].matchesProperties(properties)
                if (doesMatch) {
                    // The current mapping is shadowed!
                    errors.push(`At ${context}: Mapping ${i} is shadowed by mapping ${j} and will thus never be shown:
    The mapping ${parsedConditions[i].asHumanString(false, false, {})} is fully matched by a previous mapping (namely ${j}), which matches:
    ${parsedConditions[j].asHumanString(false, false, {})}.
    
    Move the mapping up to fix this problem
`)
                }
            }

        }

        // TODO make this errors again
        warnings.push(...errors)
        errors.splice(0, errors.length)

        return {
            errors,
            warnings,
            result: json
        };
    }
}

export class DetectMappingsWithImages extends DesugaringStep<TagRenderingConfigJson> {
    constructor() {
        super("Checks that 'then'clauses in mappings don't have images, but use 'icon' instead", [], "DetectMappingsWithImages");
    }

    convert(json: TagRenderingConfigJson, context: string): { result: TagRenderingConfigJson; errors?: string[]; warnings?: string[], information?: string[] } {
        const errors = []
        const warnings = []
        const information = []
        if (json.mappings === undefined || json.mappings.length === 0) {
            return {result: json}
        }
        const ignoreToken = "ignore-image-in-then"
        for (let i = 0; i < json.mappings.length; i++) {

            const mapping = json.mappings[i]
            const ignore = mapping["#"]?.indexOf(ignoreToken) >=0
            const images = Utils.Dedup(Translations.T(mapping.then).ExtractImages())
            const ctx = `${context}.mappings[${i}]`
            if (images.length > 0) {
                if(!ignore){
                    errors.push(`${ctx}: A mapping has an image in the 'then'-clause. Remove the image there and use \`"icon": <your-image>\` instead. The images found are ${images.join(", ")}. (This check can be turned of by adding "#": "${ignoreToken}" in the mapping, but this is discouraged`)
                }else{
                    information.push(`${ctx}: Ignored image ${images.join(", ")} in 'then'-clause of a mapping as this check has been disabled`)
                }
            }else if (ignore){
                warnings.push(`${ctx}: unused '${ignoreToken}' - please remove this`)
            }
        }

         return {
            errors,
            warnings,
            information,
            result: json
        };
    }
}

export class ValidateTagRenderings extends Fuse<TagRenderingConfigJson> {
    constructor() {
        super("Various validation on tagRenderingConfigs",
            new DetectShadowedMappings(),
            new DetectMappingsWithImages()    
        );
    }
}

export class ValidateLayer extends DesugaringStep<LayerConfigJson> {
    /**
     * The paths where this layer is originally saved. Triggers some extra checks
     * @private
     */
    private readonly _path?: string;
    private readonly _isBuiltin: boolean;

    constructor(path: string, isBuiltin: boolean) {
        super("Doesn't change anything, but emits warnings and errors", [], "ValidateLayer");
        this._path = path;
        this._isBuiltin = isBuiltin;
    }

    convert(json: LayerConfigJson, context: string): { result: LayerConfigJson; errors: string[]; warnings?: string[], information?: string[] } {
        const errors = []
        const warnings = []
        const information = []
        if (typeof json === "string") {
            errors.push(context + ": This layer hasn't been expanded: " + json)
            return {
                result: null,
                errors
            }
        }

        if (json["builtin"] !== undefined) {
            errors.push(context + ": This layer hasn't been expanded: " + json)
            return {
                result: null,
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
                // CHeck location of layer file
                const expected: string = `assets/layers/${json.id}/${json.id}.json`
                if (this._path != undefined && this._path.indexOf(expected) < 0) {
                    errors.push("Layer is in an incorrect place. The path is " + this._path + ", but expected " + expected)
                }
            }
            if (this._isBuiltin) {
                // Check for correct IDs
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
            if (json.tagRenderings !== undefined) {
               const r = new OnEvery("tagRenderings", new ValidateTagRenderings()).convert(json, context)
                warnings.push(...(r.warnings??[]))
                errors.push(...(r.errors??[]))
                information.push(...(r.information??[]))
            }

            if (json.presets !== undefined) {

                // Check that a preset will be picked up by the layer itself
                const baseTags = TagUtils.Tag(json.source.osmTags)
                for (let i = 0; i < json.presets.length; i++) {
                    const preset = json.presets[i];
                    const tags: { k: string, v: string }[] = new And(preset.tags.map(t => TagUtils.Tag(t))).asChange({id: "node/-1"})
                    const properties = {}
                    for (const tag of tags) {
                        properties[tag.k] = tag.v
                    }
                    const doMatch = baseTags.matchesProperties(properties)
                    if (!doMatch) {
                        errors.push(context + ".presets[" + i + "]: This preset does not match the required tags of this layer. This implies that a newly added point will not show up.\n    A newly created point will have properties: " + JSON.stringify(properties) + "\n    The required tags are: " + baseTags.asHumanString(false, false, {}))
                    }
                }
            }

        } catch (e) {
            errors.push(e)
        }


        return {
            result: json,
            errors,
            warnings,
            information
        };
    }
}