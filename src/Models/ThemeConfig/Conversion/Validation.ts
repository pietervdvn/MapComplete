import { Conversion, DesugaringStep, Fuse } from "./Conversion"
import { LayerConfigJson } from "../Json/LayerConfigJson"
import LayerConfig from "../LayerConfig"
import { Utils } from "../../../Utils"
import Constants from "../../Constants"
import { Translation } from "../../../UI/i18n/Translation"
import { LayoutConfigJson } from "../Json/LayoutConfigJson"
import LayoutConfig from "../LayoutConfig"
import { TagRenderingConfigJson } from "../Json/TagRenderingConfigJson"
import { TagUtils } from "../../../Logic/Tags/TagUtils"
import { And } from "../../../Logic/Tags/And"
import FilterConfigJson from "../Json/FilterConfigJson"
import { QuestionableTagRenderingConfigJson } from "../Json/QuestionableTagRenderingConfigJson"
import Validators from "../../../UI/InputElement/Validators"
import TagRenderingConfig from "../TagRenderingConfig"
import { parse as parse_html } from "node-html-parser"
import PresetConfig from "../PresetConfig"
import { TagsFilter } from "../../../Logic/Tags/TagsFilter"
import { Translatable } from "../Json/Translatable"
import { ConversionContext } from "./ConversionContext"
import PointRenderingConfigJson from "../Json/PointRenderingConfigJson"
import { PrevalidateLayer } from "./PrevalidateLayer"

export class ValidateLanguageCompleteness extends DesugaringStep<LayoutConfig> {
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
        if (!Array.isArray(json.layers)) {
            context
                .enter("layers")
                .err(
                    "The 'layers'-field should be an array, but it is not. Did you pase a layer identifier and forget to add the '[' and ']'?"
                )
        }
        if (json.socialImage === "") {
            context.warn("Social image for theme " + json.id + " is the emtpy string")
        }
        if (json["clustering"]) {
            context.warn("Obsolete field `clustering` is still around")
        }

        if (json.layers === undefined) {
            context.err("This theme has no layers defined")
        } else {
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
        super(
            "Checks that, if the tagrendering has a condition, that a mapping is not contradictory to it, i.e. that there are no dead mappings",
            [],
            "DetectMappingsShadowedByCondition"
        )
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
        if (!json.condition && !json.metacondition) {
            return json
        }
        if (!json.mappings || json.mappings?.length == 0) {
            return json
        }
        let conditionJson = json.condition ?? json.metacondition
        if (json.condition !== undefined && json.metacondition !== undefined) {
            conditionJson = { and: [json.condition, json.metacondition] }
        }
        const condition = TagUtils.Tag(conditionJson, context.path.join("."))

        for (let i = 0; i < json.mappings.length; i++) {
            const mapping = json.mappings[i]
            const tagIf = TagUtils.Tag(mapping.if, context.path.join("."))
            const optimized = new And([tagIf, condition]).optimize()
            if (optimized === false) {
                const msg =
                    "Detected a conflicting mapping and condition. The mapping requires tags " +
                    tagIf.asHumanString() +
                    ", yet this can never happen because the set condition requires " +
                    condition.asHumanString()
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

export class ValidatePossibleLinks extends DesugaringStep<string | Record<string, string>> {
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

export class CheckTranslation extends DesugaringStep<Translatable> {
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

export class ValidatePointRendering extends DesugaringStep<PointRenderingConfigJson> {
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
            console.error("Could not parse layer due to", e)
            context.err("Could not parse layer due to: " + e)
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

        if (json.allowMove?.["enableAccuraccy"] !== undefined) {
            context
                .enters("allowMove", "enableAccuracy")
                .err(
                    "`enableAccuracy` is written with two C in the first occurrence and only one in the last"
                )
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
        if (filter === undefined) {
            context.err("Trying to validate a filter, but this filter is undefined")
            return undefined
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
                `This theme has multiple presets which are named:${dups}, namely layers ${layerIds.join(
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
                        `This theme has multiple presets with the same tags: ${presetATags.asHumanString(
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
            if (theme.id === "personal") {
                continue
            }
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
