import { MinimalLayoutInformation } from "../../Models/ThemeConfig/LayoutConfig"
import { Store } from "../../Logic/UIEventSource"
import { Utils } from "../../Utils"
import themeOverview from "../../assets/generated/theme_overview.json"
import Locale from "../i18n/Locale"
import { Translatable } from "../../Models/ThemeConfig/Json/Translatable"
import { TagRenderingConfigJson } from "../../Models/ThemeConfig/Json/TagRenderingConfigJson"
import { OsmConnection } from "../../Logic/Osm/OsmConnection"

export default class MoreScreen {
    public static readonly officialThemes: MinimalLayoutInformation[] = themeOverview
    public static readonly officialThemesById: Map<string, MinimalLayoutInformation> = new Map<string, MinimalLayoutInformation>()
    static {
        for (const th of MoreScreen.officialThemes) {
            MoreScreen.officialThemesById.set(th.id, th)
        }
    }

    public static applySearch(searchTerm: string) {
        searchTerm = searchTerm.toLowerCase()
        if (!searchTerm) {
            return
        }
        if (searchTerm === "personal") {
            window.location.href = MoreScreen.createUrlFor({ id: "personal" }, false)
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
        if (searchTerm === "studio") {
            window.location.href = "./studio.html"
        }
        // Enter pressed -> search the first _official_ matchin theme and open it
        const publicTheme = MoreScreen.officialThemes.find(
            (th) =>
                th.hideFromOverview == false &&
                th.id !== "personal" &&
                MoreScreen.MatchesLayout(th, searchTerm),
        )
        if (publicTheme !== undefined) {
            window.location.href = MoreScreen.createUrlFor(publicTheme, false)
        }
        const hiddenTheme = MoreScreen.officialThemes.find(
            (th) => th.id !== "personal" && MoreScreen.MatchesLayout(th, searchTerm),
        )
        if (hiddenTheme !== undefined) {
            window.location.href = MoreScreen.createUrlFor(hiddenTheme, false)
        }
    }

    public static MatchesLayout(
        layout: MinimalLayoutInformation,
        search: string,
        language?: string,
    ): boolean {
        if (search === undefined) {
            return true
        }
        search = Utils.simplifyStringForSearch(search.toLocaleLowerCase()) // See #1729
        if (search.length > 3 && layout.id.toLowerCase().indexOf(search) >= 0) {
            return true
        }
        if (layout.id === "personal") {
            return false
        }
        if (Utils.simplifyStringForSearch(layout.id) === Utils.simplifyStringForSearch(search)) {
            return true
        }
        language ??= Locale.language.data

        const entitiesToSearch: (string | Record<string, string> | Record<string, string[]>)[] = [layout.shortDescription, layout.title, layout.keywords]
        for (const entity of entitiesToSearch) {
            if (entity === undefined) {
                continue
            }

            let term: string[]
            if (typeof entity === "string") {
                term = [entity]
            } else {
                const terms = [].concat(entity["*"], entity[language])
                if (Array.isArray(terms)) {
                    term = terms
                } else {
                    term = [terms]
                }
            }

            const minLevehnstein = Math.min(...Utils.NoNull(term).map(t => Utils.levenshteinDistance(search,
                Utils.simplifyStringForSearch(t).slice(0, search.length))))

            if (minLevehnstein < 1 || minLevehnstein / search.length < 0.2) {
                return true
            }
        }

        return false
    }

    public static createUrlFor(
        layout: { id: string },
        isCustom: boolean,
        state?: { layoutToUse?: { id } },
    ): string {
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


        return `${linkPrefix}`
    }

    /**
     * Gives all the IDs of the hidden themes which were previously visited
     * @param osmConnection
     */
    public static knownHiddenThemes(osmConnection: OsmConnection): Store<Set<string>> {
        const prefix = "mapcomplete-hidden-theme-"
        const userPreferences = osmConnection.preferencesHandler.preferences
        return userPreferences.map((preferences) =>
            new Set<string>(
                Object.keys(preferences)
                    .filter((key) => key.startsWith(prefix))
                    .map((key) => key.substring(prefix.length, key.length - "-enabled".length)),
            ))
    }
}
