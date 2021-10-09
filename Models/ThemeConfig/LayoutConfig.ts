import {Translation} from "../../UI/i18n/Translation";
import TagRenderingConfig from "./TagRenderingConfig";
import {LayoutConfigJson} from "./Json/LayoutConfigJson";
import SharedTagRenderings from "../../Customizations/SharedTagRenderings";
import AllKnownLayers from "../../Customizations/AllKnownLayers";
import {Utils} from "../../Utils";
import LayerConfig from "./LayerConfig";
import {LayerConfigJson} from "./Json/LayerConfigJson";
import Constants from "../Constants";

export default class LayoutConfig {
    public readonly id: string;
    public readonly maintainer: string;
    public readonly credits?: string;
    public readonly version: string;
    public readonly language: string[];
    public readonly title: Translation;
    public readonly shortDescription?: Translation;
    public readonly description: Translation;
    public readonly descriptionTail?: Translation;
    public readonly icon: string;
    public readonly socialImage?: string;
    public readonly startZoom: number;
    public readonly startLat: number;
    public readonly startLon: number;
    public readonly widenFactor: number;
    public readonly roamingRenderings: TagRenderingConfig[];
    public readonly defaultBackgroundId?: string;
    public layers: LayerConfig[];
    public readonly clustering?: {
        maxZoom: number,
        minNeededElements: number
    };
    public readonly hideFromOverview: boolean;
    public lockLocation: boolean | [[number, number], [number, number]];
    public readonly enableUserBadge: boolean;
    public readonly enableShareScreen: boolean;
    public readonly enableMoreQuests: boolean;
    public readonly enableAddNewPoints: boolean;
    public readonly enableLayers: boolean;
    public readonly enableSearch: boolean;
    public readonly enableGeolocation: boolean;
    public readonly enableBackgroundLayerSelection: boolean;
    public readonly enableShowAllQuestions: boolean;
    public readonly enableExportButton: boolean;
    public readonly enablePdfDownload: boolean;

    public readonly customCss?: string;
    /*
    How long is the cache valid, in seconds?
     */
    public readonly cacheTimeout?: number;
    public readonly overpassUrl: string[];
    public readonly overpassTimeout: number;
    public readonly official: boolean;

