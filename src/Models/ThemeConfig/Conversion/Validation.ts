import { Bypass, Conversion, DesugaringStep, Each, Fuse, On } from "./Conversion"
import { LayerConfigJson } from "../Json/LayerConfigJson"
import LayerConfig from "../LayerConfig"
import { Utils } from "../../../Utils"
import Constants from "../../Constants"
import { Translation } from "../../../UI/i18n/Translation"
import { LayoutConfigJson } from "../Json/LayoutConfigJson"
import LayoutConfig from "../LayoutConfig"
import { TagRenderingConfigJson } from "../Json/TagRenderingConfigJson"
import { TagUtils } from "../../../Logic/Tags/TagUtils"
import { ExtractImages } from "./FixImages"
import { And } from "../../../Logic/Tags/And"
import Translations from "../../../UI/i18n/Translations"
import FilterConfigJson from "../Json/FilterConfigJson"
import DeleteConfig from "../DeleteConfig"
import {
    MappingConfigJson,
    QuestionableTagRenderingConfigJson,
} from "../Json/QuestionableTagRenderingConfigJson"
import Validators from "../../../UI/InputElement/Validators"
import TagRenderingConfig from "../TagRenderingConfig"
import { parse as parse_html } from "node-html-parser"
import PresetConfig from "../PresetConfig"
import { TagsFilter } from "../../../Logic/Tags/TagsFilter"
import { Translatable } from "../Json/Translatable"
import { ConversionContext } from "./ConversionContext"
import { AvailableRasterLayers } from "../../RasterLayers"
import PointRenderingConfigJson from "../Json/PointRenderingConfigJson"

class ValidateLanguageCompleteness extends DesugaringStep<LayoutConfig> {
    private readonly _languages: string[]

    constructor(...languages: string[]) {
        super(
            "Checks that the given object is fully translated in the specified languages",
            [],
            "ValidateLanguageCompleteness"
        )
        this._languages = languages ?? ["en"]
    }

    convert(obj: LayoutConfig, context: ConversionContext): LayoutConfig {
        const origLayers = obj.layers
        obj.layers = [...obj.layers].filter((l) => l["id"] !== "favourite")
        const translations = Translation.ExtractAllTranslationsFrom(obj)
        for (const neededLanguage of this._languages) {
            translations
                .filter(
                    (t) =>
                        t.tr.translations[neededLanguage] === undefined &&
                        t.tr.translations["*"] === undefined
                )
                .forEach((missing) => {
                    context
                        .enter(missing.context.split("."))
                        .err(
                            `The theme ${obj.id} should be translation-complete for ` +
                                neededLanguage +
                                ", but it lacks a translation for " +
                                missing.context +
                                ".\n\tThe known translation is " +
                                missing.tr.textFor("en")
                        )
                })
        }
        obj.layers = origLayers
        return obj
    }
}

export class DoesImageExist extends DesugaringStep<string> {
    private readonly _knownImagePaths: Set<string>
    private readonly _ignore?: Set<string>
    private readonly doesPathExist: (path: string) => boolean = undefined

    constructor(
        knownImagePaths: Set<string>,
        checkExistsSync: (path: string) => boolean = undefined,
        ignore?: Set<string>
    ) {
        super("Checks if an image exists", [], "DoesImageExist")
        this._ignore = ignore
        this._knownImagePaths = knownImagePaths
        this.doesPathExist = checkExistsSync
    }

    convert(image: string, context: ConversionContext): string {
        if (this._ignore?.has(image)) {
            return image
        }

        if (image.indexOf("{") >= 0) {
            context.debug("Ignoring image with { in the path: " + image)
            return image
        }

        if (image === "assets/SocialImage.png") {
            return image
        }
        if (image.match(/[a-z]*/)) {
            if (Constants.defaultPinIcons.indexOf(image) >= 0) {
                // This is a builtin img, e.g. 'checkmark' or 'crosshair'
                return image
            }
        }

        if (image.startsWith("<") && image.endsWith(">")) {
            // This is probably HTML, you're on your own here
            return image
        }

        if (!this._knownImagePaths.has(image)) {
            if (this.doesPathExist === undefined) {
                context.err(
                    `Image with path ${image} not found or not attributed; it is used in ${context}`
                )
            } else if (!this.doesPathExist(image)) {
                context.err(
                    `Image with path ${image} does not exist.\n     Check for typo's and missing directories in the path.`
                )
            } else {
                context.err(
                    `Image with path ${image} is not attributed (but it exists); execute 'npm run query:licenses' to add the license information and/or run 'npm run generate:licenses' to compile all the license info`
                )
            }
        }
        return image
    }
}

export class ValidateTheme extends DesugaringStep<LayoutConfigJson> {
    private static readonly _availableLayers = AvailableRasterLayers.allIds()
    /**
     * The paths where this layer is originally saved. Triggers some extra checks
     * @private
     */
    private readonly _path?: string
    private readonly _isBuiltin: boolean
    //private readonly _sharedTagRenderings: Map<string, any>
    private readonly _validateImage: DesugaringStep<string>
    private readonly _extractImages: ExtractImages = undefined

    constructor(
        doesImageExist: DoesImageExist,
        path: string,
        isBuiltin: boolean,
        sharedTagRenderings?: Set<string>
    ) {
        super("Doesn't change anything, but emits warnings and errors", [], "ValidateTheme")
        this._validateImage = doesImageExist
        this._path = path
        this._isBuiltin = isBuiltin
        if (sharedTagRenderings) {
            this._extractImages = new ExtractImages(this._isBuiltin, sharedTagRenderings)
        }
    }

    convert(json: LayoutConfigJson, context: ConversionContext): LayoutConfigJson {
        const theme = new LayoutConfig(json, this._isBuiltin)
        {
            // Legacy format checks
            if (this._isBuiltin) {
                if (json["units"] !== undefined) {
                    context.err(
                        "The theme " +
                            json.id +
                            " has units defined - these should be defined on the layer instead. (Hint: use overrideAll: { '+units': ... }) "
                    )
                }
                if (json["roamingRenderings"] !== undefined) {
                    context.err(
                        "Theme " +
                            json.id +
                            " contains an old 'roamingRenderings'. Use an 'overrideAll' instead"
                    )
                }
            }
        }
        if (!json.title) {
            context.enter("title").err(`The theme ${json.id} does not have a title defined.`)
        }
        if (!json.icon) {
            context.enter("icon").err("A theme should have an icon")
        }
        if (this._isBuiltin && this._extractImages !== undefined) {
            // Check images: are they local, are the licenses there, is the theme icon square, ...
            const images = this._extractImages.convert(json, context.inOperation("ValidateTheme"))
            const remoteImages = images.filter((img) => img.path.indexOf("http") == 0)
            for (const remoteImage of remoteImages) {
                context.err(
                    "Found a remote image: " +
                        remoteImage.path +
                        " in theme " +
                        json.id +
                        ", please download it."
                )
            }
            for (const image of images) {
                this._validateImage.convert(image.path, context.enters(image.context))
            }
        }

        try {
            if (this._isBuiltin) {
                if (theme.id !== theme.id.toLowerCase()) {
                    context.err("Theme ids should be in lowercase, but it is " + theme.id)
                }

                const filename = this._path.substring(
                    this._path.lastIndexOf("/") + 1,
                    this._path.length - 5
                )
                if (theme.id !== filename) {
                    context.err(
                        "Theme ids should be the same as the name.json, but we got id: " +
                            theme.id +
                            " and filename " +
                            filename +
                            " (" +
                            this._path +
                            ")"
                    )
                }
                this._validateImage.convert(theme.icon, context.enter("icon"))
            }
            const dups = Utils.Duplicates(json.layers.map((layer) => layer["id"]))
            if (dups.length > 0) {
                context.err(
                    `The theme ${json.id} defines multiple layers with id ${dups.join(", ")}`
                )
            }
            if (json["mustHaveLanguage"] !== undefined) {
                new ValidateLanguageCompleteness(...json["mustHaveLanguage"]).convert(
                    theme,
                    context
                )
            }
            if (!json.hideFromOverview && theme.id !== "personal" && this._isBuiltin) {
                // The first key in the the title-field must be english, otherwise the title in the loading page will be the different language
                const targetLanguage = theme.title.SupportedLanguages()[0]
                if (targetLanguage !== "en") {
                    context.err(
                        `TargetLanguage is not 'en' for public theme ${theme.id}, it is ${targetLanguage}. Move 'en' up in the title of the theme and set it as the first key`
                    )
                }

                // Official, public themes must have a full english translation
                new ValidateLanguageCompleteness("en").convert(theme, context)
            }
        } catch (e) {
            console.error(e)
            context.err("Could not validate the theme due to: " + e)
        }

        if (theme.id !== "personal") {
            new DetectDuplicatePresets().convert(theme, context)
        }

        if (!theme.title) {
            context.enter("title").err("A theme must have a title")
        }

        if (!theme.description) {
            context.enter("description").err("A theme must have a description")
        }

        if (theme.overpassUrl && typeof theme.overpassUrl === "string") {
            context
                .enter("overpassUrl")
                .err("The overpassURL is a string, use a list of strings instead. Wrap it with [ ]")
        }

        if (json.defaultBackgroundId) {
            const backgroundId = json.defaultBackgroundId

            const isCategory =
                backgroundId === "photo" || backgroundId === "map" || backgroundId === "osmbasedmap"

            if (!isCategory && !ValidateTheme._availableLayers.has(backgroundId)) {
                const options = Array.from(ValidateTheme._availableLayers)
                const nearby = Utils.sortedByLevenshteinDistance(backgroundId, options, (t) => t)
                context
                    .enter("defaultBackgroundId")
                    .err(
                        `This layer ID is not known: ${backgroundId}. Perhaps you meant one of ${nearby
                            .slice(0, 5)
                            .join(", ")}`
                    )
            }
        }

        for (let i = 0; i < theme.layers.length; i++) {
            const layer = theme.layers[i]
            if (!layer.id.match("[a-z][a-z0-9_]*")) {
                context
                    .enters("layers", i, "id")
                    .err("Invalid ID:" + layer.id + "should match [a-z][a-z0-9_]*")
            }
        }

        return json
    }
}

