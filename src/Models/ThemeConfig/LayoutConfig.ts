import { Translation } from "../../UI/i18n/Translation"
import { LayoutConfigJson } from "./Json/LayoutConfigJson"
import LayerConfig from "./LayerConfig"
import { LayerConfigJson } from "./Json/LayerConfigJson"
import Constants from "../Constants"
import { ExtractImages } from "./Conversion/FixImages"
import ExtraLinkConfig from "./ExtraLinkConfig"
import { Utils } from "../../Utils"
import LanguageUtils from "../../Utils/LanguageUtils"

import { RasterLayerProperties } from "../RasterLayerProperties"

import { ConversionContext } from "./Conversion/ConversionContext"
import { Translatable } from "./Json/Translatable"

/**
 * Minimal information about a theme
 **/
export class LayoutInformation {
    id: string
    icon: string
    title: Translatable | Translation
    shortDescription: Translatable| Translation
    definition?: Translatable| Translation
    mustHaveLanguage?: boolean
    hideFromOverview?: boolean
    keywords?: (Translatable| Translation)[]
}

export default class LayoutConfig implements LayoutInformation {
    public static readonly defaultSocialImage = "assets/SocialImage.png"
    public readonly id: string
    public readonly credits?: string
    /**
     * The languages this theme supports.
     * Defaults to all languages the title has
     */
    public readonly language: string[]
    public readonly title: Translation
    public readonly shortDescription: Translation
    public readonly description: Translation
    public readonly descriptionTail?: Translation
    public readonly icon: string
    public readonly socialImage?: string
    public readonly startZoom: number
    public readonly startLat: number
    public readonly startLon: number
    public widenFactor: number
    public defaultBackgroundId?: string
    public layers: LayerConfig[]
    public tileLayerSources: (RasterLayerProperties & { defaultState?: true | boolean })[]
    public readonly hideFromOverview: boolean
    public lockLocation: boolean | [[number, number], [number, number]]
    public readonly enableUserBadge: boolean
    public readonly enableShareScreen: boolean
    public readonly enableMoreQuests: boolean
    public readonly enableAddNewPoints: boolean
    public readonly enableLayers: boolean
    public readonly enableSearch: boolean
    public readonly enableGeolocation: boolean
    public readonly enableBackgroundLayerSelection: boolean
    public readonly enableShowAllQuestions: boolean
    public readonly enableExportButton: boolean
    public readonly enablePdfDownload: boolean
    public readonly enableTerrain: boolean
    public readonly enableMorePrivacy: boolean


    public readonly customCss?: string

    public readonly overpassUrl: string[]
    public overpassTimeout: number
    public readonly overpassMaxZoom: number
    public readonly osmApiTileSize: number
    public readonly official: boolean

    private usedImages: string[]
    public readonly extraLink?: ExtraLinkConfig

    public readonly definedAtUrl?: string
    public readonly definitionRaw?: string

    private readonly layersDict: Map<string, LayerConfig>
    private readonly source: LayoutConfigJson

    constructor(
        json: LayoutConfigJson,
        official = true,
        options?: {
            definedAtUrl?: string
            definitionRaw?: string
        }
    ) {
        if (json === undefined) {
            throw "Cannot construct a layout config, the parameter 'json' is undefined"
        }
        this.source = json
        this.official = official
        this.id = json.id
        this.definedAtUrl = options?.definedAtUrl
        this.definitionRaw = options?.definitionRaw
        if (official) {
            if (json.id.toLowerCase() !== json.id) {
                throw "The id of a theme should be lowercase: " + json.id
            }
            if (json.id.match(/[a-z0-9-_]/) == null) {
                throw "The id of a theme should match [a-z0-9-_]*: " + json.id
            }
        }
        const context = this.id
        this.credits = Array.isArray(json.credits) ? json.credits.join("; ") : json.credits
        if (!json.title) {
            throw `The theme ${json.id} does not have a title defined.`
        }
        this.language = json.mustHaveLanguage ?? Object.keys(json.title)

        {
            if (typeof json.title === "string") {
                throw `The title of a theme should always be a translation, as it sets the corresponding languages (${context}.title). The themenID is ${
                    this.id
                }; the offending object is ${JSON.stringify(
                    json.title
                )} which is a ${typeof json.title})`
            }
            if (this.language.length == 0) {
                throw `No languages defined. Define at least one language. You can do this by adding a title`
            }
            if (json.title === undefined) {
                throw "Title not defined in " + this.id
            }
            if (json.description === undefined) {
                throw "Description not defined in " + this.id
            }

            if (json["hideInOverview"]) {
                throw (
                    "The json for " +
                    this.id +
                    " contains a 'hideInOverview'. Did you mean hideFromOverview instead?"
                )
            }
            if (json.layers === undefined) {
                throw "Got undefined layers for " + json.id + " at " + context
            }
        }
        this.title = new Translation(json.title, "themes:" + context + ".title")
        this.description = new Translation(json.description, "themes:" + context + ".description")
        this.shortDescription =
            json.shortDescription === undefined
                ? this.description.FirstSentence()
                : new Translation(json.shortDescription, "themes:" + context + ".shortdescription")
        this.descriptionTail =
            json.descriptionTail === undefined
                ? undefined
                : new Translation(json.descriptionTail, "themes:" + context + ".descriptionTail")
        this.icon = json.icon
        this.socialImage = json.socialImage ?? LayoutConfig.defaultSocialImage
        if (this.socialImage === "") {
            if (official) {
                throw "Theme " + json.id + " has empty string as social image"
            }
        }
        this.startZoom = json.startZoom
        this.startLat = json.startLat
        this.startLon = json.startLon
        this.widenFactor = 1.5

        this.defaultBackgroundId = json.defaultBackgroundId
        this.tileLayerSources = json.tileLayerSources ?? []
        // At this point, layers should be expanded and validated either by the generateScript or the LegacyJsonConvert
        this.layers = json.layers.map(
            (lyrJson) =>
                new LayerConfig(
                    <LayerConfigJson>lyrJson,
                    json.id + ".layers." + lyrJson["id"],
                    official
                )
        )

        this.extraLink = new ExtraLinkConfig(
            json.extraLink ?? {
                icon: "./assets/svg/pop-out.svg",
                href: "https://{basepath}/{theme}.html?lat={lat}&lon={lon}&z={zoom}&language={language}",
                newTab: true,
                requirements: ["iframe", "no-welcome-message"],
            },
            context + ".extraLink"
        )

        this.hideFromOverview = json.hideFromOverview ?? false
        this.lockLocation = <[[number, number], [number, number]]>json.lockLocation ?? undefined
        this.enableUserBadge = json.enableUserBadge ?? true
        this.enableShareScreen = json.enableShareScreen ?? true
        this.enableMoreQuests = json.enableMoreQuests ?? true
        this.enableLayers = json.enableLayers ?? true
        this.enableSearch = json.enableSearch ?? true
        this.enableGeolocation = json.enableGeolocation ?? true
        this.enableAddNewPoints = json.enableAddNewPoints ?? true
        this.enableBackgroundLayerSelection = json.enableBackgroundLayerSelection ?? true
        this.enableShowAllQuestions = json.enableShowAllQuestions ?? false
        this.enableExportButton = json.enableDownload ?? true
        this.enablePdfDownload = json.enablePdfDownload ?? true
        this.enableTerrain = json.enableTerrain ?? false
        this.customCss = json.customCss
        this.overpassUrl = json.overpassUrl ?? Constants.defaultOverpassUrls
        this.overpassTimeout = json.overpassTimeout ?? 30
        this.overpassMaxZoom = json.overpassMaxZoom ?? 16
        this.osmApiTileSize = json.osmApiTileSize ?? this.overpassMaxZoom + 1
        this.enableMorePrivacy = json.enableMorePrivacy || json.layers.some(l => (<LayerConfigJson> l).enableMorePrivacy)

        this.layersDict = new Map<string, LayerConfig>()
        for (const layer of this.layers) {
            this.layersDict.set(layer.id, layer)
        }
    }

