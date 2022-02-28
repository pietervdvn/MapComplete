import {Conversion, DesugaringStep} from "./Conversion";
import {LayoutConfigJson} from "../Json/LayoutConfigJson";
import {Utils} from "../../../Utils";
import * as metapaths from "../../../assets/layoutconfigmeta.json";
import * as tagrenderingmetapaths from "../../../assets/questionabletagrenderingconfigmeta.json";
import Translations from "../../../UI/i18n/Translations";

export class ExtractImages extends Conversion<LayoutConfigJson, string[]> {
    private _isOfficial: boolean;
    private _sharedTagRenderings: Map<string, any>;

    private static readonly layoutMetaPaths = (metapaths["default"] ?? metapaths)
        .filter(mp => (ExtractImages.mightBeTagRendering(mp)) || mp.typeHint !== undefined && (mp.typeHint === "image" || mp.typeHint === "icon"))
    private static readonly tagRenderingMetaPaths = (tagrenderingmetapaths["default"] ?? tagrenderingmetapaths)


    constructor(isOfficial: boolean, sharedTagRenderings: Map<string, any>) {
        super("Extract all images from a layoutConfig using the meta paths.",[],"ExctractImages");
        this._isOfficial = isOfficial;
        this._sharedTagRenderings = sharedTagRenderings;
    }
    
    public static mightBeTagRendering(metapath: {type: string | string[]}) : boolean{
        if(!Array.isArray(metapath.type)){
            return false
        }
        return metapath.type.some(t =>
            t["$ref"] == "#/definitions/TagRenderingConfigJson" ||  t["$ref"] == "#/definitions/QuestionableTagRenderingConfigJson")
    }

    convert(json: LayoutConfigJson, context: string): { result: string[], errors: string[], warnings: string[] } {
        const allFoundImages : string[] = []
        const errors = []
        const warnings = []
        for (const metapath of ExtractImages.layoutMetaPaths) {
            const mightBeTr = ExtractImages.mightBeTagRendering(metapath)
            const allRenderedValuesAreImages = metapath.typeHint === "icon" || metapath.typeHint === "image"
            const found = Utils.CollectPath(metapath.path, json)
            if (mightBeTr) {
                // We might have tagRenderingConfigs containing icons here
                for (const el of found) {
                    const path = el.path
                    const foundImage = el.leaf;
                     if (typeof foundImage === "string") {
                        
                         if(!allRenderedValuesAreImages){
                             continue
                         }
                         
                        if(foundImage == ""){
                            warnings.push(context+"."+path.join(".")+" Found an empty image")
                        }
                        
                        if(this._sharedTagRenderings?.has(foundImage)){
                            // This is not an image, but a shared tag rendering
                            // At key positions for checking, they'll be expanded already, so we can safely ignore them here
                            continue
                        }
                        
                        allFoundImages.push(foundImage)
                    } else{
                        // This is a tagRendering.
                        // Either every rendered value might be an icon 
                        // or -in the case of a normal tagrendering- only the 'icons' in the mappings have an icon (or exceptionally an '<img>' tag in the translation
                        for (const trpath of ExtractImages.tagRenderingMetaPaths) {
                            // Inspect all the rendered values
                            const fromPath = Utils.CollectPath(trpath.path, foundImage)
                            const isRendered = trpath.typeHint === "rendered"
                            const isImage = trpath.typeHint === "icon" || trpath.typeHint === "image"
                            for (const img of fromPath) {
                                if (allRenderedValuesAreImages && isRendered) {
                                    // What we found is an image
                                    if(img.leaf === "" || img.leaf["path"] == ""){
                                        warnings.push(context+[...path,...img.path].join(".")+": Found an empty image at ")
                                    }else if(typeof img.leaf !== "string"){
                                        (this._isOfficial ?   errors: warnings).push(context+"."+img.path.join(".")+": found an image path that is not a string: " + JSON.stringify(img.leaf))
                                    }else{
                                        allFoundImages.push(img.leaf)
                                    }
                                } 
                                if(!allRenderedValuesAreImages && isImage){
                                    // Extract images from the translations
                                    allFoundImages.push(...(Translations.T(img.leaf, "extract_images from "+img.path.join(".")).ExtractImages(false)))
                                }
                            }
                        }
                    } 
                }
            } else {
                for (const foundElement of found) {
                    if(foundElement.leaf === ""){
                        warnings.push(context+"."+foundElement.path.join(".")+" Found an empty image")
                        continue
                    }
                    allFoundImages.push(foundElement.leaf)
                }
                
            }
        }

        const splitParts = [].concat(...Utils.NoNull(allFoundImages)
            .map(img => img["path"] ?? img)
            .map(img => img.split(";")))
            .map(img => img.split(":")[0])
            .filter(img => img !== "")
        return {result: Utils.Dedup(splitParts), errors, warnings};
    }

}

export class FixImages extends DesugaringStep<LayoutConfigJson> {
    private readonly _knownImages: Set<string>;

    constructor(knownImages: Set<string>) {
        super("Walks over the entire theme and replaces images to the relative URL. Only works if the ID of the theme is an URL",[],"fixImages");
        this._knownImages = knownImages;
    }

    convert(json: LayoutConfigJson, context: string): { result: LayoutConfigJson, warnings?: [] } {
        let url: URL;
        try {
            url = new URL(json.id)
        } catch (e) {
            // Not a URL, we don't rewrite
            return {result: json}
        }

        const warnings = []
        const absolute = url.protocol + "//" + url.host
        let relative = url.protocol + "//" + url.host + url.pathname
        relative = relative.substring(0, relative.lastIndexOf("/"))
        const self = this;

        function replaceString(leaf: string) {
            if (self._knownImages.has(leaf)) {
                return leaf;
            }
            
            if(typeof leaf !== "string"){
                warnings.push("Found a non-string object while replacing images: "+JSON.stringify(leaf))
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
            const mightBeTr = ExtractImages.mightBeTagRendering(metapath)
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
            warnings,
            result: json
        };
    }
}