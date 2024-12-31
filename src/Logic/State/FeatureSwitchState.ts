/**
 * The part of the global state which initializes the feature switches, based on default values and on the theme
 */
import ThemeConfig from "../../Models/ThemeConfig/ThemeConfig"
import { UIEventSource } from "../UIEventSource"
import { QueryParameters } from "../Web/QueryParameters"
import Constants from "../../Models/Constants"
import { Utils } from "../../Utils"
import { eliCategory } from "../../Models/RasterLayerProperties"
import { AvailableRasterLayers } from "../../Models/RasterLayers"
import MarkdownUtils from "../../Utils/MarkdownUtils"

class FeatureSwitchUtils {
    /** Helper function to initialize feature switches
     *
     */
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
    public readonly featureSwitchEnableLogin: UIEventSource<boolean>
    public readonly featureSwitchSearch: UIEventSource<boolean>
    public readonly featureSwitchBackgroundSelection: UIEventSource<boolean>
    public readonly featureSwitchWelcomeMessage: UIEventSource<boolean>
    public readonly featureSwitchCommunityIndex: UIEventSource<boolean>
    public readonly featureSwitchExtraLinkEnabled: UIEventSource<boolean>
    public readonly featureSwitchBackToThemeOverview: UIEventSource<boolean>
    public readonly featureSwitchShareScreen: UIEventSource<boolean>
    public readonly featureSwitchGeolocation: UIEventSource<boolean>
    public readonly featureSwitchCache: UIEventSource<boolean>

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
    public readonly featureSwitchLayerDefault: UIEventSource<boolean>

    public constructor(theme?: ThemeConfig) {
        super()

        const legacyRewrite: Record<string, string | string[]> = {
            "fs-userbadge": "fs-enable-login",
            "fs-layers": ["fs-filter", "fs-background"],
        }

        for (const key in legacyRewrite) {
            let intoList = legacyRewrite[key]
            if (!QueryParameters.wasInitialized(key)) {
                continue
            }
            if (typeof intoList === "string") {
                intoList = [intoList]
            }
            for (const into of intoList) {
                if (!QueryParameters.wasInitialized(into)) {
                    const v = QueryParameters.GetQueryParameter(key, "", "").data
                    console.log("Adding url param due to legacy:", key, "-->", into, "(", v + ")")
                    QueryParameters.GetQueryParameter(into, "", "").setData(v)
                }
            }
        }

        this.featureSwitchEnableLogin = FeatureSwitchUtils.initSwitch(
            "fs-enable-login",
            theme?.enableUserBadge ?? true,
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
            theme?.enableSearch ?? true,
            "Disables/Enables the search bar"
        )
        this.featureSwitchBackgroundSelection = FeatureSwitchUtils.initSwitch(
            "fs-background",
            theme?.enableBackgroundLayerSelection ?? true,
            "Disables/Enables the background layer control where a user can enable e.g. aerial imagery"
        )

        this.featureSwitchFilter = FeatureSwitchUtils.initSwitch(
            "fs-filter",
            theme?.enableLayers ?? true,
            "Disables/Enables the filter view where a user can enable/disable MapComplete-layers or filter for certain properties"
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
        this.featureSwitchBackToThemeOverview = FeatureSwitchUtils.initSwitch(
            "fs-homepage-link",
            theme?.enableMoreQuests ?? true,
            "Disables/Enables the various links which go back to the index page with the theme overview"
        )
        this.featureSwitchShareScreen = FeatureSwitchUtils.initSwitch(
            "fs-share-screen",
            theme?.enableShareScreen ?? true,
            "Disables/Enables the 'Share-screen'-tab in the welcome message"
        )
        this.featureSwitchGeolocation = FeatureSwitchUtils.initSwitch(
            "fs-geolocation",
            theme?.enableGeolocation ?? true,
            "Disables/Enables the geolocation button"
        )

        this.featureSwitchLayerDefault = QueryParameters.GetBooleanQueryParameter(
            "fs-layers-enabled",
            true,
            "If set to false, all layers will be disabled - except the explicitly enabled layers"
        )
        this.featureSwitchShowAllQuestions = FeatureSwitchUtils.initSwitch(
            "fs-all-questions",
            theme?.enableShowAllQuestions ?? false,
            "Always show all questions"
        )

        this.featureSwitchEnableExport = FeatureSwitchUtils.initSwitch(
            "fs-export",
            theme?.enableExportButton ?? true,
            "Enable the export as GeoJSON and CSV button"
        )

        this.featureSwitchCache = FeatureSwitchUtils.initSwitch(
            "fs-cache",
            theme?.enableCache ?? true,
            "Enable/disable caching from localStorage"
        )

        let testingDefaultValue = false
        if (
            !Constants.osmAuthConfig.url.startsWith("https://master.apis.dev.openstreetmap.org") && (location.hostname === "127.0.0.1") && !Utils.runningFromConsole
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
            theme.enableMorePrivacy,
            "If true, the location distance indication will not be written to the changeset and other privacy enhancing measures might be taken."
        )

        this.overpassUrl = QueryParameters.GetQueryParameter(
            "overpassUrl",
            (theme?.overpassUrl ?? Constants.defaultOverpassUrls).join(","),
            "Point mapcomplete to a different overpass-instance. Example: https://overpass-api.de/api/interpreter"
        ).sync(
            (param) => param?.split(","),
            [],
            (urls) => urls?.join(",")
        )

        this.overpassTimeout = UIEventSource.asInt(
            QueryParameters.GetQueryParameter(
                "overpassTimeout",
                "" + theme?.overpassTimeout,
                "Set a different timeout (in seconds) for queries in overpass"
            )
        )

        this.overpassMaxZoom = UIEventSource.asFloat(
            QueryParameters.GetQueryParameter(
                "overpassMaxZoom",
                "" + theme?.overpassMaxZoom,
                " point to switch between OSM-api and overpass"
            )
        )

        this.osmApiTileSize = UIEventSource.asInt(
            QueryParameters.GetQueryParameter(
                "osmApiTileSize",
                "" + theme?.osmApiTileSize,
                "Tilesize when the OSM-API is used to fetch data within a BBOX"
            )
        )

        this.backgroundLayerId = QueryParameters.GetQueryParameter(
            "background",
            theme?.defaultBackgroundId,
            [
                "When set, load this raster layer (or a layer of this category) as background layer instead of using the default background. This is as if the user opened the background selection menu and selected the layer with the given id or category.",
                "Most raster layers are based on the [editor layer index](https://github.com/osmlab/editor-layer-index)",

                "#### Selecting a category",
                "If one of the following values is used, this parameter will be interpreted as a _category_ instead of the id of a specific layer. The best layer of this category will be used. Supported categories are those from the editor layer index and are:",
                eliCategory.map((c) => "- " + c).join("\n"),
                "#### Selecting a specific layer",
                "One can use the [ID of an ELI-layer](./ELI-overview.md) or use one of the global, builtin layers:",
                MarkdownUtils.list(
                    AvailableRasterLayers.globalLayers.map(
                        (global) => global.properties.id + (global.properties.best ? " ⭐" : "")
                    )
                ),
            ].join("\n\n")
        )
    }
}
