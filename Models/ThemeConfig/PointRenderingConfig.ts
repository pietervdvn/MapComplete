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
    public readonly iconOverlays: { if: TagsFilter; then: TagRenderingConfig; badge: boolean }[];
    public readonly iconSize: TagRenderingConfig;
    public readonly label: TagRenderingConfig;
    public readonly rotation: TagRenderingConfig;

    constructor(json: PointRenderingConfigJson, context: string) {
        super(json, context)
        this.icon = this.tr("icon", "");
        this.iconOverlays = (json.iconOverlays ?? []).map((overlay, i) => {
            let tr = new TagRenderingConfig(
                overlay.then,
                undefined,
                `iconoverlays.${i}`
            );
            if (
                typeof overlay.then === "string" &&
                SharedTagRenderings.SharedIcons.get(overlay.then) !== undefined
            ) {
                tr = SharedTagRenderings.SharedIcons.get(overlay.then);
            }
            return {
                if: TagUtils.Tag(overlay.if),
                then: tr,
                badge: overlay.badge ?? false,
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
        this.label = this.tr("label", "");
        this.rotation = this.tr("rotation", "0");
    }


    public ExtractImages(): Set<string> {
        const parts: Set<string>[] = [];
        parts.push(this.icon?.ExtractImages(true));
        parts.push(
            ...this.iconOverlays?.map((overlay) => overlay.then.ExtractImages(true))
        );

        const allIcons = new Set<string>();
        for (const part of parts) {
            part?.forEach(allIcons.add, allIcons);
        }
        return allIcons;
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
        }
     {
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

        const iconUrlStatic = render(this.icon);
        const self = this;

        function genHtmlFromString(sourcePart: string, rotation: string): BaseUIElement {
            const style = `width:100%;height:100%;transform: rotate( ${rotation} );display:block;position: absolute; top: 0; left: 0`;
            let html: BaseUIElement = new FixedUiElement(
                `<img src="${sourcePart}" style="${style}" />`
            );
            const match = sourcePart.match(/([a-zA-Z0-9_]*):([^;]*)/);
            if (match !== null && Svg.All[match[1] + ".svg"] !== undefined) {
                html = new Img(
                    (Svg.All[match[1] + ".svg"] as string).replace(
                        /#000000/g,
                        match[2]
                    ),
                    true
                ).SetStyle(style);
            }
            return html;
        }


        const mappedHtml = tags?.map((tgs) => {
            // What do you mean, 'tgs' is never read?
            // It is read implicitly in the 'render' method
            const iconUrl = render(self.icon);
            const rotation = render(self.rotation, "0deg");

            let htmlParts: BaseUIElement[] = [];
            let sourceParts = Utils.NoNull(
                iconUrl.split(";").filter((prt) => prt != "")
            );
            for (const sourcePart of sourceParts) {
                htmlParts.push(genHtmlFromString(sourcePart, rotation));
            }

            let badges = [];
            for (const iconOverlay of self.iconOverlays) {
                if (!iconOverlay.if.matchesProperties(tgs)) {
                    continue;
                }
                if (iconOverlay.badge) {
                    const badgeParts: BaseUIElement[] = [];
                    const renderValue = iconOverlay
                        .then
                        .GetRenderValue(tgs)

                    if (renderValue === undefined) {
                        continue;
                    }

                    const partDefs = renderValue.txt.split(";")
                        .filter((prt) => prt != "");

                    for (const badgePartStr of partDefs) {
                        badgeParts.push(genHtmlFromString(badgePartStr, "0"));
                    }

                    const badgeCompound = new Combine(badgeParts).SetStyle(
                        "display:flex;position:relative;width:100%;height:100%;"
                    );

                    badges.push(badgeCompound);
                } else {
                    htmlParts.push(
                        genHtmlFromString(iconOverlay.then.GetRenderValue(tgs).txt, "0")
                    );
                }
            }

            if (badges.length > 0) {
                const badgesComponent = new Combine(badges).SetStyle(
                    "display:flex;height:50%;width:100%;position:absolute;top:50%;left:50%;"
                );
                htmlParts.push(badgesComponent);
            }

            if (sourceParts.length == 0) {
                iconH = 0;
            }
            try {
                const label = self.label
                    ?.GetRenderValue(tgs)
                    ?.Subs(tgs)
                    ?.SetClass("block text-center")
                    ?.SetStyle("margin-top: " + (iconH + 2) + "px");
                if (label !== undefined) {
                    htmlParts.push(
                        new Combine([label]).SetClass("flex flex-col items-center")
                    );
                }
            } catch (e) {
                console.error(e, tgs);
            }
            return new Combine(htmlParts);
        });

        return {
                html: mappedHtml === undefined ? new FixedUiElement(self.icon.render.txt) : new VariableUiElement(mappedHtml),
                iconSize: [iconW, iconH],
                iconAnchor: [anchorW, anchorH],
                popupAnchor: [0, 3 - anchorH],
                iconUrl: iconUrlStatic,
                className: clickable
                    ? "leaflet-div-icon"
                    : "leaflet-div-icon unclickable",
        };
    }
    
}