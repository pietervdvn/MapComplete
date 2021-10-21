import PointRenderingConfigJson from "./Json/PointRenderingConfigJson";
import TagRenderingConfig from "./TagRenderingConfig";
import {TagsFilter} from "../../Logic/Tags/TagsFilter";
import SharedTagRenderings from "../../Customizations/SharedTagRenderings";
import {TagUtils} from "../../Logic/Tags/TagUtils";
import {Utils} from "../../Utils";
import Svg from "../../Svg";
import WithContextLoader from "./WithContextLoader";
import {UIEventSource} from "../../Logic/UIEventSource";
import BaseUIElement from "../../UI/BaseUIElement";
import {FixedUiElement} from "../../UI/Base/FixedUiElement";
import Img from "../../UI/Base/Img";
import Combine from "../../UI/Base/Combine";
import {VariableUiElement} from "../../UI/Base/VariableUIElement";

export default class PointRenderingConfig extends WithContextLoader {

    public readonly icon: TagRenderingConfig;
    public readonly iconBadges: { if: TagsFilter; then: TagRenderingConfig }[];
    public readonly iconSize: TagRenderingConfig;
    public readonly label: TagRenderingConfig;
    public readonly rotation: TagRenderingConfig;

    constructor(json: PointRenderingConfigJson, context: string) {
        super(json, context)
        this.icon = this.tr("icon", "");
        this.iconBadges = (json.iconBadges ?? []).map((overlay, i) => {
            let tr : TagRenderingConfig;
            if (typeof overlay.then === "string" &&
                SharedTagRenderings.SharedIcons.get(overlay.then) !== undefined) {
                tr = SharedTagRenderings.SharedIcons.get(overlay.then);
            }else{
                tr = new TagRenderingConfig(
                    overlay.then,
                    `iconBadges.${i}`
                );
            }
            return {
                if: TagUtils.Tag(overlay.if),
                then: tr
            };
        });

        const iconPath = this.icon.GetRenderValue({id: "node/-1"}).txt;
        if (iconPath.startsWith(Utils.assets_path)) {
            const iconKey = iconPath.substr(Utils.assets_path.length);
            if (Svg.All[iconKey] === undefined) {
                throw "Builtin SVG asset not found: " + iconPath;
            }
        }
        this.iconSize = this.tr("iconSize", "40,40,center");
        this.label = this.tr("label", undefined);
        this.rotation = this.tr("rotation", "0");
    }


    public ExtractImages(): Set<string> {
        const parts: Set<string>[] = [];
        parts.push(this.icon?.ExtractImages(true));
        parts.push(
            ...this.iconBadges?.map((overlay) => overlay.then.ExtractImages(true))
        );

        const allIcons = new Set<string>();
        for (const part of parts) {
            part?.forEach(allIcons.add, allIcons);
        }
        return allIcons;
    }

