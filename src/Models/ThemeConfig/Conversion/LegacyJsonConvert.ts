import { LayoutConfigJson } from "../Json/LayoutConfigJson"
import { Utils } from "../../../Utils"
import LineRenderingConfigJson from "../Json/LineRenderingConfigJson"
import { LayerConfigJson } from "../Json/LayerConfigJson"
import { DesugaringStep, Each, Fuse, On } from "./Conversion"
import PointRenderingConfigJson from "../Json/PointRenderingConfigJson"
import { ConversionContext } from "./ConversionContext"

export class UpdateLegacyLayer extends DesugaringStep<
    LayerConfigJson | string | { builtin; override }
> {
    constructor() {
        super(
            "Updates various attributes from the old data format to the new to provide backwards compatibility with the formats",
            ["overpassTags", "source.osmtags", "tagRenderings[*].id", "mapRendering"],
            "UpdateLegacyLayer"
        )
    }

    convert(json: LayerConfigJson, context: ConversionContext): LayerConfigJson {
        if (typeof json === "string" || json["builtin"] !== undefined) {
            // Reuse of an already existing layer; return as-is
            return json
        }
        context = context.enter(json.id)
        let config = { ...json }

        if (config["overpassTags"]) {
            config.source = config.source ?? {
                osmTags: config["overpassTags"],
            }
            config.source["osmTags"] = config["overpassTags"]
            delete config["overpassTags"]
        }

        if(config.allowMove?.["enableImproveAccuraccy"]){
            // Fix common misspelling: 'accuracy' is often typo'ed as 'accuraCCy'
            config.allowMove["enableImproveAccuracy"] = config.allowMove["enableImproveAccuraccy"]
            delete config.allowMove["enableImproveAccuraccy"]
        }

        for (const preset of config.presets ?? []) {
            const preciseInput = preset["preciseInput"]
            if (typeof preciseInput === "boolean") {
                delete preset["preciseInput"]
            } else if (preciseInput !== undefined) {
                delete preciseInput["preferredBackground"]
                preset.snapToLayer = preciseInput.snapToLayer
                delete preciseInput.snapToLayer
                if (preciseInput.maxSnapDistance) {
                    preset.maxSnapDistance = preciseInput.maxSnapDistance
                    delete preciseInput.maxSnapDistance
                }
                if (Object.keys(preciseInput).length == 0) {
                    delete preset["preciseInput"]
                }
            }

            if (typeof preset.snapToLayer === "string") {
                preset.snapToLayer = [preset.snapToLayer]
            }
        }

        if (config.tagRenderings !== undefined) {
            let i = 0
            for (const tagRendering of config.tagRenderings) {
                if (!tagRendering) {
                    continue
                }
                i++
                if (
                    typeof tagRendering === "string" ||
                    tagRendering["builtin"] !== undefined ||
                    tagRendering["rewrite"] !== undefined
                ) {
                    continue
                }
                if (tagRendering["id"] === undefined) {
                    if (tagRendering["#"] !== undefined) {
                        tagRendering["id"] = tagRendering["#"]
                        delete tagRendering["#"]
                    } else if (tagRendering["freeform"]?.key !== undefined) {
                        tagRendering["id"] = config.id + "-" + tagRendering["freeform"]["key"]
                    } else {
                        tagRendering["id"] = "tr-" + i
                    }
                }
            }
        }

        if (
            config["mapRendering"] === undefined &&
            config.pointRendering === undefined &&
            config.lineRendering === undefined
        ) {
            config["mapRendering"] = []
            // This is a legacy format, lets create a pointRendering
            let location: ("point" | "centroid")[] = ["point"]
            let wayHandling: number = config["wayHandling"] ?? 0
            if (wayHandling !== 0) {
                location = ["point", "centroid"]
            }
            if (config["icon"] ?? config["label"] !== undefined) {
                const pointConfig = {
                    icon: config["icon"],
                    iconBadges: config["iconOverlays"],
                    label: config["label"],
                    iconSize: config["iconSize"],
                    location,
                    rotation: config["rotation"],
                }
                config["mapRendering"].push(pointConfig)
            }

            if (wayHandling !== 1) {
                const lineRenderConfig = <LineRenderingConfigJson>{
                    color: config["color"],
                    width: config["width"],
                    dashArray: config["dashArray"],
                }
                if (Object.keys(lineRenderConfig).length > 0) {
                    config["mapRendering"].push(lineRenderConfig)
                }
            }
            if (config["mapRendering"].length === 0) {
                throw (
                    "Could not convert the legacy theme into a new theme: no renderings defined for layer " +
                    config.id
                )
            }
        }

        delete config["color"]
        delete config["width"]
        delete config["dashArray"]

        delete config["icon"]
        delete config["iconOverlays"]
        delete config["label"]
        delete config["iconSize"]
        delete config["rotation"]
        delete config["wayHandling"]
        delete config["hideUnderlayingFeaturesMinPercentage"]
        const src = config.source
        delete src["isOsmCache"]
        delete src["maxCacheAge"]
        delete src["widenFactor"]

        for (const mapRenderingElement of config["mapRendering"] ?? []) {
            if (mapRenderingElement["iconOverlays"] !== undefined) {
                mapRenderingElement["iconBadges"] = mapRenderingElement["iconOverlays"]
            }
            for (const overlay of mapRenderingElement["iconBadges"] ?? []) {
                if (overlay["badge"] !== true) {
                    context.enters("iconBadges", "badge").warn("Non-overlay element")
                }
                delete overlay["badge"]
            }
        }

        if (config["mapRendering"]) {
            const pointRenderings: PointRenderingConfigJson[] = []
            const lineRenderings: LineRenderingConfigJson[] = []
            for (const mapRenderingElement of config["mapRendering"]) {
                if (mapRenderingElement["location"]) {
                    // This is a pointRendering
                    pointRenderings.push(<any>mapRenderingElement)
                } else {
                    lineRenderings.push(<any>mapRenderingElement)
                }
            }
            config["pointRendering"] = pointRenderings
            config["lineRendering"] = lineRenderings
            delete config["mapRendering"]
        }

        for (const rendering of config.pointRendering ?? []) {
            const pr = rendering
            if (pr["icon"]) {
                try {
                    let iconConfig = pr["icon"]
                    if (
                        Object.keys(iconConfig).length === 1 &&
                        iconConfig["render"] !== undefined
                    ) {
                        iconConfig = iconConfig.render
                    }
                    const icon = Utils.NoEmpty(iconConfig.split(";"))
                    pr.marker = icon.map((i) => {
                        if (i.startsWith("http")) {
                            return { icon: i }
                        }
                        const [iconPath, color] = i.split(":")
                        return { icon: iconPath, color }
                    })
                    delete pr["icon"]
                } catch (e) {
                    console.error("Could not handle icon in", json.id)
                    pr.marker = [{ icon: pr["icon"] }]
                    delete pr["icon"]
                }
            }

            let iconSize = pr.iconSize
            if (!iconSize) {
                continue
            }

            if (Object.keys(pr.iconSize).length === 1 && pr.iconSize["render"] !== undefined) {
                iconSize = pr.iconSize["render"]
            }

            if (typeof iconSize === "string")
                if (["bottom", "center", "top"].some((a) => (<string>iconSize).endsWith(a))) {
                    const parts = iconSize.split(",").map((parts) => parts.toLowerCase().trim())
                    pr.anchor = parts.pop()
                    pr.iconSize = parts.join(",")
                }
        }

        if (config.pointRendering)
            for (const rendering of config.pointRendering) {
                for (const key in rendering) {
                    if (!rendering[key]) {
                        continue
                    }
                    if (
                        typeof rendering[key]["render"] === "string" &&
                        Object.keys(rendering[key]).length === 1
                    ) {
                        rendering[key] = rendering[key]["render"]
                    }
                }
            }
        if (config.lineRendering)
            for (const rendering of config.lineRendering) {
                for (const key in rendering) {
                    if (!rendering[key]) {
                        continue
                    }
                    if (
                        typeof rendering[key]["render"] === "string" &&
                        Object.keys(rendering[key]).length === 1
                    ) {
                        rendering[key] = rendering[key]["render"]
                    }
                }
            }

        return config
    }
}

