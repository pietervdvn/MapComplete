import Combine from "../src/UI/Base/Combine"
import BaseUIElement from "../src/UI/BaseUIElement"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { AllKnownLayouts } from "../src/Customizations/AllKnownLayouts"
import SimpleMetaTaggers from "../src/Logic/SimpleMetaTagger"
import SpecialVisualizations from "../src/UI/SpecialVisualizations"
import { ExtraFunctions } from "../src/Logic/ExtraFunctions"
import Title from "../src/UI/Base/Title"
import QueryParameterDocumentation from "../src/UI/QueryParameterDocumentation"
import ScriptUtils from "./ScriptUtils"
import List from "../src/UI/Base/List"
import Translations from "../src/UI/i18n/Translations"
import themeOverview from "../src/assets/generated/theme_overview.json"
import LayoutConfig from "../src/Models/ThemeConfig/LayoutConfig"
import bookcases from "../src/assets/generated/themes/bookcases.json"
import fakedom from "fake-dom"
import unit from "../src/assets/generated/layers/unit.json"
import Hotkeys from "../src/UI/Base/Hotkeys"
import { QueryParameters } from "../src/Logic/Web/QueryParameters"
import Link from "../src/UI/Base/Link"
import Constants from "../src/Models/Constants"
import LayerConfig from "../src/Models/ThemeConfig/LayerConfig"
import DependencyCalculator from "../src/Models/ThemeConfig/DependencyCalculator"
import { AllSharedLayers } from "../src/Customizations/AllSharedLayers"
import ThemeViewState from "../src/Models/ThemeViewState"
import Validators from "../src/UI/InputElement/Validators"
import questions from "../src/assets/generated/layers/questions.json"
import { LayerConfigJson } from "../src/Models/ThemeConfig/Json/LayerConfigJson"
import { Utils } from "../src/Utils"
import { TagUtils } from "../src/Logic/Tags/TagUtils"
import Script from "./Script"
import { Changes } from "../src/Logic/Osm/Changes"
import TableOfContents from "../src/UI/Base/TableOfContents"

/**
 * Converts a markdown-file into a .json file, which a walkthrough/slideshow element can use
 *
 * These are used in the studio
 */
class ToSlideshowJson {
    private readonly _source: string
    private readonly _target: string

    constructor(source: string, target: string) {
        this._source = source
        this._target = target
    }

    public convert() {
        const lines = readFileSync(this._source, "utf8").split("\n")

        const sections: string[][] = []
        let currentSection: string[] = []
        for (let line of lines) {
            if (line.trim().startsWith("# ")) {
                sections.push(currentSection)
                currentSection = []
            }
            line = line.replace("src=\"../../public/", "src=\"./")
            line = line.replace("src=\"../../", "src=\"./")
            currentSection.push(line)
        }
        sections.push(currentSection)
        writeFileSync(
            this._target,
            JSON.stringify({
                sections: sections.map((s) => s.join("\n")).filter((s) => s.length > 0)
            })
        )
    }
}

/**
 * Generates a wiki page with the theme overview
 * The wikitable should be updated regularly as some tools show an overview of apps based on the wiki.
 */
class WikiPageGenerator {
    private readonly _target: string

    constructor(target: string = "Docs/wikiIndex.txt") {
        this._target = target
    }

    generate() {
        let wikiPage =
            "{|class=\"wikitable sortable\"\n" +
            "! Name, link !! Genre !! Covered region !! Language !! Description !! Free materials !! Image\n" +
            "|-"

        for (const layout of themeOverview) {
            if (layout.hideFromOverview) {
                continue
            }
            wikiPage += "\n" + this.generateWikiEntryFor(layout)
        }

        wikiPage += "\n|}"

        writeFileSync(this._target, wikiPage)
    }

    private generateWikiEntryFor(layout: {
        hideFromOverview: boolean
        id: string
        shortDescription: any
    }): string {
        if (layout.hideFromOverview) {
            return ""
        }

        const languagesInDescr = Array.from(Object.keys(layout.shortDescription)).filter(
            (k) => k !== "_context"
        )
        const languages = languagesInDescr.map((ln) => `{{#language:${ln}|en}}`).join(", ")
        let auth = "Yes"
        return `{{service_item
|name= [https://mapcomplete.org/${layout.id} ${layout.id}]
|region= Worldwide
|lang= ${languages}
|descr= A MapComplete theme: ${Translations.T(layout.shortDescription)
            .textFor("en")
            .replace("<a href='", "[[")
            .replace(/'>.*<\/a>/, "]]")}
|material= {{yes|[https://mapcomplete.org/ ${auth}]}}
|image= MapComplete_Screenshot.png
|genre= POI, editor, ${layout.id}
}}`
    }
}

