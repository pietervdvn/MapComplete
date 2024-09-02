import LayerConfig from "./ThemeConfig/LayerConfig"
import { UIEventSource } from "../Logic/UIEventSource"
import UserRelatedState from "../Logic/State/UserRelatedState"
import { Utils } from "../Utils"
import Zoomcontrol from "../UI/Zoomcontrol"
import { LocalStorageSource } from "../Logic/Web/LocalStorageSource"

export type PageType = (typeof MenuState.pageNames)[number]

/**
 * Indicates if a menu is open, and if so, which tab is selected;
 * Some tabs allow to highlight an element.
 *
 * Some convenience methods are provided for this as well
 */
export class MenuState {


    public static readonly pageNames = [
        "copyright", "copyright_icons", "community_index", "hotkeys",
        "privacy", "filter", "background", "about_theme", "download", "favourites",
        "usersettings", "share", "menu",
    ] as const

    public readonly pageStates: Record<PageType, UIEventSource<boolean>>

    public readonly highlightedLayerInFilters: UIEventSource<string> = new UIEventSource<string>(
        undefined,
    )
    public highlightedUserSetting: UIEventSource<string> = new UIEventSource<string>(undefined)

    constructor(shouldShowWelcomeMessage: boolean, themeid: string) {
        // Note: this class is _not_ responsible to update the Hash, @see ThemeViewStateHashActor for this
        const states = {}
        for (const pageName of MenuState.pageNames) {
            const toggle = new UIEventSource(false)
            states[pageName] = toggle
        }
        this.pageStates = <Record<PageType, UIEventSource<boolean>>>states

        for (const pageName of MenuState.pageNames) {
            if(pageName === "menu"){
                continue
            }
            this.pageStates[pageName].addCallback(enabled => {
                if (enabled) {
                    this.pageStates.menu.set(false)
                }
            })
        }

        const visitedBefore = LocalStorageSource.GetParsed<boolean>(
            themeid + "thememenuisopened", false,
        )
        if (!visitedBefore.data && shouldShowWelcomeMessage) {
            this.pageStates.about_theme.set(true)
            visitedBefore.set(true)
        }
    }

    private resetZoomIfAllClosed() {
        if (this.isSomethingOpen()) {
            return
        }
        Zoomcontrol.resetzoom()
    }

    public openFilterView(highlightLayer?: LayerConfig | string) {
        this.pageStates.filter.setData(true)
        if (highlightLayer) {
            if (typeof highlightLayer !== "string") {
                highlightLayer = highlightLayer.id
            }
            this.highlightedLayerInFilters.setData(highlightLayer)
        }
    }

    public openUsersettings(highlightTagRendering?: string) {
        if (
            highlightTagRendering !== undefined &&
            !UserRelatedState.availableUserSettingsIds.some((tr) => tr === highlightTagRendering)
        ) {
            console.error(
                "No tagRendering with id '" + highlightTagRendering + "'; maybe you meant:",
                Utils.sortedByLevenshteinDistance(
                    highlightTagRendering,
                    UserRelatedState.availableUserSettingsIds,
                    (x) => x,
                ),
            )
        }
        this.highlightedUserSetting.setData(highlightTagRendering)
    }

    public isSomethingOpen(): boolean {
        return Object.values(this.pageStates).some((t) => t.data)
    }

    /**
     * Close all floatOvers.
     * Returns 'true' if at least one menu was opened
     */
    public closeAll(): boolean {
        const ps = this.pageStates
        for (const key in ps) {
            const toggle = ps[key]
            const wasOpen = toggle.data
            toggle.setData(false)
            if (wasOpen) {
                return true
            }
        }
        if (ps.menu.data) {
            ps.menu.set(false)
            return true
        }
    }

}