export class ValidateThemeAndLayers extends Fuse<LayoutConfigJson> {
    constructor(
        doesImageExist: DoesImageExist,
        path: string,
        isBuiltin: boolean,
        sharedTagRenderings?: Set<string>
    ) {
        super(
            "Validates a theme and the contained layers",
            new ValidateTheme(doesImageExist, path, isBuiltin, sharedTagRenderings),
            new On(
                "layers",
                new Each(
                    new Bypass(
                        (layer) => Constants.added_by_default.indexOf(<any>layer.id) < 0,
                        new ValidateLayerConfig(undefined, isBuiltin, doesImageExist, false, true)
                    )
                )
            )
        )
    }
}

class OverrideShadowingCheck extends DesugaringStep<LayoutConfigJson> {
    constructor() {
        super(
            "Checks that an 'overrideAll' does not override a single override",
            [],
            "OverrideShadowingCheck"
        )
    }

    convert(json: LayoutConfigJson, context: ConversionContext): LayoutConfigJson {
        const overrideAll = json.overrideAll
        if (overrideAll === undefined) {
            return json
        }

        const withOverride = json.layers.filter((l) => l["override"] !== undefined)

        for (const layer of withOverride) {
            for (const key in overrideAll) {
                if (key.endsWith("+") || key.startsWith("+")) {
                    // This key will _add_ to the list, not overwrite it - so no warning is needed
                    continue
                }
                if (
                    layer["override"][key] !== undefined ||
                    layer["override"]["=" + key] !== undefined
                ) {
                    const w =
                        "The override of layer " +
                        JSON.stringify(layer["builtin"]) +
                        " has a shadowed property: " +
                        key +
                        " is overriden by overrideAll of the theme"
                    context.err(w)
                }
            }
        }

        return json
    }
}

class MiscThemeChecks extends DesugaringStep<LayoutConfigJson> {
    constructor() {
        super("Miscelleanous checks on the theme", [], "MiscThemesChecks")
    }

    convert(json: LayoutConfigJson, context: ConversionContext): LayoutConfigJson {
        if (json.id !== "personal" && (json.layers === undefined || json.layers.length === 0)) {
            context.err("The theme " + json.id + " has no 'layers' defined")
        }
        if (json.socialImage === "") {
            context.warn("Social image for theme " + json.id + " is the emtpy string")
        }
        if (json["clustering"]) {
            context.warn("Obsolete field `clustering` is still around")
        }
        {
            for (let i = 0; i < json.layers.length; i++) {
                const l = json.layers[i]
                if (l["override"]?.["source"] === undefined) {
                    continue
                }
                if (l["override"]?.["source"]?.["geoJson"]) {
                    continue // We don't care about external data as we won't cache it anyway
                }
                if (l["override"]["id"] !== undefined) {
                    continue
                }
                context
                    .enters("layers", i)
                    .err("A layer which changes the source-tags must also change the ID")
            }
        }

        if (json["overideAll"]) {
            context
                .enter("overideAll")
                .err(
                    "'overrideAll' is spelled with _two_ `r`s. You only wrote a single one of them."
                )
        }
        return json
    }
}

export class PrevalidateTheme extends Fuse<LayoutConfigJson> {
    constructor() {
        super(
            "Various consistency checks on the raw JSON",
            new MiscThemeChecks(),
            new OverrideShadowingCheck()
        )
    }
}

export class DetectConflictingAddExtraTags extends DesugaringStep<TagRenderingConfigJson> {
    constructor() {
        super(
            "The `if`-part in a mapping might set some keys. Those keys are not allowed to be set in the `addExtraTags`, as this might result in conflicting values",
            [],
            "DetectConflictingAddExtraTags"
        )
    }

    convert(json: TagRenderingConfigJson, context: ConversionContext): TagRenderingConfigJson {
        if (!(json.mappings?.length > 0)) {
            return json
        }

        try {
            const tagRendering = new TagRenderingConfig(json, context.path.join("."))

            for (let i = 0; i < tagRendering.mappings.length; i++) {
                const mapping = tagRendering.mappings[i]
                if (!mapping.addExtraTags) {
                    continue
                }
                const keysInMapping = new Set(mapping.if.usedKeys())

                const keysInAddExtraTags = mapping.addExtraTags.map((t) => t.key)

                const duplicateKeys = keysInAddExtraTags.filter((k) => keysInMapping.has(k))
                if (duplicateKeys.length > 0) {
                    context
                        .enters("mappings", i)
                        .err(
                            "AddExtraTags overrides a key that is set in the `if`-clause of this mapping. Selecting this answer might thus first set one value (needed to match as answer) and then override it with a different value, resulting in an unsaveable question. The offending `addExtraTags` is " +
                                duplicateKeys.join(", ")
                        )
                }
            }

            return json
        } catch (e) {
            context.err("Could not check for conflicting extra tags due to: " + e)
            return undefined
        }
    }
}

export class DetectNonErasedKeysInMappings extends DesugaringStep<QuestionableTagRenderingConfigJson> {
    constructor() {
        super(
            "A tagRendering might set a freeform key (e.g. `name` and have an option that _should_ erase this name, e.g. `noname=yes`). Under normal circumstances, every mapping/freeform should affect all touched keys",
            [],
            "DetectNonErasedKeysInMappings"
        )
    }