    /**
     * Given a single HTML spec (either a single image path OR "image_path_to_known_svg:fill-colour", returns a fixedUIElement containing that
     * The element will fill 100% and be positioned absolutely with top:0 and left: 0
     */
    private static FromHtmlSpec(htmlSpec: string, style: string, isBadge = false): BaseUIElement {
        if (htmlSpec === undefined) {
            return undefined;
        }
        const match = htmlSpec.match(/([a-zA-Z0-9_]*):([^;]*)/);
        if (match !== null && Svg.All[match[1] + ".svg"] !== undefined) {
            const svg = (Svg.All[match[1] + ".svg"] as string)
            const targetColor = match[2]
            const img = new Img(svg.replace(/#000000/g, targetColor), true)
                .SetStyle(style)
            if(isBadge){
                img.SetClass("badge")
            }
            return img
        } else {
            return new FixedUiElement(`<img src="${htmlSpec}" style="${style}" />`);
        }
    }
    
    private static FromHtmlMulti(multiSpec: string, rotation: string , isBadge: boolean, defaultElement: BaseUIElement = undefined){
        if(multiSpec === undefined){
            return defaultElement
        }
        const style = `width:100%;height:100%;transform: rotate( ${rotation} );display:block;position: absolute; top: 0; left: 0`;

        const htmlDefs = multiSpec.trim()?.split(";") ?? []
        const elements = Utils.NoEmpty(htmlDefs).map(def => PointRenderingConfig.FromHtmlSpec(def, style, isBadge))
        if (elements.length === 0) {
            return defaultElement
        } else {
            return new Combine(elements).SetClass("relative block w-full h-full")
        }
    }

    public GetSimpleIcon(tags: UIEventSource<any>): BaseUIElement {
        const self = this;
        if (this.icon === undefined) {
            return undefined;
        }
        return new VariableUiElement(tags.map(tags => {
            const rotation = self.rotation?.GetRenderValue(tags)?.txt ?? "0deg"
            
            const htmlDefs = self.icon.GetRenderValue(tags)?.txt
            let defaultPin : BaseUIElement = undefined
            if(self.label === undefined){
                defaultPin =  Svg.teardrop_with_hole_green_svg()
            }
            return PointRenderingConfig.FromHtmlMulti(htmlDefs, rotation,false, defaultPin)
        })).SetClass("w-full h-full block")
    }

    private GetBadges(tags: UIEventSource<any>): BaseUIElement {
        if (this.iconBadges.length === 0) {
            return undefined
        }
        return new VariableUiElement(
            tags.map(tags => {

                const badgeElements = this.iconBadges.map(badge => {

                    if (!badge.if.matchesProperties(tags)) {
                        // Doesn't match...
                        return undefined
                    }

                    const htmlDefs = badge.then.GetRenderValue(tags)?.txt
                    const badgeElement= PointRenderingConfig.FromHtmlMulti(htmlDefs, "0", true)?.SetClass("block relative")
                    if(badgeElement === undefined){
                        return undefined;
                    }
                    return new Combine([badgeElement]).SetStyle("width: 1.5rem").SetClass("block")
                    
                })

                return new Combine(badgeElements).SetClass("inline-flex h-full")
            })).SetClass("absolute bottom-0 right-1/3 h-1/2 w-0")
    }

    private GetLabel(tags: UIEventSource<any>): BaseUIElement {
        if (this.label === undefined) {
            return undefined;
        }
        const self = this;
        return new VariableUiElement(tags.map(tags => {
            const label = self.label
                ?.GetRenderValue(tags)
                ?.Subs(tags)
                ?.SetClass("block text-center")
            return new Combine([label]).SetClass("flex flex-col items-center mt-1")
        }))

    }

    public GenerateLeafletStyle(
        tags: UIEventSource<any>,
        clickable: boolean
    ):
        {
            html: BaseUIElement;
            iconSize: [number, number];
            iconAnchor: [number, number];
            popupAnchor: [number, number];
            iconUrl: string;
            className: string;
        } {
        function num(str, deflt = 40) {
            const n = Number(str);
            if (isNaN(n)) {
                return deflt;
            }
            return n;
        }

        function render(tr: TagRenderingConfig, deflt?: string) {
            if (tags === undefined) {
                return deflt
            }
            const str = tr?.GetRenderValue(tags.data)?.txt ?? deflt;
            return Utils.SubstituteKeys(str, tags.data).replace(/{.*}/g, "");
        }

        const iconSize = render(this.iconSize, "40,40,center").split(",");

        const iconW = num(iconSize[0]);
        let iconH = num(iconSize[1]);
        const mode = iconSize[2]?.trim()?.toLowerCase() ?? "center";

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


        const iconAndBadges = new Combine([this.GetSimpleIcon(tags), this.GetBadges(tags)])
            .SetStyle(`width: ${iconW}px; height: ${iconH}px`)
            .SetClass("block relative")


        return {
            html: new Combine([iconAndBadges, this.GetLabel(tags)]).SetStyle("flex flex-col"),
            iconSize: [iconW, iconH],
            iconAnchor: [anchorW, anchorH],
            popupAnchor: [0, 3 - anchorH],
            iconUrl: undefined,
            className: clickable
                ? "leaflet-div-icon"
                : "leaflet-div-icon unclickable",
        };
    }

}