    constructor(json: LayoutConfigJson, official = true, context?: string) {
        this.official = official;
        this.id = json.id;
        context = (context ?? "") + "." + this.id;
        this.maintainer = json.maintainer;
        this.credits = json.credits;
        this.version = json.version;
        this.language = [];
        if (typeof json.language === "string") {
            this.language = [json.language];
        } else {
            this.language = json.language;
        }
        if (this.language.length == 0) {
            throw `No languages defined. Define at least one language. (${context}.languages)`
        }
        if (json.title === undefined) {
            throw "Title not defined in " + this.id;
        }
        if (json.description === undefined) {
            throw "Description not defined in " + this.id;
        }
        this.title = new Translation(json.title, context + ".title");
        this.description = new Translation(json.description, context + ".description");
        this.shortDescription = json.shortDescription === undefined ? this.description.FirstSentence() : new Translation(json.shortDescription, context + ".shortdescription");
        this.descriptionTail = json.descriptionTail === undefined ? undefined : new Translation(json.descriptionTail, context + ".descriptionTail");
        this.icon = json.icon;
        this.socialImage = json.socialImage;
        this.startZoom = json.startZoom;
        this.startLat = json.startLat;
        this.startLon = json.startLon;
        if(json.widenFactor < 1){
            if(official){
                throw "Widenfactor too small"
            }else{
                // Unofficial themes get away with this
                console.warn("Detected a very small widenfactor, bumping this above 1.")
                json.widenFactor = json.widenFactor + 1
            }
        }
        if(json.widenFactor > 20){
            throw "Widenfactor is very big, use a value between 1 and 5 (current value is "+json.widenFactor+") at "+context
        }
        this.widenFactor = json.widenFactor ?? 1.5;
        this.roamingRenderings = (json.roamingRenderings ?? []).map((tr, i) => {
                if (typeof tr === "string") {
                    if (SharedTagRenderings.SharedTagRendering.get(tr) !== undefined) {
                        return SharedTagRenderings.SharedTagRendering.get(tr);
                    }
                }
                return new TagRenderingConfig(tr, undefined, `${this.id}.roaming_renderings[${i}]`);
            }
        );
        this.defaultBackgroundId = json.defaultBackgroundId;
        this.layers = LayoutConfig.ExtractLayers(json, official, context);

        // ALl the layers are constructed, let them share tagRenderings now!
        const roaming: { r, source: LayerConfig }[] = []
        for (const layer of this.layers) {
            roaming.push({r: layer.GetRoamingRenderings(), source: layer});
        }

        for (const layer of this.layers) {
            for (const r of roaming) {
                if (r.source == layer) {
                    continue;
                }
                layer.AddRoamingRenderings(r.r);
            }
        }

        for (const layer of this.layers) {
            layer.AddRoamingRenderings(
                {
                    titleIcons: [],
                    iconOverlays: [],
                    tagRenderings: this.roamingRenderings
                }
            );
        }

        this.clustering = {
            maxZoom: 16,
            minNeededElements: 25
        };
        if (json.clustering) {
            this.clustering = {
                maxZoom: json.clustering.maxZoom ?? 18,
                minNeededElements: json.clustering.minNeededElements ?? 25
            }
        }

        this.hideFromOverview = json.hideFromOverview ?? false;
        // @ts-ignore
        if (json.hideInOverview) {
            throw "The json for " + this.id + " contains a 'hideInOverview'. Did you mean hideFromOverview instead?"
        }
        this.lockLocation = json.lockLocation ?? undefined;
        this.enableUserBadge = json.enableUserBadge ?? true;
        this.enableShareScreen = json.enableShareScreen ?? true;
        this.enableMoreQuests = json.enableMoreQuests ?? true;
        this.enableLayers = json.enableLayers ?? true;
        this.enableSearch = json.enableSearch ?? true;
        this.enableGeolocation = json.enableGeolocation ?? true;
        this.enableAddNewPoints = json.enableAddNewPoints ?? true;
        this.enableBackgroundLayerSelection = json.enableBackgroundLayerSelection ?? true;
        this.enableShowAllQuestions = json.enableShowAllQuestions ?? false;
        this.enableExportButton = json.enableDownload ?? false;
        this.enablePdfDownload = json.enablePdfDownload ?? false;
        this.customCss = json.customCss;
        this.cacheTimeout = json.cacheTimout ?? (60 * 24 * 60 * 60)
        this.overpassUrl = Constants.defaultOverpassUrls
        if(json.overpassUrl !== undefined){
            if(typeof json.overpassUrl === "string"){
                this.overpassUrl = [json.overpassUrl]
            }else{
                this.overpassUrl = json.overpassUrl
            }
        }
        this.overpassTimeout = json.overpassTimeout ?? 30

    }

