import { VariableUiElement } from "../Base/VariableUIElement"
import Svg from "../../Svg"
import Combine from "../Base/Combine"
import { SubtleButton } from "../Base/SubtleButton"
import Translations from "../i18n/Translations"
import * as personal from "../../assets/themes/personal/personal.json"
import Constants from "../../Models/Constants"
import BaseUIElement from "../BaseUIElement"
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"
import { ImmutableStore, Store, Stores, UIEventSource } from "../../Logic/UIEventSource"
import Loc from "../../Models/Loc"
import { OsmConnection } from "../../Logic/Osm/OsmConnection"
import UserRelatedState from "../../Logic/State/UserRelatedState"
import Toggle from "../Input/Toggle"
import { Utils } from "../../Utils"
import Title from "../Base/Title"
import * as themeOverview from "../../assets/generated/theme_overview.json"
import { Translation } from "../i18n/Translation"
import { TextField } from "../Input/TextField"
import FilteredCombine from "../Base/FilteredCombine"
import Locale from "../i18n/Locale"

export default class MoreScreen extends Combine {
    private static readonly officialThemes: {
        id: string
        icon: string
        title: any
        shortDescription: any
        definition?: any
        mustHaveLanguage?: boolean
        hideFromOverview: boolean
        keywors?: any[]
    }[] = themeOverview["default"]

