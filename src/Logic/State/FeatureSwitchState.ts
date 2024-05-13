/**
 * The part of the global state which initializes the feature switches, based on default values and on the layoutToUse
 */
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"
import { UIEventSource } from "../UIEventSource"
import { QueryParameters } from "../Web/QueryParameters"
import Constants from "../../Models/Constants"
import { Utils } from "../../Utils"

class FeatureSwitchUtils {
    static initSwitch(key: string, deflt: boolean, documentation: string): UIEventSource<boolean> {
        const defaultValue = deflt
        const queryParam = QueryParameters.GetQueryParameter(
            key,
            "" + defaultValue,
            documentation,
            { stackOffset: -1 }
        )

        // It takes the current layout, extracts the default value for this query parameter. A query parameter event source is then retrieved and flattened
        return queryParam.sync(
            (str) => (str === undefined ? defaultValue : str !== "false"),
            [],
            (b) => (b == defaultValue ? undefined : "" + b)
        )
    }
}

export class OsmConnectionFeatureSwitches {
    public readonly featureSwitchFakeUser: UIEventSource<boolean>

    constructor() {
        this.featureSwitchFakeUser = QueryParameters.GetBooleanQueryParameter(
            "fake-user",
            false,
            "If true, 'dryrun' mode is activated and a fake user account is loaded"
        )
    }
}

export default class FeatureSwitchState extends OsmConnectionFeatureSwitches {
    /**
     * The layout that is being used in this run
     */
    public readonly layoutToUse: LayoutConfig

    public readonly featureSwitchEnableLogin: UIEventSource<boolean>
    public readonly featureSwitchSearch: UIEventSource<boolean>
    public readonly featureSwitchBackgroundSelection: UIEventSource<boolean>
    public readonly featureSwitchWelcomeMessage: UIEventSource<boolean>
    public readonly featureSwitchCommunityIndex: UIEventSource<boolean>
    public readonly featureSwitchExtraLinkEnabled: UIEventSource<boolean>
    public readonly featureSwitchMoreQuests: UIEventSource<boolean>
    public readonly featureSwitchShareScreen: UIEventSource<boolean>
    public readonly featureSwitchGeolocation: UIEventSource<boolean>
    public readonly featureSwitchIsTesting: UIEventSource<boolean>
    public readonly featureSwitchIsDebugging: UIEventSource<boolean>
    public readonly featureSwitchShowAllQuestions: UIEventSource<boolean>
    public readonly featureSwitchFilter: UIEventSource<boolean>
    public readonly featureSwitchEnableExport: UIEventSource<boolean>
    public readonly overpassUrl: UIEventSource<string[]>
    public readonly overpassTimeout: UIEventSource<number>
    public readonly overpassMaxZoom: UIEventSource<number>
    public readonly osmApiTileSize: UIEventSource<number>
    public readonly backgroundLayerId: UIEventSource<string>
    public readonly featureSwitchMorePrivacy: UIEventSource<boolean>

