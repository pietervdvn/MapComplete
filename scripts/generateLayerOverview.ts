import ScriptUtils from "./ScriptUtils"
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "fs"
import licenses from "../src/assets/generated/license_info.json"
import { LayoutConfigJson } from "../src/Models/ThemeConfig/Json/LayoutConfigJson"
import { LayerConfigJson } from "../src/Models/ThemeConfig/Json/LayerConfigJson"
import Constants from "../src/Models/Constants"
import {
    DetectDuplicateFilters,
    DoesImageExist,
    PrevalidateTheme,
    ValidateLayer,
    ValidateThemeAndLayers,
    ValidateThemeEnsemble,
} from "../src/Models/ThemeConfig/Conversion/Validation"
import { Translation } from "../src/UI/i18n/Translation"
import { PrepareLayer } from "../src/Models/ThemeConfig/Conversion/PrepareLayer"
import { PrepareTheme } from "../src/Models/ThemeConfig/Conversion/PrepareTheme"
import {
    Conversion,
    DesugaringContext,
    DesugaringStep,
} from "../src/Models/ThemeConfig/Conversion/Conversion"
import { Utils } from "../src/Utils"
import Script from "./Script"
import { AllSharedLayers } from "../src/Customizations/AllSharedLayers"
import { parse as parse_html } from "node-html-parser"
import { ExtraFunctions } from "../src/Logic/ExtraFunctions"
import { QuestionableTagRenderingConfigJson } from "../src/Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson"
import LayerConfig from "../src/Models/ThemeConfig/LayerConfig"
import PointRenderingConfig from "../src/Models/ThemeConfig/PointRenderingConfig"
import { ConversionContext } from "../src/Models/ThemeConfig/Conversion/ConversionContext"
import { GenerateFavouritesLayer } from "./generateFavouritesLayer"
import LayoutConfig from "../src/Models/ThemeConfig/LayoutConfig"

// This scripts scans 'src/assets/layers/*.json' for layer definition files and 'src/assets/themes/*.json' for theme definition files.
// It spits out an overview of those to be used to load them

class ParseLayer extends Conversion<
    string,
    {
        parsed: LayerConfig
        raw: LayerConfigJson
    }
> {
    private readonly _prepareLayer: PrepareLayer
    private readonly _doesImageExist: DoesImageExist
    private readonly _options: { readonly addExpandedTagRenderingsToContext?: boolean }

    constructor(prepareLayer: PrepareLayer, doesImageExist: DoesImageExist) {
        super("Parsed a layer from file, validates it", [], "ParseLayer")
        this._prepareLayer = prepareLayer
        this._doesImageExist = doesImageExist
    }

    convert(
        path: string,
        context: ConversionContext
    ): {
        parsed: LayerConfig
        raw: LayerConfigJson
    } {
        let parsed
        let fileContents
        try {
            fileContents = readFileSync(path, "utf8")
        } catch (e) {
            context.err("Could not read file " + path + " due to " + e)
            return undefined
        }
        try {
            parsed = JSON.parse(fileContents)
        } catch (e) {
            context.err("Could not parse file as JSON: " + e)
            return undefined
        }
        if (parsed === undefined) {
            context.err("yielded undefined")
            return undefined
        }
        const fixed = this._prepareLayer.convert(parsed, context.inOperation("PrepareLayer"))

        if (!fixed.source) {
            context.enter("source").err("No source is configured")
            return undefined
        }

        if (
            typeof fixed.source !== "string" &&
            fixed.source["osmTags"] &&
            fixed.source["osmTags"]["and"] === undefined
        ) {
            fixed.source["osmTags"] = { and: [fixed.source["osmTags"]] }
        }

        const validator = new ValidateLayer(path, true, this._doesImageExist)
        return validator.convert(fixed, context.inOperation("ValidateLayer"))
    }
}

class AddIconSummary extends DesugaringStep<{ raw: LayerConfigJson; parsed: LayerConfig }> {
    static singleton = new AddIconSummary()

    constructor() {
        super("Adds an icon summary for quick reference", ["_layerIcon"], "AddIconSummary")
    }

