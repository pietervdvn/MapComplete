import PointRenderingConfigJson from "./Json/PointRenderingConfigJson"
import TagRenderingConfig from "./TagRenderingConfig"
import { TagsFilter } from "../../Logic/Tags/TagsFilter"
import { TagUtils } from "../../Logic/Tags/TagUtils"
import { Utils } from "../../Utils"
import WithContextLoader from "./WithContextLoader"
import { ImmutableStore, Store } from "../../Logic/UIEventSource"
import BaseUIElement from "../../UI/BaseUIElement"
import { FixedUiElement } from "../../UI/Base/FixedUiElement"
import Combine from "../../UI/Base/Combine"
import { VariableUiElement } from "../../UI/Base/VariableUIElement"
import { TagRenderingConfigJson } from "./Json/TagRenderingConfigJson"
import SvelteUIElement from "../../UI/Base/SvelteUIElement"
import DynamicMarker from "../../UI/Map/DynamicMarker.svelte"
import { UIElement } from "../../UI/UIElement"
import Img from "../../UI/Base/Img"

export class IconConfig extends WithContextLoader {
    public static readonly defaultIcon = new IconConfig({ icon: "pin", color: "#ff9939" })
    public readonly icon: TagRenderingConfig
    public readonly color: TagRenderingConfig

    constructor(
        config: {
            icon: string | TagRenderingConfigJson
            color?: string | TagRenderingConfigJson
        },
        context?: string
    ) {
        super(config, context)
        this.icon = this.tr("icon")
        this.color = this.tr("color")
    }
}

export default class PointRenderingConfig extends WithContextLoader {
    static readonly allowed_location_codes: ReadonlySet<string> = new Set<string>([
        "point",
        "centroid",
        "start",
        "end",
        "projected_centerpoint",
        "polygon_centroid",
    ])
    public readonly location: Set<
        | "point"
        | "centroid"
        | "start"
        | "end"
        | "projected_centerpoint"
        | "polygon_centroid"
        | string
    >

    public readonly marker: IconConfig[]
    public readonly iconBadges: { if: TagsFilter; then: TagRenderingConfig }[]
    public readonly iconSize: TagRenderingConfig
    public readonly anchor: TagRenderingConfig

    public readonly label: TagRenderingConfig
    public readonly labelCss: TagRenderingConfig
    public readonly labelCssClasses: TagRenderingConfig
    public readonly rotation: TagRenderingConfig
    public readonly cssDef: TagRenderingConfig
    public readonly cssClasses?: TagRenderingConfig
    public readonly pitchAlignment?: TagRenderingConfig
    public readonly rotationAlignment?: TagRenderingConfig

    constructor(json: PointRenderingConfigJson, context: string) {
        super(json, context)

        if (json === undefined || json === null) {
            throw `At ${context}: Invalid PointRenderingConfig: undefined or null`
        }

        if (typeof json.location === "string") {
            json.location = [json.location]
        }

        this.location = new Set(json.location)

        this.location.forEach((l) => {
            const allowed = PointRenderingConfig.allowed_location_codes
            if (!allowed.has(l)) {
                throw `A point rendering has an invalid location: '${l}' is not one of ${Array.from(
                    allowed
                ).join(", ")} (at ${context}.location)`
            }
        })

        this.marker = (json.marker ?? []).map((m) => new IconConfig(<any>m))
        if (json.css !== undefined) {
            this.cssDef = this.tr("css", undefined)
        }
        this.cssClasses = this.tr("cssClasses", undefined)
        this.labelCss = this.tr("labelCss", undefined)
        this.labelCssClasses = this.tr("labelCssClasses", undefined)
        this.iconBadges = (json.iconBadges ?? []).map((overlay, i) => {
            return {
                if: TagUtils.Tag(overlay.if),
                then: new TagRenderingConfig(overlay.then, `iconBadges.${i}`),
            }
        })

        if (typeof json.iconSize === "string") {
            const s = json.iconSize
            if (["bottom", "top", "center"].some((e) => s.endsWith(e))) {
                throw (
                    "At " +
                    context +
                    " in : iconSize uses legacy ,bottom, center or top postfix. Use the field `anchor` instead."
                )
            }
        }
        this.iconSize = this.tr("iconSize", "40,40", context + ".iconsize")
        this.anchor = this.tr("anchor", "center", context + ".anchor")
        this.label = this.tr("label", undefined, context + ".label")
        this.rotation = this.tr("rotation", "0", context + ".rotation")
        this.pitchAlignment = this.tr("pitchAlignment", "canvas", context + ".pitchAlignment")
        this.rotationAlignment = this.tr(
            "rotationAlignment",
            json.pitchAlignment === "map" ? "map" : "canvas",
            context + ".rotationAlignment"
        )
    }
    private static FromHtmlMulti(multiSpec: string, tags: Store<Record<string, string>>): BaseUIElement {
        const icons: IconConfig[] = []

        for (const subspec of multiSpec.split(";")) {
            if(subspec.startsWith("http://") || subspec.startsWith("https://")){
                icons.push(new IconConfig({icon: subspec}))
                continue
            }
            const [icon, color] = subspec.split(":")
            icons.push(new IconConfig({ icon, color }))
        }
        return new SvelteUIElement(DynamicMarker, { marker: icons, tags }).SetClass(
            "w-full h-full block absolute top-0 left-0"
        )
    }

    public GetBaseIcon(tags?: Record<string, string>): BaseUIElement {
        return new SvelteUIElement(DynamicMarker, {
            marker: this.marker,
            rotation: this.rotation,
            tags: new ImmutableStore(tags),
        })
    }

