import {Translation} from "../../UI/i18n/Translation";
import TagRenderingConfig from "./TagRenderingConfig";
import LayerConfig from "./LayerConfig";
import {LayoutConfigJson} from "./LayoutConfigJson";
import SharedLayers from "../SharedLayers";
import SharedTagRenderings from "../SharedTagRenderings";

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
    public readonly hideFromOverview: boolean;
    public readonly enableUserBadge: boolean;
    public readonly enableShareScreen: boolean;
    public readonly enableMoreQuests: boolean;
    public readonly enableAddNewPoints: boolean;
    public readonly enableLayers: boolean;
    public readonly enableSearch: boolean;
    public readonly enableGeolocation: boolean;
   public readonly enableBackgroundLayerSelection: boolean;
    public readonly customCss?: string;

    constructor(json: LayoutConfigJson, context?:string) {
        this.id = json.id;
        context = (context ?? "")+"."+this.id;
        this.maintainer = json.maintainer;
        this.changesetmessage = json.changesetmessage;
        this.version = json.version;
        this.language = [];
        if (typeof json.language === "string") {
            this.language = [json.language];
        } else {
            this.language = json.language;
        }
        if(json.title === undefined){
            throw "Title not defined in "+this.id;
        }
        if(json.description === undefined){
            throw "Description not defined in "+this.id;
        }
        this.title = new Translation(json.title, context+".title");
        this.description = new Translation(json.description, context+".description");
        this.shortDescription = json.shortDescription === undefined ? this.description.FirstSentence() : new Translation(json.shortDescription, context+".shortdescription");
        this.descriptionTail = json.descriptionTail === undefined ? new Translation({"*":""}, context) : new Translation(json.descriptionTail, context+".descriptionTail");
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
                return new TagRenderingConfig(tr, `${this.id}.roaming_renderings[${i}]`);
            }
        );
        this.defaultBackgroundId = json.defaultBackgroundId;
        this.layers = json.layers.map((layer, i) => {
            if (typeof layer === "string")
                if (SharedLayers.sharedLayers[layer] !== undefined) {
                    return SharedLayers.sharedLayers[layer];
                } else {
                    throw "Unkown fixed layer " + layer;
                }
            return new LayerConfig(layer, `${this.id}.layers[${i}]`);
        });
        this.hideFromOverview = json.hideFromOverview ?? false;

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