    convert(json: { raw: LayerConfigJson; parsed: LayerConfig }, context: ConversionContext) {
        // Add a summary of the icon
        const fixed = json.raw
        const layerConfig = json.parsed
        const pointRendering: PointRenderingConfig = layerConfig.mapRendering.find((pr) =>
            pr.location.has("point")
        )
        const defaultTags = layerConfig.GetBaseTags()
        fixed["_layerIcon"] = Utils.NoNull(
            (pointRendering?.marker ?? []).map((i) => {
                const icon = i.icon?.GetRenderValue(defaultTags)?.txt
                if (!icon) {
                    return undefined
                }
                const result = { icon }
                const c = i.color?.GetRenderValue(defaultTags)?.txt
                if (c) {
                    result["color"] = c
                }
                return result
            })
        )
        return { raw: fixed, parsed: layerConfig }
    }
}

class LayerOverviewUtils extends Script {
    public static readonly layerPath = "./src/assets/generated/layers/"
    public static readonly themePath = "./src/assets/generated/themes/"

    constructor() {
        super("Reviews and generates the compiled themes")
    }

    private static publicLayerIdsFrom(themefiles: LayoutConfigJson[]): Set<string> {
        const publicThemes = [].concat(...themefiles.filter((th) => !th.hideFromOverview))

        return new Set([].concat(...publicThemes.map((th) => this.extractLayerIdsFrom(th))))
    }

    private static extractLayerIdsFrom(
        themeFile: LayoutConfigJson,
        includeInlineLayers = true
    ): string[] {
        const publicLayerIds = []
        if (!Array.isArray(themeFile.layers)) {
            throw (
                "Cannot iterate over 'layers' of " +
                themeFile.id +
                "; it is a " +
                typeof themeFile.layers
            )
        }
        for (const publicLayer of themeFile.layers) {
            if (typeof publicLayer === "string") {
                publicLayerIds.push(publicLayer)
                continue
            }
            if (publicLayer["builtin"] !== undefined) {
                const bi = publicLayer["builtin"]
                if (typeof bi === "string") {
                    publicLayerIds.push(bi)
                    continue
                }
                bi.forEach((id) => publicLayerIds.push(id))
                continue
            }
            if (includeInlineLayers) {
                publicLayerIds.push(publicLayer["id"])
            }
        }
        return publicLayerIds
    }

    shouldBeUpdated(sourcefile: string | string[], targetfile: string): boolean {
        if (!existsSync(targetfile)) {
            return true
        }
        const targetModified = statSync(targetfile).mtime
        if (typeof sourcefile === "string") {
            sourcefile = [sourcefile]
        }

        for (const path of sourcefile) {
            const hasChange = statSync(path).mtime > targetModified
            if (hasChange) {
                console.log("File ", targetfile, " should be updated as ", path, "has been changed")
                return true
            }
        }
        return false
    }

    writeSmallOverview(
        themes: {
            id: string
            title: any
            shortDescription: any
            icon: string
            hideFromOverview: boolean
            mustHaveLanguage: boolean
            layers: (
                | LayerConfigJson
                | string
                | {
                      builtin
                  }
            )[]
        }[]
    ) {
        const perId = new Map<string, any>()
        for (const theme of themes) {
            const keywords: {}[] = []
            for (const layer of theme.layers ?? []) {
                const l = <LayerConfigJson>layer
                keywords.push({ "*": l.id })
                keywords.push(l.title)
                keywords.push(l.description)
            }

            const data = {
                id: theme.id,
                title: theme.title,
                shortDescription: theme.shortDescription,
                icon: theme.icon,
                hideFromOverview: theme.hideFromOverview,
                mustHaveLanguage: theme.mustHaveLanguage,
                keywords: Utils.NoNull(keywords),
            }
            perId.set(theme.id, data)
        }

        const sorted = Constants.themeOrder.map((id) => {
            if (!perId.has(id)) {
                throw "Ordered theme id " + id + " not found"
            }
            return perId.get(id)
        })

        perId.forEach((value) => {
            if (Constants.themeOrder.indexOf(value.id) >= 0) {
                return // actually a continue
            }
            sorted.push(value)
        })

        writeFileSync(
            "./src/assets/generated/theme_overview.json",
            JSON.stringify(sorted, null, "  "),
            { encoding: "utf8" }
        )
    }

