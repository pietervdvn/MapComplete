import { Conversion, DesugaringStep } from "./Conversion"
import { LayoutConfigJson } from "../Json/LayoutConfigJson"
import { Utils } from "../../../Utils"
import metapaths from "../../../assets/schemas/layoutconfigmeta.json"
import tagrenderingmetapaths from "../../../assets/schemas/questionabletagrenderingconfigmeta.json"
import Translations from "../../../UI/i18n/Translations"

import { parse as parse_html } from "node-html-parser"
import { ConversionContext } from "./ConversionContext"

export class ExtractImages extends Conversion<
    LayoutConfigJson,
    { path: string; context: string }[]
> {
    private static readonly layoutMetaPaths = metapaths.filter((mp) => {
        const typeHint = mp.hints.typehint
        return (
            ExtractImages.mightBeTagRendering(<any>mp) ||
            (typeHint !== undefined &&
                (typeHint === "image" ||
                    typeHint === "icon" ||
                    typeHint === "image[]" ||
                    typeHint === "icon[]"))
        )
    })
    private static readonly tagRenderingMetaPaths = tagrenderingmetapaths
    private _isOfficial: boolean
    private _sharedTagRenderings: Set<string>

    constructor(isOfficial: boolean, sharedTagRenderings: Set<string>) {
        super("Extract all images from a layoutConfig using the meta paths.", [], "ExctractImages")
        this._isOfficial = isOfficial
        this._sharedTagRenderings = sharedTagRenderings
    }

    public static mightBeTagRendering(metapath: { type?: string | string[] }): boolean {
        if (!metapath.type) {
            return false
        }
        let type: any[]
        if (!Array.isArray(metapath.type)) {
            type = [metapath.type]
        } else {
            type = metapath.type
        }
        return type.some(
            (t) =>
                t !== null &&
                (t["$ref"] == "#/definitions/TagRenderingConfigJson" ||
                    t["$ref"] == "#/definitions/MinimalTagRenderingConfigJson" ||
                    t["$ref"] == "#/definitions/QuestionableTagRenderingConfigJson" ||
                    (t["properties"]?.render !== undefined &&
                        t["properties"]?.mappings !== undefined))
        )
    }

    /**
     *  const images = new ExtractImages(true, new Set<string>()).convert(<any>{
     *     "layers": [
     *         {
     *             tagRenderings: [
     *                 {
     *                     "mappings": [
     *                         {
     *                             "if": "bicycle_parking=stands",
     *                             "then": {
     *                                 "en": "Staple racks",
     *                             },
     *                             "icon": {
     *                                 path: "./assets/layers/bike_parking/staple.svg",
     *                                 class: "small"
     *                             }
     *                         },
     *                         {
     *                             "if": "bicycle_parking=stands",
     *                             "then": {
     *                                 "en": "Bollard",
     *                             },
     *                             "icon": "./assets/layers/bike_parking/bollard.svg",
     *                         }
     *                     ]
     *                 }
     *             ]
     *         }
     *     ]
     * }, ConversionContext.test()).map(i => i.path);
     * images.length // => 2
     * images.findIndex(img => img == "./assets/layers/bike_parking/staple.svg") >= 0 // => true
     * images.findIndex(img => img == "./assets/layers/bike_parking/bollard.svg") >= 0 // => true
     *
     * // should not pickup rotation, should drop color
     * const images = new ExtractImages(true, new Set<string>()).convert(<any>{"layers": [{"pointRendering": [{"location": ["point", "centroid"],marker: [{"icon": "pin:black"}],rotation: 180,iconSize: "40,40,center"}]}]
     * }, ConversionContext.test())
     * images.length // => 1
     * images[0].path // => "pin"
     *
     */
    convert(
        json: LayoutConfigJson,
        context: ConversionContext
    ): { path: string; context: string }[] {
        const allFoundImages: { path: string; context: string }[] = []
        for (const metapath of ExtractImages.layoutMetaPaths) {
            const mightBeTr = ExtractImages.mightBeTagRendering(<any>metapath)
            const allRenderedValuesAreImages =
                metapath.hints.typehint === "icon" || metapath.hints.typehint === "image"
            const found = Utils.CollectPath(metapath.path, json)
            if (mightBeTr) {
                // We might have tagRenderingConfigs containing icons here
                for (const el of found) {
                    const path = el.path
                    const foundImage = el.leaf
                    if (typeof foundImage === "string") {
                        if (!allRenderedValuesAreImages) {
                            continue
                        }

                        if (foundImage == "") {
                            context.warn(context + "." + path.join(".") + " Found an empty image")
                        }

                        if (this._sharedTagRenderings?.has(foundImage)) {
                            // This is not an image, but a shared tag rendering
                            // At key positions for checking, they'll be expanded already, so we can safely ignore them here
                            continue
                        }

                        allFoundImages.push({ path: foundImage, context: context + "." + path })
                    } else {
                        // This is a tagRendering.
                        // Either every rendered value might be an icon
                        // or -in the case of a normal tagrendering- only the 'icons' in the mappings have an icon (or exceptionally an '<img>' tag in the translation
                        for (const trpath of ExtractImages.tagRenderingMetaPaths) {
                            // Inspect all the rendered values
                            const fromPath = Utils.CollectPath(trpath.path, foundImage)
                            const isRendered = trpath.hints.typehint === "rendered"
                            const isImage =
                                trpath.hints.typehint === "icon" ||
                                trpath.hints.typehint === "image"
                            for (const img of fromPath) {
                                if (allRenderedValuesAreImages && isRendered) {
                                    // What we found is an image
                                    if (img.leaf === "" || img.leaf["path"] == "") {
                                        context
                                            .enter(path)
                                            .enter(img.path)
                                            .warn("Found an emtpy image")
                                    } else if (typeof img.leaf !== "string") {
                                        const c = context.enter(img.path)
                                        const msg =
                                            "found an image path that is not a string: " +
                                            JSON.stringify(img.leaf)
                                        if (this._isOfficial) {
                                            c.err(msg)
                                        } else {
                                            c.warn(msg)
                                        }
                                    } else {
                                        allFoundImages.push({
                                            path: img.leaf,
                                            context: context + "." + path,
                                        })
                                    }
                                }
                                if (!allRenderedValuesAreImages && isImage) {
                                    // Extract images from the translations
                                    allFoundImages.push(
                                        ...Translations.T(
                                            img.leaf,
                                            "extract_images from " + img.path.join(".")
                                        )
                                            .ExtractImages(false)
                                            .map((path) => ({
                                                path,
                                                context: context + "." + path,
                                            }))
                                    )
                                }
                            }
                        }
                    }
                }
            } else {
                for (const foundElement of found) {
                    if (foundElement.leaf === "") {
                        context.enter(foundElement.path).warn("Found an empty image")

                        continue
                    }
                    if (typeof foundElement.leaf !== "string") {
                        continue
                    }
                    allFoundImages.push({
                        context: context.path.join(".") + "." + foundElement.path.join("."),
                        path: foundElement.leaf,
                    })
                }
            }
        }

        const cleanedImages: { path: string; context: string }[] = []

        for (const foundImage of allFoundImages) {
            if (foundImage.path.startsWith("<") && foundImage.path.endsWith(">")) {
                // This is probably html
                const doc = parse_html(foundImage.path)
                const images = Array.from(doc.getElementsByTagName("img"))
                const paths = images.map((i) => i.getAttribute("src"))
                cleanedImages.push(
                    ...paths.map((path) => ({ path, context: foundImage.context + " (in html)" }))
                )
                continue
            }

            // Split "circle:white;./assets/layers/.../something.svg" into ["circle", "./assets/layers/.../something.svg"]
            const allPaths = Utils.NoNull(
                Utils.NoEmpty(foundImage.path?.split(";")?.map((part) => part.split(":")[0]))
            )
            for (const path of allPaths) {
                cleanedImages.push({ path, context: foundImage.context })
            }
        }

        return cleanedImages
    }
}

