import Translations from "../../UI/i18n/Translations";
import TagRenderingConfig from "./TagRenderingConfig";
import {Tag, TagsFilter} from "../../Logic/Tags";
import {LayerConfigJson} from "./LayerConfigJson";
import {FromJSON} from "./FromJSON";
import SharedTagRenderings from "../SharedTagRenderings";
import {TagRenderingConfigJson} from "./TagRenderingConfigJson";
import {Translation} from "../../UI/i18n/Translation";
import Img from "../../UI/Base/Img";
import Svg from "../../Svg";
import {SubstitutedTranslation} from "../../UI/SpecialVisualizations";
import {Utils} from "../../Utils";
import Combine from "../../UI/Base/Combine";
import {VariableUiElement} from "../../UI/Base/VariableUIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {FixedUiElement} from "../../UI/Base/FixedUiElement";
import {UIElement} from "../../UI/UIElement";

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
    iconOverlays: { if: TagsFilter, then: TagRenderingConfig, badge: boolean }[]
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
                        
                        if(renderingJson === "questions"){
                            return new TagRenderingConfig("questions")
                        }
                        
                        
                        const shared = SharedTagRenderings.SharedTagRendering[renderingJson];
                        if (shared !== undefined) {
                            return shared;
                        }
                        throw `Predefined tagRendering ${renderingJson} not found in ${context}`;
                    }
                    return new TagRenderingConfig(renderingJson, `${context}.tagrendering[${i}]`);
                });
        }

        this.tagRenderings = trs(json.tagRenderings).concat(roamingRenderings);


        const titleIcons = [];
        const defaultIcons = ["phonelink", "emaillink", "wikipedialink", "osmlink", "sharelink"];
        for (const icon of (json.titleIcons ?? defaultIcons)) {
            if (icon === "defaults") {
                titleIcons.push(...defaultIcons);
            } else {
                titleIcons.push(icon);
            }
        }

        this.titleIcons = trs(titleIcons);


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
        this.iconOverlays = (json.iconOverlays ?? []).map(overlay => {
            let tr = new TagRenderingConfig(overlay.then);
            if (typeof overlay.then === "string" && SharedTagRenderings.SharedIcons[overlay.then] !== undefined) {
                tr = SharedTagRenderings.SharedIcons[overlay.then];
            }
            return {
                if: FromJSON.Tag(overlay.if),
                then: tr,
                badge: overlay.badge ?? false
            }
        });

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


    public GenerateLeafletStyle(tags: UIEventSource<any>, clickable: boolean):
        {
            color: string;
            icon: {
                iconUrl: string,
                popupAnchor: [number, number];
                iconAnchor: [number, number];
                iconSize: [number, number];
                html: UIElement;
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
            const str = (tr?.GetRenderValue(tags.data)?.txt ?? deflt);
            return SubstitutedTranslation.SubstituteKeys(str, tags.data);
        }

        const iconSize = render(this.iconSize, "40,40,center").split(",");
        const dashArray = render(this.dashArray).split(" ").map(Number);
        let color = render(this.color, "#00f");

        if (color.startsWith("--")) {
            color = getComputedStyle(document.body).getPropertyValue("--catch-detail-color")
        }

        const weight = rendernum(this.width, 5);

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

        const iconUrlStatic = render(this.icon);
        const self = this;
        var mappedHtml = tags.map(tgs => {
            // What do you mean, 'tgs' is never read?
            // It is read implicitly in the 'render' method
            const iconUrl = render(self.icon);
            const rotation = render(self.rotation, "0deg");

            let htmlParts: UIElement[] = [];
            let sourceParts = iconUrl.split(";");

            function genHtmlFromString(sourcePart: string): UIElement {
                const style = `width:100%;height:100%;rotate:${rotation};display:block;position: absolute; top: 0, left: 0`;
                let html: UIElement = new FixedUiElement(`<img src="${sourcePart}" style="${style}" />`);
                const match = sourcePart.match(/([a-zA-Z0-9_]*):#([0-9a-fA-F]{3,6})/)
                if (match !== null && Svg.All[match[1] + ".svg"] !== undefined) {
                    html = new Combine([
                        (Svg.All[match[1] + ".svg"] as string)
                            .replace(/#000000/g, "#" + match[2])
                    ]).SetStyle(style);
                }

                if (sourcePart.startsWith(Utils.assets_path)) {
                    const key = sourcePart.substr(Utils.assets_path.length);
                    html = new Combine([
                        (Svg.All[key] as string).replace(/stop-color:#000000/g, 'stop-color:' + color)
                    ]).SetStyle(style);
                }
                return html;
            }


            for (const sourcePart of sourceParts) {
                htmlParts.push(genHtmlFromString(sourcePart))
            }


            let badges = [];
            for (const iconOverlay of self.iconOverlays) {
                if (!iconOverlay.if.matchesProperties(tgs)) {
                    continue;
                }
                if (iconOverlay.badge) {
                    const badgeParts: UIElement[] = [];
                    const partDefs = iconOverlay.then.GetRenderValue(tgs).txt.split(";");

                    for (const badgePartStr of partDefs) {
                        badgeParts.push(genHtmlFromString(badgePartStr))
                    }

                    const badgeCompound = new Combine(badgeParts)
                        .SetStyle("display:flex;position:relative;width:100%;height:100%;");

                    badges.push(badgeCompound)

                } else {
                    htmlParts.push(genHtmlFromString(
                        iconOverlay.then.GetRenderValue(tgs).txt));
                }
            }

            if (badges.length > 0) {
                const badgesComponent = new Combine(badges)
                    .SetStyle("display:flex;height:50%;width:100%;position:absolute;top:50%;left:50%;");
                htmlParts.push(badgesComponent)
            }
            return new Combine(htmlParts).Render();
        })


        return {
            icon:
                {
                    html: new VariableUiElement(mappedHtml),
                    iconSize: [iconW, iconH],
                    iconAnchor: [anchorW, anchorH],
                    popupAnchor: [0, 3 - anchorH],
                    iconUrl: iconUrlStatic,
                    className: clickable ? "leaflet-div-icon" : "leaflet-div-icon unclickable"
                },
            color: color,
            weight: weight,
            dashArray: dashArray
        };
    }


}