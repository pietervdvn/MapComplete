import { ConversionContext, DesugaringStep, Each, Fuse, On } from "./Conversion"
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
import Svg from "../../../Svg"
import FilterConfigJson from "../Json/FilterConfigJson"
import DeleteConfig from "../DeleteConfig"
import { QuestionableTagRenderingConfigJson } from "../Json/QuestionableTagRenderingConfigJson"
import Validators from "../../../UI/InputElement/Validators"
import TagRenderingConfig from "../TagRenderingConfig"
import { parse as parse_html } from "node-html-parser"
import PresetConfig from "../PresetConfig"
import { TagsFilter } from "../../../Logic/Tags/TagsFilter"

class ValidateLanguageCompleteness extends DesugaringStep<any> {
    private readonly _languages: string[]

    constructor(...languages: string[]) {
        super(
            "Checks that the given object is fully translated in the specified languages",
            [],
            "ValidateLanguageCompleteness"
        )
        this._languages = languages ?? ["en"]
    }

    convert(obj: any, context: ConversionContext): LayerConfig {
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
            context.info("Ignoring image with { in the path: " + image)
            return image
        }

        if (image === "assets/SocialImage.png") {
            return image
        }
        if (image.match(/[a-z]*/)) {
            if (Svg.All[image + ".svg"] !== undefined) {
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
                    `Image with path ${image} does not exist; it is used in ${context}.\n     Check for typo's and missing directories in the path.`
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

class ValidateTheme extends DesugaringStep<LayoutConfigJson> {
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
        if (this._isBuiltin && this._extractImages !== undefined) {
            // Check images: are they local, are the licenses there, is the theme icon square, ...
            const images = this._extractImages.convert(json, context.inOperation("ValidateTheme"))
            const remoteImages = images.filter((img) => img.path.indexOf("http") == 0)
            for (const remoteImage of remoteImages) {
                context.err(
                    "Found a remote image: " +
                        remoteImage +
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
            context.err(e)
        }

        if (theme.id !== "personal") {
            new DetectDuplicatePresets().convert(theme, context)
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
            new On("layers", new Each(new ValidateLayer(undefined, isBuiltin, doesImageExist)))
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
            "The `if`-part in a mapping might set some keys. Those key are not allowed to be set in the `addExtraTags`, as this might result in conflicting values",
            [],
            "DetectConflictingAddExtraTags"
        )
    }

    convert(json: TagRenderingConfigJson, context: ConversionContext): TagRenderingConfigJson {
        if (!(json.mappings?.length > 0)) {
            return json
        }

        const tagRendering = new TagRenderingConfig(json)

        const errors = []
        for (let i = 0; i < tagRendering.mappings.length; i++) {
            const mapping = tagRendering.mappings[i]
            if (!mapping.addExtraTags) {
                continue
            }
            const keysInMapping = new Set(mapping.if.usedKeys())

            const keysInAddExtraTags = mapping.addExtraTags.map((t) => t.key)

            const duplicateKeys = keysInAddExtraTags.filter((k) => keysInMapping.has(k))
            if (duplicateKeys.length > 0) {
                errors.push(
                    "At " +
                        context +
                        ".mappings[" +
                        i +
                        "]: AddExtraTags overrides a key that is set in the `if`-clause of this mapping. Selecting this answer might thus first set one value (needed to match as answer) and then override it with a different value, resulting in an unsaveable question. The offending `addExtraTags` is " +
                        duplicateKeys.join(", ")
                )
            }
        }

        return json
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
     * const r = new DetectShadowedMappings().convert(tr, "test");
     * r.errors.length // => 1
     * r.errors[0].indexOf("The mapping key=value is fully matched by a previous mapping (namely 0)") >= 0 // => true
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
     * const r = new DetectShadowedMappings().convert(tr, "test");
     * r.errors.length // => 1
     * r.errors[0].indexOf("The mapping key=value&x=y is fully matched by a previous mapping (namely 0)") >= 0 // => true
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
            const ctx = `${context}.mappings[${i}]`
            const ifTags = TagUtils.Tag(m.if, ctx)
            const hideInAnswer = m["hideInAnswer"]
            if (hideInAnswer !== undefined && hideInAnswer !== false && hideInAnswer !== true) {
                let conditionTags = TagUtils.Tag(hideInAnswer)
                // Merge the condition too!
                return new And([conditionTags, ifTags])
            }
            return ifTags
        })
        for (let i = 0; i < json.mappings.length; i++) {
            if (!parsedConditions[i].isUsableAsAnswer()) {
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
     * }, "test");
     * r.errors.length > 0 // => true
     * r.errors.some(msg => msg.indexOf("./assets/layers/bike_parking/staple.svg") >= 0) // => true
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

class MiscTagRenderingChecks extends DesugaringStep<TagRenderingConfigJson> {
    private _options: { noQuestionHintCheck: boolean }

    constructor(options: { noQuestionHintCheck: boolean }) {
        super("Miscellaneous checks on the tagrendering", ["special"], "MiscTagRenderingChecks")
        this._options = options
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
        if (json["group"]) {
            context.err('Groups are deprecated, use `"label": ["' + json["group"] + '"]` instead')
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
        return json
    }
}

export class ValidateTagRenderings extends Fuse<TagRenderingConfigJson> {
    constructor(
        layerConfig?: LayerConfigJson,
        doesImageExist?: DoesImageExist,
        options?: { noQuestionHintCheck: boolean }
    ) {
        super(
            "Various validation on tagRenderingConfigs",
            new DetectShadowedMappings(layerConfig),
            new DetectConflictingAddExtraTags(),
            new DetectMappingsWithImages(doesImageExist),
            new On("render", new ValidatePossibleLinks()),
            new On("question", new ValidatePossibleLinks()),
            new On("questionHint", new ValidatePossibleLinks()),
            new On("mappings", new Each(new On("then", new ValidatePossibleLinks()))),
            new MiscTagRenderingChecks(options)
        )
    }
}

export class ValidateLayer extends DesugaringStep<LayerConfigJson> {
    /**
     * The paths where this layer is originally saved. Triggers some extra checks
     * @private
     */
    private readonly _path?: string
    private readonly _isBuiltin: boolean
    private readonly _doesImageExist: DoesImageExist

    constructor(path: string, isBuiltin: boolean, doesImageExist: DoesImageExist) {
        super("Doesn't change anything, but emits warnings and errors", [], "ValidateLayer")
        this._path = path
        this._isBuiltin = isBuiltin
        this._doesImageExist = doesImageExist
    }

    convert(json: LayerConfigJson, context: ConversionContext): LayerConfigJson {
        context = context.inOperation(this.name)
        if (typeof json === "string") {
            context.err("This layer hasn't been expanded: " + json)
            return null
        }

        let layerConfig: LayerConfig
        try {
            layerConfig = new LayerConfig(json, "validation", true)
        } catch (e) {
            context.err(e)
            return undefined
        }
        for (const [_, code, __] of layerConfig.calculatedTags ?? []) {
            try {
                new Function("feat", "return " + code + ";")
            } catch (e) {
                throw `Invalid function definition: the custom javascript is invalid:${e} (at ${context}). The offending javascript code is:\n    ${code}`
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

        if (json.tagRenderings !== undefined && json.tagRenderings.length > 0) {
            if (json.title === undefined && json.source !== "special:library") {
                context.err(
                    "This layer does not have a title defined but it does have tagRenderings. Not having a title will disable the popups, resulting in an unclickable element. Please add a title. If not having a popup is intended and the tagrenderings need to be kept (e.g. in a library layer), set `title: null` to disable this error."
                )
            }
            if (json.title === null) {
                context.info(
                    "Title is `null`. This results in an element that cannot be clicked - even though tagRenderings is set."
                )
            }
        }

        if (json["builtin"] !== undefined) {
            context.err("This layer hasn't been expanded: " + json)
            return null
        }

        if (json.minzoom > Constants.minZoomLevelToAddNewPoint) {
            const c = context.enter("minzoom")
            const w = json.presets?.length > 0 ? c.err : c.warn
            w(
                `Minzoom is ${json.minzoom}, this should be at most ${Constants.minZoomLevelToAddNewPoint} as a preset is set. Why? Selecting the pin for a new item will zoom in to level before adding the point. Having a greater minzoom will hide the points, resulting in possible duplicates`
            )
        }
        {
            // duplicate ids in tagrenderings check
            const duplicates = Utils.Dedup(
                Utils.Duplicates(Utils.NoNull((json.tagRenderings ?? []).map((tr) => tr["id"])))
            )
            if (duplicates.length > 0) {
                context
                    .enter("tagRenderings")
                    .err("Some tagrenderings have a duplicate id: " + duplicates.join(", "))
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
                        context.err(
                            "Layer " + json.id + " still has a forbidden key " + forbiddenKey
                        )
                }
                if (json["hideUnderlayingFeaturesMinPercentage"] !== undefined) {
                    context.err(
                        "Layer " +
                            json.id +
                            " contains an old 'hideUnderlayingFeaturesMinPercentage'"
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
                    (json.tagRenderings ?? [])
                        ?.map((f) => f["id"])
                        .filter((id) => id !== "questions")
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
                    new Each(
                        new ValidateTagRenderings(json, this._doesImageExist, {
                            noQuestionHintCheck: json["#"]?.indexOf("no-question-hint-check") >= 0,
                        })
                    )
                ).convert(json, context)
            }

            {
                const hasCondition = json.pointRendering?.filter(
                    (mr) => mr["icon"] !== undefined && mr["icon"]["condition"] !== undefined
                )
                if (hasCondition?.length > 0) {
                    context.err(
                        "One or more icons in the mapRenderings have a condition set. Don't do this, as this will result in an invisible but clickable element. Use extra filters in the source instead. The offending mapRenderings are:\n" +
                            JSON.stringify(hasCondition, null, "  ")
                    )
                }
            }

            if (json.presets !== undefined) {
                if (typeof json.source === "string") {
                    context.err("A special layer cannot have presets")
                }
                // Check that a preset will be picked up by the layer itself
                const baseTags = TagUtils.Tag(json.source["osmTags"])
                for (let i = 0; i < json.presets.length; i++) {
                    const preset = json.presets[i]
                    const tags: { k: string; v: string }[] = new And(
                        preset.tags.map((t) => TagUtils.Tag(t))
                    ).asChange({ id: "node/-1" })
                    const properties = {}
                    for (const tag of tags) {
                        properties[tag.k] = tag.v
                    }
                    const doMatch = baseTags.matchesProperties(properties)
                    if (!doMatch) {
                        context
                            .enters("presets", i)
                            .err(
                                "This preset does not match the required tags of this layer. This implies that a newly added point will not show up.\n    A newly created point will have properties: " +
                                    JSON.stringify(properties) +
                                    "\n    The required tags are: " +
                                    baseTags.asHumanString(false, false, {})
                            )
                    }
                }
            }
        } catch (e) {
            context.err(e)
        }

        return json
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