    convert(
        json: QuestionableTagRenderingConfigJson,
        context: ConversionContext
    ): QuestionableTagRenderingConfigJson {
        if (json.multiAnswer) {
            // No need to check this here, this has its own validation
            return json
        }
        if (!json.question) {
            // No need to check the writable tags, as this cannot write
            return json
        }

        function addAll(keys: { forEach: (f: (s: string) => void) => void }, addTo: Set<string>) {
            keys?.forEach((k) => addTo.add(k))
        }

        const freeformKeys: Set<string> = new Set()
        if (json.freeform) {
            freeformKeys.add(json.freeform.key)
            for (const tag of json.freeform.addExtraTags ?? []) {
                const tagParsed = TagUtils.Tag(tag)
                addAll(tagParsed.usedKeys(), freeformKeys)
            }
        }

        const mappingKeys: Set<string>[] = []
        for (const mapping of json.mappings ?? []) {
            if (mapping.hideInAnswer === true) {
                mappingKeys.push(undefined)
                continue
            }
            const thisMappingKeys: Set<string> = new Set<string>()
            addAll(TagUtils.Tag(mapping.if).usedKeys(), thisMappingKeys)
            for (const tag of mapping.addExtraTags ?? []) {
                addAll(TagUtils.Tag(tag).usedKeys(), thisMappingKeys)
            }
            mappingKeys.push(thisMappingKeys)
        }

        const neededKeys = new Set<string>()

        addAll(freeformKeys, neededKeys)
        for (const mappingKey of mappingKeys) {
            addAll(mappingKey, neededKeys)
        }

        neededKeys.delete("fixme") // fixme gets a free pass

        if (json.freeform) {
            for (const neededKey of neededKeys) {
                if (!freeformKeys.has(neededKey)) {
                    context
                        .enters("freeform")
                        .warn(
                            "The freeform block does not modify the key `" +
                                neededKey +
                                "` which is set in a mapping. Use `addExtraTags` to overwrite it"
                        )
                }
            }
        }

        for (let i = 0; i < json.mappings?.length; i++) {
            const mapping = json.mappings[i]
            if (mapping.hideInAnswer === true) {
                continue
            }
            const keys = mappingKeys[i]
            for (const neededKey of neededKeys) {
                if (!keys.has(neededKey)) {
                    context
                        .enters("mappings", i)
                        .warn(
                            "This mapping does not modify the key `" +
                                neededKey +
                                "` which is set in a mapping or by the freeform block. Use `addExtraTags` to overwrite it"
                        )
                }
            }
        }

        return json
    }
}

export class DetectMappingsShadowedByCondition extends DesugaringStep<TagRenderingConfigJson> {
    private readonly _forceError: boolean

    constructor(forceError: boolean = false) {
        super("Checks that, if the tagrendering has a condition, that a mapping is not contradictory to it, i.e. that there are no dead mappings", [], "DetectMappingsShadowedByCondition")
        this._forceError = forceError
    }

    /**
     *
     * const validator = new DetectMappingsShadowedByCondition(true)
     * const ctx = ConversionContext.construct([],["test"])
     * validator.convert({
     *     condition: "count>0",
     *     mappings:[
     *         {
     *             if: "count=0",
     *             then:{
     *                 en: "No count"
     *             }
     *         }
     *     ]
     * }, ctx)
     * ctx.hasErrors() // => true
     */
    convert(json: TagRenderingConfigJson, context: ConversionContext): TagRenderingConfigJson {
        if(!json.condition && !json.metacondition){
            return json
        }
        if(!json.mappings || json.mappings?.length ==0){
            return json
        }
        let conditionJson = json.condition ?? json.metacondition
        if(json.condition !== undefined && json.metacondition !== undefined){
            conditionJson = {and: [json.condition, json.metacondition]}
        }
        const condition = TagUtils.Tag(conditionJson, context.path.join("."))

        for (let i = 0; i < json.mappings.length; i++){
            const mapping = json.mappings[i]
            const tagIf = TagUtils.Tag(mapping.if, context.path.join("."))
            const optimized = new And([tagIf, condition]).optimize()
            if(optimized === false){
                const msg = ("Detected a conflicting mapping and condition. The mapping requires tags " + tagIf.asHumanString() + ", yet this can never happen because the set condition requires " + condition.asHumanString())
                const ctx = context.enters("mappings", i)
                if (this._forceError) {
                    ctx.err(msg)
                } else {
                    ctx.warn(msg)
                }
            }
        }


        return undefined
    }

}

export class DetectShadowedMappings extends DesugaringStep<TagRenderingConfigJson> {
    private readonly _calculatedTagNames: string[]

    constructor(layerConfig?: LayerConfigJson) {
        super("Checks that the mappings don't shadow each other", [], "DetectShadowedMappings")
        this._calculatedTagNames = DetectShadowedMappings.extractCalculatedTagNames(layerConfig)
    }

    /**
     *
     * DetectShadowedMappings.extractCalculatedTagNames({calculatedTags: ["_abc:=js()"]}) // => ["_abc"]
     * DetectShadowedMappings.extractCalculatedTagNames({calculatedTags: ["_abc=js()"]}) // => ["_abc"]
     */
    private static extractCalculatedTagNames(
        layerConfig?: LayerConfigJson | { calculatedTags: string[] }
    ) {
        return (
            layerConfig?.calculatedTags?.map((ct) => {
                if (ct.indexOf(":=") >= 0) {
                    return ct.split(":=")[0]
                }
                return ct.split("=")[0]
            }) ?? []
        )
    }

    /**
     *
     * // should detect a simple shadowed mapping
     * const tr = {mappings: [
     *            {
     *                if: {or: ["key=value", "x=y"]},
     *                then: "Case A"
     *            },
     *            {
     *                if: "key=value",
     *                then: "Shadowed"
     *            }
     *        ]
     *    }
     * const context = ConversionContext.test()
     * const r = new DetectShadowedMappings().convert(tr, context);
     * context.getAll("error").length // => 1
     * context.getAll("error")[0].message.indexOf("The mapping key=value is fully matched by a previous mapping (namely 0)") >= 0 // => true
     *
     * const tr = {mappings: [
     *         {
     *             if: {or: ["key=value", "x=y"]},
     *             then: "Case A"
     *         },
     *         {
     *             if: {and: ["key=value", "x=y"]},
     *             then: "Shadowed"
     *         }
     *     ]
     * }
     * const context = ConversionContext.test()
     * const r = new DetectShadowedMappings().convert(tr, context);
     * context.getAll("error").length // => 1
     * context.getAll("error")[0].message.indexOf("The mapping key=value & x=y is fully matched by a previous mapping (namely 0)") >= 0 // => true
     */
    convert(json: TagRenderingConfigJson, context: ConversionContext): TagRenderingConfigJson {
        if (json.mappings === undefined || json.mappings.length === 0) {
            return json
        }
        const defaultProperties = {}
        for (const calculatedTagName of this._calculatedTagNames) {
            defaultProperties[calculatedTagName] =
                "some_calculated_tag_value_for_" + calculatedTagName
        }
        const parsedConditions = json.mappings.map((m, i) => {
            const c = context.enters("mappings", i)
            const ifTags = TagUtils.Tag(m.if, c.enter("if"))
            const hideInAnswer = m["hideInAnswer"]
            if (hideInAnswer !== undefined && hideInAnswer !== false && hideInAnswer !== true) {
                const conditionTags = TagUtils.Tag(hideInAnswer)
                // Merge the condition too!
                return new And([conditionTags, ifTags])
            }
            return ifTags
        })
        for (let i = 0; i < json.mappings.length; i++) {
            if (!parsedConditions[i]?.isUsableAsAnswer()) {
                // There is no straightforward way to convert this mapping.if into a properties-object, so we simply skip this one
                // Yes, it might be shadowed, but running this check is to difficult right now
                continue
            }
            const keyValues = parsedConditions[i].asChange(defaultProperties)
            const properties = {}
            keyValues.forEach(({ k, v }) => {
                properties[k] = v
            })
            for (let j = 0; j < i; j++) {
                const doesMatch = parsedConditions[j].matchesProperties(properties)
                if (
                    doesMatch &&
                    json.mappings[j]["hideInAnswer"] === true &&
                    json.mappings[i]["hideInAnswer"] !== true
                ) {
                    context.warn(
                        `Mapping ${i} is shadowed by mapping ${j}. However, mapping ${j} has 'hideInAnswer' set, which will result in a different rendering in question-mode.`
                    )
                } else if (doesMatch) {
                    // The current mapping is shadowed!
                    context.err(`Mapping ${i} is shadowed by mapping ${j} and will thus never be shown:
    The mapping ${parsedConditions[i].asHumanString(
        false,
        false,
        {}
    )} is fully matched by a previous mapping (namely ${j}), which matches:
    ${parsedConditions[j].asHumanString(false, false, {})}.

    To fix this problem, you can try to:
    - Move the shadowed mapping up
    - Do you want to use a different text in 'question mode'? Add 'hideInAnswer=true' to the first mapping
    - Use "addExtraTags": ["key=value", ...] in order to avoid a different rendering
         (e.g. [{"if": "fee=no",                     "then": "Free to use", "hideInAnswer":true},
                {"if": {"and":["fee=no","charge="]}, "then": "Free to use"}]
          can be replaced by
               [{"if":"fee=no", "then": "Free to use", "addExtraTags": ["charge="]}]
`)
                }
            }
        }

        return json
    }
}