export class GenerateDocs extends Script {
    constructor() {
        super("Generates various documentation files")
    }

    async main(args: string[]) {
        console.log("Starting documentation generation...")
        ScriptUtils.fixUtils()
        if (!existsSync("./Docs/Themes")) {
            mkdirSync("./Docs/Themes")
        }

        this.WriteFile("./Docs/Tags_format.md", TagUtils.generateDocs(), [
            "src/Logic/Tags/TagUtils.ts"
        ])

        new ToSlideshowJson(
            "./Docs/Studio/Introduction.md",
            "./src/assets/studio_introduction.json"
        ).convert()
        new ToSlideshowJson(
            "./Docs/Studio/TagRenderingIntro.md",
            "./src/assets/studio_tagrenderings_intro.json"
        ).convert()

        this.generateHotkeyDocs()
        this.generateBuiltinIndex()
        this.generateQueryParameterDocs()
        this.generateBuiltinQuestions()
        this.generateOverviewsForAllSingleLayer()
        this.generateLayerOverviewText()
        this.generateBuiltinUnits()

        Array.from(AllKnownLayouts.allKnownLayouts.values()).map((theme) => {
            this.generateForTheme(theme)
        })

        this.WriteMarkdownFile("./Docs/SpecialRenderings.md", SpecialVisualizations.HelpMessage(), [
            "src/UI/SpecialVisualizations.ts"
        ])
        this.WriteFile(
            "./Docs/CalculatedTags.md",
            new Combine([
                new Title("Metatags", 1),
                SimpleMetaTaggers.HelpText(),
                ExtraFunctions.HelpText()
            ]).SetClass("flex-col"),
            ["src/Logic/SimpleMetaTagger.ts", "src/Logic/ExtraFunctions.ts"]
        )
        this.WriteFile("./Docs/SpecialInputElements.md", Validators.HelpText(), [
            "src/UI/InputElement/Validators.ts"
        ])

        this.WriteFile("./Docs/ChangesetMeta.md", Changes.getDocs(), [
            "src/Logic/Osm/Changes.ts",
            "src/Logic/Osm/ChangesetHandler.ts"
        ])
        new WikiPageGenerator().generate()

        console.log("Generated docs")
    }

    /**
     * @deprecated
     */
    private WriteFile(
        filename,
        html: string | BaseUIElement,
        autogenSource: string[],
        options?: {
            noTableOfContents: boolean
        }
    ): void {
        if (!html) {
            return
        }

        let md = new Combine([
            Translations.W(html),
            "\n\nThis document is autogenerated from " +
            autogenSource
                .map(
                    (file) =>
                        `[${file}](https://github.com/pietervdvn/MapComplete/blob/develop/${file})`
                )
                .join(", ")
        ]).AsMarkdown()
        this.WriteMarkdownFile(filename, md, autogenSource, options)
    }


    private WriteMarkdownFile(
        filename: string,
        markdown: string,
        autogenSource: string[],
        options?: {
            noTableOfContents: boolean
        }
    ): void {
        for (const source of autogenSource) {
            if (source.indexOf("*") > 0) {
                continue
            }
            if (!existsSync(source)) {
                throw (
                    "While creating a documentation file and checking that the generation sources are properly linked: source file " +
                    source +
                    " was not found. Typo?"
                )
            }
        }


        let md = markdown

        if (options?.noTableOfContents !== false) {
           md = TableOfContents.insertTocIntoMd(md)
        }

        md.replace(/\n\n\n+/g, "\n\n")

        if (!md.endsWith("\n")) {
            md += "\n"
        }

        const warnAutomated =
            "[//]: # (WARNING: this file is automatically generated. Please find the sources at the bottom and edit those sources)\n\n"

        writeFileSync(filename, warnAutomated + md)
    }

    private generateHotkeyDocs() {
        new ThemeViewState(new LayoutConfig(<any>bookcases), new Set())
        this.WriteFile("./Docs/Hotkeys.md", Hotkeys.generateDocumentation(), [])
    }

    private generateBuiltinUnits() {
        const layer = new LayerConfig(<LayerConfigJson>unit, "units", true)
        const els: (BaseUIElement | string)[] = [new Title(layer.id, 2)]

        for (const unit of layer.units) {
            els.push(new Title(unit.quantity))
            for (const denomination of unit.denominations) {
                els.push(new Title(denomination.canonical, 4))
                if (denomination.useIfNoUnitGiven === true) {
                    els.push("*Default denomination*")
                } else if (
                    denomination.useIfNoUnitGiven &&
                    denomination.useIfNoUnitGiven.length > 0
                ) {
                    els.push("Default denomination in the following countries:")
                    els.push(new List(denomination.useIfNoUnitGiven))
                }
                if (denomination.prefix) {
                    els.push("Prefixed")
                }
                if (denomination.alternativeDenominations.length > 0) {
                    els.push(
                        "Alternative denominations:",
                        new List(denomination.alternativeDenominations)
                    )
                }
            }
        }

        this.WriteFile("./Docs/builtin_units.md", new Combine([new Title("Units", 1), ...els]), [
            `assets/layers/unit/unit.json`
        ])
    }

