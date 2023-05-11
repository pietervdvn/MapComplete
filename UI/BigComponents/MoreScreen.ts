import Svg from "../../Svg"
import Combine from "../Base/Combine"
import { SubtleButton } from "../Base/SubtleButton"
import Translations from "../i18n/Translations"
import BaseUIElement from "../BaseUIElement"
import LayoutConfig, { LayoutInformation } from "../../Models/ThemeConfig/LayoutConfig"
import { ImmutableStore, Store, UIEventSource } from "../../Logic/UIEventSource"
import Loc from "../../Models/Loc"
import UserRelatedState from "../../Logic/State/UserRelatedState"
import { Utils } from "../../Utils"
import Title from "../Base/Title"
import themeOverview from "../../assets/generated/theme_overview.json"
import { Translation } from "../i18n/Translation"
import { TextField } from "../Input/TextField"
import Locale from "../i18n/Locale"
import SvelteUIElement from "../Base/SvelteUIElement"
import ThemesList from "./ThemesList.svelte"
import HiddenThemeList from "./HiddenThemeList.svelte"
import UnofficialThemeList from "./UnofficialThemeList.svelte"

export default class MoreScreen extends Combine {
    private static readonly officialThemes: LayoutInformation[] = themeOverview

    constructor(
        state: UserRelatedState & {
            locationControl?: UIEventSource<Loc>
            layoutToUse?: LayoutConfig
        },
        onMainScreen: boolean = false
    ) {
        const tr = Translations.t.general.morescreen

        const search = new TextField({
            placeholder: tr.searchForATheme,
        })
        search.enterPressed.addCallbackD((searchTerm) => {
            searchTerm = searchTerm.toLowerCase()
            if (searchTerm === "personal") {
                window.location.href = MoreScreen.createUrlFor(
                    { id: "personal" },
                    false,
                    state
                ).data
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
                window.location.href = MoreScreen.createUrlFor(publicTheme, false, state).data
            }
            const hiddenTheme = MoreScreen.officialThemes.find(
                (th) => th.id !== "personal" && MoreScreen.MatchesLayout(th, searchTerm)
            )
            if (hiddenTheme !== undefined) {
                window.location.href = MoreScreen.createUrlFor(hiddenTheme, false, state).data
            }
        })

        if (onMainScreen) {
            search.focus()
            document.addEventListener("keydown", function (event) {
                if (event.ctrlKey && event.code === "KeyF") {
                    search.focus()
                    event.preventDefault()
                }
            })
        }

        const searchBar = new Combine([
            Svg.search_svg().SetClass("w-8"),
            search.SetClass("mr-4 w-full"),
        ]).SetClass("flex rounded-full border-2 border-black items-center my-2 w-1/2")

        super([
            new Combine([searchBar]).SetClass("flex justify-center"),
            new SvelteUIElement(ThemesList, {
                state,
                onMainScreen,
                search: search.GetValue(),
                themes: MoreScreen.officialThemes,
            }),
            new SvelteUIElement(HiddenThemeList, {
                state,
                onMainScreen,
                search: search.GetValue(),
            }),
            new SvelteUIElement(UnofficialThemeList, {
                state,
                onMainScreen,
                search: search.GetValue(),
            }),
            tr.streetcomplete.Clone().SetClass("block text-base mx-10 my-3 mb-10"),
        ])
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
        search = search.toLocaleLowerCase()
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
            if (term?.toLowerCase()?.indexOf(search) >= 0) {
                return true
            }
        }

        return false
    }

    private static createUrlFor(
        layout: { id: string; definition?: string },
        isCustom: boolean,
        state?: { locationControl?: UIEventSource<{ lat; lon; zoom }>; layoutToUse?: { id } }
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

        const currentLocation = state?.locationControl

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

        return (
            currentLocation?.map((currentLocation) => {
                const params = [
                    ["z", currentLocation?.zoom],
                    ["lat", currentLocation?.lat],
                    ["lon", currentLocation?.lon],
                ]
                    .filter((part) => part[1] !== undefined)
                    .map((part) => part[0] + "=" + part[1])
                    .join("&")
                return `${linkPrefix}${params}${hash}`
            }) ?? new ImmutableStore<string>(`${linkPrefix}`)
        )
    }
}
