import { Validator } from "../Validator"

export default class UrlValidator extends Validator {
    private readonly _forceHttps: boolean
    constructor(name?: string, explanation?: string, forceHttps?: boolean) {
        super(
            name ?? "url",
            explanation ??
                "The validatedTextField will format URLs to always be valid and have a https://-header (even though the 'https'-part will be hidden from the user. Furthermore, some tracking parameters will be removed",
            "url"
        )
        this._forceHttps = forceHttps ?? false
    }
    reformat(str: string): string {
        try {
            let url: URL
            // str = str.toLowerCase() // URLS are case sensitive. Lowercasing them might break some URLS. See #763
            if (
                !str.startsWith("http://") &&
                !str.startsWith("https://") &&
                !str.startsWith("http:")
            ) {
                url = new URL("https://" + str)
            } else {
                url = new URL(str)
            }
            if (this._forceHttps) {
                url.protocol = "https:"
            }
            const blacklistedTrackingParams = [
                "fbclid", // Oh god, how I hate the fbclid. Let it burn, burn in hell!
                "gclid",
                "cmpid",
                "agid",
                "utm",
                "utm_source",
                "utm_medium",
                "campaignid",
                "campaign",
                "AdGroupId",
                "AdGroup",
                "TargetId",
                "msclkid",
                "pk_source",
                "pk_medium",
                "pk_campaign",
                "pk_content",
                "pk_kwd",
            ]
            for (const dontLike of blacklistedTrackingParams) {
                url.searchParams.delete(dontLike.toLowerCase())
            }
            let cleaned = url.toString()
            if (cleaned.endsWith("/") && !str.endsWith("/")) {
                // Do not add a trailing '/' if it wasn't typed originally
                cleaned = cleaned.substr(0, cleaned.length - 1)
            }

            return cleaned
        } catch (e) {
            console.error(e)
            return undefined
        }
    }

    isValid(str: string): boolean {
        try {
            if (
                !str.startsWith("http://") &&
                !str.startsWith("https://") &&
                !str.startsWith("http:")
            ) {
                str = "https://" + str
            }
            const url = new URL(str)
            const dotIndex = url.host.indexOf(".")
            return dotIndex > 0 && url.host[url.host.length - 1] !== "."
        } catch (e) {
            return false
        }
    }
}
