import {LayoutConfigJson} from "../Json/LayoutConfigJson";
import {Utils} from "../../../Utils";
import LineRenderingConfigJson from "../Json/LineRenderingConfigJson";
import {LayerConfigJson} from "../Json/LayerConfigJson";
import {DesugaringContext, DesugaringStep, Fuse, OnEvery} from "./Conversion";

export class UpdateLegacyLayer extends DesugaringStep<LayerConfigJson | string | { builtin, override }> {

    constructor() {
        super("Updates various attributes from the old data format to the new to provide backwards compatibility with the formats",
            ["overpassTags", "source.osmtags", "tagRenderings[*].id", "mapRendering"]);
    }

    convert(json: LayerConfigJson, context: string): { result: LayerConfigJson; errors: string[]; warnings: string[] } {
        const warnings = []
        if (typeof json === "string" || json["builtin"] !== undefined) {
            // Reuse of an already existing layer; return as-is
            return {result: json, errors: [], warnings: []}
        }
        let config: any = {...json};

        if (config["overpassTags"]) {
            config.source = config.source ?? {}
            config.source.osmTags = config["overpassTags"]
            delete config["overpassTags"]
        }

        if (config.tagRenderings !== undefined) {
            let i = 0;
            for (const tagRendering of config.tagRenderings) {
                i++;
                if (typeof tagRendering === "string" || tagRendering["builtin"] !== undefined || tagRendering["rewrite"] !== undefined) {
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


        if (config.mapRendering === undefined) {
            config.mapRendering = []
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
                    rotation: config["rotation"]
                }
                config.mapRendering.push(pointConfig)
            }

            if (wayHandling !== 1) {
                const lineRenderConfig = <LineRenderingConfigJson>{
                    color: config["color"],
                    width: config["width"],
                    dashArray: config["dashArray"]
                }
                if (Object.keys(lineRenderConfig).length > 0) {
                    config.mapRendering.push(lineRenderConfig)
                }
            }
            if (config.mapRendering.length === 0) {
                throw "Could not convert the legacy theme into a new theme: no renderings defined for layer " + config.id
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

        for (const mapRenderingElement of config.mapRendering) {
            if (mapRenderingElement["iconOverlays"] !== undefined) {
                mapRenderingElement["iconBadges"] = mapRenderingElement["iconOverlays"]
            }
            for (const overlay of mapRenderingElement["iconBadges"] ?? []) {
                if (overlay["badge"] !== true) {
                    warnings.push("Warning: non-overlay element for ", config.id)
                }
                delete overlay["badge"]
            }
        }

        return {
            result: config,
            errors: [],
            warnings
        };
    }

}

class UpdateLegacyTheme extends DesugaringStep<LayoutConfigJson> {
    constructor() {
        super("Small fixes in the theme config", ["roamingRenderings"]);
    }

    convert(json: LayoutConfigJson, context: string): { result: LayoutConfigJson; errors: string[]; warnings: string[] } {
        const oldThemeConfig = {...json}
        if (oldThemeConfig["roamingRenderings"] !== undefined) {

            if (oldThemeConfig["roamingRenderings"].length == 0) {
                delete oldThemeConfig["roamingRenderings"]
            } else {
                return {
                    result: null,
                    errors: [context + ": The theme contains roamingRenderings. These are not supported anymore"],
                    warnings: []
                }
            }
        }

        oldThemeConfig.layers = Utils.NoNull(oldThemeConfig.layers)
        delete oldThemeConfig["language"]
        return {
            errors: [],
            warnings: [],
            result: oldThemeConfig
        }
    }
}

export class FixLegacyTheme extends Fuse<LayoutConfigJson> {
    constructor() {
        super(
            "Fixes a legacy theme to the modern JSON format geared to humans. Syntactic sugars are kept (i.e. no tagRenderings are expandend, no dependencies are automatically gathered)",
            new UpdateLegacyTheme(),
            new OnEvery("layers", new UpdateLegacyLayer())
        );
    }
}