    writeTheme(theme: LayoutConfigJson) {
        if (!existsSync(LayerOverviewUtils.themePath)) {
            mkdirSync(LayerOverviewUtils.themePath)
        }

        writeFileSync(
            `${LayerOverviewUtils.themePath}${theme.id}.json`,
            JSON.stringify(theme, null, "  "),
            { encoding: "utf8" }
        )
    }

    writeLayer(layer: LayerConfigJson) {
        if (!existsSync(LayerOverviewUtils.layerPath)) {
            mkdirSync(LayerOverviewUtils.layerPath)
        }
        writeFileSync(
            `${LayerOverviewUtils.layerPath}${layer.id}.json`,
            JSON.stringify(layer, null, "  "),
            { encoding: "utf8" }
        )
    }

    getSharedTagRenderings(
        doesImageExist: DoesImageExist,
        bootstrapTagRenderings: Map<string, QuestionableTagRenderingConfigJson> = null
    ): Map<string, QuestionableTagRenderingConfigJson> {
        const prepareLayer = new PrepareLayer({
            tagRenderings: bootstrapTagRenderings,
            sharedLayers: null,
            publicLayers: null,
        }, {
            addTagRenderingsToContext: true
        })

        const path = "assets/layers/questions/questions.json"
        const sharedQuestions = this.parseLayer(doesImageExist, prepareLayer, path).raw

        const dict = new Map<string, QuestionableTagRenderingConfigJson>()

        for (const tr of sharedQuestions.tagRenderings) {
            const tagRendering = <QuestionableTagRenderingConfigJson>tr
            dict.set(tagRendering["id"], tagRendering)
        }

        if (dict.size === bootstrapTagRenderings?.size) {
            return dict
        }

        return this.getSharedTagRenderings(doesImageExist, dict)
    }

    checkAllSvgs() {
        const allSvgs = ScriptUtils.readDirRecSync("./src/assets")
            .filter((path) => path.endsWith(".svg"))
            .filter((path) => !path.startsWith("./src/assets/generated"))
        let errCount = 0
        const exempt = [
            "src/assets/SocialImageTemplate.svg",
            "src/assets/SocialImageTemplateWide.svg",
            "src/assets/SocialImageBanner.svg",
            "src/assets/SocialImageRepo.svg",
            "src/assets/svg/osm-logo.svg",
            "src/assets/templates/*",
        ]
        for (const path of allSvgs) {
            if (
                exempt.some((p) => {
                    if (p.endsWith("*") && path.startsWith("./" + p.substring(0, p.length - 1))) {
                        return true
                    }
                    return "./" + p === path
                })
            ) {
                continue
            }

            const contents = readFileSync(path, { encoding: "utf8" })
            if (contents.indexOf("data:image/png;") >= 0) {
                console.warn("The SVG at " + path + " is a fake SVG: it contains PNG data!")
                errCount++
                if (path.startsWith("./src/assets/svg")) {
                    throw "A core SVG is actually a PNG. Don't do this!"
                }
            }
            if (contents.indexOf("<text") > 0) {
                console.warn(
                    "The SVG at " +
                        path +
                        " contains a `text`-tag. This is highly discouraged. Every machine viewing your theme has their own font libary, and the font you choose might not be present, resulting in a different font being rendered. Solution: open your .svg in inkscape (or another program), select the text and convert it to a path"
                )
                errCount++
            }
        }
        if (errCount > 0) {
            throw `There are ${errCount} invalid svgs`
        }
    }