export class DetectMappingsWithImages extends DesugaringStep<TagRenderingConfigJson> {
    private readonly _doesImageExist: DoesImageExist

    constructor(doesImageExist: DoesImageExist) {
        super(
            "Checks that 'then'clauses in mappings don't have images, but use 'icon' instead",
            [],
            "DetectMappingsWithImages"
        )
        this._doesImageExist = doesImageExist
    }

    /**
     * const context = ConversionContext.test()
     * const r = new DetectMappingsWithImages(new DoesImageExist(new Set<string>())).convert({
     *     "mappings": [
     *         {
     *             "if": "bicycle_parking=stands",
     *             "then": {
     *                 "en": "Staple racks <img style='width: 25%' src='./assets/layers/bike_parking/staple.svg'>",
     *                 "nl": "Nietjes <img style='width: 25%'' src='./assets/layers/bike_parking/staple.svg'>",
     *                 "fr": "Arceaux <img style='width: 25%'' src='./assets/layers/bike_parking/staple.svg'>",
     *                 "gl": "De roda (Stands) <img style='width: 25%'' src='./assets/layers/bike_parking/staple.svg'>",
     *                 "de": "Fahrradbügel <img style='width: 25%'' src='./assets/layers/bike_parking/staple.svg'>",
     *                 "hu": "Korlát <img style='width: 25%' src='./assets/layers/bike_parking/staple.svg'>",
     *                 "it": "Archetti <img style='width: 25%' src='./assets/layers/bike_parking/staple.svg'>",
     *                 "zh_Hant": "單車架 <img style='width: 25%' src='./assets/layers/bike_parking/staple.svg'>"
     *             }
     *         }]
     * }, context);
     * context.hasErrors() // => true
     * context.getAll("error").some(msg => msg.message.indexOf("./assets/layers/bike_parking/staple.svg") >= 0) // => true
     */
    convert(json: TagRenderingConfigJson, context: ConversionContext): TagRenderingConfigJson {
        if (json.mappings === undefined || json.mappings.length === 0) {
            return json
        }
        const ignoreToken = "ignore-image-in-then"
        for (let i = 0; i < json.mappings.length; i++) {
            const mapping = json.mappings[i]
            const ignore = mapping["#"]?.indexOf(ignoreToken) >= 0
            const images = Utils.Dedup(Translations.T(mapping.then)?.ExtractImages() ?? [])
            const ctx = context.enters("mappings", i)
            if (images.length > 0) {
                if (!ignore) {
                    ctx.err(
                        `A mapping has an image in the 'then'-clause. Remove the image there and use \`"icon": <your-image>\` instead. The images found are ${images.join(
                            ", "
                        )}. (This check can be turned of by adding "#": "${ignoreToken}" in the mapping, but this is discouraged`
                    )
                } else {
                    ctx.info(
                        `Ignored image ${images.join(
                            ", "
                        )} in 'then'-clause of a mapping as this check has been disabled`
                    )

                    for (const image of images) {
                        this._doesImageExist.convert(image, ctx)
                    }
                }
            } else if (ignore) {
                ctx.warn(`Unused '${ignoreToken}' - please remove this`)
            }
        }

        return json
    }
}

class ValidatePossibleLinks extends DesugaringStep<string | Record<string, string>> {
    constructor() {
        super(
            "Given a possible set of translations, validates that <a href=... target='_blank'> does have `rel='noopener'` set",
            [],
            "ValidatePossibleLinks"
        )
    }

    public isTabnabbingProne(str: string): boolean {
        const p = parse_html(str)
        const links = Array.from(p.getElementsByTagName("a"))
        if (links.length == 0) {
            return false
        }
        for (const link of Array.from(links)) {
            if (link.getAttribute("target") !== "_blank") {
                continue
            }
            const rel = new Set<string>(link.getAttribute("rel")?.split(" ") ?? [])
            if (rel.has("noopener")) {
                continue
            }
            const source = link.getAttribute("href")
            if (source.startsWith("http")) {
                // No variable part - we assume the link is safe
                continue
            }
            return true
        }
        return false
    }

    convert(
        json: string | Record<string, string>,
        context: ConversionContext
    ): string | Record<string, string> {
        if (typeof json === "string") {
            if (this.isTabnabbingProne(json)) {
                context.err(
                    "The string " +
                        json +
                        " has a link targeting `_blank`, but it doesn't have `rel='noopener'` set. This gives rise to reverse tabnapping"
                )
            }
        } else {
            for (const k in json) {
                if (this.isTabnabbingProne(json[k])) {
                    context.err(
                        `The translation for ${k} '${json[k]}' has a link targeting \`_blank\`, but it doesn't have \`rel='noopener'\` set. This gives rise to reverse tabnapping`
                    )
                }
            }
        }
        return json
    }
}

class CheckTranslation extends DesugaringStep<Translatable> {
    public static readonly allowUndefined: CheckTranslation = new CheckTranslation(true)
    public static readonly noUndefined: CheckTranslation = new CheckTranslation()
    private readonly _allowUndefined: boolean

    constructor(allowUndefined: boolean = false) {
        super(
            "Checks that a translation is valid and internally consistent",
            ["*"],
            "CheckTranslation"
        )
        this._allowUndefined = allowUndefined
    }

    convert(json: Translatable, context: ConversionContext): Translatable {
        if (json === undefined || json === null) {
            if (!this._allowUndefined) {
                context.err("Expected a translation, but got " + json)
            }
            return json
        }
        if (typeof json === "string") {
            return json
        }
        const keys = Object.keys(json)
        if (keys.length === 0) {
            context.err("No actual values are given in this translation, it is completely empty")
            return json
        }
        const en = json["en"]
        if (!en && json["*"] === undefined) {
            const msg = "Received a translation without english version"
            context.warn(msg)
        }

        for (const key of keys) {
            const lng = json[key]
            if (lng === "") {
                context.enter(lng).err("Got an empty string in translation for language " + key)
            }

            // TODO validate that all subparts are here
        }

        return json
    }
}

class MiscTagRenderingChecks extends DesugaringStep<TagRenderingConfigJson> {
    constructor() {
        super("Miscellaneous checks on the tagrendering", ["special"], "MiscTagRenderingChecks")
    }