    public CustomCodeSnippets(): string[] {
        if (this.official) {
            return []
        }
        const msg =
            "<br/><b>This layout uses <span class='alert'>custom javascript</span>, loaded for the wide internet. The code is printed below, please report suspicious code on the issue tracker of MapComplete:</b><br/>"
        const custom = []
        for (const layer of this.layers) {
            custom.push(...layer.CustomCodeSnippets().map((code) => code + "<br />"))
        }
        if (custom.length === 0) {
            return custom
        }
        custom.splice(0, 0, msg)
        return custom
    }

    public getLayer(id: string) {
        return this.layersDict.get(id)
    }

    public isLeftRightSensitive() {
        return this.layers.some((l) => l.isLeftRightSensitive())
    }

    public hasNoteLayer() {
        return this.layers.some((l) => l.id === "note")
    }

    public hasPresets() {
        return this.layers.some((l) => l.presets?.length > 0)
    }

    public missingTranslations(extraInspection: any): {
        untranslated: Map<string, string[]>
        total: number
    } {
        let total = 0
        const untranslated = new Map<string, string[]>()

        Utils.WalkObject(
            [this, extraInspection],
            (o) => {
                const translation = <Translation>(<any>o)
                if (translation.translations["*"] !== undefined) {
                    return
                }
                if (translation.context === undefined || translation.context.indexOf(":") < 0) {
                    // no source given - lets ignore
                    return
                }

                total++
                LanguageUtils.usedLanguagesSorted.forEach((ln) => {
                    const trans = translation.translations
                    if (trans["*"] !== undefined) {
                        return
                    }
                    if (translation.context.indexOf(":") < 0) {
                        return
                    }
                    if (trans[ln] === undefined) {
                        if (!untranslated.has(ln)) {
                            untranslated.set(ln, [])
                        }
                        untranslated
                            .get(ln)
                            .push(
                                translation.context.replace(
                                    /^note_import_[a-zA-Z0-9_]*/,
                                    "note_import"
                                )
                            )
                    }
                })
            },
            (o) => {
                if (o === undefined || o === null) {
                    return false
                }
                return o instanceof Translation
            }
        )

        return { untranslated, total }
    }
    public getMatchingLayer(tags: Record<string, string>): LayerConfig | undefined {
        if (tags === undefined) {
            return undefined
        }
        if (tags.id.startsWith("current_view")) {
            return this.getLayer("current_view")
        }
        for (const layer of this.layers) {
            if (!layer.source) {
                if (layer.isShown?.matchesProperties(tags)) {
                    return layer
                }
                continue
            }
            if (layer.source.osmTags.matchesProperties(tags)) {
                return layer
            }
        }
        console.log("Fallthrough", this, tags)
        return undefined
    }

    public getUsedImages(){
        if(this.usedImages){
            return this.usedImages
        }
        const json = this.source
        // The 'favourite'-layer contains pretty much all images as it bundles all layers, so we exclude it
        const jsonNoFavourites = {...json, layers: json.layers.filter(l => l["id"] !== "favourite")}
        this.usedImages = Array.from(
            new ExtractImages(this.official, undefined)
                .convertStrict(jsonNoFavourites, ConversionContext.construct([json.id], ["ExtractImages"]))
                .map((i) => i.path)
        ).sort()
        return this.usedImages
    }
}