    async main(args: string[]) {
        console.log("Generating layer overview...")
        const themeWhitelist = new Set(
            args
                .find((a) => a.startsWith("--themes="))
                ?.substring("--themes=".length)
                ?.split(",") ?? []
        )

        const layerWhitelist = new Set(
            args
                .find((a) => a.startsWith("--layers="))
                ?.substring("--layers=".length)
                ?.split(",") ?? []
        )

        const forceReload = args.some((a) => a == "--force")

        const licensePaths = new Set<string>()
        for (const i in licenses) {
            licensePaths.add(licenses[i].path)
        }
        const doesImageExist = new DoesImageExist(licensePaths, existsSync)
        const sharedLayers = this.buildLayerIndex(doesImageExist, forceReload, layerWhitelist)

        const priviliged = new Set<string>(Constants.priviliged_layers)
        sharedLayers.forEach((_, key) => {
            priviliged.delete(key)
        })
        if (priviliged.size > 0) {
            throw (
                "Priviliged layer " +
                Array.from(priviliged).join(", ") +
                " has no definition file, create it at `src/assets/layers/<layername>/<layername.json>"
            )
        }
        const recompiledThemes: string[] = []
        const sharedThemes = this.buildThemeIndex(
            licensePaths,
            sharedLayers,
            recompiledThemes,
            forceReload,
            themeWhitelist
        )

        new ValidateThemeEnsemble().convertStrict(
            Array.from(sharedThemes.values()).map((th) => new LayoutConfig(th, true))
        )

        if (recompiledThemes.length > 0) {
            writeFileSync(
                "./src/assets/generated/known_layers.json",
                JSON.stringify({
                    layers: Array.from(sharedLayers.values()).filter((l) => l.id !== "favourite"),
                })
            )
        }

        const mcChangesPath = "./assets/themes/mapcomplete-changes/mapcomplete-changes.json"
        if (
            (recompiledThemes.length > 0 &&
                !(
                    recompiledThemes.length === 1 && recompiledThemes[0] === "mapcomplete-changes"
                )) ||
            args.indexOf("--generate-change-map") >= 0 ||
            !existsSync(mcChangesPath)
        ) {
            // mapcomplete-changes shows an icon for each corresponding mapcomplete-theme
            const iconsPerTheme = Array.from(sharedThemes.values()).map((th) => ({
                if: "theme=" + th.id,
                then: th.icon,
            }))
            const proto: LayoutConfigJson = JSON.parse(
                readFileSync("./assets/themes/mapcomplete-changes/mapcomplete-changes.proto.json", {
                    encoding: "utf8",
                })
            )
            const protolayer = <LayerConfigJson>(
                proto.layers.filter((l) => l["id"] === "mapcomplete-changes")[0]
            )
            const rendering = protolayer.pointRendering[0]
            rendering.marker[0].icon["mappings"] = iconsPerTheme
            writeFileSync(mcChangesPath, JSON.stringify(proto, null, "  "))
        }

        this.checkAllSvgs()

        new DetectDuplicateFilters().convertStrict(
            {
                layers: ScriptUtils.getLayerFiles().map((f) => f.parsed),
                themes: ScriptUtils.getThemeFiles().map((f) => f.parsed),
            },
            ConversionContext.construct([], [])
        )

        for (const [_, theme] of sharedThemes) {
            theme.layers = theme.layers.filter(
                (l) => Constants.added_by_default.indexOf(l["id"]) < 0
            )
        }

        if (recompiledThemes.length > 0) {
            writeFileSync(
                "./src/assets/generated/known_themes.json",
                JSON.stringify({
                    themes: Array.from(sharedThemes.values()),
                })
            )
        }

        if (AllSharedLayers.getSharedLayersConfigs().size == 0) {
            console.error("This was a bootstrapping-run. Run generate layeroverview again!")
        }
    }

    private parseLayer(
        doesImageExist: DoesImageExist,
        prepLayer: PrepareLayer,
        sharedLayerPath: string
    ): {
        raw: LayerConfigJson
        parsed: LayerConfig
        context: ConversionContext
    } {
        const parser = new ParseLayer(prepLayer, doesImageExist)
        const context = ConversionContext.construct([sharedLayerPath], ["ParseLayer"])
        const parsed = parser.convertStrict(sharedLayerPath, context)
        const result = AddIconSummary.singleton.convertStrict(
            parsed,
            context.inOperation("AddIconSummary")
        )
        return { ...result, context }
    }