    public constructor(layoutToUse?: LayoutConfig) {
        super()
        this.layoutToUse = layoutToUse

        // Helper function to initialize feature switches

        this.featureSwitchEnableLogin = FeatureSwitchUtils.initSwitch(
            "fs-enable-login",
            layoutToUse?.enableUserBadge ?? true,
            "Disables/Enables logging in and thus disables editing all together. This effectively puts MapComplete into read-only mode."
        )
        {
            if (QueryParameters.wasInitialized("fs-userbadge")) {
                // userbadge is the legacy name for 'enable-login'
                this.featureSwitchEnableLogin.setData(
                    QueryParameters.GetBooleanQueryParameter("fs-userbadge", undefined, "Legacy")
                        .data
                )
            }
        }

        this.featureSwitchSearch = FeatureSwitchUtils.initSwitch(
            "fs-search",
            layoutToUse?.enableSearch ?? true,
            "Disables/Enables the search bar"
        )
        this.featureSwitchBackgroundSelection = FeatureSwitchUtils.initSwitch(
            "fs-background",
            layoutToUse?.enableBackgroundLayerSelection ?? true,
            "Disables/Enables the background layer control"
        )

        this.featureSwitchFilter = FeatureSwitchUtils.initSwitch(
            "fs-filter",
            layoutToUse?.enableLayers ?? true,
            "Disables/Enables the filter view"
        )

        this.featureSwitchWelcomeMessage = FeatureSwitchUtils.initSwitch(
            "fs-welcome-message",
            true,
            "Disables/enables the help menu or welcome message"
        )
        this.featureSwitchCommunityIndex = FeatureSwitchUtils.initSwitch(
            "fs-community-index",
            this.featureSwitchEnableLogin.data,
            "Disables/enables the button to get in touch with the community"
        )
        this.featureSwitchExtraLinkEnabled = FeatureSwitchUtils.initSwitch(
            "fs-iframe-popout",
            true,
            "Disables/Enables the extraLink button. By default, if in iframe mode and the welcome message is hidden, a popout button to the full mapcomplete instance is shown instead (unless disabled with this switch or another extraLink button is enabled)"
        )
        this.featureSwitchMoreQuests = FeatureSwitchUtils.initSwitch(
            "fs-more-quests",
            layoutToUse?.enableMoreQuests ?? true,
            "Disables/Enables the 'More Quests'-tab in the welcome message"
        )
        this.featureSwitchShareScreen = FeatureSwitchUtils.initSwitch(
            "fs-share-screen",
            layoutToUse?.enableShareScreen ?? true,
            "Disables/Enables the 'Share-screen'-tab in the welcome message"
        )
        this.featureSwitchGeolocation = FeatureSwitchUtils.initSwitch(
            "fs-geolocation",
            layoutToUse?.enableGeolocation ?? true,
            "Disables/Enables the geolocation button"
        )
        this.featureSwitchShowAllQuestions = FeatureSwitchUtils.initSwitch(
            "fs-all-questions",
            layoutToUse?.enableShowAllQuestions ?? false,
            "Always show all questions"
        )

        this.featureSwitchEnableExport = FeatureSwitchUtils.initSwitch(
            "fs-export",
            layoutToUse?.enableExportButton ?? true,
            "Enable the export as GeoJSON and CSV button"
        )

        let testingDefaultValue = false
        if (
            !Utils.runningFromConsole &&
            (location.hostname === "localhost" || location.hostname === "127.0.0.1")
        ) {
            testingDefaultValue = true
        }

        this.featureSwitchIsTesting = QueryParameters.GetBooleanQueryParameter(
            "test",
            testingDefaultValue,
            "If true, 'dryrun' mode is activated. The app will behave as normal, except that changes to OSM will be printed onto the console instead of actually uploaded to osm.org"
        )

        this.featureSwitchIsDebugging = QueryParameters.GetBooleanQueryParameter(
            "debug",
            false,
            "If true, shows some extra debugging help such as all the available tags on every object"
        )


        this.featureSwitchMorePrivacy = QueryParameters.GetBooleanQueryParameter(
            "moreprivacy",
            layoutToUse.enableMorePrivacy,
            "If true, the location distance indication will not be written to the changeset and other privacy enhancing measures might be taken."
        )


        this.overpassUrl = QueryParameters.GetQueryParameter(
            "overpassUrl",
            (layoutToUse?.overpassUrl ?? Constants.defaultOverpassUrls).join(","),
            "Point mapcomplete to a different overpass-instance. Example: https://overpass-api.de/api/interpreter"
        ).sync(
            (param) => param?.split(","),
            [],
            (urls) => urls?.join(",")
        )

        this.overpassTimeout = UIEventSource.asInt(
            QueryParameters.GetQueryParameter(
                "overpassTimeout",
                "" + layoutToUse?.overpassTimeout,
                "Set a different timeout (in seconds) for queries in overpass"
            )
        )

        this.overpassMaxZoom = UIEventSource.asFloat(
            QueryParameters.GetQueryParameter(
                "overpassMaxZoom",
                "" + layoutToUse?.overpassMaxZoom,
                " point to switch between OSM-api and overpass"
            )
        )

        this.osmApiTileSize = UIEventSource.asInt(
            QueryParameters.GetQueryParameter(
                "osmApiTileSize",
                "" + layoutToUse?.osmApiTileSize,
                "Tilesize when the OSM-API is used to fetch data within a BBOX"
            )
        )

        this.backgroundLayerId = QueryParameters.GetQueryParameter(
            "background",
            layoutToUse?.defaultBackgroundId,
            "The id of the background layer to start with"
        )
    }
}
