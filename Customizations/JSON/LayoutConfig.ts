import {Translation} from "../../UI/i18n/Translation";
import TagRenderingConfig from "./TagRenderingConfig";
import LayerConfig from "./LayerConfig";
import {LayoutConfigJson} from "./LayoutConfigJson";
import AllKnownLayers from "../AllKnownLayers";
import SharedTagRenderings from "../SharedTagRenderings";
import {Utils} from "../../Utils";

export default class LayoutConfig {
    public readonly id: string;
    public readonly maintainer: string;
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
    public readonly layers: LayerConfig[];
    public readonly clustering?: {
        maxZoom: number,
        minNeededElements: number
    };

    public readonly hideFromOverview: boolean;
    public readonly lockLocation: boolean | [[number,number],[number, number]];
    public readonly enableUserBadge: boolean;
    public readonly enableShareScreen: boolean;
    public readonly enableMoreQuests: boolean;
    public readonly enableAddNewPoints: boolean;
    public readonly enableLayers: boolean;
    public readonly enableSearch: boolean;
    public readonly enableGeolocation: boolean;
    public readonly enableBackgroundLayerSelection: boolean;
    public readonly customCss?: string;

    constructor(json: LayoutConfigJson, context?: string) {
        this.id = json.id;
        context = (context ?? "") + "." + this.id;
        this.maintainer = json.maintainer;
        this.changesetmessage = json.changesetmessage;
        this.version = json.version;
        this.language = [];
        if (typeof json.language === "string") {
            this.language = [json.language];
        } else {
            this.language = json.language;
        }
        if(this.language.length == 0){
            throw "No languages defined. Define at least one language"
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
        this.descriptionTail = json.descriptionTail === undefined ? new Translation({"*": ""}, context+".descriptionTail") : new Translation(json.descriptionTail, context + ".descriptionTail");
        this.icon = json.icon;
        this.socialImage = json.socialImage;
        this.startZoom = json.startZoom;
        this.startLat = json.startLat;
        this.startLon = json.startLon;
        this.widenFactor = json.widenFactor ?? 0.05;
        this.roamingRenderings = (json.roamingRenderings ?? []).map((tr, i) => {
                if (typeof tr === "string") {
                    if (SharedTagRenderings.SharedTagRendering[tr] !== undefined) {
                        return SharedTagRenderings.SharedTagRendering[tr];
                    }
                }
                return new TagRenderingConfig(tr, undefined,`${this.id}.roaming_renderings[${i}]`);
            }
        );
        this.defaultBackgroundId = json.defaultBackgroundId;
        this.layers = json.layers.map((layer, i) => {
            if (typeof layer === "string") {
                if (AllKnownLayers.sharedLayers[layer] !== undefined) {
                    return AllKnownLayers.sharedLayers[layer];
                } else {
                    throw "Unkown fixed layer " + layer;
                }
            }
            // @ts-ignore
            if (layer.builtin !== undefined) {
                // @ts-ignore
                const name = layer.builtin;
                const shared = AllKnownLayers.sharedLayersJson[name];
                if (shared === undefined) {
                    throw "Unkown fixed layer " + name;
                }
                // @ts-ignore
                layer = Utils.Merge(layer.override, shared);
            }

            // @ts-ignore
            return new LayerConfig(layer, `${this.id}.layers[${i}]`)
        });
        
        // ALl the layers are constructed, let them share tags in now!
        const roaming : {r, source: LayerConfig}[] = []
        for (const layer of this.layers) {
            roaming.push({r: layer.GetRoamingRenderings(), source:layer});
        }

        for (const layer of this.layers) {
            for (const r of roaming) {
                if(r.source == layer){
                    continue;
                }
                layer.AddRoamingRenderings(r.r);
            }
        }
        
        for(const layer of this.layers) {
            layer.AddRoamingRenderings(
                {
                    titleIcons:[],
                    iconOverlays: [],
                    tagRenderings: this.roamingRenderings
                }  
                
            );
        }

        this.clustering = {
            maxZoom: 16,
            minNeededElements: 250
        };
        if (json.clustering) {
            this.clustering = {
                maxZoom: json.clustering.maxZoom ?? 18,
                minNeededElements: json.clustering.minNeededElements ?? 1
            }
            for (const layer of this.layers) {
                if (layer.wayHandling !== LayerConfig.WAYHANDLING_CENTER_ONLY) {
                    console.error("WARNING: In order to allow clustering, every layer must be set to CENTER_ONLY. Layer", layer.id, "does not respect this for layout", this.id);
                }
            }
        }

        this.hideFromOverview = json.hideFromOverview ?? false;
        this.lockLocation = json.lockLocation ?? false;
        this.enableUserBadge = json.enableUserBadge ?? true;
        this.enableShareScreen = json.enableShareScreen ?? true;
        this.enableMoreQuests = json.enableMoreQuests ?? true;
        this.enableLayers = json.enableLayers ?? true;
        this.enableSearch = json.enableSearch ?? true;
        this.enableGeolocation = json.enableGeolocation ?? true;
        this.enableAddNewPoints = json.enableAddNewPoints ?? true;
        this.enableBackgroundLayerSelection = json.enableBackgroundLayerSelection ?? true;
        this.customCss = json.customCss;
    }

}