    private buildLayerIndex(
        doesImageExist: DoesImageExist,
        forceReload: boolean,
        whitelist: Set<string>
    ): Map<string, LayerConfigJson> {
        // First, we expand and validate all builtin layers. These are written to src/assets/generated/layers
        // At the same time, an index of available layers is built.
        console.log("------------- VALIDATING THE BUILTIN QUESTIONS ---------------")
        const sharedTagRenderings = this.getSharedTagRenderings(doesImageExist)
        console.log("Shared questions are:", Array.from(sharedTagRenderings.keys()).join(", "))
        console.log("   ---------- VALIDATING BUILTIN LAYERS ---------")
        const state: DesugaringContext = {
            tagRenderings: sharedTagRenderings,
            sharedLayers: AllSharedLayers.getSharedLayersConfigs(),
        }
        const sharedLayers = new Map<string, LayerConfigJson>()
        const prepLayer = new PrepareLayer(state)
        const skippedLayers: string[] = []
        const recompiledLayers: string[] = []
        let warningCount = 0
        for (const sharedLayerPath of ScriptUtils.getLayerPaths()) {
            if (whitelist.size > 0) {
                const idByPath = sharedLayerPath.split("/").at(-1).split(".")[0]
                if (
                    Constants.priviliged_layers.indexOf(<any>idByPath) < 0 &&
                    !whitelist.has(idByPath)
                ) {
                    continue
                }
            }
            {
                const targetPath =
                    LayerOverviewUtils.layerPath +
                    sharedLayerPath.substring(sharedLayerPath.lastIndexOf("/"))
                if (!forceReload && !this.shouldBeUpdated(sharedLayerPath, targetPath)) {
                    const sharedLayer = JSON.parse(readFileSync(targetPath, "utf8"))
                    sharedLayers.set(sharedLayer.id, sharedLayer)
                    skippedLayers.push(sharedLayer.id)
                    ScriptUtils.erasableLog("Loaded " + sharedLayer.id)
                    continue
                }
            }

            const parsed = this.parseLayer(doesImageExist, prepLayer, sharedLayerPath)
            warningCount += parsed.context.getAll("warning").length
            const fixed = parsed.raw
            if (sharedLayers.has(fixed.id)) {
                throw "There are multiple layers with the id " + fixed.id + ", " + sharedLayerPath
            }

            sharedLayers.set(fixed.id, fixed)
            recompiledLayers.push(fixed.id)

            this.writeLayer(fixed)
        }

        console.log(
            "Recompiled layers " +
                recompiledLayers.join(", ") +
                " and skipped " +
                skippedLayers.length +
                " layers. Detected " +
                warningCount +
                " warnings"
        )
        // We always need the calculated tags of 'usersettings', so we export them separately
        this.extractJavascriptCodeForLayer(
            state.sharedLayers.get("usersettings"),
            "./src/Logic/State/UserSettingsMetaTagging.ts"
        )

        return sharedLayers
    }

    /**
     * Given: a fully expanded themeConfigJson
     *
     * Will extract a dictionary of the special code and write it into a javascript file which can be imported.
     * This removes the need for _eval_, allowing for a correct CSP
     * @param themeFile
     * @private
     */
    private extractJavascriptCode(themeFile: LayoutConfigJson) {
        const allCode = [
            "import {Feature} from 'geojson'",
            'import { ExtraFuncType } from "../../../Logic/ExtraFunctions";',
            'import { Utils } from "../../../Utils"',
            "export class ThemeMetaTagging {",
            "   public static readonly themeName = " + JSON.stringify(themeFile.id),
            "",
        ]
        for (const layer of themeFile.layers) {
            const l = <LayerConfigJson>layer
            const id = l.id.replace(/[^a-zA-Z0-9_]/g, "_")
            const code = l.calculatedTags ?? []

            allCode.push(
                "   public metaTaggging_for_" +
                    id +
                    "(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {"
            )
            allCode.push("      const {" + ExtraFunctions.types.join(", ") + "} = helperFunctions")
            for (const line of code) {
                const firstEq = line.indexOf("=")
                let attributeName = line.substring(0, firstEq).trim()
                const expression = line.substring(firstEq + 1)
                const isStrict = attributeName.endsWith(":")
                if (!isStrict) {
                    allCode.push(
                        "      Utils.AddLazyProperty(feat.properties, '" +
                            attributeName +
                            "', () => " +
                            expression +
                            " ) "
                    )
                } else {
                    attributeName = attributeName.substring(0, attributeName.length - 1).trim()
                    allCode.push("      feat.properties['" + attributeName + "'] = " + expression)
                }
            }
            allCode.push("   }")
        }

        const targetDir = "./src/assets/generated/metatagging/"
        if (!existsSync(targetDir)) {
            mkdirSync(targetDir)
        }
        allCode.push("}")

        writeFileSync(targetDir + themeFile.id + ".ts", allCode.join("\n"))
    }

