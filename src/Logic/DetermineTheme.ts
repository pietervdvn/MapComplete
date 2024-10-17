import ThemeConfig from "../Models/ThemeConfig/ThemeConfig"
import { QueryParameters } from "./Web/QueryParameters"
import { AllKnownLayouts } from "../Customizations/AllKnownLayouts"
import { FixedUiElement } from "../UI/Base/FixedUiElement"
import { Utils } from "../Utils"
import LZString from "lz-string"
import { FixLegacyTheme } from "../Models/ThemeConfig/Conversion/LegacyJsonConvert"
import { LayerConfigJson } from "../Models/ThemeConfig/Json/LayerConfigJson"
import known_layers from "../assets/generated/known_layers.json"
import { PrepareTheme } from "../Models/ThemeConfig/Conversion/PrepareTheme"
import licenses from "../assets/generated/license_info.json"
import TagRenderingConfig from "../Models/ThemeConfig/TagRenderingConfig"
import { FixImages } from "../Models/ThemeConfig/Conversion/FixImages"
import questions from "../assets/generated/layers/questions.json"
import { DoesImageExist, PrevalidateTheme } from "../Models/ThemeConfig/Conversion/Validation"
import { DesugaringContext } from "../Models/ThemeConfig/Conversion/Conversion"
import { TagRenderingConfigJson } from "../Models/ThemeConfig/Json/TagRenderingConfigJson"
import Hash from "./Web/Hash"
import { QuestionableTagRenderingConfigJson } from "../Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson"
import { ThemeConfigJson } from "../Models/ThemeConfig/Json/ThemeConfigJson"
import { ValidateThemeAndLayers } from "../Models/ThemeConfig/Conversion/ValidateThemeAndLayers"

export default class DetermineTheme {
    private static readonly _knownImages = new Set(Array.from(licenses).map((l) => l.path))
    private static readonly loadCustomThemeParam = QueryParameters.GetQueryParameter(
        "userlayout",
        "false",
        "If the parameter is an URL, it should point to a .json of a theme which will be loaded and used"
    )

    public static getCustomDefinition(): string {
        const layoutFromBase64 = decodeURIComponent(DetermineTheme.loadCustomThemeParam.data)

        if (layoutFromBase64.startsWith("http")) {
            return layoutFromBase64
        }

        return undefined
    }

    private static async expandRemoteLayers(
        layoutConfig: ThemeConfigJson
    ): Promise<ThemeConfigJson> {
        if (!layoutConfig.layers) {
            // This is probably a layer in 'layer-only-mode'
            return layoutConfig
        }
        for (let i = 0; i < layoutConfig.layers.length; i++) {
            const l = layoutConfig.layers[i]
            if (typeof l !== "string") {
                continue
            }
            try {
                new URL(l)
                console.log("Downloading remote layer " + l)
                layoutConfig.layers[i] = <LayerConfigJson>await Utils.downloadJson(l)
            } catch (_) {
                continue
            }
        }
        return layoutConfig
    }

    /**
     * Gets the correct layout for this website
     */
    public static async getTheme(): Promise<ThemeConfig | undefined> {
        const layoutFromBase64 = decodeURIComponent(DetermineTheme.loadCustomThemeParam.data)

        if (layoutFromBase64.startsWith("http")) {
            return await DetermineTheme.LoadRemoteTheme(layoutFromBase64)
        }

        let layoutId: string = undefined

        const path = window.location.pathname.split("/").slice(-1)[0]
        if (path !== "theme.html" && path !== "") {
            layoutId = path
            if (path.endsWith(".html")) {
                layoutId = path.substr(0, path.length - 5)
            }
            console.log("Using layout", layoutId)
        }
        layoutId = QueryParameters.GetQueryParameter(
            "layout",
            layoutId,
            "The layout to load into MapComplete"
        ).data
        const id = layoutId?.toLowerCase()
        const layouts = AllKnownLayouts.allKnownLayouts
        if (layouts.size() == 0) {
            throw "Build failed or running, no layouts are known at all"
        }
        if (layouts.getConfig(id) === undefined) {
            const alternatives = Utils.sortedByLevenshteinDistance(
                id,
                Array.from(layouts.keys()),
                (i) => i
            ).slice(0, 3)
            const msg = `No builtin map theme with name ${layoutId} exists. Perhaps you meant one of ${alternatives.join(
                ", "
            )}`
            throw msg
        }
        return layouts.get(id)
    }

