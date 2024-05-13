import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"
import { OsmConnection } from "../Osm/OsmConnection"
import { MangroveIdentity } from "../Web/MangroveReviews"
import { Store, Stores, UIEventSource } from "../UIEventSource"
import StaticFeatureSource from "../FeatureSource/Sources/StaticFeatureSource"
import { FeatureSource } from "../FeatureSource/FeatureSource"
import { Feature } from "geojson"
import { Utils } from "../../Utils"
import translators from "../../assets/translators.json"
import codeContributors from "../../assets/contributors.json"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import { LayerConfigJson } from "../../Models/ThemeConfig/Json/LayerConfigJson"
import usersettings from "../../../src/assets/generated/layers/usersettings.json"
import Locale from "../../UI/i18n/Locale"
import LinkToWeblate from "../../UI/Base/LinkToWeblate"
import FeatureSwitchState from "./FeatureSwitchState"
import Constants from "../../Models/Constants"
import { QueryParameters } from "../Web/QueryParameters"
import { ThemeMetaTagging } from "./UserSettingsMetaTagging"
import { MapProperties } from "../../Models/MapProperties"

/**
 * The part of the state which keeps track of user-related stuff, e.g. the OSM-connection,
 * which layers they enabled, ...
 */
export default class UserRelatedState {
    public static readonly usersettingsConfig = UserRelatedState.initUserSettingsState()
    public static readonly availableUserSettingsIds: string[] =
        UserRelatedState.usersettingsConfig?.tagRenderings?.map((tr) => tr.id) ?? []
    public static readonly SHOW_TAGS_VALUES = ["always", "yes", "full"] as const
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
    public readonly showTags: UIEventSource<"no" | undefined | "always" | "yes" | "full">
    public readonly showCrosshair: UIEventSource<"yes" | "always" | "no" | undefined>
    public readonly fixateNorth: UIEventSource<undefined | "yes">
    public readonly a11y: UIEventSource<undefined | "always" | "never" | "default">
    public readonly homeLocation: FeatureSource
    public readonly morePrivacy: UIEventSource<undefined | "yes" | "no">
    /**
     * The language as saved into the preferences of the user, if logged in.
     * Note that this is _different_ from the languages a user can set via the osm.org interface here: https://www.openstreetmap.org/preferences
     */
    public readonly language: UIEventSource<string>
    public readonly preferredBackgroundLayer: UIEventSource<
        string | "photo" | "map" | "osmbasedmap" | undefined
    >
    public readonly imageLicense: UIEventSource<string>
    /**
     * The number of seconds that the GPS-locations are stored in memory.
     * Time in seconds
     */
    public readonly gpsLocationHistoryRetentionTime = new UIEventSource(
        7 * 24 * 60 * 60,
        "gps_location_retention"
    )
    /**
     * Preferences as tags exposes many preferences and state properties as record.
     * This is used to bridge the internal state with the usersettings.json layerconfig file
     *
     * Some metainformation that should not be edited starts with a single underscore
     * Constants and query parameters start with two underscores
     * Note: these are linked via OsmConnection.preferences which exports all preferences as UIEventSource
     */
    public readonly preferencesAsTags: UIEventSource<Record<string, string>>
    private readonly _mapProperties: MapProperties