    private extractJavascriptCodeForLayer(l: LayerConfigJson, targetPath?: string) {
        if (!l) {
            return // Probably a bootstrapping run
        }
        let importPath = "../../../"
        if (targetPath) {
            const l = targetPath.split("/")
            if (l.length == 1) {
                importPath = "./"
            } else {
                importPath = ""
                for (let i = 0; i < l.length - 3; i++) {
                    importPath += "../"
                }
            }
        }
        const allCode = [
            `import { Utils } from "${importPath}Utils"`,
            `/** This code is autogenerated - do not edit. Edit ./assets/layers/${l?.id}/${l?.id}.json instead */`,
            "export class ThemeMetaTagging {",
            "   public static readonly themeName = " + JSON.stringify(l.id),
            "",
        ]
        const code = l.calculatedTags ?? []

        allCode.push(
            "   public metaTaggging_for_" + l.id + "(feat: {properties: Record<string, string>}) {"
        )
        for (const line of code) {
            const firstEq = line.indexOf("=")
            let attributeName = line.substring(0, firstEq).trim()
            const expression = line.substring(firstEq + 1)
            const isStrict = attributeName.endsWith(":")
            if (!isStrict) {
                allCode.push(
                    "      Utils.AddLazyProperty(feat.properties, '" +
                        attributeName +
                        "', () => " +
                        expression +
                        " ) "
                )
            } else {
                attributeName = attributeName.substring(0, attributeName.length - 2).trim()
                allCode.push("      feat.properties['" + attributeName + "'] = " + expression)
            }
        }
        allCode.push("   }")
        allCode.push("}")

        const targetDir = "./src/assets/generated/metatagging/"
        if (!targetPath) {
            if (!existsSync(targetDir)) {
                mkdirSync(targetDir)
            }
        }

        writeFileSync(targetPath ?? targetDir + "layer_" + l.id + ".ts", allCode.join("\n"))
    }

