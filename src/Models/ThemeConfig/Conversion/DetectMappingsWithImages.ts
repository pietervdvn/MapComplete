import { DesugaringStep } from "./Conversion"
import { TagRenderingConfigJson } from "../Json/TagRenderingConfigJson"
import { ConversionContext } from "./ConversionContext"
import { Utils } from "../../../Utils"
import Translations from "../../../UI/i18n/Translations"
import { DoesImageExist } from "./Validation"

export class DetectMappingsWithImages extends DesugaringStep<TagRenderingConfigJson> {
    private readonly _doesImageExist: DoesImageExist

    constructor(doesImageExist: DoesImageExist) {
        super(
            "Checks that 'then'clauses in mappings don't have images, but use 'icon' instead",
            [],
            "DetectMappingsWithImages",
        )
        this._doesImageExist = doesImageExist
    }

    /**
     * const context = ConversionContext.test()
     * const r = new DetectMappingsWithImages(new DoesImageExist(new Set<string>())).convert({
     *     "mappings": [
     *         {
     *             "if": "bicycle_parking=stands",
     *             "then": {
     *                 "en": "Staple racks <img style='width: 25%' src='./assets/layers/bike_parking/staple.svg'>",
     *                 "nl": "Nietjes <img style='width: 25%'' src='./assets/layers/bike_parking/staple.svg'>",
     *                 "fr": "Arceaux <img style='width: 25%'' src='./assets/layers/bike_parking/staple.svg'>",
     *                 "gl": "De roda (Stands) <img style='width: 25%'' src='./assets/layers/bike_parking/staple.svg'>",
     *                 "de": "Fahrradbügel <img style='width: 25%'' src='./assets/layers/bike_parking/staple.svg'>",
     *                 "hu": "Korlát <img style='width: 25%' src='./assets/layers/bike_parking/staple.svg'>",
     *                 "it": "Archetti <img style='width: 25%' src='./assets/layers/bike_parking/staple.svg'>",
     *                 "zh_Hant": "單車架 <img style='width: 25%' src='./assets/layers/bike_parking/staple.svg'>"
     *             }
     *         }]
     * }, context);
     * context.hasErrors() // => true
     * context.getAll("error").some(msg => msg.message.indexOf("./assets/layers/bike_parking/staple.svg") >= 0) // => true
     */
    convert(json: TagRenderingConfigJson, context: ConversionContext): TagRenderingConfigJson {
        if (json.mappings === undefined || json.mappings.length === 0) {
            return json
        }
        const ignoreToken = "ignore-image-in-then"
        for (let i = 0; i < json.mappings.length; i++) {
            const mapping = json.mappings[i]
            const ignore = mapping["#"]?.indexOf(ignoreToken) >= 0
            const images = Utils.Dedup(Translations.T(mapping.then)?.ExtractImages() ?? [])
            const ctx = context.enters("mappings", i)
            if (images.length > 0) {
                if (!ignore) {
                    ctx.err(
                        `A mapping has an image in the 'then'-clause. Remove the image there and use \`"icon": <your-image>\` instead. The images found are ${images.join(
                            ", ",
                        )}. (This check can be turned of by adding "#": "${ignoreToken}" in the mapping, but this is discouraged`,
                    )
                } else {
                    ctx.info(
                        `Ignored image ${images.join(
                            ", ",
                        )} in 'then'-clause of a mapping as this check has been disabled`,
                    )

                    for (const image of images) {
                        this._doesImageExist.convert(image, ctx)
                    }
                }
            } else if (ignore) {
                ctx.warn(`Unused '${ignoreToken}' - please remove this`)
            }
        }

        return json
    }
}