    convert(
        json: TagRenderingConfigJson | QuestionableTagRenderingConfigJson,
        context: ConversionContext
    ): TagRenderingConfigJson {
        if (json["special"] !== undefined) {
            context.err(
                'Detected `special` on the top level. Did you mean `{"render":{ "special": ... }}`'
            )
        }

        if (Object.keys(json).length === 1 && typeof json["render"] === "string") {
            context.warn(
                `use the content directly instead of {render: ${JSON.stringify(json["render"])}}`
            )
        }

        {
            for (const key of ["question", "questionHint", "render"]) {
                CheckTranslation.allowUndefined.convert(json[key], context.enter(key))
            }
            for (let i = 0; i < json.mappings?.length ?? 0; i++) {
                const mapping: MappingConfigJson = json.mappings[i]
                CheckTranslation.noUndefined.convert(
                    mapping.then,
                    context.enters("mappings", i, "then")
                )
                if (!mapping.if) {
                    console.log(
                        "Checking mappings",
                        i,
                        "if",
                        mapping.if,
                        context.path.join("."),
                        mapping.then
                    )
                    context.enters("mappings", i, "if").err("No `if` is defined")
                }
                if (mapping.addExtraTags) {
                    for (let j = 0; j < mapping.addExtraTags.length; j++) {
                        if (!mapping.addExtraTags[j]) {
                            context
                                .enters("mappings", i, "addExtraTags", j)
                                .err(
                                    "Detected a 'null' or 'undefined' value. Either specify a tag or delete this item"
                                )
                        }
                    }
                }
                const en = mapping?.then?.["en"]
                if (en && this.detectYesOrNo(en)) {
                    console.log("Found a match with yes or no: ", { en })
                    context
                        .enters("mappings", i, "then")
                        .warn(
                            "A mapping should not start with 'yes' or 'no'. If the attribute is known, it will only show 'yes' or 'no' <i>without</i> the question, resulting in a weird phrasing in the information box"
                        )
                }
            }
        }
        if (json["group"]) {
            context.err('Groups are deprecated, use `"label": ["' + json["group"] + '"]` instead')
        }

        if (json["question"] && json.freeform?.key === undefined && json.mappings === undefined) {
            context.err(
                "A question is defined, but no mappings nor freeform (key) are. Add at least one of them"
            )
        }
        if (json["question"] && !json.freeform && (json.mappings?.length ?? 0) == 1) {
            context.err("A question is defined, but there is only one option to choose from.")
        }
        if (json["questionHint"] && !json["question"]) {
            context
                .enter("questionHint")
                .err(
                    "A questionHint is defined, but no question is given. As such, the questionHint will never be shown"
                )
        }

        if (json.icon?.["size"]) {
            context
                .enters("icon", "size")
                .err(
                    "size is not a valid attribute. Did you mean 'class'? Class can be one of `small`, `medium` or `large`"
                )
        }

        if (json.freeform) {
            if (json.render === undefined) {
                context
                    .enter("render")
                    .err(
                        "This tagRendering allows to set a value to key " +
                            json.freeform.key +
                            ", but does not define a `render`. Please, add a value here which contains `{" +
                            json.freeform.key +
                            "}`"
                    )
            } else {
                const render = new Translation(<any>json.render)
                for (const ln in render.translations) {
                    if (ln.startsWith("_")) {
                        continue
                    }
                    const txt: string = render.translations[ln]
                    if (txt === "") {
                        context.enter("render").err(" Rendering for language " + ln + " is empty")
                    }
                    if (
                        txt.indexOf("{" + json.freeform.key + "}") >= 0 ||
                        txt.indexOf("&LBRACE" + json.freeform.key + "&RBRACE") >= 0
                    ) {
                        continue
                    }
                    if (txt.indexOf("{" + json.freeform.key + ":") >= 0) {
                        continue
                    }

                    if (
                        json.freeform["type"] === "opening_hours" &&
                        txt.indexOf("{opening_hours_table(") >= 0
                    ) {
                        continue
                    }
                    const keyFirstArg = ["canonical", "fediverse_link", "translated"]
                    if (
                        keyFirstArg.some(
                            (funcName) => txt.indexOf(`{${funcName}(${json.freeform.key}`) >= 0
                        )
                    ) {
                        continue
                    }
                    if (
                        json.freeform["type"] === "wikidata" &&
                        txt.indexOf("{wikipedia(" + json.freeform.key) >= 0
                    ) {
                        continue
                    }
                    if (json.freeform.key === "wikidata" && txt.indexOf("{wikipedia()") >= 0) {
                        continue
                    }
                    if (
                        json.freeform["type"] === "wikidata" &&
                        txt.indexOf(`{wikidata_label(${json.freeform.key})`) >= 0
                    ) {
                        continue
                    }
                    if (json.freeform.key.indexOf("wikidata") >= 0) {
                        context
                            .enter("render")
                            .err(
                                `The rendering for language ${ln} does not contain \`{${json.freeform.key}}\`. Did you perhaps forget to set "freeform.type: 'wikidata'"?`
                            )
                    }
                    context
                        .enter("render")
                        .err(
                            `The rendering for language ${ln} does not contain \`{${json.freeform.key}}\`. This is a bug, as this rendering should show exactly this freeform key!`
                        )
                }
            }
        }
        if (json.render && json["question"] && json.freeform === undefined) {
            context.err(
                `Detected a tagrendering which takes input without freeform key in ${context}; the question is ${new Translation(
                    json["question"]
                ).textFor("en")}`
            )
        }

        const freeformType = json["freeform"]?.["type"]
        if (freeformType) {
            if (Validators.availableTypes.indexOf(freeformType) < 0) {
                context
                    .enters("freeform", "type")
                    .err(
                        "Unknown type: " +
                            freeformType +
                            "; try one of " +
                            Validators.availableTypes.join(", ")
                    )
            }
        }

        if (context.hasErrors()) {
            return undefined
        }
        return json
    }

    /**
     * const obj = new MiscTagRenderingChecks()
     * obj.detectYesOrNo("Yes, this place has") // => true
     * obj.detectYesOrNo("Yes") // => true
     * obj.detectYesOrNo("No, this place does not have...") // => true
     * obj.detectYesOrNo("This place does not have...") // => false
     */
    private detectYesOrNo(en: string): boolean {
        return en.toLowerCase().match(/^(yes|no)([,:;.?]|$)/) !== null
    }
}

export class ValidateTagRenderings extends Fuse<TagRenderingConfigJson> {
    constructor(layerConfig?: LayerConfigJson, doesImageExist?: DoesImageExist) {
        super(
            "Various validation on tagRenderingConfigs",
            new MiscTagRenderingChecks(),
            new DetectShadowedMappings(layerConfig),

            new DetectMappingsShadowedByCondition(),
            new DetectConflictingAddExtraTags(),
            // TODO enable   new DetectNonErasedKeysInMappings(),
            new DetectMappingsWithImages(doesImageExist),
            new On("render", new ValidatePossibleLinks()),
            new On("question", new ValidatePossibleLinks()),
            new On("questionHint", new ValidatePossibleLinks()),
            new On("mappings", new Each(new On("then", new ValidatePossibleLinks()))),
            new MiscTagRenderingChecks()
        )
    }
}

export class PrevalidateLayer extends DesugaringStep<LayerConfigJson> {
    private readonly _isBuiltin: boolean
    private readonly _doesImageExist: DoesImageExist
    /**
     * The paths where this layer is originally saved. Triggers some extra checks
     */
    private readonly _path: string
    private readonly _studioValidations: boolean
    private readonly _validatePointRendering = new ValidatePointRendering()

    constructor(
        path: string,
        isBuiltin: boolean,
        doesImageExist: DoesImageExist,
        studioValidations: boolean
    ) {
        super("Runs various checks against common mistakes for a layer", [], "PrevalidateLayer")
        this._path = path
        this._isBuiltin = isBuiltin
        this._doesImageExist = doesImageExist
        this._studioValidations = studioValidations
    }

