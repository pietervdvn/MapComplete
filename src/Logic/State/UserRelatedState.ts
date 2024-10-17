import ThemeConfig, { MinimalThemeInformation } from "../../Models/ThemeConfig/ThemeConfig"
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
import Showdown from "showdown"
import { LocalStorageSource } from "../Web/LocalStorageSource"
import { GeocodeResult } from "../Search/GeocodingProvider"


export class OptionallySyncedHistory<T> {

    public readonly syncPreference: UIEventSource<"sync" | "local" | "no">
    public readonly value: Store<T[]>
    private readonly synced: UIEventSource<T[]>
    private readonly local: UIEventSource<T[]>
    private readonly thisSession: UIEventSource<T[]>
    private readonly _maxHistory: number
    private readonly _isSame: (a: T, b: T) => boolean
    private osmconnection: OsmConnection

    constructor(key: string, osmconnection: OsmConnection, maxHistory: number = 20, isSame?: (a: T, b: T) => boolean) {
        this.osmconnection = osmconnection
        this._maxHistory = maxHistory
        this._isSame = isSame
        this.syncPreference = osmconnection.getPreference(
            "preference-" + key + "-history",
            "sync",
        )
        const synced = this.synced = UIEventSource.asObject<T[]>(osmconnection.getPreference(key + "-history"), [])
        const local = this.local = LocalStorageSource.getParsed<T[]>(key + "-history", [])
        const thisSession = this.thisSession = new UIEventSource<T[]>([], "optionally-synced:" + key + "(session only)")
        this.syncPreference.addCallback(syncmode => {
            if (syncmode === "sync") {
                let list = [...thisSession.data, ...synced.data].slice(0, maxHistory)
                if (this._isSame) {
                    for (let i = 0; i < list.length; i++) {
                        for (let j = i + 1; j < list.length; j++) {
                            if (this._isSame(list[i], list[j])) {
                                list.splice(j, 1)
                            }
                        }
                    }
                }
                synced.set(list)
            } else if (syncmode === "local") {
                local.set(synced.data?.slice(0, maxHistory))
                synced.set([])
            } else {
                synced.set([])
                local.set([])
            }
        })

        this.value = this.syncPreference.bind(syncPref => this.getAppropriateStore(syncPref))


    }

    private getAppropriateStore(syncPref?: string) {
        syncPref ??= this.syncPreference.data
        if (syncPref === "sync") {
            return this.synced
        }
        if (syncPref === "local") {
            return this.local
        }
        return this.thisSession
    }

    public add(t: T) {
        const store = this.getAppropriateStore()
        let oldList = store.data ?? []
        if (this._isSame) {
            oldList = oldList.filter(x => !this._isSame(t, x))
        }
        store.set([t, ...oldList].slice(0, this._maxHistory))
    }

    /**
     * Adds the value when the user is actually logged in
     * @param t
     */
    public addDefferred(t: T) {
        if (t === undefined) {
            return
        }
        this.osmconnection.isLoggedIn.addCallbackAndRun(loggedIn => {
            if (!loggedIn) {
                return
            }
            this.add(t)
            return true
        })

    }