    constructor(
        osmConnection: OsmConnection,
        layout?: LayoutConfig,
        featureSwitches?: FeatureSwitchState,
        mapProperties?: MapProperties
    ) {
        this.osmConnection = osmConnection
        this._mapProperties = mapProperties
        {
            const translationMode: UIEventSource<undefined | "true" | "false" | "mobile" | string> =
                this.osmConnection.GetPreference("translation-mode", "false")
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
        this.language = this.osmConnection.GetPreference("language")
        this.showTags = this.osmConnection.GetPreference("show_tags")
        this.showCrosshair = this.osmConnection.GetPreference("show_crosshair")
        this.fixateNorth = this.osmConnection.GetPreference("fixate-north")
        this.morePrivacy = this.osmConnection.GetPreference("more_privacy", "no")

        this.a11y = this.osmConnection.GetPreference("a11y")

        this.mangroveIdentity = new MangroveIdentity(
            this.osmConnection.GetLongPreference("identity", "mangrove"),
            this.osmConnection.GetPreference("identity-creation-date", "mangrove")
        )
        this.preferredBackgroundLayer = this.osmConnection.GetPreference(
            "preferred-background-layer",
            undefined,
            {
                documentation:
                    "The ID of a layer or layer category that MapComplete uses by default",
            }
        )

        this.imageLicense = this.osmConnection.GetPreference("pictures-license", "CC0", {
            documentation: "The license under which new images are uploaded",
        })
        this.installedUserThemes = this.InitInstalledUserThemes()

        this.homeLocation = this.initHomeLocation()

        this.preferencesAsTags = this.initAmendedPrefs(layout, featureSwitches)

        this.syncLanguage()
    }

    private syncLanguage() {
        if (QueryParameters.wasInitialized("language")) {
            return
        }

        this.language.syncWith(Locale.language)
    }

    private static initUserSettingsState(): LayerConfig {
        try {
            return new LayerConfig(<LayerConfigJson>usersettings, "userinformationpanel")
        } catch (e) {
            return undefined
        }
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

    /**
     * Initialize the 'amended preferences'.
     * This is inherently a dirty and chaotic method, as it shoves many properties into this EventSource
     * */
    private initAmendedPrefs(
        layout?: LayoutConfig,
        featureSwitches?: FeatureSwitchState
    ): UIEventSource<Record<string, string>> {
        const amendedPrefs = new UIEventSource<Record<string, string>>({
            _theme: layout?.id,
            "_theme:backgroundLayer": layout?.defaultBackgroundId,
            _backend: this.osmConnection.Backend(),
            _applicationOpened: new Date().toISOString(),
            _supports_sharing:
                typeof window === "undefined" ? "no" : window.navigator.share ? "yes" : "no",
        })

        for (const key in Constants.userJourney) {
            amendedPrefs.data["__userjourney_" + key] = Constants.userJourney[key]
        }

        for (const key of QueryParameters.initializedParameters()) {
            amendedPrefs.data["__url_parameter_initialized:" + key] = "yes"
        }

        const osmConnection = this.osmConnection
        osmConnection.preferencesHandler.preferences.addCallback((newPrefs) => {
            for (const k in newPrefs) {
                const v = newPrefs[k]
                if (v === "undefined" || !v) {
                    continue
                }
                if (k.endsWith("-combined-length")) {
                    const l = Number(v)
                    const key = k.substring(0, k.length - "length".length)
                    let combined = ""
                    for (let i = 0; i < l; i++) {
                        combined += newPrefs[key + i]
                    }
                    amendedPrefs.data[key.substring(0, key.length - "-combined-".length)] = combined
                } else {
                    amendedPrefs.data[k] = newPrefs[k]
                }
            }

            amendedPrefs.ping()
        })
        const translationMode = osmConnection.GetPreference("translation-mode")

        Locale.language.mapD(
            (language) => {
                amendedPrefs.data["_language"] = language
                const trmode = translationMode.data
                if ((trmode === "true" || trmode === "mobile") && layout !== undefined) {
                    const extraInspection = UserRelatedState.usersettingsConfig
                    const missing = layout.missingTranslations(extraInspection)
                    const total = missing.total

                    const untranslated = missing.untranslated.get(language) ?? []
                    const hasMissingTheme = untranslated.some((k) => k.startsWith("themes:"))
                    const missingLayers = Utils.Dedup(
                        untranslated
                            .filter((k) => k.startsWith("layers:"))
                            .map((k) => k.slice("layers:".length).split(".")[0])
                    )

                    const zenLinks: { link: string; id: string }[] = Utils.NoNull([
                        hasMissingTheme
                            ? {
                                  id: "theme:" + layout.id,
                                  link: LinkToWeblate.hrefToWeblateZen(
                                      language,
                                      "themes",
                                      layout.id
                                  ),
                              }
                            : undefined,
                        ...missingLayers.map((id) => ({
                            id: "layer:" + id,
                            link: LinkToWeblate.hrefToWeblateZen(language, "layers", id),
                        })),
                    ])
                    const untranslated_count = untranslated.length
                    amendedPrefs.data["_translation_total"] = "" + total
                    amendedPrefs.data["_translation_translated_count"] =
                        "" + (total - untranslated_count)
                    amendedPrefs.data["_translation_percentage"] =
                        "" + Math.floor((100 * (total - untranslated_count)) / total)
                    amendedPrefs.data["_translation_links"] = JSON.stringify(zenLinks)
                }
                amendedPrefs.ping()
            },
            [translationMode]
        )

        this.mangroveIdentity.getKeyId().addCallbackAndRun((kid) => {
            amendedPrefs.data["mangrove_kid"] = kid
            amendedPrefs.ping()
        })

        const usersettingMetaTagging = new ThemeMetaTagging()
        osmConnection.userDetails.addCallback((userDetails) => {
            for (const k in userDetails) {
                amendedPrefs.data["_" + k] = "" + userDetails[k]
            }

            usersettingMetaTagging.metaTaggging_for_usersettings({ properties: amendedPrefs.data })

            const simplifiedName = userDetails.name.toLowerCase().replace(/\s+/g, "")
            const isTranslator = translators.contributors.find(
                (c: { contributor: string; commits: number }) => {
                    const replaced = c.contributor.toLowerCase().replace(/\s+/g, "")
                    return replaced === simplifiedName
                }
            )
            if (isTranslator) {
                amendedPrefs.data["_translation_contributions"] = "" + isTranslator.commits
            }
            const isCodeContributor = codeContributors.contributors.find(
                (c: { contributor: string; commits: number }) => {
                    const replaced = c.contributor.toLowerCase().replace(/\s+/g, "")
                    return replaced === simplifiedName
                }
            )
            if (isCodeContributor) {
                amendedPrefs.data["_code_contributions"] = "" + isCodeContributor.commits
            }
            amendedPrefs.ping()
        })

        amendedPrefs.addCallbackD((tags) => {
            for (const key in tags) {
                if (key.startsWith("_") || key === "mapcomplete-language") {
                    // Language is managed seperately
                    continue
                }
                if (tags[key + "-combined-0"]) {
                    // A combined value exists
                    this.osmConnection.GetLongPreference(key, "").setData(tags[key])
                } else {
                    this.osmConnection
                        .GetPreference(key, undefined, { prefix: "" })
                        .setData(tags[key])
                }
            }
        })

        for (const key in featureSwitches) {
            if (featureSwitches[key].addCallbackAndRun) {
                featureSwitches[key].addCallbackAndRun((v) => {
                    const oldV = amendedPrefs.data["__" + key]
                    if (oldV === v) {
                        return
                    }
                    amendedPrefs.data["__" + key] = "" + v
                    amendedPrefs.ping()
                })
            }
        }

        this._mapProperties?.rasterLayer?.addCallbackAndRun((l) => {
            amendedPrefs.data["__current_background"] = l?.properties?.id
            amendedPrefs.ping()
        })

        return amendedPrefs
    }
}