    convert(json: LayerConfigJson, context: ConversionContext): LayerConfigJson {
        if (json.id === undefined) {
            context.enter("id").err(`Not a valid layer: id is undefined`)
        } else {
            if (json.id?.toLowerCase() !== json.id) {
                context.enter("id").err(`The id of a layer should be lowercase: ${json.id}`)
            }
            const layerRegex = /[a-zA-Z][a-zA-Z_0-9]+/
            if (json.id.match(layerRegex) === null) {
                context.enter("id").err("Invalid ID. A layer ID should match " + layerRegex.source)
            }
        }

        if (json.source === undefined) {
            context
                .enter("source")
                .err(
                    "No source section is defined; please define one as data is not loaded otherwise"
                )
        } else {
            if (json.source === "special" || json.source === "special:library") {
            } else if (json.source && json.source["osmTags"] === undefined) {
                context
                    .enters("source", "osmTags")
                    .err(
                        "No osmTags defined in the source section - these should always be present, even for geojson layer"
                    )
            } else {
                const osmTags = TagUtils.Tag(json.source["osmTags"], context + "source.osmTags")
                if (osmTags.isNegative()) {
                    context
                        .enters("source", "osmTags")
                        .err(
                            "The source states tags which give a very wide selection: it only uses negative expressions, which will result in too much and unexpected data. Add at least one required tag. The tags are:\n\t" +
                                osmTags.asHumanString(false, false, {})
                        )
                }
            }

            if (json.source["geoJsonSource"] !== undefined) {
                context
                    .enters("source", "geoJsonSource")
                    .err("Use 'geoJson' instead of 'geoJsonSource'")
            }

            if (json.source["geojson"] !== undefined) {
                context
                    .enters("source", "geojson")
                    .err("Use 'geoJson' instead of 'geojson' (the J is a capital letter)")
            }
        }

        if (
            json.syncSelection !== undefined &&
            LayerConfig.syncSelectionAllowed.indexOf(json.syncSelection) < 0
        ) {
            context
                .enter("syncSelection")
                .err(
                    "Invalid sync-selection: must be one of " +
                        LayerConfig.syncSelectionAllowed.map((v) => `'${v}'`).join(", ") +
                        " but got '" +
                        json.syncSelection +
                        "'"
                )
        }
        if (json["pointRenderings"]?.length > 0) {
            context
                .enter("pointRenderings")
                .err("Detected a 'pointRenderingS', it is written singular")
        }

        if (
            !(json.pointRendering?.length > 0) &&
            json.pointRendering !== null &&
            json.source !== "special" &&
            json.source !== "special:library"
        ) {
            context.enter("pointRendering").err("There are no pointRenderings at all...")
        }

        json.pointRendering?.forEach((pr, i) =>
            this._validatePointRendering.convert(pr, context.enters("pointeRendering", i))
        )

        if (json["mapRendering"]) {
            context.enter("mapRendering").err("This layer has a legacy 'mapRendering'")
        }

        if (json.presets?.length > 0) {
            if (!(json.pointRendering?.length > 0)) {
                context.enter("presets").warn("A preset is defined, but there is no pointRendering")
            }
        }

        if (json.source === "special") {
            if (!Constants.priviliged_layers.find((x) => x == json.id)) {
                context.err(
                    "Layer " +
                        json.id +
                        " uses 'special' as source.osmTags. However, this layer is not a priviliged layer"
                )
            }
        }

        if (context.hasErrors()) {
            return undefined
        }

        if (json.tagRenderings !== undefined && json.tagRenderings.length > 0) {
            new On("tagRenderings", new Each(new ValidateTagRenderings(json)))
            if (json.title === undefined && json.source !== "special:library") {
                context
                    .enter("title")
                    .err(
                        "This layer does not have a title defined but it does have tagRenderings. Not having a title will disable the popups, resulting in an unclickable element. Please add a title. If not having a popup is intended and the tagrenderings need to be kept (e.g. in a library layer), set `title: null` to disable this error."
                    )
            }
            if (json.title === null) {
                context.info(
                    "Title is `null`. This results in an element that cannot be clicked - even though tagRenderings is set."
                )
            }

            {
                // Check for multiple, identical builtin questions - usability for studio users
                const duplicates = Utils.Duplicates(
                    <string[]>json.tagRenderings.filter((tr) => typeof tr === "string")
                )
                for (let i = 0; i < json.tagRenderings.length; i++) {
                    const tagRendering = json.tagRenderings[i]
                    if (typeof tagRendering === "string" && duplicates.indexOf(tagRendering) > 0) {
                        context
                            .enters("tagRenderings", i)
                            .err(`This builtin question is used multiple times (${tagRendering})`)
                    }
                }
            }
        }

        if (json["builtin"] !== undefined) {
            context.err("This layer hasn't been expanded: " + json)
            return null
        }

        if (json.minzoom > Constants.minZoomLevelToAddNewPoint) {
            const c = context.enter("minzoom")
            const msg = `Minzoom is ${json.minzoom}, this should be at most ${Constants.minZoomLevelToAddNewPoint} as a preset is set. Why? Selecting the pin for a new item will zoom in to level before adding the point. Having a greater minzoom will hide the points, resulting in possible duplicates`
            if (json.presets?.length > 0) {
                c.err(msg)
            } else {
                c.warn(msg)
            }
        }
        {
            // duplicate ids in tagrenderings check
            const duplicates = Utils.NoNull(
                Utils.Duplicates(Utils.NoNull((json.tagRenderings ?? []).map((tr) => tr["id"])))
            )
            if (duplicates.length > 0) {
                // It is tempting to add an index to this warning; however, due to labels the indices here might be different from the index in the tagRendering list
                context
                    .enter("tagRenderings")
                    .err(
                        "Some tagrenderings have a duplicate id: " +
                            duplicates.join(", ") +
                            "\n" +
                            JSON.stringify(
                                json.tagRenderings.filter((tr) => duplicates.indexOf(tr["id"]) >= 0)
                            )
                    )
            }
        }

        if (json.deletion !== undefined && json.deletion instanceof DeleteConfig) {
            if (json.deletion.softDeletionTags === undefined) {
                context
                    .enter("deletion")
                    .warn("No soft-deletion tags in deletion block for layer " + json.id)
            }
        }

        try {
        } catch (e) {
            context.err("Could not validate layer due to: " + e + e.stack)
        }

        if (this._studioValidations) {
            if (!json.description) {
                context.enter("description").err("A description is required")
            }
            if (!json.name) {
                context.enter("name").err("A name is required")
            }
        }

        if (this._isBuiltin) {
            // Some checks for legacy elements

            if (json["overpassTags"] !== undefined) {
                context.err(
                    "Layer " +
                        json.id +
                        'still uses the old \'overpassTags\'-format. Please use "source": {"osmTags": <tags>}\' instead of "overpassTags": <tags> (note: this isn\'t your fault, the custom theme generator still spits out the old format)'
                )
            }
            const forbiddenTopLevel = [
                "icon",
                "wayHandling",
                "roamingRenderings",
                "roamingRendering",
                "label",
                "width",
                "color",
                "colour",
                "iconOverlays",
            ]
            for (const forbiddenKey of forbiddenTopLevel) {
                if (json[forbiddenKey] !== undefined)
                    context.err("Layer " + json.id + " still has a forbidden key " + forbiddenKey)
            }
            if (json["hideUnderlayingFeaturesMinPercentage"] !== undefined) {
                context.err(
                    "Layer " + json.id + " contains an old 'hideUnderlayingFeaturesMinPercentage'"
                )
            }

            if (
                json.isShown !== undefined &&
                (json.isShown["render"] !== undefined || json.isShown["mappings"] !== undefined)
            ) {
                context.warn("Has a tagRendering as `isShown`")
            }
        }
        if (this._isBuiltin) {
            // Check location of layer file
            const expected: string = `assets/layers/${json.id}/${json.id}.json`
            if (this._path != undefined && this._path.indexOf(expected) < 0) {
                context.err(
                    "Layer is in an incorrect place. The path is " +
                        this._path +
                        ", but expected " +
                        expected
                )
            }
        }
        if (this._isBuiltin) {
            // Check for correct IDs
            if (json.tagRenderings?.some((tr) => tr["id"] === "")) {
                const emptyIndexes: number[] = []
                for (let i = 0; i < json.tagRenderings.length; i++) {
                    const tagRendering = json.tagRenderings[i]
                    if (tagRendering["id"] === "") {
                        emptyIndexes.push(i)
                    }
                }
                context
                    .enter(["tagRenderings", ...emptyIndexes])
                    .err(
                        `Some tagrendering-ids are empty or have an emtpy string; this is not allowed (at ${emptyIndexes.join(
                            ","
                        )}])`
                    )
            }

            const duplicateIds = Utils.Duplicates(
                (json.tagRenderings ?? [])?.map((f) => f["id"]).filter((id) => id !== "questions")
            )
            if (duplicateIds.length > 0 && !Utils.runningFromConsole) {
                context
                    .enter("tagRenderings")
                    .err(`Some tagRenderings have a duplicate id: ${duplicateIds}`)
            }

            if (json.description === undefined) {
                if (typeof json.source === null) {
                    context.err("A priviliged layer must have a description")
                } else {
                    context.warn("A builtin layer should have a description")
                }
            }
        }

        if (json.filter) {
            new On("filter", new Each(new ValidateFilter())).convert(json, context)
        }

        if (json.tagRenderings !== undefined) {
            new On(
                "tagRenderings",
                new Each(new ValidateTagRenderings(json, this._doesImageExist))
            ).convert(json, context)
        }

        if (json.pointRendering !== null && json.pointRendering !== undefined) {
            if (!Array.isArray(json.pointRendering)) {
                throw (
                    "pointRendering in " +
                    json.id +
                    " is not iterable, it is: " +
                    typeof json.pointRendering
                )
            }
            for (let i = 0; i < json.pointRendering.length; i++) {
                const pointRendering = json.pointRendering[i]
                if (pointRendering.marker === undefined) {
                    continue
                }
                for (const icon of pointRendering?.marker) {
                    const indexM = pointRendering?.marker.indexOf(icon)
                    if (!icon.icon) {
                        continue
                    }
                    if (icon.icon["condition"]) {
                        context
                            .enters("pointRendering", i, "marker", indexM, "icon", "condition")
                            .err(
                                "Don't set a condition in a marker as this will result in an invisible but clickable element. Use extra filters in the source instead."
                            )
                    }
                }
            }
        }

        if (json.presets !== undefined) {
            if (typeof json.source === "string") {
                context.enter("presets").err("A special layer cannot have presets")
            }
            // Check that a preset will be picked up by the layer itself
            const baseTags = TagUtils.Tag(json.source["osmTags"])
            for (let i = 0; i < json.presets.length; i++) {
                const preset = json.presets[i]
                if (!preset) {
                    context.enters("presets", i).err("This preset is undefined")
                    continue
                }
                if (!preset.tags) {
                    context.enters("presets", i, "tags").err("No tags defined for this preset")
                    continue
                }
                if (!preset.tags) {
                    context.enters("presets", i, "title").err("No title defined for this preset")
                }

                const tags = new And(preset.tags.map((t) => TagUtils.Tag(t)))
                const properties = {}
                for (const tag of tags.asChange({ id: "node/-1" })) {
                    properties[tag.k] = tag.v
                }
                const doMatch = baseTags.matchesProperties(properties)
                if (!doMatch) {
                    context
                        .enters("presets", i, "tags")
                        .err(
                            "This preset does not match the required tags of this layer. This implies that a newly added point will not show up.\n    A newly created point will have properties: " +
                                tags.asHumanString(false, false, {}) +
                                "\n    The required tags are: " +
                                baseTags.asHumanString(false, false, {})
                        )
                }
            }
        }
        return json
    }
}