    private static getSharedTagRenderings(): Map<string, QuestionableTagRenderingConfigJson> {
        const dict = new Map<string, QuestionableTagRenderingConfigJson>()

        for (const tagRendering of questions.tagRenderings) {
            dict.set(tagRendering.id, <QuestionableTagRenderingConfigJson> tagRendering)
        }

        return dict
    }

    private static getSharedTagRenderingOrder(): string[] {
        return questions.tagRenderings.map((tr) => tr.id)
    }

    private static prepCustomTheme(json: any, sourceUrl?: string, forceId?: string): ThemeConfig {
        if (json.layers === undefined && json.tagRenderings !== undefined) {
            // We got fed a layer instead of a theme
            const layerConfig = <LayerConfigJson>json
            let icon = Utils.NoNull(
                layerConfig.pointRendering
                    .flatMap((pr) => pr.marker)
                    .map((iconSpec) => {
                        if (!iconSpec) {
                            return undefined
                        }
                        const icon = new TagRenderingConfig(<TagRenderingConfigJson>iconSpec.icon)
                            .render.txt
                        if (
                            iconSpec.color === undefined ||
                            icon.startsWith("http:") ||
                            icon.startsWith("https:")
                        ) {
                            return icon
                        }
                        const color = new TagRenderingConfig(<TagRenderingConfigJson>iconSpec.color)
                            .render.txt
                        return icon + ":" + color
                    })
            ).join(";")

            if (!icon) {
                icon = "./assets/svg/bug.svg"
            }

            json = {
                id: json.id,
                description: json.description,
                descriptionTail: {
                    en: "<div class='alert'>Layer only mode.</div> The loaded custom theme actually isn't a custom theme, but only contains a layer.",
                },
                icon,
                title: json.name,
                layers: [json],
            }
        }

        const knownLayersDict = new Map<string, LayerConfigJson>()
        for (const key in known_layers["layers"]) {
            const layer = known_layers["layers"][key]
            knownLayersDict.set(layer.id, <LayerConfigJson>layer)
        }
        const convertState: DesugaringContext = {
            tagRenderings: DetermineTheme.getSharedTagRenderings(),
            tagRenderingOrder: DetermineTheme.getSharedTagRenderingOrder(),
            sharedLayers: knownLayersDict,
            publicLayers: new Set<string>(),
        }
        json = new FixLegacyTheme().convertStrict(json)
        const raw = json

        json = new FixImages(DetermineTheme._knownImages).convertStrict(json)
        json.enableNoteImports = json.enableNoteImports ?? false
        json = new PrepareTheme(convertState).convertStrict(json)
        console.log("The layoutconfig is ", json)

        json.id = forceId ?? json.id

        {
            new PrevalidateTheme().convertStrict(json)
        }
        {
            new ValidateThemeAndLayers(
                new DoesImageExist(new Set<string>(), () => true),
                "",
                false
            ).convertStrict(json)
        }
        return new ThemeConfig(json, false, {
            definitionRaw: JSON.stringify(raw, null, "  "),
            definedAtUrl: sourceUrl,
        })
    }

    private static async LoadRemoteTheme(link: string): Promise<ThemeConfig | null> {
        console.log("Downloading map theme from ", link)

        new FixedUiElement(`Downloading the theme from the <a href="${link}">link</a>...`).AttachTo(
            "maindiv"
        )

        let parsed = <ThemeConfigJson>await Utils.downloadJson(link)
        let forcedId = parsed.id
        const url = new URL(link)
        if (!(url.hostname === "localhost" || url.hostname === "127.0.0.1")) {
            forcedId = link
        }
        console.log("Loaded remote link:", link)
        parsed = await this.expandRemoteLayers(parsed)
        return DetermineTheme.prepCustomTheme(parsed, link, forcedId)
    }
}