export class FixImages extends DesugaringStep<LayoutConfigJson> {
    private readonly _knownImages: Set<string>

    constructor(knownImages: Set<string>) {
        super(
            "Walks over the entire theme and replaces images to the relative URL. Only works if the ID of the theme is an URL",
            [],
            "fixImages"
        )
        this._knownImages = knownImages
    }

    /**
     * If the id is an URL to a json file, replaces "./" in images with the path to the json file
     *
     * const theme = {
     *          "id": "https://raw.githubusercontent.com/seppesantens/MapComplete-Themes/main/VerkeerdeBordenDatabank/verkeerdeborden.json"
     *         "layers": [
     *             {
     *                 "pointRendering": [
     *                     {
     *                         marker: [{"icon": "./TS_bolt.svg"}],
     *                         iconBadges: [{
     *                             if: "id=yes",
     *                             then: {
     *                                 mappings: [
     *                                     {
     *                                         if: "id=yes",
     *                                         then: "./Something.svg"
     *                                     }
     *                                 ]
     *                             }
     *                         }],
     *                         "location": [
     *                             "point",
     *                             "centroid"
     *                         ]
     *                     }
     *                 ]
     *             }
     *         ],
     *     }
     * const fixed = new FixImages(new Set<string>()).convert(<any> theme, ConversionContext.test())
     * fixed.layers[0]["pointRendering"][0].marker[0].icon // => "https://raw.githubusercontent.com/seppesantens/MapComplete-Themes/main/VerkeerdeBordenDatabank/TS_bolt.svg"
     * fixed.layers[0]["pointRendering"][0].iconBadges[0].then.mappings[0].then // => "https://raw.githubusercontent.com/seppesantens/MapComplete-Themes/main/VerkeerdeBordenDatabank/Something.svg"
     */
    convert(json: LayoutConfigJson, context: ConversionContext): LayoutConfigJson {
        let url: URL
        try {
            url = new URL(json.id)
        } catch (e) {
            // Not a URL, we don't rewrite
            return json
        }

        const absolute = url.protocol + "//" + url.host
        let relative = url.protocol + "//" + url.host + url.pathname
        relative = relative.substring(0, relative.lastIndexOf("/"))
        const self = this

        if (relative.endsWith("assets/generated/themes")) {
            context.warn(
                "Detected 'assets/generated/themes' as relative URL. I'm assuming that you are loading your file for the MC-repository, so I'm rewriting all image links as if they were absolute instead of relative"
            )
            relative = absolute
        }

        function replaceString(leaf: string) {
            if (self._knownImages.has(leaf)) {
                return leaf
            }

            if (typeof leaf !== "string") {
                context.warn(
                    "Found a non-string object while replacing images: " + JSON.stringify(leaf)
                )
                return leaf
            }

            if (leaf.startsWith("./")) {
                return relative + leaf.substring(1)
            }
            if (leaf.startsWith("/")) {
                return absolute + leaf
            }
            return leaf
        }

        json = Utils.Clone(json)

        for (const metapath of metapaths) {
            if (metapath.hints.typehint !== "image" && metapath.hints.typehint !== "icon") {
                continue
            }
            const mightBeTr = ExtractImages.mightBeTagRendering(<any>metapath)
            Utils.WalkPath(metapath.path, json, (leaf) => {
                if (typeof leaf === "string") {
                    return replaceString(leaf)
                }

                if (mightBeTr) {
                    // We might have reached a tagRenderingConfig containing icons
                    // lets walk every rendered value and fix the images in there
                    for (const trpath of tagrenderingmetapaths) {
                        if (trpath.hints.typehint !== "rendered") {
                            continue
                        }
                        Utils.WalkPath(trpath.path, leaf, (rendered) => {
                            return replaceString(rendered)
                        })
                    }
                }

                return leaf
            })
        }

        return json
    }
}
