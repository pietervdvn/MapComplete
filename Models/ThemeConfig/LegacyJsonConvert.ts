import LineRenderingConfigJson from "./Json/LineRenderingConfigJson";
import PointRenderingConfig from "./PointRenderingConfig";

export default class LegacyJsonConvert {

    /**
     * Updates the config file in-place
     * @param config
     * @private
     */
    public static fixLayerConfig(config: any): void {
        if (config["overpassTags"]) {
            config.source = config.source ?? {}
            config.source.osmTags = config["overpassTags"]
            delete config["overpassTags"]
        }

        if (config.tagRenderings !== undefined) {
            for (const tagRendering of config.tagRenderings) {
                if (tagRendering["id"] === undefined) {

                    if (tagRendering["#"] !== undefined) {
                        tagRendering["id"] = tagRendering["#"]
                        delete tagRendering["#"]
                    } else if (tagRendering["freeform"]?.key !== undefined) {
                        tagRendering["id"] = config.id + "-" + tagRendering["freeform"]["key"]
                    }
                }
            }
        }

        if (config.mapRendering === undefined && config.id !== "sidewalks") {
            config.mapRendering = []
            // This is a legacy format, lets create a pointRendering
            let location: ("point" | "centroid")[] = ["point"]
            let wayHandling: number = config["wayHandling"] ?? 0
            if (wayHandling !== 0) {
                location = ["point", "centroid"]
            }
           if(config["icon"] ?? config["label"] !== undefined){
               
            const pointConfig =   {
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
            if(config.mapRendering.length === 0){
                throw "Could not convert the legacy theme into a new theme: no renderings defined for layer "+config.id
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
        
        for (const mapRenderingElement of config.mapRendering) {
            if (mapRenderingElement["iconOverlays"] !== undefined) {
                mapRenderingElement["iconBadges"] = mapRenderingElement["iconOverlays"]
            }
            for (const overlay of mapRenderingElement["iconBadges"] ?? []) {
                if (overlay["badge"] !== true) {
                    console.log("Warning: non-overlay element for ", config.id)
                }
                delete overlay["badge"]
            }
        }

    }


    /**
     * Given an old (parsed) JSON-config, will (in place) fix some issues
     * @param oldThemeConfig: the config to update to the latest format
     */
    public static fixThemeConfig(oldThemeConfig: any): void {
        for (const layerConfig of oldThemeConfig.layers ?? []) {
            if (typeof layerConfig === "string" || layerConfig["builtin"] !== undefined) {
                continue
            }
            // @ts-ignore
            LegacyJsonConvert.fixLayerConfig(layerConfig)
        }

        if (oldThemeConfig["roamingRenderings"] !== undefined && oldThemeConfig["roamingRenderings"].length == 0) {
            delete oldThemeConfig["roamingRenderings"]
        }
    }


}