    constructor(
        state: UserRelatedState & {
            locationControl?: UIEventSource<Loc>
            layoutToUse?: LayoutConfig
        },
        onMainScreen: boolean = false
    ) {
        const tr = Translations.t.general.morescreen
        let themeButtonStyle = ""
        let themeListStyle = ""
        if (onMainScreen) {
            themeButtonStyle = "h-32 min-h-32 max-h-32 text-ellipsis overflow-hidden"
            themeListStyle =
                "md:grid md:grid-flow-row md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-g4 gap-4"
        }

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
                    MoreScreen.MatchesLayoutFunc(th)(searchTerm)
            )
            if (publicTheme !== undefined) {
                window.location.href = MoreScreen.createUrlFor(publicTheme, false, state).data
            }
            const hiddenTheme = MoreScreen.officialThemes.find(
                (th) => th.id !== "personal" && MoreScreen.MatchesLayoutFunc(th)(searchTerm)
            )
            if (hiddenTheme !== undefined) {
                window.location.href = MoreScreen.createUrlFor(hiddenTheme, false, state).data
            }
        })

        if (onMainScreen) {
            search.focus()
        }
        document.addEventListener("keydown", function (event) {
            if (event.ctrlKey && event.code === "KeyF") {
                search.focus()
                event.preventDefault()
            }
        })

        const searchBar = new Combine([
            Svg.search_svg().SetClass("w-8"),
            search.SetClass("mr-4 w-full"),
        ]).SetClass("flex rounded-full border-2 border-black items-center my-2 w-1/2")

        super([
            new Combine([searchBar]).SetClass("flex justify-center"),
            MoreScreen.createOfficialThemesList(
                state,
                themeButtonStyle,
                themeListStyle,
                search.GetValue()
            ),
            MoreScreen.createPreviouslyVistedHiddenList(
                state,
                themeButtonStyle,
                themeListStyle,
                search.GetValue()
            ),
            MoreScreen.createUnofficialThemeList(
                themeButtonStyle,
                state,
                themeListStyle,
                search.GetValue()
            ),
            tr.streetcomplete.Clone().SetClass("block text-base mx-10 my-3 mb-10"),
        ])
    }

    private static NothingFound(search: UIEventSource<string>): BaseUIElement {
        const t = Translations.t.general.morescreen
        return new Combine([
            new Title(t.noMatchingThemes, 5).SetClass("w-max font-bold"),
            new SubtleButton(Svg.search_disable_ui(), t.noSearch, { imgSize: "h-6" })
                .SetClass("h-12 w-max")
                .onClick(() => search.setData("")),
        ]).SetClass("flex flex-col items-center w-full")
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

    /**
     * Creates a button linking to the given theme
     * @private
     */
    public static createLinkButton(
        state: {
            locationControl?: UIEventSource<Loc>
            layoutToUse?: LayoutConfig
        },
        layout: {
            id: string
            icon: string
            title: any
            shortDescription: any
            definition?: any
            mustHaveLanguage?: boolean
        },
        isCustom: boolean = false
    ): BaseUIElement {
        const url = MoreScreen.createUrlFor(layout, isCustom, state)
        let content = new Combine([
            new Translation(
                layout.title,
                !isCustom && !layout.mustHaveLanguage ? "themes:" + layout.id + ".title" : undefined
            ),
            new Translation(layout.shortDescription)?.SetClass("subtle") ?? "",
        ]).SetClass("overflow-hidden flex flex-col")

        if (state.layoutToUse === undefined) {
            // Currently on the index screen: we style the buttons equally large
            content = new Combine([content]).SetClass("flex flex-col justify-center h-24")
        }

        return new SubtleButton(layout.icon, content, { url, newTab: false })
    }

    public static CreateProffessionalSerivesButton() {
        const t = Translations.t.professional.indexPage
        return new Combine([
            new Title(t.hook, 4),
            t.hookMore,
            new SubtleButton(undefined, t.button, { url: "./professional.html" }),
        ]).SetClass("flex flex-col border border-gray-300 p-2 rounded-lg")
    }
    private static createUnofficialThemeList(
        buttonClass: string,
        state: UserRelatedState,
        themeListClasses: string,
        search: UIEventSource<string>
    ): BaseUIElement {
        var currentIds: Store<string[]> = state.installedUserThemes

        var stableIds = Stores.ListStabilized<string>(currentIds)
        return new VariableUiElement(
            stableIds.map((ids) => {
                const allThemes: { element: BaseUIElement; predicate?: (s: string) => boolean }[] =
                    []
                for (const id of ids) {
                    const themeInfo = state.GetUnofficialTheme(id)
                    if (themeInfo === undefined) {
                        continue
                    }
                    const link = MoreScreen.createLinkButton(state, themeInfo, true)
                    if (link !== undefined) {
                        allThemes.push({
                            element: link.SetClass(buttonClass),
                            predicate: (s) => id.toLowerCase().indexOf(s) >= 0,
                        })
                    }
                }
                if (allThemes.length <= 0) {
                    return undefined
                }
                return new Combine([
                    Translations.t.general.customThemeIntro,
                    new FilteredCombine(allThemes, search, {
                        innerClasses: themeListClasses,
                        onEmpty: MoreScreen.NothingFound(search),
                    }),
                ])
            })
        )
    }

    private static createPreviouslyVistedHiddenList(
        state: UserRelatedState,
        buttonClass: string,
        themeListStyle: string,
        search: UIEventSource<string>
    ): BaseUIElement {
        const t = Translations.t.general.morescreen
        const prefix = "mapcomplete-hidden-theme-"
        const hiddenThemes = themeOverview["default"].filter((layout) => layout.hideFromOverview)
        const hiddenTotal = hiddenThemes.length

        return new Toggle(
            new VariableUiElement(
                state.osmConnection.preferencesHandler.preferences.map((allPreferences) => {
                    const knownThemes: Set<string> = new Set(
                        Utils.NoNull(
                            Object.keys(allPreferences)
                                .filter((key) => key.startsWith(prefix))
                                .map((key) =>
                                    key.substring(prefix.length, key.length - "-enabled".length)
                                )
                        )
                    )

                    if (knownThemes.size === 0) {
                        return undefined
                    }

                    const knownThemeDescriptions = hiddenThemes
                        .filter((theme) => knownThemes.has(theme.id))
                        .map((theme) => ({
                            element: MoreScreen.createLinkButton(state, theme)?.SetClass(
                                buttonClass
                            ),
                            predicate: MoreScreen.MatchesLayoutFunc(theme),
                        }))

                    const knownLayouts = new FilteredCombine(knownThemeDescriptions, search, {
                        innerClasses: themeListStyle,
                        onEmpty: MoreScreen.NothingFound(search),
                    })

                    return new Combine([
                        new Title(t.previouslyHiddenTitle),
                        t.hiddenExplanation.Subs({
                            hidden_discovered: "" + knownThemes.size,
                            total_hidden: "" + hiddenTotal,
                        }),
                        knownLayouts,
                    ])
                })
            ).SetClass("flex flex-col"),
            undefined,
            state.osmConnection.isLoggedIn
        )
    }

    private static MatchesLayoutFunc(layout: {
        id: string
        title: any
        shortDescription: any
        keywords?: any[]
    }): (search: string) => boolean {
        return (search: string) => {
            search = search.toLocaleLowerCase()
            if (layout.id.toLowerCase().indexOf(search) >= 0) {
                return true
            }
            const entitiesToSearch = [
                layout.shortDescription,
                layout.title,
                ...(layout.keywords ?? []),
            ]
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
    }

    private static createOfficialThemesList(
        state: { osmConnection: OsmConnection; locationControl?: UIEventSource<Loc> },
        buttonClass: string,
        themeListStyle: string,
        search: UIEventSource<string>
    ): BaseUIElement {
        let buttons: { element: BaseUIElement; predicate?: (s: string) => boolean }[] =
            MoreScreen.officialThemes.map((layout) => {
                if (layout === undefined) {
                    console.trace("Layout is undefined")
                    return undefined
                }
                if (layout.hideFromOverview) {
                    return undefined
                }
                const button = MoreScreen.createLinkButton(state, layout)?.SetClass(buttonClass)
                if (layout.id === personal.id) {
                    const element = new VariableUiElement(
                        state.osmConnection.userDetails
                            .map((userdetails) => userdetails.csCount)
                            .map((csCount) => {
                                if (csCount < Constants.userJourney.personalLayoutUnlock) {
                                    return undefined
                                } else {
                                    return button
                                }
                            })
                    )
                    return { element }
                }

                return { element: button, predicate: MoreScreen.MatchesLayoutFunc(layout) }
            })

        const professional = MoreScreen.CreateProffessionalSerivesButton()
        const customGeneratorLink = MoreScreen.createCustomGeneratorButton(state)
        buttons.splice(0, 0, { element: customGeneratorLink }, { element: professional })
        return new FilteredCombine(buttons, search, {
            innerClasses: themeListStyle,
            onEmpty: MoreScreen.NothingFound(search),
        })
    }

    /*
     * Returns either a link to the issue tracker or a link to the custom generator, depending on the achieved number of changesets
     * */
    private static createCustomGeneratorButton(state: {
        osmConnection: OsmConnection
    }): VariableUiElement {
        const tr = Translations.t.general.morescreen
        return new VariableUiElement(
            state.osmConnection.userDetails.map((userDetails) => {
                if (userDetails.csCount < Constants.userJourney.themeGeneratorReadOnlyUnlock) {
                    return new SubtleButton(null, tr.requestATheme.Clone(), {
                        url: "https://github.com/pietervdvn/MapComplete/issues",
                        newTab: true,
                    })
                }
                return new SubtleButton(Svg.pencil_ui(), tr.createYourOwnTheme.Clone(), {
                    url: "https://pietervdvn.github.io/mc/legacy/070/customGenerator.html",
                    newTab: false,
                })
            })
        )
    }
}
