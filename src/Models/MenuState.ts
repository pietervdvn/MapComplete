import LayerConfig from "./ThemeConfig/LayerConfig"
import { UIEventSource } from "../Logic/UIEventSource"
import UserRelatedState from "../Logic/State/UserRelatedState"
import { Utils } from "../Utils"
import { LocalStorageSource } from "../Logic/Web/LocalStorageSource"
import Zoomcontrol from "../UI/Zoomcontrol"

export type ThemeViewTabStates = (typeof MenuState._themeviewTabs)[number]
export type MenuViewTabStates = (typeof MenuState._menuviewTabs)[number]

/**
 * Indicates if a menu is open, and if so, which tab is selected;
 * Some tabs allow to highlight an element.
 *
 * Some convenience methods are provided for this as well
 */
export class MenuState {
    public static readonly _themeviewTabs = ["intro", "download", "copyright", "share"] as const
    public static readonly _menuviewTabs = [
        "about",
        "settings",
        "favourites",
        "community",
        "privacy",
        "advanced",
    ] as const
    public readonly themeIsOpened: UIEventSource<boolean>
    public readonly themeViewTabIndex: UIEventSource<number>
    public readonly themeViewTab: UIEventSource<ThemeViewTabStates>
    public readonly menuIsOpened: UIEventSource<boolean>
    public readonly menuViewTabIndex: UIEventSource<number>
    public readonly menuViewTab: UIEventSource<MenuViewTabStates>

    public readonly backgroundLayerSelectionIsOpened: UIEventSource<boolean> =
        new UIEventSource<boolean>(false)

    public readonly filtersPanelIsOpened: UIEventSource<boolean> = new UIEventSource<boolean>(false)
    public readonly privacyPanelIsOpened: UIEventSource<boolean> = new UIEventSource<boolean>(false)
    public readonly communityIndexPanelIsOpened: UIEventSource<boolean> = new UIEventSource(false)
    public readonly allToggles: {
        toggle: UIEventSource<boolean>
        name: string
        submenu?: UIEventSource<string>
        showOverOthers?: boolean
    }[]

    public readonly highlightedLayerInFilters: UIEventSource<string> = new UIEventSource<string>(
        undefined
    )
    public highlightedUserSetting: UIEventSource<string> = new UIEventSource<string>(undefined)

    constructor(shouldOpenWelcomeMessage: boolean, themeid: string = "") {
        // Note: this class is _not_ responsible to update the Hash, @see ThemeViewStateHashActor for this
        if (themeid) {
            themeid += "-"
        }
        this.themeIsOpened = LocalStorageSource.GetParsed(
            themeid + "thememenuisopened",
            shouldOpenWelcomeMessage
        )
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
        this.menuViewTab.addCallbackD((tab) => {
            if (tab !== "settings") {
                this.highlightedUserSetting.setData(undefined)
            }
        })
        this.filtersPanelIsOpened.addCallbackAndRun((isOpen) => {
            if (!isOpen) {
                this.highlightedLayerInFilters.setData(undefined)
            }
        })

        this.menuIsOpened.addCallbackAndRunD((opened) => {
            if (opened) {
                this.themeIsOpened.setData(false)
            }
        })
        this.themeIsOpened.addCallbackAndRunD((opened) => {
            if (opened) {
                this.menuIsOpened.setData(false)
            }
        })

        this.allToggles = [
            {
                toggle: this.privacyPanelIsOpened,
                name: "privacy",
                showOverOthers: true,
            },
            {
                toggle: this.menuIsOpened,
                name: "menu",
                submenu: this.menuViewTab,
            },
            {
                toggle: this.themeIsOpened,
                name: "theme-menu",
                submenu: this.themeViewTab,
            },
            {
                toggle: this.backgroundLayerSelectionIsOpened,
                name: "background",
                showOverOthers: true,
            },
            {
                toggle: this.communityIndexPanelIsOpened,
                name: "community",
                showOverOthers: true,
            },
            {
                toggle: this.filtersPanelIsOpened,
                name: "filters",
                showOverOthers: true,
            },
        ]
        for (const toggle of this.allToggles) {
            toggle.toggle.addCallback((isOpen) => {
                if (!isOpen) {
                    this.resetZoomIfAllClosed()
                }
            })
        }
    }

    private resetZoomIfAllClosed() {
        if (this.isSomethingOpen()) {
            return
        }
        Zoomcontrol.resetzoom()
    }

    public openFilterView(highlightLayer?: LayerConfig | string) {
        this.filtersPanelIsOpened.setData(true)
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

    public isSomethingOpen(): boolean {
        return this.allToggles.some((t) => t.toggle.data)
    }

    /**
     * Close all floatOvers.
     * Returns 'true' if at least one menu was opened
     */
    public closeAll(): boolean {
        let somethingWasOpen = false
        for (const t of this.allToggles) {
            somethingWasOpen = t.toggle.data
            t.toggle.setData(false)
            if (somethingWasOpen) {
                break
            }
        }
        return somethingWasOpen
    }
}
