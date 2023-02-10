import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"
import { OsmConnection } from "../Osm/OsmConnection"
import { MangroveIdentity } from "../Web/MangroveReviews"
import { Store, UIEventSource } from "../UIEventSource"
import { QueryParameters } from "../Web/QueryParameters"
import Locale from "../../UI/i18n/Locale"
import ElementsState from "./ElementsState"
import SelectedElementTagsUpdater from "../Actors/SelectedElementTagsUpdater"
import { Changes } from "../Osm/Changes"
import ChangeToElementsActor from "../Actors/ChangeToElementsActor"
import PendingChangesUploader from "../Actors/PendingChangesUploader"
import Maproulette from "../Maproulette"

/**
 * The part of the state which keeps track of user-related stuff, e.g. the OSM-connection,
 * which layers they enabled, ...
 */
export default class UserRelatedState extends ElementsState {
    /**
     The user credentials
     */
    public osmConnection: OsmConnection
    /**
     THe change handler
     */
    public changes: Changes
    /**
     * The key for mangrove
     */
    public mangroveIdentity: MangroveIdentity

    /**
     * Maproulette connection
     */
    public maprouletteConnection: Maproulette

    public readonly isTranslator: Store<boolean>

    public readonly installedUserThemes: Store<string[]>

    constructor(layoutToUse: LayoutConfig, options?: { attemptLogin: true | boolean }) {
        super(layoutToUse)

        this.osmConnection = new OsmConnection({
            dryRun: this.featureSwitchIsTesting,
            fakeUser: this.featureSwitchFakeUser.data,
            oauth_token: QueryParameters.GetQueryParameter(
                "oauth_token",
                undefined,
                "Used to complete the login"
            ),
            osmConfiguration: <"osm" | "osm-test">this.featureSwitchApiURL.data,
            attemptLogin: options?.attemptLogin,
        })
        {
            const translationMode: UIEventSource<undefined | "true" | "false" | "mobile" | string> =
                this.osmConnection.GetPreference("translation-mode")
            translationMode.addCallbackAndRunD((mode) => {
                mode = mode.toLowerCase()
                if (mode === "true" || mode === "yes") {
                    Locale.showLinkOnMobile.setData(false)
                    Locale.showLinkToWeblate.setData(true)
                } else if (mode === "false" || mode === "no") {
                    Locale.showLinkToWeblate.setData(false)
                } else if (mode === "mobile") {
                    Locale.showLinkOnMobile.setData(true)
                    Locale.showLinkToWeblate.setData(true)
                } else {
                    Locale.showLinkOnMobile.setData(false)
                    Locale.showLinkToWeblate.setData(false)
                }
            })
        }

        this.changes = new Changes(this, layoutToUse?.isLeftRightSensitive() ?? false)

        new ChangeToElementsActor(this.changes, this.allElements)
        new PendingChangesUploader(this.changes, this.selectedElement)

        this.mangroveIdentity = new MangroveIdentity(
            this.osmConnection.GetLongPreference("identity", "mangrove")
        )

        this.maprouletteConnection = new Maproulette()

        if (layoutToUse?.hideFromOverview) {
            this.osmConnection.isLoggedIn.addCallbackAndRunD((loggedIn) => {
                if (loggedIn) {
                    this.osmConnection
                        .GetPreference("hidden-theme-" + layoutToUse?.id + "-enabled")
                        .setData("true")
                    return true
                }
            })
        }

        if (this.layoutToUse !== undefined && !this.layoutToUse.official) {
            console.log("Marking unofficial theme as visited")
            this.osmConnection.GetLongPreference("unofficial-theme-" + this.layoutToUse.id).setData(
                JSON.stringify({
                    id: this.layoutToUse.id,
                    icon: this.layoutToUse.icon,
                    title: this.layoutToUse.title.translations,
                    shortDescription: this.layoutToUse.shortDescription.translations,
                    definition: this.layoutToUse["definition"],
                })
            )
        }

        this.InitializeLanguage()
        new SelectedElementTagsUpdater(this)
        this.installedUserThemes = this.InitInstalledUserThemes()
    }

    public GetUnofficialTheme(id: string):
        | {
              id: string
              icon: string
              title: any
              shortDescription: any
              definition?: any
              isOfficial: boolean
          }
        | undefined {
        console.log("GETTING UNOFFICIAL THEME")
        const pref = this.osmConnection.GetLongPreference("unofficial-theme-" + id)
        const str = pref.data

        if (str === undefined || str === "undefined" || str === "") {
            pref.setData(null)
            return undefined
        }

        try {
            const value: {
                id: string
                icon: string
                title: any
                shortDescription: any
                definition?: any
                isOfficial: boolean
            } = JSON.parse(str)
            value.isOfficial = false
            return value
        } catch (e) {
            console.warn(
                "Removing theme " +
                    id +
                    " as it could not be parsed from the preferences; the content is:",
                str
            )
            pref.setData(null)
            return undefined
        }
    }

    private InitializeLanguage() {
        const layoutToUse = this.layoutToUse
        Locale.language.syncWith(this.osmConnection.GetPreference("language"))
        Locale.language.addCallback((currentLanguage) => {
            if (layoutToUse === undefined) {
                return
            }
            if (Locale.showLinkToWeblate.data) {
                return true // Disable auto switching as we are in translators mode
            }
            if (this.layoutToUse.language.indexOf(currentLanguage) < 0) {
                console.log(
                    "Resetting language to",
                    layoutToUse.language[0],
                    "as",
                    currentLanguage,
                    " is unsupported"
                )
                // The current language is not supported -> switch to a supported one
                Locale.language.setData(layoutToUse.language[0])
            }
        })
        Locale.language.ping()
    }

    private InitInstalledUserThemes(): Store<string[]> {
        const prefix = "mapcomplete-unofficial-theme-"
        const postfix = "-combined-length"
        return this.osmConnection.preferencesHandler.preferences.map((prefs) =>
            Object.keys(prefs)
                .filter((k) => k.startsWith(prefix) && k.endsWith(postfix))
                .map((k) => k.substring(prefix.length, k.length - postfix.length))
        )
    }
}
