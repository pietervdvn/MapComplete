import { LayoutInformation } from "../../Models/ThemeConfig/LayoutConfig"
import { ImmutableStore, Store } from "../../Logic/UIEventSource"
import { Utils } from "../../Utils"
import themeOverview from "../../assets/generated/theme_overview.json"
import Locale from "../i18n/Locale"

export default class MoreScreen {
    public static readonly officialThemes: LayoutInformation[] = themeOverview

    public static applySearch(searchTerm: string) {
        searchTerm = searchTerm.toLowerCase()
        if (!searchTerm) {
            return
        }
        if (searchTerm === "personal") {
            window.location.href = MoreScreen.createUrlFor({ id: "personal" }, false).data
        }
        if (searchTerm === "bugs" || searchTerm === "issues") {
            window.location.href = "https://github.com/pietervdvn/MapComplete/issues"
        }
        if (searchTerm === "source") {
            window.location.href = "https://github.com/pietervdvn/MapComplete"
        }
        if (searchTerm === "docs") {
            window.location.href = "https://github.com/pietervdvn/MapComplete/tree/develop/Docs"
        }
        if (searchTerm === "osmcha" || searchTerm === "stats") {
            window.location.href = Utils.OsmChaLinkFor(7)
        }
        // Enter pressed -> search the first _official_ matchin theme and open it
        const publicTheme = MoreScreen.officialThemes.find(
            (th) =>
                th.hideFromOverview == false &&
                th.id !== "personal" &&
                MoreScreen.MatchesLayout(th, searchTerm)
        )
        if (publicTheme !== undefined) {
            window.location.href = MoreScreen.createUrlFor(publicTheme, false).data
        }
        const hiddenTheme = MoreScreen.officialThemes.find(
            (th) => th.id !== "personal" && MoreScreen.MatchesLayout(th, searchTerm)
        )
        if (hiddenTheme !== undefined) {
            window.location.href = MoreScreen.createUrlFor(hiddenTheme, false).data
        }
    }

    public static MatchesLayout(
        layout: {
            id: string
            title: any
            shortDescription: any
            keywords?: any[]
        },
        search: string
    ): boolean {
        if (search === undefined) {
            return true
        }
        search = Utils.RemoveDiacritics(search.toLocaleLowerCase())
        if (search.length > 3 && layout.id.toLowerCase().indexOf(search) >= 0) {
            return true
        }
        if (layout.id === "personal") {
            return false
        }
        const entitiesToSearch = [layout.shortDescription, layout.title, ...(layout.keywords ?? [])]
        for (const entity of entitiesToSearch) {
            if (entity === undefined) {
                continue
            }
            const term = entity["*"] ?? entity[Locale.language.data]
            if (Utils.RemoveDiacritics(term?.toLowerCase())?.indexOf(search) >= 0) {
                return true
            }
        }

        return false
    }

    public static createUrlFor(
        layout: { id: string; definition?: string },
        isCustom: boolean,
        state?: { layoutToUse?: { id } }
    ): Store<string> {
        if (layout === undefined) {
            return undefined
        }
        if (layout.id === undefined) {
            console.error("ID is undefined for layout", layout)
            return undefined
        }

        if (layout.id === state?.layoutToUse?.id) {
            return undefined
        }

        let path = window.location.pathname
        // Path starts with a '/' and contains everything, e.g. '/dir/dir/page.html'
        path = path.substr(0, path.lastIndexOf("/"))
        // Path will now contain '/dir/dir', or empty string in case of nothing
        if (path === "") {
            path = "."
        }

        let linkPrefix = `${path}/${layout.id.toLowerCase()}.html?`
        if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
            linkPrefix = `${path}/theme.html?layout=${layout.id}&`
        }

        if (isCustom) {
            linkPrefix = `${path}/theme.html?userlayout=${layout.id}&`
        }

        let hash = ""
        if (layout.definition !== undefined) {
            hash = "#" + btoa(JSON.stringify(layout.definition))
        }

        return new ImmutableStore<string>(`${linkPrefix}${hash}`)
    }
}
