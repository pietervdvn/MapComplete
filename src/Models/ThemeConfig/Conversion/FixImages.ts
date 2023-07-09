import { Conversion, DesugaringStep } from "./Conversion"
import { LayoutConfigJson } from "../Json/LayoutConfigJson"
import { Utils } from "../../../Utils"
import metapaths from "../../../assets/layoutconfigmeta.json"
import tagrenderingmetapaths from "../../../assets/questionabletagrenderingconfigmeta.json"
import Translations from "../../../UI/i18n/Translations"

import { parse as parse_html } from "node-html-parser"
export class ExtractImages extends Conversion<
    LayoutConfigJson,
    { path: string; context: string }[]
> {
    private _isOfficial: boolean
    private _sharedTagRenderings: Set<string>

    private static readonly layoutMetaPaths = metapaths.filter(
        (mp) =>
            ExtractImages.mightBeTagRendering(<any>mp) ||
            (mp.typeHint !== undefined &&
                (mp.typeHint === "image" ||
                    mp.typeHint === "icon" ||
                    mp.typeHint === "image[]" ||
                    mp.typeHint === "icon[]"))
    )
    private static readonly tagRenderingMetaPaths = tagrenderingmetapaths

    constructor(isOfficial: boolean, sharedTagRenderings: Set<string>) {
        super("Extract all images from a layoutConfig using the meta paths.", [], "ExctractImages")
        this._isOfficial = isOfficial
        this._sharedTagRenderings = sharedTagRenderings
    }

    public static mightBeTagRendering(metapath: { type?: string | string[] }): boolean {
        if (!Array.isArray(metapath.type)) {
            return false
        }
        return (
            metapath.type?.some(
                (t) =>
                    t["$ref"] == "#/definitions/TagRenderingConfigJson" ||
                    t["$ref"] == "#/definitions/QuestionableTagRenderingConfigJson"
            ) ?? false
        )
    }

    /**
     *  const images = new ExtractImages(true, new Map<string, any>()).convert(<any>{
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
     * }, "test").result.map(i => i.path);
     * images.length // => 2
     * images.findIndex(img => img == "./assets/layers/bike_parking/staple.svg") >= 0 // => true
     * images.findIndex(img => img == "./assets/layers/bike_parking/bollard.svg") >= 0 // => true
     *
     * // should not pickup rotation, should drop color
     * const images = new ExtractImages(true, new Set<string>()).convert(<any>{"layers": [{mapRendering: [{"location": ["point", "centroid"],"icon": "pin:black",rotation: 180,iconSize: "40,40,center"}]}]
     * }, "test").result
     * images.length // => 1
     * images[0].path // => "pin"
     *
     */
    convert(
        json: LayoutConfigJson,
        context: string
    ): { result: { path: string; context: string }[]; errors: string[]; warnings: string[] } {
        const allFoundImages: { path: string; context: string }[] = []
        const errors = []
        const warnings = []
        for (const metapath of ExtractImages.layoutMetaPaths) {
            const mightBeTr = ExtractImages.mightBeTagRendering(<any>metapath)
            const allRenderedValuesAreImages =
                metapath.typeHint === "icon" || metapath.typeHint === "image"
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
                            warnings.push(context + "." + path.join(".") + " Found an empty image")
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
                            const isRendered = trpath.typeHint === "rendered"
                            const isImage =
                                trpath.typeHint === "icon" || trpath.typeHint === "image"
                            for (const img of fromPath) {
                                if (allRenderedValuesAreImages && isRendered) {
                                    // What we found is an image
                                    if (img.leaf === "" || img.leaf["path"] == "") {
                                        warnings.push(
                                            context +
                                                [...path, ...img.path].join(".") +
                                                ": Found an empty image at "
                                        )
                                    } else if (typeof img.leaf !== "string") {
                                        ;(this._isOfficial ? errors : warnings).push(
                                            context +
                                                "." +
                                                img.path.join(".") +
                                                ": found an image path that is not a string: " +
                                                JSON.stringify(img.leaf)
                                        )
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
                        warnings.push(
                            context + "." + foundElement.path.join(".") + " Found an empty image"
                        )
                        continue
                    }
                    if (typeof foundElement.leaf !== "string") {
                        continue
                    }
                    allFoundImages.push({
                        context: context + "." + foundElement.path.join("."),
                        path: foundElement.leaf,
                    })
                }
            }
        }

        const cleanedImages: { path: string; context: string }[] = []

        for (const foundImage of allFoundImages) {
            if (foundImage.path.startsWith("<") && foundImage.path.endsWith(">")) {
                // These is probably html - we ignore
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

        return { result: cleanedImages, errors, warnings }
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
     *                 "mapRendering": [
     *                     {
     *                         "icon": "./TS_bolt.svg",
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
     * const fixed = new FixImages(new Set<string>()).convert(<any> theme, "test").result
     * fixed.layers[0]["mapRendering"][0].icon // => "https://raw.githubusercontent.com/seppesantens/MapComplete-Themes/main/VerkeerdeBordenDatabank/TS_bolt.svg"
     * fixed.layers[0]["mapRendering"][0].iconBadges[0].then.mappings[0].then // => "https://raw.githubusercontent.com/seppesantens/MapComplete-Themes/main/VerkeerdeBordenDatabank/Something.svg"
     */
    convert(
        json: LayoutConfigJson,
        context: string
    ): { result: LayoutConfigJson; warnings?: string[] } {
        let url: URL
        try {
            url = new URL(json.id)
        } catch (e) {
            // Not a URL, we don't rewrite
            return { result: json }
        }

        const warnings: string[] = []
        const absolute = url.protocol + "//" + url.host
        let relative = url.protocol + "//" + url.host + url.pathname
        relative = relative.substring(0, relative.lastIndexOf("/"))
        const self = this

        if (relative.endsWith("assets/generated/themes")) {
            warnings.push(
                "Detected 'assets/generated/themes' as relative URL. I'm assuming that you are loading your file for the MC-repository, so I'm rewriting all image links as if they were absolute instead of relative"
            )
            relative = absolute
        }

        function replaceString(leaf: string) {
            if (self._knownImages.has(leaf)) {
                return leaf
            }

            if (typeof leaf !== "string") {
                warnings.push(
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
            if (metapath.typeHint !== "image" && metapath.typeHint !== "icon") {
                continue
            }
            const mightBeTr = ExtractImages.mightBeTagRendering(<any>metapath)
            Utils.WalkPath(metapath.path, json, (leaf, path) => {
                if (typeof leaf === "string") {
                    return replaceString(leaf)
                }

                if (mightBeTr) {
                    // We might have reached a tagRenderingConfig containing icons
                    // lets walk every rendered value and fix the images in there
                    for (const trpath of tagrenderingmetapaths) {
                        if (trpath.typeHint !== "rendered") {
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

        return {
            warnings,
            result: json,
        }
    }
}
