import * as packagefile from "../../package.json"
import * as extraconfig from "../../config.json"
import { Utils } from "../Utils"
import { AuthConfig } from "../Logic/Osm/AuthConfig"

export type PriviligedLayerType = (typeof Constants.priviliged_layers)[number]

export default class Constants {
    public static vNumber: string = packagefile.version
    /**
     * API key for Maproulette
     *
     * Currently there is no user-friendly way to get the user's API key.
     * See https://github.com/maproulette/maproulette2/issues/476 for more information.
     * Using an empty string however does work for most actions, but will attribute all actions to the Superuser.
     */
    public static readonly MaprouletteApiKey = ""
    public static readonly added_by_default = [
        "selected_element",
        "gps_location",
        "gps_location_history",
        "home_location",
        "gps_track",
        "range",
        "last_click",
        "favourite",
        "summary",
    ] as const
    /**
     * Special layers which are not included in a theme by default
     */
    public static readonly no_include = [
        "conflation",
        "split_point",
        "split_road",
        "current_view",
        "import_candidate",
        "usersettings",
        "icons",
        "filters",
    ] as const
    /**
     * Layer IDs of layers which have special properties through built-in hooks
     */
    public static readonly priviliged_layers = [
        ...Constants.added_by_default,
        ...Constants.no_include,
    ] as const
    // The user journey states thresholds when a new feature gets unlocked
    public static userJourney = {
        moreScreenUnlock: 1,
        personalLayoutUnlock: 5,
        historyLinkVisible: 10,
        deletePointsOfOthersUnlock: 20,
        tagsVisibleAt: 25,
        tagsVisibleAndWikiLinked: 30,

        mapCompleteHelpUnlock: 50,
        themeGeneratorReadOnlyUnlock: 50,
        themeGeneratorFullUnlock: 500,
        addNewPointWithUnreadMessagesUnlock: 500,

        importHelperUnlock: 5000,
    }
    static readonly minZoomLevelToAddNewPoint = Constants.isRetina() ? 17 : 18
    /**
     * Used by 'PendingChangesUploader', which waits this amount of seconds to upload changes.
     * (Note that pendingChanges might upload sooner if the popup is closed or similar)
     */
    static updateTimeoutSec: number = 15
    /**
     * If the contributor has their GPS location enabled and makes a change,
     * the points visited less then `nearbyVisitTime`-seconds ago will be inspected.
     * The point closest to the changed feature will be considered and this distance will be tracked.
     * ALl these distances are used to calculate a nearby-score
     */
    static nearbyVisitTime: number = 30 * 60
    /**
     * If a user makes a change, the distance to the changed object is calculated.
     * If a user makes multiple changes, all these distances are put into multiple bins, depending on this distance.
     * For every bin, the totals are uploaded as metadata
     */
    static distanceToChangeObjectBins = [25, 50, 100, 500, 1000, 5000, Number.MAX_VALUE]
    static themeOrder = [
        "personal",
        "cyclofix",
        "waste",
        "etymology",
        "food",
        "cafes_and_pubs",
        "shops",
        "playgrounds",
        "hailhydrant",
        "toilets",
        "aed",
        "bookcases",
    ]
    /**
     * Upon initialization, the GPS will search the location.
     * If the location is found within the given timout, it'll automatically fly to it.
     *
     * In seconds
     */
    static zoomToLocationTimeout = 15
    public static readonly viewportCenterCloseToGpsCutoff: number = 20
    private static readonly config = (() => {
        const defaultConfig = packagefile.config
        return { ...defaultConfig, ...extraconfig }
    })()
    public static ImgurApiKey = Constants.config.api_keys.imgur
    public static readonly mapillary_client_token_v4 = Constants.config.api_keys.mapillary_v4
    public static defaultOverpassUrls = Constants.config.default_overpass_urls
    public static countryCoderEndpoint: string = Constants.config.country_coder_host
    public static osmAuthConfig: AuthConfig = Constants.config.oauth_credentials
    public static nominatimEndpoint: string = Constants.config.nominatimEndpoint
    public static linkedDataProxy: string = Constants.config["jsonld-proxy"]
    /**
     * These are the values that are allowed to use as 'backdrop' icon for a map pin
     */
    private static readonly _defaultPinIcons = [
        "pin",
        "bug",
        "square",
        "square_rounded",
        "circle",
        "checkmark",
        "clock",
        "close",
        "crosshair",
        "help",
        "home",
        "invalid",
        "location",
        "location_empty",
        "location_locked",
        "note",
        "resolved",
        "ring",
        "scissors",
        "teardrop",
        "teardrop_with_hole_green",
        "triangle",
        "brick_wall_square",
        "brick_wall_round",
        "gps_arrow",
        "checkmark",
        "help",
        "close",
        "invalid",
        "heart",
        "heart_outline",
        "link",
        "confirm",
        "direction",
        "not_found",
        "mastodon",
        "party",
        "addSmall",
    ] as const
    public static readonly defaultPinIcons: string[] = <any>Constants._defaultPinIcons
    /**
     * The location that the MVT-layer is hosted.
     * This is a MapLibre/MapBox vector tile server which hosts vector tiles for every (official) layer
     */
    public static VectorTileServer: string | undefined = Constants.config.mvt_layer_server
    public static readonly maptilerApiKey = "GvoVAJgu46I5rZapJuAy"

    private static isRetina(): boolean {
        if (Utils.runningFromConsole) {
            return false
        }
        // The cause for this line of code: https://github.com/pietervdvn/MapComplete/issues/115
        // See https://stackoverflow.com/questions/19689715/what-is-the-best-way-to-detect-retina-support-on-a-device-using-javascript
        return (
            (window.matchMedia &&
                (window.matchMedia(
                    "only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx), only screen and (min-resolution: 75.6dpcm)"
                ).matches ||
                    window.matchMedia(
                        "only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min--moz-device-pixel-ratio: 2), only screen and (min-device-pixel-ratio: 2)"
                    ).matches)) ||
            (window.devicePixelRatio && window.devicePixelRatio >= 2)
        )
    }
}