class UpdateLegacyTheme extends DesugaringStep<LayoutConfigJson> {
    constructor() {
        super("Small fixes in the theme config", ["roamingRenderings"], "UpdateLegacyTheme")
    }

    convert(json: LayoutConfigJson, context: ConversionContext): LayoutConfigJson {
        const oldThemeConfig = { ...json }

        if (oldThemeConfig.socialImage === "") {
            delete oldThemeConfig.socialImage
        }

        if (typeof oldThemeConfig.credits === "string") {
            oldThemeConfig.credits = [oldThemeConfig.credits]
        }

        if (oldThemeConfig["roamingRenderings"] !== undefined) {
            if (oldThemeConfig["roamingRenderings"].length == 0) {
                delete oldThemeConfig["roamingRenderings"]
            } else {
                context.err("The theme contains roamingRenderings. These are not supported anymore")
                return null
            }
        }

        oldThemeConfig.layers = Utils.NoNull(oldThemeConfig.layers)
        delete oldThemeConfig["language"]
        delete oldThemeConfig["version"]
        delete oldThemeConfig["clustering"]

        if (oldThemeConfig.startLat === 0) {
            delete oldThemeConfig.startLat
        }
        if (oldThemeConfig.startLon === 0) {
            delete oldThemeConfig.startLon
        }
        if (oldThemeConfig.startZoom <= 2) {
            delete oldThemeConfig.startZoom
        }
        if (oldThemeConfig["maintainer"] !== undefined) {
            if (oldThemeConfig.credits === undefined) {
                oldThemeConfig["credits"] = oldThemeConfig["maintainer"]
                delete oldThemeConfig["maintainer"]
            } else if (oldThemeConfig["maintainer"].toLowerCase().trim() === "mapcomplete") {
                delete oldThemeConfig["maintainer"]
            } else if (oldThemeConfig["maintainer"].toLowerCase().trim() === "") {
                delete oldThemeConfig["maintainer"]
            }
        }

        return oldThemeConfig
    }
}

export class FixLegacyTheme extends Fuse<LayoutConfigJson> {
    constructor() {
        super(
            "Fixes a legacy theme to the modern JSON format geared to humans. Syntactic sugars are kept (i.e. no tagRenderings are expandend, no dependencies are automatically gathered)",
            new UpdateLegacyTheme(),
            new On("layers", new Each(new UpdateLegacyLayer()))
        )
    }
}
