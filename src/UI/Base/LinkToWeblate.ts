import { VariableUiElement } from "./VariableUIElement"
import Locale from "../i18n/Locale"
import Link from "./Link"
import SvelteUIElement from "./SvelteUIElement"
import Translate from "../../assets/svg/Translate.svelte"

/**
 * The little 'translate'-icon next to every icon + some static helper functions
 */
export default class LinkToWeblate extends VariableUiElement {
    constructor(context: string, availableTranslations: object) {
        super(
            Locale.language.map(
                (ln) => {
                    if (Locale.showLinkToWeblate.data === false) {
                        return undefined
                    }
                    if (availableTranslations["*"] !== undefined) {
                        return undefined
                    }
                    if (context === undefined || context.indexOf(":") < 0) {
                        return undefined
                    }
                    const icon = new SvelteUIElement(Translate).SetClass(
                        "rounded-full inline-block w-3 h-3 ml-1 weblate-link self-center"
                    )
                    if (availableTranslations[ln] === undefined) {
                        icon.SetClass("bg-red-400")
                    }
                    return new Link(icon, LinkToWeblate.hrefToWeblate(ln, context), true).SetClass(
                        "weblate-link"
                    )
                },
                [Locale.showLinkToWeblate]
            )
        )
        this.SetClass("enable-links")
        const self = this
        Locale.showLinkOnMobile.addCallbackAndRunD((showOnMobile) => {
            if (showOnMobile) {
                self.RemoveClass("hidden-on-mobile")
            } else {
                self.SetClass("hidden-on-mobile")
            }
        })
    }

    /**
     * Creates the url to Hosted weblate
     *
     * LinkToWeblate.hrefToWeblate("nl", "category:some.context") // => "https://hosted.weblate.org/translate/mapcomplete/category/nl/?offset=1&q=context%3A%3D%22some.context%22"
     */
    public static hrefToWeblate(language: string, contextKey: string): string {
        if (contextKey === undefined || contextKey.indexOf(":") < 0) {
            return undefined
        }
        const [category, ...rest] = contextKey.split(":")
        const key = rest.join(":")

        const baseUrl = "https://hosted.weblate.org/translate/mapcomplete/"
        return baseUrl + category + "/" + language + "/?offset=1&q=context%3A%3D%22" + key + "%22"
    }

    public static hrefToWeblateZen(
        language: string,
        category: "core" | "themes" | "layers" | "shared-questions" | "glossary" | string,
        searchKey: string
    ): string {
        const baseUrl = "https://hosted.weblate.org/zen/mapcomplete/"
        // ?offset=1&q=+state%3A%3Ctranslated+context%3Acampersite&sort_by=-priority%2Cposition&checksum=
        return (
            baseUrl +
            category +
            "/" +
            language +
            "?offset=1&q=+state%3A%3Ctranslated+context%3A" +
            encodeURIComponent(searchKey) +
            "&sort_by=-priority%2Cposition&checksum="
        )
    }
}