    /**
     * Generates documentation for the all the individual layers.
     * Inline layers are included (if the theme is public)
     */
    private generateOverviewsForAllSingleLayer(): void {
        const allLayers: LayerConfig[] = Array.from(AllSharedLayers.sharedLayers.values()).filter(
            (layer) => layer["source"] !== null
        )
        const builtinLayerIds: Set<string> = new Set<string>()
        allLayers.forEach((l) => builtinLayerIds.add(l.id))
        const inlineLayers = new Map<string, string>()

        for (const layout of Array.from(AllKnownLayouts.allKnownLayouts.values())) {
            if (layout.hideFromOverview) {
                continue
            }

            for (const layer of layout.layers) {
                if (layer.source === null) {
                    continue
                }
                if (builtinLayerIds.has(layer.id)) {
                    continue
                }
                if (layer.source.geojsonSource !== undefined) {
                    // Not an OSM-source
                    continue
                }
                allLayers.push(layer)
                builtinLayerIds.add(layer.id)
                inlineLayers.set(layer.id, layout.id)
            }
        }

        const themesPerLayer = new Map<string, string[]>()

        for (const layout of Array.from(AllKnownLayouts.allKnownLayouts.values())) {
            for (const layer of layout.layers) {
                if (!builtinLayerIds.has(layer.id)) {
                    // This is an inline layer
                    continue
                }
                if (!themesPerLayer.has(layer.id)) {
                    themesPerLayer.set(layer.id, [])
                }
                themesPerLayer.get(layer.id).push(layout.id)
            }
        }

        // Determine the cross-dependencies
        const layerIsNeededBy: Map<string, string[]> = new Map<string, string[]>()

        for (const layer of allLayers) {
            for (const dep of DependencyCalculator.getLayerDependencies(layer)) {
                const dependency = dep.neededLayer
                if (!layerIsNeededBy.has(dependency)) {
                    layerIsNeededBy.set(dependency, [])
                }
                layerIsNeededBy.get(dependency).push(layer.id)
            }
        }

        allLayers.forEach((layer) => {
            const element = layer.GenerateDocumentation(
                themesPerLayer.get(layer.id),
                layerIsNeededBy,
                DependencyCalculator.getLayerDependencies(layer)
            )
            const inlineSource = inlineLayers.get(layer.id)
            ScriptUtils.erasableLog("Exporting layer documentation for", layer.id)
            if (!existsSync("./Docs/Layers")) {
                mkdirSync("./Docs/Layers")
            }
            let source: string = `assets/layers/${layer.id}/${layer.id}.json`
            if (inlineSource !== undefined) {
                source = `assets/themes/${inlineSource}/${inlineSource}.json`
            }
            this.WriteFile("./Docs/Layers/" + layer.id + ".md", element, [source])
        })
    }

    /**
     *  Generate the builtinIndex which shows interlayer dependencies
     * @private
     */

    private generateBuiltinIndex() {
        const layers = ScriptUtils.getLayerFiles().map((f) => f.parsed)
        const builtinsPerLayer = new Map<string, string[]>()
        const layersUsingBuiltin = new Map<string /* Builtin */, string[]>()
        for (const layer of layers) {
            if (layer.tagRenderings === undefined) {
                continue
            }
            const usedBuiltins: string[] = []
            for (const tagRendering of layer.tagRenderings) {
                if (typeof tagRendering === "string") {
                    usedBuiltins.push(tagRendering)
                    continue
                }
                if (tagRendering["builtin"] !== undefined) {
                    const builtins = tagRendering["builtin"]
                    if (typeof builtins === "string") {
                        usedBuiltins.push(builtins)
                    } else {
                        usedBuiltins.push(...builtins)
                    }
                }
            }
            for (const usedBuiltin of usedBuiltins) {
                const usingLayers = layersUsingBuiltin.get(usedBuiltin)
                if (usingLayers === undefined) {
                    layersUsingBuiltin.set(usedBuiltin, [layer.id])
                } else {
                    usingLayers.push(layer.id)
                }
            }

            builtinsPerLayer.set(layer.id, usedBuiltins)
        }

        let docs =`
            # Index of builtin TagRenderings
            ## Existing builtin tagrenderings
        `

        for (const [builtin, usedByLayers] of Array.from(layersUsingBuiltin.entries())) {
            docs += `
            ### ${builtin}

            ${usedByLayers.map(item => " - "+item).join("\n")}
            `
        }
        this.WriteMarkdownFile("./Docs/BuiltinIndex.md", docs, ["assets/layers/*.json"])
    }

