import Translations from "../../UI/i18n/Translations";
import TagRenderingConfig from "./TagRenderingConfig";
import {Tag, TagsFilter} from "../../Logic/Tags";
import {LayerConfigJson} from "./LayerConfigJson";
import {FromJSON} from "./FromJSON";
import SharedTagRenderings from "../SharedTagRenderings";
import {TagRenderingConfigJson} from "./TagRenderingConfigJson";
import {Translation} from "../../UI/i18n/Translation";
import {Img} from "../../UI/Img";
import Svg from "../../Svg";
import {SubstitutedTranslation} from "../../UI/SpecialVisualizations";
import {Utils} from "../../Utils";
import Combine from "../../UI/Base/Combine";
import {VariableUiElement} from "../../UI/Base/VariableUIElement";

export default class LayerConfig {


    id: string;

    name: Translation

    description: Translation;
    overpassTags: TagsFilter;
    doNotDownload: boolean;

    passAllFeatures: boolean;

    minzoom: number;

    title?: TagRenderingConfig;

    titleIcons: TagRenderingConfig[];

    icon: TagRenderingConfig;
    iconSize: TagRenderingConfig;
    rotation: TagRenderingConfig;
    color: TagRenderingConfig;
    width: TagRenderingConfig;
    dashArray: TagRenderingConfig;


    wayHandling: number;

    static WAYHANDLING_DEFAULT = 0;
    static WAYHANDLING_CENTER_ONLY = 1;
    static WAYHANDLING_CENTER_AND_WAY = 2;

    hideUnderlayingFeaturesMinPercentage?: number;

    presets: {
        title: Translation,
        tags: Tag[],
        description?: Translation,
    }[];

    tagRenderings: TagRenderingConfig [];

    constructor(json: LayerConfigJson, roamingRenderings: TagRenderingConfig[],
                context?: string) {
        context = context + "." + json.id;

        this.id = json.id;
        this.name = Translations.T(json.name);
        this.description = Translations.T(json.name);
        this.overpassTags = FromJSON.Tag(json.overpassTags, context + ".overpasstags");
        this.doNotDownload = json.doNotDownload ?? false,
            this.passAllFeatures = json.passAllFeatures ?? false;
        this.minzoom = json.minzoom;
        this.wayHandling = json.wayHandling ?? 0;
        this.hideUnderlayingFeaturesMinPercentage = json.hideUnderlayingFeaturesMinPercentage ?? 0;
        this.presets = (json.presets ?? []).map(pr =>
            ({
                title: Translations.T(pr.title),
                tags: pr.tags.map(t => FromJSON.SimpleTag(t)),
                description: Translations.T(pr.description)
            }))


        /**
         * Converts a list of tagRenderingCOnfigJSON in to TagRenderingConfig
         * A string is interpreted as a name to call
         * @param tagRenderings
         */
        function trs(tagRenderings?: (string | TagRenderingConfigJson)[]) {
            if (tagRenderings === undefined) {
                return [];
            }
            return tagRenderings.map(
                (renderingJson, i) => {
                    if (typeof renderingJson === "string") {
                        const shared = SharedTagRenderings.SharedTagRendering[renderingJson];
                        if (shared !== undefined) {
                            return shared;
                        }
                        throw `Predefined tagRendering ${renderingJson} not found in ${context}`;
                    }
                    return new TagRenderingConfig(renderingJson, `${context}.tagrendering[${i}]`);
                });
        }

        this.tagRenderings = trs(json.tagRenderings);
        this.titleIcons = trs(json.titleIcons ?? ["wikipedialink","osmlink"]);
        

        function tr(key, deflt) {
            const v = json[key];
            if (v === undefined || v === null) {
                if (deflt === undefined) {
                    return undefined;
                }
                return new TagRenderingConfig(deflt);
            }
            if (typeof v === "string") {
                const shared = SharedTagRenderings.SharedTagRendering[v];
                if (shared) {
                    console.log("Got shared TR:", v, "-->", shared)
                    return shared;
                }
            }
            return new TagRenderingConfig(v, context + "." + key);
        }


        this.title = tr("title", undefined);
        this.icon = tr("icon", Img.AsData(Svg.bug));
        const iconPath = this.icon.GetRenderValue({id: "node/-1"}).txt;
        if (iconPath.startsWith(Utils.assets_path)) {
            const iconKey = iconPath.substr(Utils.assets_path.length);
            if (Svg.All[iconKey] === undefined) {
                throw "Builtin SVG asset not found: " + iconPath
            }
        }
        this.iconSize = tr("iconSize", "40,40,center");
        this.color = tr("color", "#0000ff");
        this.width = tr("width", "7");
        this.rotation = tr("rotation", "0");
        this.dashArray = tr("dashArray", "");


    }


    public GenerateLeafletStyle(tags: any, clickable: boolean):
        {
            color: string;
            icon: {
                iconUrl: string,
                popupAnchor: [number, number];
                iconAnchor: [number, number];
                iconSize: [number, number];
                html: string;
                rotation: string;
                className?: string;
            };
            weight: number; dashArray: number[]
        } {

        function num(str, deflt = 40) {
            const n = Number(str);
            if (isNaN(n)) {
                return deflt;
            }
            return n;
        }

        function rendernum(tr: TagRenderingConfig, deflt: number) {
            const str = Number(render(tr, "" + deflt));
            const n = Number(str);
            if (isNaN(n)) {
                return deflt;
            }
            return n;
        }

        function render(tr: TagRenderingConfig, deflt?: string) {
            const str = (tr?.GetRenderValue(tags)?.txt ?? deflt);
            return SubstitutedTranslation.SubstituteKeys(str, tags);
        }

        const iconUrl = render(this.icon);
        const iconSize = render(this.iconSize, "40,40,center").split(",");
        const dashArray = render(this.dashArray).split(" ").map(Number);
        let color = render(this.color, "#00f");

        if (color.startsWith("--")) {
            color = getComputedStyle(document.body).getPropertyValue("--catch-detail-color")
        }

        const weight = rendernum(this.width, 5);
        const rotation = render(this.rotation, "0deg");


        const iconW = num(iconSize[0]);
        const iconH = num(iconSize[1]);
        const mode = iconSize[2] ?? "center"

        let anchorW = iconW / 2;
        let anchorH = iconH / 2;
        if (mode === "left") {
            anchorW = 0;
        }
        if (mode === "right") {
            anchorW = iconW;
        }

        if (mode === "top") {
            anchorH = 0;
        }
        if (mode === "bottom") {
            anchorH = iconH;
        }

        
        let html = `<img src="${iconUrl}" style="width:100%;height:100%;rotate:${rotation};display:block;" />`;
        
        if (iconUrl.startsWith(Utils.assets_path)) {
            const key = iconUrl.substr(Utils.assets_path.length);
            html = new Combine([
                (Svg.All[key] as string).replace(/stop-color:#000000/g, 'stop-color:' + color)
            ]).SetStyle(`width:100%;height:100%;rotate:${rotation};display:block;`).Render();
        }
        return {
            icon:
                {
                    html: html,
                    iconSize: [iconW, iconH],
                    iconAnchor: [anchorW, anchorH],
                    popupAnchor: [0, 3 - anchorH],
                    rotation: rotation,
                    iconUrl: iconUrl,
                    className: clickable ? "leaflet-div-icon" : "leaflet-div-icon unclickable"
                },
            color: color,
            weight: weight,
            dashArray: dashArray
        };
    }


}