import {Conversion, DesugaringStep} from "./Conversion";
import {LayoutConfigJson} from "../Json/LayoutConfigJson";
import {Utils} from "../../../Utils";
import * as metapaths from "../../../assets/layoutconfigmeta.json";
import * as tagrenderingmetapaths from "../../../assets/tagrenderingconfigmeta.json";

export class ExtractImages extends Conversion<LayoutConfigJson, string[]> {
    private _isOfficial: boolean;
    private _sharedTagRenderings: Map<string, any>;

    private static readonly layoutMetaPaths = (metapaths["default"] ?? metapaths).filter(mp => mp.typeHint !== undefined && (mp.typeHint === "image" || mp.typeHint === "icon"))
    private static readonly tagRenderingMetaPaths = (tagrenderingmetapaths["default"] ?? tagrenderingmetapaths).filter(trpath => trpath.typeHint === "rendered")


    constructor(isOfficial: boolean, sharedTagRenderings: Map<string, any>) {
        super("Extract all images from a layoutConfig using the meta paths",[],"ExctractImages");
        this._isOfficial = isOfficial;
        this._sharedTagRenderings = sharedTagRenderings;
    }

    convert(json: LayoutConfigJson, context: string): { result: string[], errors: string[], warnings: string[] } {
         const allFoundImages = []
        const errors = []
        const warnings = []
        for (const metapath of ExtractImages.layoutMetaPaths) {
            const mightBeTr = Array.isArray(metapath.type) && metapath.type.some(t => t["$ref"] == "#/definitions/TagRenderingConfigJson")
            const found = Utils.CollectPath(metapath.path, json)
            if (mightBeTr) {
                // We might have tagRenderingConfigs containing icons here
                for (const el of found) {
                    const path = el.path
                    const foundImage = el.leaf;
                    if (typeof foundImage === "string") {
                        
                        if(foundImage == ""){
                            errors.push(context+"."+path.join(".")+" Found an empty image")
                        }
                        
                        if(this._sharedTagRenderings?.has(foundImage)){
                            // This is not an image, but a shared tag rendering
                            continue
                        }
                        
                        allFoundImages.push(foundImage)
                    } else{
                        // This is a tagRendering where every rendered value might be an icon!
                        for (const trpath of ExtractImages.tagRenderingMetaPaths) {
                            const fromPath = Utils.CollectPath(trpath.path, foundImage)
                            for (const img of fromPath) {
                                if (typeof img.leaf !== "string") {
                                    (this._isOfficial ?   errors: warnings).push(context+"."+img.path.join(".")+": found an image path that is not a string: " + JSON.stringify(img.leaf))
                                }
                            }
                            allFoundImages.push(...fromPath.map(i => i.leaf).filter(i => typeof i=== "string"))
                            for (const pathAndImg of fromPath) {
                                if(pathAndImg.leaf === "" || pathAndImg.leaf["path"] == ""){
                                    errors.push(context+[...path,...pathAndImg.path].join(".")+": Found an empty image at ")
                                }
                            }
                        }

                    }
                }
            } else {
                allFoundImages.push(...found.map(i => i.leaf))
            }
        }

        const splitParts = [].concat(...Utils.NoNull(allFoundImages)
            .map(img => img["path"] ?? img)
            .map(img => img.split(";")))
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
            Utils.WalkPath(metapath.path, json, (leaf, path) => {
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