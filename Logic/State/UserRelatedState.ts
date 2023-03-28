import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"
import { OsmConnection } from "../Osm/OsmConnection"
import { MangroveIdentity } from "../Web/MangroveReviews"
import { Store, Stores, UIEventSource } from "../UIEventSource"
import Locale from "../../UI/i18n/Locale"
import { Changes } from "../Osm/Changes"
import StaticFeatureSource from "../FeatureSource/Sources/StaticFeatureSource"
import FeatureSource from "../FeatureSource/FeatureSource"
import { Feature } from "geojson"

/**
 * The part of the state which keeps track of user-related stuff, e.g. the OSM-connection,
 * which layers they enabled, ...
 */
export default class UserRelatedState {
    /**
     The user credentials
     */
    public osmConnection: OsmConnection
    /**
     * The key for mangrove
     */
    public readonly mangroveIdentity: MangroveIdentity

    public readonly installedUserThemes: Store<string[]>

    public readonly showAllQuestionsAtOnce: UIEventSource<boolean>
    public readonly homeLocation: FeatureSource

    /**
     * The number of seconds that the GPS-locations are stored in memory.
     * Time in seconds
     */
    public gpsLocationHistoryRetentionTime = new UIEventSource(
        7 * 24 * 60 * 60,
        "gps_location_retention"
    )

    constructor(osmConnection: OsmConnection, availableLanguages?: string[]) {
        this.osmConnection = osmConnection
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

        this.showAllQuestionsAtOnce = UIEventSource.asBoolean(
            this.osmConnection.GetPreference("show-all-questions", "false", {
                documentation:
                    "Either 'true' or 'false'. If set, all questions will be shown all at once",
            })
        )

        this.mangroveIdentity = new MangroveIdentity(
            this.osmConnection.GetLongPreference("identity", "mangrove")
        )

        this.InitializeLanguage(availableLanguages)

        this.installedUserThemes = this.InitInstalledUserThemes()

        this.homeLocation = this.initHomeLocation()
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

    public markLayoutAsVisited(layout: LayoutConfig) {
        if (!layout) {
            console.error("Trying to mark a layout as visited, but ", layout, " got passed")
            return
        }
        if (layout.hideFromOverview) {
            this.osmConnection.isLoggedIn.addCallbackAndRunD((loggedIn) => {
                if (loggedIn) {
                    this.osmConnection
                        .GetPreference("hidden-theme-" + layout?.id + "-enabled")
                        .setData("true")
                    return true
                }
            })
        }
        if (!layout.official) {
            this.osmConnection.GetLongPreference("unofficial-theme-" + layout.id).setData(
                JSON.stringify({
                    id: layout.id,
                    icon: layout.icon,
                    title: layout.title.translations,
                    shortDescription: layout.shortDescription.translations,
                    definition: layout["definition"],
                })
            )
        }
    }

    private InitializeLanguage(availableLanguages?: string[]) {
        Locale.language.syncWith(this.osmConnection.GetPreference("language"))
        Locale.language.addCallback((currentLanguage) => {
            if (Locale.showLinkToWeblate.data) {
                return true // Disable auto switching as we are in translators mode
            }
            if (availableLanguages?.indexOf(currentLanguage) < 0) {
                console.log(
                    "Resetting language to",
                    availableLanguages[0],
                    "as",
                    currentLanguage,
                    " is unsupported"
                )
                // The current language is not supported -> switch to a supported one
                Locale.language.setData(availableLanguages[0])
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

    private initHomeLocation(): FeatureSource {
        const empty = []
        const feature: Store<Feature[]> = Stores.ListStabilized(
            this.osmConnection.userDetails.map((userDetails) => {
                if (userDetails === undefined) {
                    return undefined
                }
                const home = userDetails.home
                if (home === undefined) {
                    return undefined
                }
                return [home.lon, home.lat]
            })
        ).map((homeLonLat) => {
            if (homeLonLat === undefined) {
                return empty
            }
            return [
                <Feature>{
                    type: "Feature",
                    properties: {
                        id: "home",
                        "user:home": "yes",
                        _lon: homeLonLat[0],
                        _lat: homeLonLat[1],
                    },
                    geometry: {
                        type: "Point",
                        coordinates: homeLonLat,
                    },
                },
            ]
        })
        return new StaticFeatureSource(feature)
    }
}