export class ValidateLayerConfig extends DesugaringStep<LayerConfigJson> {
    private readonly validator: ValidateLayer

    constructor(
        path: string,
        isBuiltin: boolean,
        doesImageExist: DoesImageExist,
        studioValidations: boolean = false,
        skipDefaultLayers: boolean = false
    ) {
        super("Thin wrapper around 'ValidateLayer", [], "ValidateLayerConfig")
        this.validator = new ValidateLayer(
            path,
            isBuiltin,
            doesImageExist,
            studioValidations,
            skipDefaultLayers
        )
    }

    convert(json: LayerConfigJson, context: ConversionContext): LayerConfigJson {
        const prepared = this.validator.convert(json, context)
        if (!prepared) {
            context.err("Preparing layer failed")
            return undefined
        }
        return prepared?.raw
    }
}

class ValidatePointRendering extends DesugaringStep<PointRenderingConfigJson> {
    constructor() {
        super("Various checks for pointRenderings", [], "ValidatePOintRendering")
    }

    convert(json: PointRenderingConfigJson, context: ConversionContext): PointRenderingConfigJson {
        if (json.marker === undefined && json.label === undefined) {
            context.err(`A point rendering should define at least an marker or a label`)
        }

        if (json["markers"]) {
            context
                .enter("markers")
                .err(
                    `Detected a field 'markerS' in pointRendering. It is written as a singular case`
                )
        }
        if (json.marker && !Array.isArray(json.marker)) {
            context.enter("marker").err("The marker in a pointRendering should be an array")
        }
        if (json.location.length == 0) {
            context
                .enter("location")
                .err(
                    "A pointRendering should have at least one 'location' to defined where it should be rendered. "
                )
        }
        return json
    }
}

export class ValidateLayer extends Conversion<
    LayerConfigJson,
    { parsed: LayerConfig; raw: LayerConfigJson }
> {
    private readonly _skipDefaultLayers: boolean
    private readonly _prevalidation: PrevalidateLayer

    constructor(
        path: string,
        isBuiltin: boolean,
        doesImageExist: DoesImageExist,
        studioValidations: boolean = false,
        skipDefaultLayers: boolean = false
    ) {
        super("Doesn't change anything, but emits warnings and errors", [], "ValidateLayer")
        this._prevalidation = new PrevalidateLayer(
            path,
            isBuiltin,
            doesImageExist,
            studioValidations
        )
        this._skipDefaultLayers = skipDefaultLayers
    }

    convert(
        json: LayerConfigJson,
        context: ConversionContext
    ): { parsed: LayerConfig; raw: LayerConfigJson } {
        context = context.inOperation(this.name)
        if (typeof json === "string") {
            context.err(
                `Not a valid layer: the layerConfig is a string. 'npm run generate:layeroverview' might be needed`
            )
            return undefined
        }

        if (this._skipDefaultLayers && Constants.added_by_default.indexOf(<any>json.id) >= 0) {
            return { parsed: undefined, raw: json }
        }

        this._prevalidation.convert(json, context.inOperation(this._prevalidation.name))

        if (context.hasErrors()) {
            return undefined
        }

        let layerConfig: LayerConfig
        try {
            layerConfig = new LayerConfig(json, "validation", true)
        } catch (e) {
            context.err("Could not parse layer due to:" + e)
            return undefined
        }

        for (let i = 0; i < (layerConfig.calculatedTags ?? []).length; i++) {
            const [_, code, __] = layerConfig.calculatedTags[i]
            try {
                new Function("feat", "return " + code + ";")
            } catch (e) {
                context
                    .enters("calculatedTags", i)
                    .err(
                        `Invalid function definition: the custom javascript is invalid:${e}. The offending javascript code is:\n    ${code}`
                    )
            }
        }

        for (let i = 0; i < layerConfig.titleIcons.length; i++) {
            const titleIcon = layerConfig.titleIcons[i]
            if (<any>titleIcon.render === "icons.defaults") {
                context.enters("titleIcons", i).err("Detected a literal 'icons.defaults'")
            }
            if (<any>titleIcon.render === "icons.rating") {
                context.enters("titleIcons", i).err("Detected a literal 'icons.rating'")
            }
        }

        for (let i = 0; i < json.presets?.length; i++) {
            const preset = json.presets[i]
            if (
                preset.snapToLayer === undefined &&
                preset.maxSnapDistance !== undefined &&
                preset.maxSnapDistance !== null
            ) {
                context
                    .enters("presets", i, "maxSnapDistance")
                    .err("A maxSnapDistance is given, but there is no layer given to snap to")
            }
        }

        if (json["doCount"]) {
            context.enters("doCount").err("Use `isCounted` instead of `doCount`")
        }

        if (json.source) {
            const src = json.source
            if (src["isOsmCache"] !== undefined) {
                context.enters("source").err("isOsmCache is deprecated")
            }
            if (src["maxCacheAge"] !== undefined) {
                context
                    .enters("source")
                    .err("maxCacheAge is deprecated; it is " + src["maxCacheAge"])
            }
        }

        if(json.allowMove?.["enableAccuraccy"] !== undefined){
            context.enters("allowMove", "enableAccuracy").err("`enableAccuracy` is written with two C in the first occurrence and only one in the last")
        }

        return { raw: json, parsed: layerConfig }
    }
}

