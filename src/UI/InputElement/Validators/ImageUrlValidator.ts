import UrlValidator from "./UrlValidator"
import { Translation } from "../../i18n/Translation"

export default class ImageUrlValidator extends UrlValidator {
    private static readonly allowedExtensions = ["jpg", "jpeg", "svg", "png"]
    public readonly isMeta = true

    constructor() {
        super(
            "image",
            "Same as the URL-parameter, except that it checks that the URL ends with `.jpg`, `.png` or some other typical image format"
        )
    }

    private static hasValidExternsion(str: string): boolean {
        str = str.toLowerCase()
        return ImageUrlValidator.allowedExtensions.some((ext) => str.endsWith(ext))
    }

    getFeedback(s: string, _?: () => string): Translation | undefined {
        const superF = super.getFeedback(s, _)
        if (superF) {
            return superF
        }
        if (!ImageUrlValidator.hasValidExternsion(s)) {
            return new Translation(
                "This URL does not end with one of the allowed extensions. These are: " +
                    ImageUrlValidator.allowedExtensions.join(", ")
            )
        }
        return undefined
    }

    isValid(str: string): boolean {
        if (!super.isValid(str)) {
            return false
        }
        return ImageUrlValidator.hasValidExternsion(str)
    }
}