    public RenderIcon(
        tags: Store<Record<string, string>>,
        options?: {
            noSize?: false | boolean
            includeBadges?: true | boolean
            metatags?: Store<Record<string, string>>
        }
    ): {
        html: BaseUIElement
        iconAnchor: [number, number]
    } {
        function num(str, deflt = 40) {
            const n = Number(str)
            if (isNaN(n)) {
                return deflt
            }
            return n
        }

        function render(tr: TagRenderingConfig, deflt?: string): string {
            if (tags === undefined) {
                return deflt
            }
            const str = tr?.GetRenderValue(tags.data)?.txt ?? deflt
            return Utils.SubstituteKeys(str, tags.data).replace(/{.*}/g, "")
        }

        // in MapLibre, the offset is relative to the _center_ of the object, with left = [-x, 0] and up = [0,-y]
        let anchorW = 0
        let anchorH = 0
        const anchor = render(this.anchor, "center")
        const mode = anchor?.trim()?.toLowerCase() ?? "center"
        const size = this.iconSize.GetRenderValue(tags.data).Subs(tags).txt ?? "[40,40]"
        const [iconW, iconH] = size.split(",").map((x) => num(x))

        if (mode === "left") {
            anchorW = -iconW / 2
        }
        if (mode === "right") {
            anchorW = iconW / 2
        }

        if (mode === "top") {
            anchorH = iconH / 2
        }
        if (mode === "bottom") {
            anchorH = -iconH / 2
        }

        const icon =
            this.marker?.length > 0
                ? new SvelteUIElement(DynamicMarker, {
                      marker: this.marker,
                      rotation: this.rotation,
                      tags,
                  }).SetClass("w-full h-full")
                : undefined
        let badges = undefined
        if (options?.includeBadges ?? true) {
            badges = this.GetBadges(tags, options?.metatags)
        }
        const iconAndBadges = new Combine([icon, badges]).SetClass("block relative")

        if (options?.noSize) {
            iconAndBadges.SetClass("w-full h-full")
        } else {
            tags.map((tags) => this.iconSize.GetRenderValue(tags).Subs(tags).txt ?? "[40,40]").map(
                (size) => {
                    const [iconW, iconH] = size.split(",").map((x) => num(x))
                    iconAndBadges.SetStyle(`width: ${iconW}px; height: ${iconH}px`)
                }
            )
        }

        const css = this.cssDef?.GetRenderValue(tags.data)?.txt
        const cssClasses = this.cssClasses?.GetRenderValue(tags.data)?.txt

        let label = this.GetLabel(tags, icon === undefined)

        let htmlEl: BaseUIElement
        if (icon === undefined && label === undefined) {
            htmlEl = undefined
        } else if (icon === undefined) {
            htmlEl = label
        } else if (label === undefined) {
            htmlEl = new Combine([iconAndBadges])
        } else {
            htmlEl = new Combine([iconAndBadges, label]).SetStyle("flex flex-col")
        }

        if (css !== undefined) {
            htmlEl?.SetStyle(css)
        }

        if (cssClasses !== undefined) {
            htmlEl?.SetClass(cssClasses)
        }
        return {
            html: htmlEl,
            iconAnchor: [anchorW, anchorH],
        }
    }

    private GetBadges(
        tags: Store<Record<string, string>>,
        metaTags?: Store<Record<string, string>>
    ): BaseUIElement {
        if (this.iconBadges.length === 0) {
            return undefined
        }
        return new VariableUiElement(
            tags.map(
                (tagsData) => {
                    const badgeElements = this.iconBadges.map((badge) => {
                        if (!badge.if.matchesProperties(tagsData)) {
                            // Doesn't match...
                            return undefined
                        }
                        const metaCondition = badge.then.metacondition
                        if (
                            metaCondition &&
                            metaTags &&
                            !metaCondition.matchesProperties(metaTags.data)
                        ) {
                            // Doesn't match
                            return undefined
                        }

                        const htmlDefs = Utils.SubstituteKeys(
                            badge.then.GetRenderValue(tagsData)?.txt,
                            tagsData
                        )
                        if (htmlDefs.startsWith("<") && htmlDefs.endsWith(">")) {
                            // This is probably an HTML-element
                            return new FixedUiElement(Utils.SubstituteKeys(htmlDefs, tagsData))
                                .SetStyle("width: 1.5rem")
                                .SetClass("block")
                        }

                        if (!htmlDefs) {
                            return undefined
                        }

                        const badgeElement = PointRenderingConfig.FromHtmlMulti(
                            htmlDefs,
                            tags
                        )?.SetClass("block relative")
                        if (badgeElement === undefined) {
                            return undefined
                        }
                        return new Combine([badgeElement])
                            .SetStyle("width: 1.5rem")
                            .SetClass("block")
                    })

                    return new Combine(badgeElements).SetClass("inline-flex h-full")
                },
                [metaTags]
            )
        ).SetClass("absolute bottom-0 right-1/3 h-1/2 w-0")
    }

    private GetLabel(tags: Store<Record<string, string>>, labelOnly: boolean): BaseUIElement {
        if (this.label === undefined) {
            return undefined
        }
        const cssLabel = this.labelCss?.GetRenderValue(tags.data)?.txt
        const cssClassesLabel = this.labelCssClasses?.GetRenderValue(tags.data)?.txt
        const self = this
        return new VariableUiElement(
            tags.map((tags) => {
                const label = self.label
                    ?.GetRenderValue(tags)
                    ?.Subs(tags)
                    ?.SetClass("flex items-center justify-center absolute marker-label")
                    ?.SetClass(cssClassesLabel)
                if (cssLabel) {
                    label.SetStyle(cssLabel)
                } else if (labelOnly) {
                    return label?.SetStyle("transform: translate(-50%, -50%);")
                }
                return new Combine([label]).SetClass("flex flex-col items-center")
            })
        )
    }
}
