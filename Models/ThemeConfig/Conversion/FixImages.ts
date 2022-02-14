import {Conversion, DesugaringStep} from "./Conversion";
import {LayoutConfigJson} from "../Json/LayoutConfigJson";
import {Utils} from "../../../Utils";
import * as metapaths from "../../../assets/layoutconfigmeta.json";
import * as tagrenderingmetapaths from "../../../assets/tagrenderingconfigmeta.json";

export class ExtractImages extends Conversion<LayoutConfigJson, string[]> {
    private _isOfficial: boolean;
    constructor(isOfficial: boolean) {
        super("Extract all images from a layoutConfig using the meta paths",[],"ExctractImages");
        this._isOfficial = isOfficial;
    }

    convert(json: LayoutConfigJson, context: string): { result: string[], errors: string[], warnings: string[] } {
        const paths = metapaths["default"] ?? metapaths
        const trpaths = tagrenderingmetapaths["default"] ?? tagrenderingmetapaths
        const allFoundImages = []
        const errors = []
        const warnings = []
        for (const metapath of paths) {
            if (metapath.typeHint === undefined) {
                continue
            }
            if (metapath.typeHint !== "image" && metapath.typeHint !== "icon") {
                continue
            }

            const mightBeTr = Array.isArray(metapath.type) && metapath.type.some(t => t["$ref"] == "#/definitions/TagRenderingConfigJson")
            const found = Utils.CollectPath(metapath.path, json)
            if (mightBeTr) {
                // We might have tagRenderingConfigs containing icons here
                for (const foundImage of found) {
                    if (typeof foundImage === "string") {
                        allFoundImages.push(foundImage)
                    } else {
                        // This is a tagRendering where every rendered value might be an icon!
                        for (const trpath of trpaths) {
                            if (trpath.typeHint !== "rendered") {
                                continue
                            }
                            const fromPath = Utils.CollectPath(trpath.path, foundImage)
                            for (const img of fromPath) {
                                if (typeof img !== "string") {
                                    (this._isOfficial ?   errors: warnings).push(context+": found an image path that is not a path at " + context + "." + metapath.path.join(".") + ": " + JSON.stringify(img))
                                }
                            }
                            allFoundImages.push(...fromPath.filter(i => typeof i === "string"))
                        }

                    }
                }
            } else {
                allFoundImages.push(...found)
            }
        }

        const splitParts = [].concat(...Utils.NoNull(allFoundImages).map(img => img.split(";")))
            .map(img => img.split(":")[0])
        return {result: Utils.Dedup(splitParts), errors, warnings};
    }

}

export class FixImages extends DesugaringStep<LayoutConfigJson> {
    private readonly _knownImages: Set<string>;

    constructor(knownImages: Set<string>) {
        super("Walks over the entire theme and replaces images to the relative URL. Only works if the ID of the theme is an URL",[],"fixImages");
        this._knownImages = knownImages;
    }

    convert(json: LayoutConfigJson, context: string): { result: LayoutConfigJson } {
        let url: URL;
        try {
            url = new URL(json.id)
        } catch (e) {
            // Not a URL, we don't rewrite
            return {result: json}
        }

        const absolute = url.protocol + "//" + url.host
        let relative = url.protocol + "//" + url.host + url.pathname
        relative = relative.substring(0, relative.lastIndexOf("/"))
        const self = this;

        function replaceString(leaf: string) {
            if (self._knownImages.has(leaf)) {
                return leaf;
            }
            if (leaf.startsWith("./")) {
                return relative + leaf.substring(1)
            }
            if (leaf.startsWith("/")) {
                return absolute + leaf
            }
            return leaf;
        }

        json = Utils.Clone(json)

        let paths = metapaths["default"] ?? metapaths
        let trpaths = tagrenderingmetapaths["default"] ?? tagrenderingmetapaths

        for (const metapath of paths) {
            if (metapath.typeHint !== "image" && metapath.typeHint !== "icon") {
                continue
            }
            const mightBeTr = Array.isArray(metapath.type) && metapath.type.some(t => t["$ref"] == "#/definitions/TagRenderingConfigJson")
            Utils.WalkPath(metapath.path, json, leaf => {
                if (typeof leaf === "string") {
                    return replaceString(leaf)
                }

                if (mightBeTr) {
                    // We might have reached a tagRenderingConfig containing icons
                    // lets walk every rendered value and fix the images in there
                    for (const trpath of trpaths) {
                        if (trpath.typeHint !== "rendered") {
                            continue
                        }
                        Utils.WalkPath(trpath.path, leaf, (rendered => {
                            return replaceString(rendered)
                        }))
                    }
                }


                return leaf;
            })
        }


        return {
            result: json
        };
    }
}