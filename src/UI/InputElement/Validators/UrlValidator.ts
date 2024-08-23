import { Validator } from "../Validator"
import { Translation } from "../../i18n/Translation"
import Translations from "../../i18n/Translations"

export default class UrlValidator extends Validator {
    private readonly _forceHttps: boolean

    private static readonly spamWebsites = new Set<string>([
        "booking.com",
        "hotel-details-guide.com",
        "tripingguide.com",
        "tripadvisor.com",
        "tripadvisor.co.uk",
        "tripadvisor.com.au",
        "katestravelexperience.eu",
        "hoteldetails.eu"
    ])

    private static readonly discouragedWebsites = new Set<string>([
        "facebook.com"
    ])

    constructor(name?: string, explanation?: string, forceHttps?: boolean) {
        super(
            name ?? "url",
            explanation ??
                "The validatedTextField will format URLs to always be valid and have a https://-header (even though the 'https'-part will be hidden from the user. Furthermore, some tracking parameters will be removed",
            "url"
        )
        this._forceHttps = forceHttps ?? false
    }

    /**
     *
     * new UrlValidator().reformat("https://example.com/page?fbclid=123456&utm_source=mastodon") // => "https://example.com/page"
     */
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

    /**
     *
     * const v = new UrlValidator()
     * v.getFeedback("example.").textFor("en") // => "This is not a valid web address"
     * v.getFeedback("https://booking.com/some-hotel.html").textFor("en").indexOf("search the official website") > 0 // => true
     *
     */
    getFeedback(s: string, getCountry?: () => string): Translation | undefined {
        if (
            !s.startsWith("http://") &&
            !s.startsWith("https://") &&
            !s.startsWith("http:")
        ) {
            s = "https://" + s
        }
        try{
            const url = new URL(s)
            let host = url.host.toLowerCase()
            if (host.startsWith("www.")) {
                host = host.slice(4)
            }
            if (UrlValidator.spamWebsites.has(host)) {
                return Translations.t.validation.url.spamSite.Subs({ host })
            }
            if (UrlValidator.discouragedWebsites.has(host)) {
                return Translations.t.validation.url.aggregator.Subs({ host })
            }


        }catch (e) {
            // pass
        }
        const upstream = super.getFeedback(s, getCountry)
        if (upstream) {
            return upstream
        }


        return undefined
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

            let host = url.host.toLowerCase()
            if (host.startsWith("www.")) {
                host = host.slice(4)
            }
            if (UrlValidator.spamWebsites.has(host)) {
                return false
            }

            const dotIndex = url.host.indexOf(".")
            return dotIndex > 0 && url.host[url.host.length - 1] !== "."
        } catch (e) {
            return false
        }
    }
}
