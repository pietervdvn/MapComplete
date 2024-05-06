import { UIEventSource } from "../../Logic/UIEventSource"
import { LocalStorageSource } from "../../Logic/Web/LocalStorageSource"
import { Utils } from "../../Utils"
import { QueryParameters } from "../../Logic/Web/QueryParameters"

export default class Locale {
    public static showLinkToWeblate: UIEventSource<boolean> = new UIEventSource<boolean>(false)
    /**
     * Indicates that -if showLinkToWeblate is true- a link on mobile mode is shown as well
     */
    public static showLinkOnMobile: UIEventSource<boolean> = new UIEventSource<boolean>(false)
    public static language: UIEventSource<string> = Locale.setup()

    /**
     * Creates the UIEventSource containing the identifier of the current language
     *
     * If the QueryParameter 'language' is set, this query parameter will be used as backing source value
     * If not set, a localStorageSource will be used. This will use the navigator language by default
     *
     * Note that other parts of the code (most notably the UserRelatedState) might sync language selection with OSM.
     *
     *
     * @private
     */
    private static setup() {
        let source: UIEventSource<string>

        if (QueryParameters.wasInitialized("language") || Utils.runningFromConsole) {
            if (!Utils.runningFromConsole) {
                console.debug(
                    "Language was initialized via URL-parameter - using the URL parameter as store instead of local storage",
                    QueryParameters.wasInitialized("language")
                )
            }
            source = QueryParameters.GetQueryParameter(
                "language",
                undefined,
                [
                    "The language to display MapComplete in.",
                    "The user display language is determined in the following order:",
                    "",
                    "1. Use the language as set by the URL-parameter `language` (following ISO 639-1 | ex. `language=nl`). This will _disable_ setting the language by the user",
                    "2. If the user did log in and did set their language before with MapComplete, use this language. This language selection is synchronized accross devices using the openstreetmap.org user preferences.",
                    "3. If the user visited MapComplete before and did change their language manually, this changed language will be saved in local storage. Use the language from local storage",
                    "4. Use the navigator-language (if available)",
                    "5. Use English",
                    "",
                    "Note that this URL-parameter is not added to the URL-bar by default.",
                    "Note that the _loading_ screen will always use the navigator language.",
                    "",
                    "Translations are never complete. If a translation in a certain language is missing, English is used as fallback.",
                ].join("\n")
            )
        } else {
            let browserLanguage = "en"
            if (typeof navigator !== "undefined") {
                browserLanguage = navigator.languages?.[0] ?? navigator.language ?? "en"
                console.log("Browser language is", browserLanguage)
                if (browserLanguage === "en-US") {
                    browserLanguage = "en"
                }
            }
            source = LocalStorageSource.Get("language", browserLanguage)
        }

        if (!Utils.runningFromConsole && typeof document !== undefined) {
            source.addCallbackAndRun((l) => {
                document.documentElement.setAttribute("lang", l)
            })
        }

        if (!Utils.runningFromConsole) {
            window["setLanguage"] = function (language: string) {
                source.setData(language)
            }
        }

        QueryParameters.GetBooleanQueryParameter(
            "fs-translation-mode",
            false,
            "If set, will show a translation button next to every string."
        ).addCallbackAndRunD((tr) => {
            Locale.showLinkToWeblate.setData(Locale.showLinkToWeblate.data || tr)
        })

        return source
    }
}
