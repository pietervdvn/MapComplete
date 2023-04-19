import LayerConfig from "./ThemeConfig/LayerConfig"
import { UIEventSource } from "../Logic/UIEventSource"
import UserRelatedState from "../Logic/State/UserRelatedState"
import { Utils } from "../Utils"
import { LocalStorageSource } from "../Logic/Web/LocalStorageSource"

/**
 * Indicates if a menu is open, and if so, which tab is selected;
 * Some tabs allow to highlight an element.
 *
 * Some convenience methods are provided for this as well
 */
export class MenuState {
    private static readonly _themeviewTabs = ["intro", "filters", "download", "copyright"] as const
    public readonly themeIsOpened: UIEventSource<boolean>
    public readonly themeViewTabIndex: UIEventSource<number>
    public readonly themeViewTab: UIEventSource<typeof MenuState._themeviewTabs[number]>

    private static readonly _menuviewTabs = ["about", "settings", "community", "privacy"] as const
    public readonly menuIsOpened: UIEventSource<boolean>
    public readonly menuViewTabIndex: UIEventSource<number>
    public readonly menuViewTab: UIEventSource<typeof MenuState._menuviewTabs[number]>

    public readonly highlightedLayerInFilters: UIEventSource<string> = new UIEventSource<string>(
        undefined
    )
    public highlightedUserSetting: UIEventSource<string> = new UIEventSource<string>(undefined)
    constructor(themeid: string = "") {
        if (themeid) {
            themeid += "-"
        }
        this.themeIsOpened = LocalStorageSource.GetParsed(themeid + "thememenuisopened", true)
        this.themeViewTabIndex = LocalStorageSource.GetParsed(themeid + "themeviewtabindex", 0)
        this.themeViewTab = this.themeViewTabIndex.sync(
            (i) => MenuState._themeviewTabs[i],
            [],
            (str) => MenuState._themeviewTabs.indexOf(<any>str)
        )

        this.menuIsOpened = LocalStorageSource.GetParsed(themeid + "menuisopened", false)
        this.menuViewTabIndex = LocalStorageSource.GetParsed(themeid + "menuviewtabindex", 0)
        this.menuViewTab = this.menuViewTabIndex.sync(
            (i) => MenuState._menuviewTabs[i],
            [],
            (str) => MenuState._menuviewTabs.indexOf(<any>str)
        )
        this.menuIsOpened.addCallbackAndRun((isOpen) => {
            if (!isOpen) {
                this.highlightedUserSetting.setData(undefined)
            }
        })
        this.themeViewTab.addCallbackAndRun((tab) => {
            if (tab !== "filters") {
                this.highlightedLayerInFilters.setData(undefined)
            }
        })
    }
    public openFilterView(highlightLayer?: LayerConfig | string) {
        this.themeIsOpened.setData(true)
        this.themeViewTab.setData("filters")
        if (highlightLayer) {
            if (typeof highlightLayer !== "string") {
                highlightLayer = highlightLayer.id
            }
            this.highlightedLayerInFilters.setData(highlightLayer)
        }
    }

    public openUsersettings(highlightTagRendering?: string) {
        this.menuIsOpened.setData(true)
        this.menuViewTab.setData("settings")
        if (
            highlightTagRendering !== undefined &&
            !UserRelatedState.availableUserSettingsIds.some((tr) => tr === highlightTagRendering)
        ) {
            console.error(
                "No tagRendering with id '" + highlightTagRendering + "'; maybe you meant:",
                Utils.sortedByLevenshteinDistance(
                    highlightTagRendering,
                    UserRelatedState.availableUserSettingsIds,
                    (x) => x
                )
            )
        }
        this.highlightedUserSetting.setData(highlightTagRendering)
    }

    public closeAll() {
        this.menuIsOpened.setData(false)
        this.themeIsOpened.setData(false)
    }
}