    private generateQueryParameterDocs() {
        if (fakedom === undefined) {
            throw "FakeDom not initialized"
        }
        QueryParameters.GetQueryParameter(
            "mode",
            "map",
            "The mode the application starts in, e.g. 'map', 'dashboard' or 'statistics'"
        )

        this.WriteFile(
            "./Docs/URL_Parameters.md",
            QueryParameterDocumentation.GenerateQueryParameterDocs(),
            ["src/Logic/Web/QueryParameters.ts", "src/UI/QueryParameterDocumentation.ts"]
        )
    }

    private generateBuiltinQuestions() {
        const qLayer = new LayerConfig(<LayerConfigJson>questions, "questions.json", true)
        this.WriteFile(
            "./Docs/BuiltinQuestions.md",
            qLayer.GenerateDocumentation([], new Map(), []),
            ["assets/layers/questions/questions.json"]
        )
    }

    private generateForTheme(theme: LayoutConfig): void {
        const el = new Combine([
            new Title(
                new Combine([
                    theme.title,
                    "(",
                    new Link(theme.id, "https://mapcomplete.org/" + theme.id),
                    ")"
                ]),
                2
            ),
            theme.description,
            "This theme contains the following layers:",
            new List(
                theme.layers
                    .filter((l) => !l.id.startsWith("note_import_"))
                    .map((l) => new Link(l.id, "../Layers/" + l.id + ".md"))
            ),
            "Available languages:",
            new List(theme.language.filter((ln) => ln !== "_context"))
        ]).SetClass("flex flex-col")
        this.WriteFile(
            "./Docs/Themes/" + theme.id + ".md",
            el,
            [`assets/themes/${theme.id}/${theme.id}.json`],
            { noTableOfContents: true }
        )
    }

    /**
     * Generates the documentation for the layers overview page
     * @constructor
     */
    private generateLayerOverviewText(): BaseUIElement {
        for (const id of Constants.priviliged_layers) {
            if (!AllSharedLayers.sharedLayers.has(id)) {
                console.error("Priviliged layer definition not found: " + id)
                return undefined
            }
        }

        const allLayers: LayerConfig[] = Array.from(AllSharedLayers.sharedLayers.values()).filter(
            (layer) => layer["source"] === null
        )

        const builtinLayerIds: Set<string> = new Set<string>()
        allLayers.forEach((l) => builtinLayerIds.add(l.id))

        const themesPerLayer = new Map<string, string[]>()

        for (const layout of Array.from(AllKnownLayouts.allKnownLayouts.values())) {
            for (const layer of layout.layers) {
                if (!builtinLayerIds.has(layer.id)) {
                    continue
                }
                if (!themesPerLayer.has(layer.id)) {
                    themesPerLayer.set(layer.id, [])
                }
                themesPerLayer.get(layer.id).push(layout.id)
            }
        }

        // Determine the cross-dependencies
        const layerIsNeededBy: Map<string, string[]> = new Map<string, string[]>()

        for (const layer of allLayers) {
            for (const dep of DependencyCalculator.getLayerDependencies(layer)) {
                const dependency = dep.neededLayer
                if (!layerIsNeededBy.has(dependency)) {
                    layerIsNeededBy.set(dependency, [])
                }
                layerIsNeededBy.get(dependency).push(layer.id)
            }
        }

        const el = new Combine([
            new Title("Special and other useful layers", 1),
            "MapComplete has a few data layers available in the theme which have special properties through builtin-hooks. Furthermore, there are some normal layers (which are built from normal Theme-config files) but are so general that they get a mention here.",
            new Title("Priviliged layers", 1),
            new List(Constants.priviliged_layers.map((id) => "[" + id + "](#" + id + ")")),
            ...Utils.NoNull(
                Constants.priviliged_layers.map((id) => AllSharedLayers.sharedLayers.get(id))
            ).map((l) =>
                l.GenerateDocumentation(
                    themesPerLayer.get(l.id),
                    layerIsNeededBy,
                    DependencyCalculator.getLayerDependencies(l),
                    Constants.added_by_default.indexOf(<any>l.id) >= 0,
                    Constants.no_include.indexOf(<any>l.id) < 0
                )
            ),
            new Title("Normal layers", 1),
            "The following layers are included in MapComplete:",
            new List(
                Array.from(AllSharedLayers.sharedLayers.keys()).map(
                    (id) => new Link(id, "./Layers/" + id + ".md")
                )
            )
        ])
        this.WriteFile("./Docs/BuiltinLayers.md", el, ["src/Customizations/AllKnownLayouts.ts"])
    }
}

new GenerateDocs().run()