    private static ExtractLayers(json: LayoutConfigJson, official: boolean, context: string): LayerConfig[] {
        const result: LayerConfig[] = []

        json.layers.forEach((layer, i) => {
            if (typeof layer === "string") {
                if (AllKnownLayers.sharedLayersJson.get(layer) !== undefined) {
                    if (json.overrideAll !== undefined) {
                        let lyr = JSON.parse(JSON.stringify(AllKnownLayers.sharedLayersJson[layer]));
                        const newLayer = new LayerConfig(Utils.Merge(json.overrideAll, lyr), `${json.id}+overrideAll.layers[${i}]`, official)
                        result.push(newLayer)
                        return
                    } else {
                        result.push(AllKnownLayers.sharedLayers[layer])
                        return
                    }
                } else {
                    console.log("Layer ", layer, " not kown, try one of", Array.from(AllKnownLayers.sharedLayers.keys()).join(", "))
                    throw `Unknown builtin layer ${layer} at ${context}.layers[${i}]`;
                }
            }

            if (layer["builtin"] === undefined) {
                if (json.overrideAll !== undefined) {
                    layer = Utils.Merge(json.overrideAll, layer);
                }
                // @ts-ignore
                const newLayer = new LayerConfig(layer, `${json.id}.layers[${i}]`, official)
                result.push(newLayer)
                return
            }
            // @ts-ignore
            let names = layer.builtin;
            if (typeof names === "string") {
                names = [names]
            }
            names.forEach(name => {
                const shared = AllKnownLayers.sharedLayersJson.get(name);
                if (shared === undefined) {
                    throw `Unknown shared/builtin layer ${name} at ${context}.layers[${i}]. Available layers are ${Array.from(AllKnownLayers.sharedLayersJson.keys()).join(", ")}`;
                }
                let newLayer: LayerConfigJson = Utils.Merge(layer["override"], JSON.parse(JSON.stringify(shared))); // We make a deep copy of the shared layer, in order to protect it from changes
                if (json.overrideAll !== undefined) {
                    newLayer = Utils.Merge(json.overrideAll, newLayer);
                }
                // @ts-ignore
                const layerConfig = new LayerConfig(newLayer, `${json.id}.layers[${i}]`, official)
                result.push(layerConfig)
                return
            })

        });

        return result
    }

    public CustomCodeSnippets(): string[] {
        if (this.official) {
            return [];
        }
        const msg = "<br/><b>This layout uses <span class='alert'>custom javascript</span>, loaded for the wide internet. The code is printed below, please report suspicious code on the issue tracker of MapComplete:</b><br/>"
        const custom = [];
        for (const layer of this.layers) {
            custom.push(...layer.CustomCodeSnippets().map(code => code + "<br />"))
        }
        if (custom.length === 0) {
            return custom;
        }
        custom.splice(0, 0, msg);
        return custom;
    }

    public ExtractImages(): Set<string> {
        const icons = new Set<string>()
        for (const layer of this.layers) {
            layer.ExtractImages().forEach(icons.add, icons)
        }
        icons.add(this.icon)
        icons.add(this.socialImage)
        return icons
    }

    /**
     * Replaces all the relative image-urls with a fixed image url
     * This is to fix loading from external sources
     *
     * It should be passed the location where the original theme file is hosted.
     *
     * If no images are rewritten, the same object is returned, otherwise a new copy is returned
     */
    public patchImages(originalURL: string, originalJson: string): LayoutConfig {
        const allImages = Array.from(this.ExtractImages())
        const rewriting = new Map<string, string>()

        // Needed for absolute urls: note that it doesn't contain a trailing slash
        const origin = new URL(originalURL).origin
        let path = new URL(originalURL).href
        path = path.substring(0, path.lastIndexOf("/"))
        for (const image of allImages) {
            if (image == "" || image == undefined) {
                continue
            }
            if (image.startsWith("http://") || image.startsWith("https://")) {
                continue
            }
            if (image.startsWith("/")) {
                // This is an absolute path
                rewriting.set(image, origin + image)
            } else if (image.startsWith("./assets/themes")) {
                // Legacy workaround
                rewriting.set(image, path + image.substring(image.lastIndexOf("/")))
            } else if (image.startsWith("./")) {
                // This is a relative url
                rewriting.set(image, path + image.substring(1))
            } else {
                // This is a relative URL with only the path
                rewriting.set(image, path + image)
            }
        }
        if (rewriting.size == 0) {
            return this;
        }
        rewriting.forEach((value, key) => {
            console.log("Rewriting", key, "==>", value)

            originalJson = originalJson.replace(new RegExp(key, "g"), value)
        })
        return new LayoutConfig(JSON.parse(originalJson), false, "Layout rewriting")
    }

}