    clear() {
        this.getAppropriateStore().set([])
    }
}

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
    public readonly translationMode: UIEventSource<"false" | "true" | "mobile" | undefined | string>

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
        "gps_location_retention",
    )

    public readonly addNewFeatureMode = new UIEventSource<
        "button" | "button_click_right" | "button_click" | "click" | "click_right"
    >("button_click_right")

    public readonly showScale: UIEventSource<boolean>

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

    public readonly recentlyVisitedThemes: OptionallySyncedHistory<string>
    public readonly recentlyVisitedSearch: OptionallySyncedHistory<GeocodeResult>


    constructor(
        osmConnection: OsmConnection,
        layout?: ThemeConfig,
        featureSwitches?: FeatureSwitchState,
        mapProperties?: MapProperties,
    ) {
        this.osmConnection = osmConnection
        this._mapProperties = mapProperties

        this.showAllQuestionsAtOnce = UIEventSource.asBoolean(
            this.osmConnection.getPreference("show-all-questions", "false"),
        )
        this.language = this.osmConnection.getPreference("language")
        this.showTags = this.osmConnection.getPreference("show_tags")
        this.showCrosshair = this.osmConnection.getPreference("show_crosshair")
        this.fixateNorth = this.osmConnection.getPreference("fixate-north")
        this.morePrivacy = this.osmConnection.getPreference("more_privacy", "no")

        this.a11y = this.osmConnection.getPreference("a11y")

        this.mangroveIdentity = new MangroveIdentity(
            this.osmConnection.getPreference("identity", undefined, "mangrove"),
            this.osmConnection.getPreference("identity-creation-date", undefined, "mangrove"),
        )
        this.preferredBackgroundLayer = this.osmConnection.getPreference("preferred-background-layer")

        this.addNewFeatureMode = this.osmConnection.getPreference(
            "preferences-add-new-mode",
            "button_click_right",
        )
        this.showScale = UIEventSource.asBoolean(this.osmConnection.GetPreference("preference-show-scale", "false"))

        this.imageLicense = this.osmConnection.getPreference("pictures-license", "CC0")
        this.installedUserThemes = UserRelatedState.initInstalledUserThemes(osmConnection)
        this.translationMode = this.initTranslationMode()
        this.homeLocation = this.initHomeLocation()

        this.preferencesAsTags = this.initAmendedPrefs(layout, featureSwitches)

        this.recentlyVisitedThemes = new OptionallySyncedHistory<string>(
            "theme",
            this.osmConnection,
            10,
            (a, b) => a === b,
        )
        this.recentlyVisitedSearch = new OptionallySyncedHistory<GeocodeResult>("places",
            this.osmConnection,
            15,
            (a, b) => a.osm_id === b.osm_id && a.osm_type === b.osm_type,
        )
        this.syncLanguage()
        this.recentlyVisitedThemes.addDefferred(layout?.id)
    }

    private syncLanguage() {
        if (QueryParameters.wasInitialized("language")) {
            return
        }

        this.language.syncWith(Locale.language)
    }

    private initTranslationMode(): UIEventSource<"false" | "true" | "mobile" | undefined | string> {
        const translationMode: UIEventSource<undefined | "true" | "false" | "mobile" | string> =
            this.osmConnection.getPreference("translation-mode", "false")
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
        return translationMode
    }

    private static initUserSettingsState(): LayerConfig {
        try {
            return new LayerConfig(<LayerConfigJson>usersettings, "userinformationpanel")
        } catch (e) {
            return undefined
        }
    }

    /**
     * Adds a newly visited unofficial theme (or update the info).
     *
     * @param themeInfo note that themeInfo.id should be the URL where it was found
     */
    public addUnofficialTheme(themeInfo: MinimalThemeInformation) {
        const pref = this.osmConnection.getPreference("unofficial-theme-" + themeInfo.id)
        this.osmConnection.isLoggedIn.when(
            () =>        pref.set(JSON.stringify(themeInfo))
        )
    }

    public getUnofficialTheme(id: string): MinimalThemeInformation | undefined {
        const pref = this.osmConnection.getPreference("unofficial-theme-" + id)
        const str = pref.data

        if (str === undefined || str === "undefined" || str === "") {
            pref.setData(null)
            return undefined
        }

        try {
            return JSON.parse(str)
        } catch (e) {
            console.warn(
                "Removing theme " +
                id +
                " as it could not be parsed from the preferences; the content is:",
                str,
            )
            pref.setData(null)
            return undefined
        }
    }

    public markLayoutAsVisited(layout: ThemeConfig) {
        if (!layout) {
            console.error("Trying to mark a layout as visited, but ", layout, " got passed")
            return
        }
        if (layout.hideFromOverview) {
            this.osmConnection.isLoggedIn.addCallbackAndRunD((loggedIn) => {
                if (loggedIn) {
                    this.osmConnection
                        .getPreference("hidden-theme-" + layout?.id + "-enabled")
                        .setData("true")
                    return true
                }
            })
        }
        if (!layout.official) {
            this.osmConnection.getPreference("unofficial-theme-" + layout.id).setData(
                JSON.stringify({
                    id: layout.id,
                    icon: layout.icon,
                    title: layout.title.translations,
                    shortDescription: layout.shortDescription.translations,
                    definition: layout["definition"],
                }),
            )
        }
    }

    public static initInstalledUserThemes(osmConnection: OsmConnection): Store<string[]> {
        const prefix = "mapcomplete-unofficial-theme-"
        return osmConnection.preferencesHandler.allPreferences.map((prefs) =>
            Object.keys(prefs)
                .filter((k) => k.startsWith(prefix))
                .map((k) => k.substring(prefix.length)),
        )
    }

    /**
     * List of all hidden themes that have been seen before
     * @param osmConnection
     */
    public static initDiscoveredHiddenThemes(osmConnection: OsmConnection): Store<string[]> {
        const prefix = "mapcomplete-hidden-theme-"
        const userPreferences = osmConnection.preferencesHandler.allPreferences
        return userPreferences.map((preferences) =>
            Object.keys(preferences)
                .filter((key) => key.startsWith(prefix))
                .map((key) => key.substring(prefix.length, key.length - "-enabled".length)),
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
            }),
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
        layout?: ThemeConfig,
        featureSwitches?: FeatureSwitchState,
    ): UIEventSource<Record<string, string>> {
        const amendedPrefs = new UIEventSource<Record<string, string>>({
            _theme: layout?.id,
            "_theme:backgroundLayer": layout?.defaultBackgroundId,
            _backend: this.osmConnection.Backend(),
            _applicationOpened: new Date().toISOString(),
            _supports_sharing:
                typeof window === "undefined" ? "no" : window.navigator.share ? "yes" : "no",
            _iframe: Utils.isIframe ? "yes" : "no",
        })

        for (const key in Constants.userJourney) {
            amendedPrefs.data["__userjourney_" + key] = Constants.userJourney[key]
        }

        for (const key of QueryParameters.initializedParameters()) {
            amendedPrefs.data["__url_parameter_initialized:" + key] = "yes"
        }

        const osmConnection = this.osmConnection
        osmConnection.preferencesHandler.allPreferences.addCallback((newPrefs) => {
            for (const k in newPrefs) {
                const v = newPrefs[k]
                if (v === "undefined" || v === "null" || !v) {
                    continue
                }
                amendedPrefs.data[k] = newPrefs[k] ?? ""
            }

            amendedPrefs.ping()
        })
        Locale.language.mapD(
            (language) => {
                amendedPrefs.data["_language"] = language
                const trmode = this.translationMode.data
                if ((trmode === "true" || trmode === "mobile") && layout !== undefined) {
                    const extraInspection = UserRelatedState.usersettingsConfig
                    const missing = layout.missingTranslations(extraInspection)
                    const total = missing.total

                    const untranslated = missing.untranslated.get(language) ?? []
                    const hasMissingTheme = untranslated.some((k) => k.startsWith("themes:"))
                    const missingLayers = Utils.Dedup(
                        untranslated
                            .filter((k) => k.startsWith("layers:"))
                            .map((k) => k.slice("layers:".length).split(".")[0]),
                    )

                    const zenLinks: { link: string; id: string }[] = Utils.NoNull([
                        hasMissingTheme
                            ? {
                                id: "theme:" + layout.id,
                                link: LinkToWeblate.hrefToWeblateZen(
                                    language,
                                    "themes",
                                    layout.id,
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
            [this.translationMode],
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
            if (userDetails.description) {
                amendedPrefs.data["_description_html"] = Utils.purify(
                    new Showdown.Converter()
                        .makeHtml(userDetails.description)
                        ?.replace(/&gt;/g, ">")
                        ?.replace(/&lt;/g, "<")
                        ?.replace(/\n/g, ""),
                )
            }

            usersettingMetaTagging.metaTaggging_for_usersettings({ properties: amendedPrefs.data })

            const simplifiedName = userDetails.name.toLowerCase().replace(/\s+/g, "")
            const isTranslator = translators.contributors.find(
                (c: { contributor: string; commits: number }) => {
                    const replaced = c.contributor.toLowerCase().replace(/\s+/g, "")
                    return replaced === simplifiedName
                },
            )
            if (isTranslator) {
                amendedPrefs.data["_translation_contributions"] = "" + isTranslator.commits
            }
            const isCodeContributor = codeContributors.contributors.find(
                (c: { contributor: string; commits: number }) => {
                    const replaced = c.contributor.toLowerCase().replace(/\s+/g, "")
                    return replaced === simplifiedName
                },
            )
            if (isCodeContributor) {
                amendedPrefs.data["_code_contributions"] = "" + isCodeContributor.commits
            }
            amendedPrefs.ping()
        })

        amendedPrefs.addCallbackD((tags) => {
            for (const key in tags) {
                if (key.startsWith("_") || key === "mapcomplete-language") {
                    // Language is managed separately
                    continue
                }
                if (tags[key] === null) {
                    continue
                }
                let pref = this.osmConnection.GetPreference(key, undefined, { prefix: "" })

                pref.set(tags[key])
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
