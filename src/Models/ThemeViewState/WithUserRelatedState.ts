import { Utils } from "../../Utils"
import ThemeConfig from "../ThemeConfig/ThemeConfig"
import { OsmConnection } from "../../Logic/Osm/OsmConnection"
import UserRelatedState from "../../Logic/State/UserRelatedState"
import { QueryParameters } from "../../Logic/Web/QueryParameters"
import FeatureSwitchState from "../../Logic/State/FeatureSwitchState"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import LayerConfig from "../ThemeConfig/LayerConfig"
import { LastClickFeatureSource } from "../../Logic/FeatureSource/Sources/LastClickFeatureSource"
import { GeocodingUtils } from "../../Logic/Search/GeocodingProvider"

export class WithUserRelatedState {
    readonly theme: ThemeConfig

    readonly featureSwitches: FeatureSwitchState
    readonly featureSwitchIsTesting: Store<boolean>
    readonly featureSwitchUserbadge: Store<boolean>

    readonly osmConnection: OsmConnection
    readonly userRelatedState: UserRelatedState
    readonly overlayLayerStates: ReadonlyMap<
        string,
        { readonly isDisplayed: UIEventSource<boolean> }
    >

    constructor(theme: ThemeConfig, rasterLayer: Store<{ properties: { id: string } }>) {
        {
            // Some weird setups
            Utils.initDomPurify()
            if (
                !Utils.runningFromConsole &&
                theme.customCss !== undefined &&
                window.location.pathname.indexOf("theme") >= 0
            ) {
                Utils.LoadCustomCss(theme.customCss)
            }
        }
        this.theme = theme
        this.featureSwitches = new FeatureSwitchState(theme)
        this.osmConnection = new OsmConnection({
            dryRun: this.featureSwitches.featureSwitchIsTesting,
            fakeUser: this.featureSwitches.featureSwitchFakeUser.data,
            oauth_token: QueryParameters.GetQueryParameter(
                "oauth_token",
                undefined,
                "Used to complete the login"
            ),
        })

        this.featureSwitchIsTesting = this.featureSwitches.featureSwitchIsTesting
        this.featureSwitchUserbadge = this.featureSwitches.featureSwitchEnableLogin

        this.userRelatedState = new UserRelatedState(
            this.osmConnection,
            theme,
            this.featureSwitches,
            rasterLayer
        )

        if (!this.theme.official) {
            // Add custom themes to the "visited custom themes"
            const th = this.theme
            this.userRelatedState.addUnofficialTheme({
                id: th.id,
                icon: th.icon,
                title: th.title.translations,
                shortDescription: th.shortDescription.translations,
                layers: th.layers.filter((l) => l.isNormal()).map((l) => l.id),
            })
        }

        const overlayLayerStates = new Map<string, { isDisplayed: UIEventSource<boolean> }>()
        this.overlayLayerStates = overlayLayerStates
        for (const rasterInfo of this.theme.tileLayerSources) {
            const isDisplayed = QueryParameters.GetBooleanQueryParameter(
                "overlay-" + rasterInfo.id,
                rasterInfo.defaultState ?? true,
                "Whether or not overlay layer " + rasterInfo.id + " is shown"
            )
            const state = { isDisplayed }
            overlayLayerStates.set(rasterInfo.id, state)
        }
    }

    /**
     * Searches the appropriate layer - will first try if a special layer matches; if not, a normal layer will be used by delegating to the theme
     */
    public getMatchingLayer(properties: Record<string, string>): LayerConfig | undefined {
        const id = properties.id

        if (id.startsWith("summary_")) {
            // We don't select 'summary'-objects
            return undefined
        }

        if (id === "settings") {
            return UserRelatedState.usersettingsConfig
        }
        if (id.startsWith(LastClickFeatureSource.newPointElementId)) {
            return this.theme.layers.find((l) => l.id === "last_click")
        }
        if (id.startsWith("search_result")) {
            return GeocodingUtils.searchLayer
        }
        if (id === "location_track") {
            return this.theme.layers.find((l) => l.id === "gps_track")
        }
        return this.theme.getMatchingLayer(properties)
    }
}