    private buildThemeIndex(
        licensePaths: Set<string>,
        sharedLayers: Map<string, LayerConfigJson>,
        recompiledThemes: string[],
        forceReload: boolean,
        whitelist: Set<string>
    ): Map<string, LayoutConfigJson> {
        console.log("   ---------- VALIDATING BUILTIN THEMES ---------")
        const themeFiles = ScriptUtils.getThemeFiles()
        const fixed = new Map<string, LayoutConfigJson>()

        const publicLayers = LayerOverviewUtils.publicLayerIdsFrom(
            themeFiles.map((th) => th.parsed)
        )

        const convertState: DesugaringContext = {
            sharedLayers,
            tagRenderings: this.getSharedTagRenderings(
                new DoesImageExist(licensePaths, existsSync)
            ),
            publicLayers,
        }
        const knownTagRenderings = new Set<string>()
        convertState.tagRenderings.forEach((_, key) => knownTagRenderings.add(key))
        sharedLayers.forEach((layer) => {
            for (const tagRendering of layer.tagRenderings ?? []) {
                if (tagRendering["id"]) {
                    knownTagRenderings.add(layer.id + "." + tagRendering["id"])
                }
                if (tagRendering["labels"]) {
                    for (const label of tagRendering["labels"]) {
                        knownTagRenderings.add(layer.id + "." + label)
                    }
                }
            }
        })

        const skippedThemes: string[] = []

        for (let i = 0; i < themeFiles.length; i++) {
            const themeInfo = themeFiles[i]
            const themePath = themeInfo.path
            let themeFile = themeInfo.parsed
            if (whitelist.size > 0 && !whitelist.has(themeFile.id)) {
                continue
            }

            const targetPath =
                LayerOverviewUtils.themePath + "/" + themePath.substring(themePath.lastIndexOf("/"))

            const usedLayers = Array.from(
                LayerOverviewUtils.extractLayerIdsFrom(themeFile, false)
            ).map((id) => LayerOverviewUtils.layerPath + id + ".json")

            if (!forceReload && !this.shouldBeUpdated([themePath, ...usedLayers], targetPath)) {
                fixed.set(
                    themeFile.id,
                    JSON.parse(
                        readFileSync(LayerOverviewUtils.themePath + themeFile.id + ".json", "utf8")
                    )
                )
                ScriptUtils.erasableLog("Skipping", themeFile.id)
                skippedThemes.push(themeFile.id)
                continue
            }

            recompiledThemes.push(themeFile.id)

            new PrevalidateTheme().convertStrict(
                themeFile,
                ConversionContext.construct([themePath], ["PrepareLayer"])
            )
            try {
                themeFile = new PrepareTheme(convertState, {
                    skipDefaultLayers: true,
                }).convertStrict(
                    themeFile,
                    ConversionContext.construct([themePath], ["PrepareLayer"])
                )
                new ValidateThemeAndLayers(
                    new DoesImageExist(licensePaths, existsSync, knownTagRenderings),
                    themePath,
                    true,
                    knownTagRenderings
                ).convertStrict(
                    themeFile,
                    ConversionContext.construct([themePath], ["PrepareLayer"])
                )

                if (themeFile.icon.endsWith(".svg")) {
                    try {
                        ScriptUtils.ReadSvgSync(themeFile.icon, (svg) => {
                            const width: string = svg.$.width
                            const height: string = svg.$.height
                            const err = themeFile.hideFromOverview ? console.warn : console.error
                            if (width !== height) {
                                const e =
                                    `the icon for theme ${themeFile.id} is not square. Please square the icon at ${themeFile.icon}` +
                                    ` Width = ${width} height = ${height}`
                                err(e)
                            }

                            const w = parseInt(width)
                            const h = parseInt(height)
                            if (w < 370 || h < 370) {
                                const e: string = [
                                    `the icon for theme ${themeFile.id} is too small. Please rescale the icon at ${themeFile.icon}`,
                                    `Even though an SVG is 'infinitely scaleable', the icon should be dimensioned bigger. One of the build steps of the theme does convert the image to a PNG (to serve as PWA-icon) and having a small dimension will cause blurry images.`,
                                    ` Width = ${width} height = ${height}; we recommend a size of at least 500px * 500px and to use a square aspect ratio.`,
                                ].join("\n")
                                err(e)
                            }
                        })
                    } catch (e) {
                        console.error("Could not read " + themeFile.icon + " due to " + e)
                    }
                }

                this.writeTheme(themeFile)
                fixed.set(themeFile.id, themeFile)

                this.extractJavascriptCode(themeFile)
            } catch (e) {
                console.error("ERROR: could not prepare theme " + themePath + " due to " + e)
                throw e
            }
        }

        if (whitelist.size == 0) {
            this.writeSmallOverview(
                Array.from(fixed.values()).map((t) => {
                    return {
                        ...t,
                        hideFromOverview: t.hideFromOverview ?? false,
                        shortDescription:
                            t.shortDescription ??
                            new Translation(t.description)
                                .FirstSentence()
                                .OnEveryLanguage((s) => parse_html(s).textContent).translations,
                        mustHaveLanguage: t.mustHaveLanguage?.length > 0,
                    }
                })
            )
        }

        console.log(
            "Recompiled themes " +
                recompiledThemes.join(", ") +
                " and skipped " +
                skippedThemes.length +
                " themes"
        )

        return fixed
    }
}

new GenerateFavouritesLayer().run()
new LayerOverviewUtils().run()