export class ValidateFilter extends DesugaringStep<FilterConfigJson> {
    constructor() {
        super("Detect common errors in the filters", [], "ValidateFilter")
    }

    convert(filter: FilterConfigJson, context: ConversionContext): FilterConfigJson {
        if (typeof filter === "string") {
            // Calling another filter, we skip
            return filter
        }
        for (const option of filter.options) {
            for (let i = 0; i < option.fields?.length ?? 0; i++) {
                const field = option.fields[i]
                const type = field.type ?? "string"
                if (Validators.availableTypes.find((t) => t === type) === undefined) {
                    context
                        .enters("fields", i)
                        .err(
                            `Invalid filter: ${type} is not a valid textfield type.\n\tTry one of ${Array.from(
                                Validators.availableTypes
                            ).join(",")}`
                        )
                }
            }
        }
        return filter
    }
}

export class DetectDuplicateFilters extends DesugaringStep<{
    layers: LayerConfigJson[]
    themes: LayoutConfigJson[]
}> {
    constructor() {
        super(
            "Tries to detect layers where a shared filter can be used (or where similar filters occur)",
            [],
            "DetectDuplicateFilters"
        )
    }

    convert(
        json: { layers: LayerConfigJson[]; themes: LayoutConfigJson[] },
        context: ConversionContext
    ): { layers: LayerConfigJson[]; themes: LayoutConfigJson[] } {
        const { layers, themes } = json
        const perOsmTag = new Map<
            string,
            {
                layer: LayerConfigJson
                layout: LayoutConfigJson | undefined
                filter: FilterConfigJson
            }[]
        >()

        for (const layer of layers) {
            this.addLayerFilters(layer, perOsmTag)
        }

        for (const theme of themes) {
            if (theme.id === "personal") {
                continue
            }
            for (const layer of theme.layers) {
                if (typeof layer === "string") {
                    continue
                }
                if (layer["builtin"] !== undefined) {
                    continue
                }
                this.addLayerFilters(<LayerConfigJson>layer, perOsmTag, theme)
            }
        }

        // At this point, we have gathered all filters per tag - time to find duplicates
        perOsmTag.forEach((value, key) => {
            if (value.length <= 1) {
                // Seen this key just once, it is unique
                return
            }
            let msg = "Possible duplicate filter: " + key
            for (const { filter, layer, layout } of value) {
                let id = ""
                if (layout !== undefined) {
                    id = layout.id + ":"
                }
                msg += `\n      - ${id}${layer.id}.${filter.id}`
            }
            context.warn(msg)
        })

        return json
    }

    /**
     * Add all filter options into 'perOsmTag'
     */
    private addLayerFilters(
        layer: LayerConfigJson,
        perOsmTag: Map<
            string,
            {
                layer: LayerConfigJson
                layout: LayoutConfigJson | undefined
                filter: FilterConfigJson
            }[]
        >,
        layout?: LayoutConfigJson | undefined
    ): void {
        if (layer.filter === undefined || layer.filter === null) {
            return
        }
        if (layer.filter["sameAs"] !== undefined) {
            return
        }
        for (const filter of <(string | FilterConfigJson)[]>layer.filter) {
            if (typeof filter === "string") {
                continue
            }

            if (filter["#"]?.indexOf("ignore-possible-duplicate") >= 0) {
                continue
            }

            for (const option of filter.options) {
                if (option.osmTags === undefined) {
                    continue
                }
                const key = JSON.stringify(option.osmTags)
                if (!perOsmTag.has(key)) {
                    perOsmTag.set(key, [])
                }
                perOsmTag.get(key).push({
                    layer,
                    filter,
                    layout,
                })
            }
        }
    }
}

export class DetectDuplicatePresets extends DesugaringStep<LayoutConfig> {
    constructor() {
        super(
            "Detects mappings which have identical (english) names or identical mappings.",
            ["presets"],
            "DetectDuplicatePresets"
        )
    }

    convert(json: LayoutConfig, context: ConversionContext): LayoutConfig {
        const presets: PresetConfig[] = [].concat(...json.layers.map((l) => l.presets))

        const enNames = presets.map((p) => p.title.textFor("en"))
        if (new Set(enNames).size != enNames.length) {
            const dups = Utils.Duplicates(enNames)
            const layersWithDup = json.layers.filter((l) =>
                l.presets.some((p) => dups.indexOf(p.title.textFor("en")) >= 0)
            )
            const layerIds = layersWithDup.map((l) => l.id)
            context.err(
                `This themes has multiple presets which are named:${dups}, namely layers ${layerIds.join(
                    ", "
                )} this is confusing for contributors and is probably the result of reusing the same layer multiple times. Use \`{"override": {"=presets": []}}\` to remove some presets`
            )
        }

        const optimizedTags = <TagsFilter[]>presets.map((p) => new And(p.tags).optimize())
        for (let i = 0; i < presets.length; i++) {
            const presetATags = optimizedTags[i]
            const presetA = presets[i]
            for (let j = i + 1; j < presets.length; j++) {
                const presetBTags = optimizedTags[j]
                const presetB = presets[j]
                if (
                    Utils.SameObject(presetATags, presetBTags) &&
                    Utils.sameList(
                        presetA.preciseInput.snapToLayers,
                        presetB.preciseInput.snapToLayers
                    )
                ) {
                    context.err(
                        `This themes has multiple presets with the same tags: ${presetATags.asHumanString(
                            false,
                            false,
                            {}
                        )}, namely the preset '${presets[i].title.textFor("en")}' and '${presets[
                            j
                        ].title.textFor("en")}'`
                    )
                }
            }
        }

        return json
    }
}

export class ValidateThemeEnsemble extends Conversion<
    LayoutConfig[],
    Map<
        string,
        {
            tags: TagsFilter
            foundInTheme: string[]
            isCounted: boolean
        }
    >
> {
    constructor() {
        super(
            "Validates that all themes together are logical, i.e. no duplicate ids exists within (overriden) themes",
            [],
            "ValidateThemeEnsemble"
        )
    }

    convert(
        json: LayoutConfig[],
        context: ConversionContext
    ): Map<
        string,
        {
            tags: TagsFilter
            foundInTheme: string[]
            isCounted: boolean
        }
    > {
        const idToSource = new Map<
            string,
            { tags: TagsFilter; foundInTheme: string[]; isCounted: boolean }
        >()

        for (const theme of json) {
            for (const layer of theme.layers) {
                if (typeof layer.source === "string") {
                    continue
                }
                if (Constants.priviliged_layers.indexOf(<any>layer.id) >= 0) {
                    continue
                }
                if (!layer.source) {
                    console.log(theme, layer, layer.source)
                    context.enters(theme.id, "layers", "source", layer.id).err("No source defined")
                    continue
                }
                if (layer.source.geojsonSource) {
                    continue
                }
                const id = layer.id
                const tags = layer.source.osmTags
                if (!idToSource.has(id)) {
                    idToSource.set(id, { tags, foundInTheme: [theme.id], isCounted: layer.doCount })
                    continue
                }

                const oldTags = idToSource.get(id).tags
                const oldTheme = idToSource.get(id).foundInTheme
                if (oldTags.shadows(tags) && tags.shadows(oldTags)) {
                    // All is good, all is well
                    oldTheme.push(theme.id)
                    idToSource.get(id).isCounted ||= layer.doCount
                    continue
                }
                context.err(
                    [
                        "The layer with id '" +
                            id +
                            "' is found in multiple themes with different tag definitions:",
                        "\t In theme " + oldTheme + ":\t" + oldTags.asHumanString(false, false, {}),
                        "\tIn theme " + theme.id + ":\t" + tags.asHumanString(false, false, {}),
                    ].join("\n")
                )
            }
        }

        return idToSource
    }
}
