import {Translation} from "../../UI/i18n/Translation";
import TagRenderingConfig from "./TagRenderingConfig";
import LayerConfig from "./LayerConfig";
import {LayoutConfigJson} from "./LayoutConfigJson";
import AllKnownLayers from "../AllKnownLayers";
import SharedTagRenderings from "../SharedTagRenderings";
import {Utils} from "../../Utils";
import {Denomination, Unit} from "./Denomination";

export default class LayoutConfig {
    public readonly id: string;
    public readonly maintainer: string;
    public readonly credits?: string;
    public readonly changesetmessage?: string;
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
    public readonly units: Unit[] = []
    private readonly _official: boolean;

    constructor(json: LayoutConfigJson, official = true, context?: string) {
        this._official = official;
        this.id = json.id;
        context = (context ?? "") + "." + this.id;
        this.maintainer = json.maintainer;
        this.credits = json.credits;
        this.changesetmessage = json.changesetmessage;
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
        this.units = LayoutConfig.ExtractUnits(json, context) ?? [];
        this.title = new Translation(json.title, context + ".title");
        this.description = new Translation(json.description, context + ".description");
        this.shortDescription = json.shortDescription === undefined ? this.description.FirstSentence() : new Translation(json.shortDescription, context + ".shortdescription");
        this.descriptionTail = json.descriptionTail === undefined ? new Translation({"*": ""}, context + ".descriptionTail") : new Translation(json.descriptionTail, context + ".descriptionTail");
        this.icon = json.icon;
        this.socialImage = json.socialImage;
        this.startZoom = json.startZoom;
        this.startLat = json.startLat;
        this.startLon = json.startLon;
        this.widenFactor = json.widenFactor ?? 0.05;
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
        this.layers = LayoutConfig.ExtractLayers(json, this.units, official, context);

        // ALl the layers are constructed, let them share tags in now!
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
            minNeededElements: 500
        };
        if (json.clustering) {
            this.clustering = {
                maxZoom: json.clustering.maxZoom ?? 18,
                minNeededElements: json.clustering.minNeededElements ?? 1
            }
            for (const layer of this.layers) {
                if (layer.wayHandling !== LayerConfig.WAYHANDLING_CENTER_ONLY) {
                    console.debug("WARNING: In order to allow clustering, every layer must be set to CENTER_ONLY. Layer", layer.id, "does not respect this for layout", this.id);
                }
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


    }

    private static ExtractLayers(json: LayoutConfigJson, units: Unit[], official: boolean, context: string): LayerConfig[] {
        const result: LayerConfig[] = []

        json.layers.forEach((layer, i) => {
            if (typeof layer === "string") {
                if (AllKnownLayers.sharedLayersJson.get(layer) !== undefined) {
                    if (json.overrideAll !== undefined) {
                        let lyr = JSON.parse(JSON.stringify(AllKnownLayers.sharedLayersJson[layer]));
                        const newLayer = new LayerConfig(Utils.Merge(json.overrideAll, lyr), units, `${json.id}+overrideAll.layers[${i}]`, official)
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
                const newLayer = new LayerConfig(layer, units, `${json.id}.layers[${i}]`, official)
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
                // @ts-ignore
                let newLayer: LayerConfigJson = Utils.Merge(layer.override, JSON.parse(JSON.stringify(shared))); // We make a deep copy of the shared layer, in order to protect it from changes
                if (json.overrideAll !== undefined) {
                    newLayer = Utils.Merge(json.overrideAll, newLayer);
                }
                // @ts-ignore
                const layerConfig = new LayerConfig(newLayer, units, `${json.id}.layers[${i}]`, official)
                result.push(layerConfig)
                return
            })

        });

        return result
    }

    private static ExtractUnits(json: LayoutConfigJson, context: string): Unit[] {
        const result: Unit[] = []
        if ((json.units ?? []).length !== 0) {
            for (let i1 = 0; i1 < json.units.length; i1++) {
                let unit = json.units[i1];
                const appliesTo = unit.appliesToKey

                for (let i = 0; i < appliesTo.length; i++) {
                    let key = appliesTo[i];
                    if (key.trim() !== key) {
                        throw `${context}.unit[${i1}].appliesToKey[${i}] is invalid: it starts or ends with whitespace`
                    }
                }

                if ((unit.applicableUnits ?? []).length === 0) {
                    throw  `${context}: define at least one applicable unit`
                }
                // Some keys do have unit handling

                const defaultSet = unit.applicableUnits.filter(u => u.default === true)
                // No default is defined - we pick the first as default
                if (defaultSet.length === 0) {
                    unit.applicableUnits[0].default = true
                }

                // Check that there are not multiple defaults
                if (defaultSet.length > 1) {
                    throw `Multiple units are set as default: they have canonical values of ${defaultSet.map(u => u.canonicalDenomination).join(", ")}`
                }
                const applicable = unit.applicableUnits.map((u, i) => new Denomination(u, `${context}.units[${i}]`))
                result.push(new Unit(appliesTo, applicable, unit.eraseInvalidValues ?? false));
            }

            const seenKeys = new Set<string>()
            for (const unit of result) {
                const alreadySeen = Array.from(unit.appliesToKeys).filter((key: string) => seenKeys.has(key));
                if (alreadySeen.length > 0) {
                    throw `${context}.units: multiple units define the same keys. The key(s) ${alreadySeen.join(",")} occur multiple times`
                }
                unit.appliesToKeys.forEach(key => seenKeys.add(key))
            }
            return result;

        }


    }

    public CustomCodeSnippets(): string[] {
        if (this._official) {
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

    public LayerIndex(): Map<string, LayerConfig> {
        const index = new Map<string, LayerConfig>();
        for (const layer of this.layers) {
            index.set(layer.id, layer)
        }
        return index;
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