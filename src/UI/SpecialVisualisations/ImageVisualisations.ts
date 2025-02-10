import { SpecialVisualizationState, SpecialVisualizationSvelte } from "../SpecialVisualization"
import AllImageProviders from "../../Logic/ImageProviders/AllImageProviders"
import SvelteUIElement from "../Base/SvelteUIElement"
import ImageCarousel from "../Image/ImageCarousel.svelte"
import { Imgur } from "../../Logic/ImageProviders/Imgur"
import UploadImage from "../Image/UploadImage.svelte"
import { CombinedFetcher } from "../../Logic/Web/NearbyImagesSearch"
import { UIEventSource } from "../../Logic/UIEventSource"
import { Feature } from "geojson"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import { GeoOperations } from "../../Logic/GeoOperations"
import NearbyImages from "../Image/NearbyImages.svelte"
import NearbyImagesCollapsed from "../Image/NearbyImagesCollapsed.svelte"

class NearbyImageVis implements SpecialVisualizationSvelte {
    // Class must be in SpecialVisualisations due to weird cyclical import that breaks the tests
    args: { name: string; defaultValue?: string; doc: string; required?: boolean }[] = [
        {
            name: "mode",
            defaultValue: "closed",
            doc: "Either `open` or `closed`. If `open`, then the image carousel will always be shown",
        },
        {
            name: "readonly",
            required: false,
            doc: "If 'readonly' or 'yes', will not show the 'link'-button",
        },
    ]
    group: "images"
    docs =
        "A component showing nearby images loaded from various online services such as Mapillary. In edit mode and when used on a feature, the user can select an image to add to the feature"
    funcName = "nearby_images"
    needsUrls = CombinedFetcher.apiUrls

    constr(
        state: SpecialVisualizationState,
        tags: UIEventSource<Record<string, string>>,
        args: string[],
        feature: Feature,
        layer: LayerConfig
    ): SvelteUIElement {
        const isOpen = args[0] === "open"
        const readonly = args[1] === "readonly" || args[1] === "yes"
        const [lon, lat] = GeoOperations.centerpointCoordinates(feature)
        return new SvelteUIElement(isOpen ? NearbyImages : NearbyImagesCollapsed, {
            tags,
            state,
            lon,
            lat,
            feature,
            layer,
            linkable: !readonly,
        })
    }
}

export class ImageVisualisations {
    static initList(): SpecialVisualizationSvelte[] {
        return [
            new NearbyImageVis(),
            {
                funcName: "image_carousel",
                group: "images",
                docs: "Creates an image carousel for the given sources. An attempt will be made to guess what source is used. Supported: Wikidata identifiers, Wikipedia pages, Wikimedia categories, IMGUR (with attribution, direct links)",
                args: [
                    {
                        name: "image_key",
                        defaultValue: AllImageProviders.defaultKeys.join(","),
                        doc: "The keys given to the images, e.g. if <span class='literal-code'>image</span> is given, the first picture URL will be added as <span class='literal-code'>image</span>, the second as <span class='literal-code'>image:0</span>, the third as <span class='literal-code'>image:1</span>, etc... Multiple values are allowed if ';'-separated ",
                    },
                ],
                needsUrls: AllImageProviders.apiUrls,
                constr: (state, tags, args) => {
                    let imagePrefixes: string[] = undefined
                    if (args.length > 0) {
                        imagePrefixes = [].concat(...args.map((a) => a.split(",")))
                    }
                    const images = AllImageProviders.loadImagesFor(tags, imagePrefixes)
                    const estimated = tags.mapD((tags) =>
                        AllImageProviders.estimateNumberOfImages(tags, imagePrefixes)
                    )
                    return new SvelteUIElement(ImageCarousel, { state, tags, images, estimated })
                },
            },
            {
                funcName: "image_upload",
                group: "images",
                docs: "Creates a button where a user can upload an image to IMGUR",
                needsUrls: [Imgur.apiUrl, ...Imgur.supportingUrls],
                args: [
                    {
                        name: "image-key",
                        doc: "Image tag to add the URL to (or image-tag:0, image-tag:1 when multiple images are added)",
                        required: false,
                    },
                    {
                        name: "label",
                        doc: "The text to show on the button",
                        required: false,
                    },
                    {
                        name: "disable_blur",
                        doc: "If set to 'true' or 'yes', then face blurring will be disabled. To be used sparingly",
                        required: false,
                    },
                ],
                constr: (state, tags, args, feature) => {
                    const targetKey = args[0] === "" ? undefined : args[0]
                    const noBlur = args[3]?.toLowerCase()?.trim()
                    return new SvelteUIElement(UploadImage, {
                        state,
                        tags,
                        targetKey,
                        feature,
                        labelText: args[1],
                        image: args[2],
                        noBlur: noBlur === "true" || noBlur === "yes",
                    })
                },
            },
        ]
    }
}
