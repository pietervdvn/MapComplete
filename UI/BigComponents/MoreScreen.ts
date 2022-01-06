import {VariableUiElement} from "../Base/VariableUIElement";
import Svg from "../../Svg";
import Combine from "../Base/Combine";
import {SubtleButton} from "../Base/SubtleButton";
import Translations from "../i18n/Translations";
import * as personal from "../../assets/themes/personal/personal.json"
import Constants from "../../Models/Constants";
import BaseUIElement from "../BaseUIElement";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import {UIEventSource} from "../../Logic/UIEventSource";
import Loc from "../../Models/Loc";
import {OsmConnection} from "../../Logic/Osm/OsmConnection";
import UserRelatedState from "../../Logic/State/UserRelatedState";
import Toggle from "../Input/Toggle";
import {Utils} from "../../Utils";
import Title from "../Base/Title";
import * as themeOverview from "../../assets/generated/theme_overview.json"
import {Translation} from "../i18n/Translation";

export default class MoreScreen extends Combine {


    constructor(state: UserRelatedState & {
        locationControl?: UIEventSource<Loc>,
        layoutToUse?: LayoutConfig
    }, onMainScreen: boolean = false) {
        const tr = Translations.t.general.morescreen;
        let themeButtonStyle = ""
        let themeListStyle = ""
        if (onMainScreen) {
            themeButtonStyle = "h-32 min-h-32 max-h-32 overflow-ellipsis overflow-hidden"
            themeListStyle = "md:grid md:grid-flow-row md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-g4 gap-4"
        }

        super([
            MoreScreen.createOfficialThemesList(state, themeButtonStyle).SetClass(themeListStyle),
            MoreScreen.createPreviouslyVistedHiddenList(state, themeButtonStyle, themeListStyle),
            MoreScreen.createUnofficialThemeList(themeButtonStyle, state, themeListStyle),
            tr.streetcomplete.Clone().SetClass("block text-base mx-10 my-3 mb-10")
        ]);
    }

    /**
     * Creates a button linking to the given theme
     * @private
     */
    public static createLinkButton(
        state: {
            locationControl?: UIEventSource<Loc>,
            layoutToUse?: LayoutConfig
        }, layout: {
            id: string,
            icon: string,
            title: any,
            shortDescription: any
        }, isCustom: boolean = false
    ):
        BaseUIElement {
        if (layout === undefined) {
            return undefined;
        }
        if (layout.id === undefined) {
            console.error("ID is undefined for layout", layout);
            return undefined;
        }

        if (layout.id === state?.layoutToUse?.id) {
            return undefined;
        }

        const currentLocation = state?.locationControl;

        let path = window.location.pathname;
        // Path starts with a '/' and contains everything, e.g. '/dir/dir/page.html'
        path = path.substr(0, path.lastIndexOf("/"));
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

        const linkText = currentLocation?.map(currentLocation => {
            const params = [
                ["z", currentLocation?.zoom],
                ["lat", currentLocation?.lat],
                ["lon", currentLocation?.lon]
            ].filter(part => part[1] !== undefined)
                .map(part => part[0] + "=" + part[1])
                .join("&")
            return `${linkPrefix}${params}`;
        }) ?? new UIEventSource<string>(`${linkPrefix}`)


        return new SubtleButton(layout.icon,
            new Combine([
                `<dt class='text-lg leading-6 font-medium text-gray-900 group-hover:text-blue-800'>`,
                new Translation(layout.title),
                `</dt>`,
                `<dd class='mt-1 text-base text-gray-500 group-hover:text-blue-900 overflow-ellipsis'>`,
                new Translation(layout.shortDescription)?.SetClass("subtle") ?? "",
                `</dd>`,
            ]), {url: linkText, newTab: false});
    }

    private static createUnofficialThemeList(buttonClass: string, state: UserRelatedState, themeListClasses): BaseUIElement {
        return new VariableUiElement(state.installedThemes.map(customThemes => {
            if (customThemes.length <= 0) {
                return undefined;
            }
            const customThemeButtons = customThemes.map(theme => MoreScreen.createLinkButton(state, theme, true)?.SetClass(buttonClass))
            return new Combine([
                Translations.t.general.customThemeIntro.Clone(),
                new Combine(customThemeButtons).SetClass(themeListClasses)
            ]);
        }));
    }

    private static createPreviouslyVistedHiddenList(state: UserRelatedState, buttonClass: string, themeListStyle: string) {
        const t = Translations.t.general.morescreen
        const prefix = "mapcomplete-hidden-theme-"
        const hiddenThemes = themeOverview["default"].filter(layout => layout.hideFromOverview)
        const hiddenTotal = hiddenThemes.length
        
        return new Toggle(
            new VariableUiElement(
                state.osmConnection.preferencesHandler.preferences.map(allPreferences => {
                    const knownThemes: Set<string> = new Set(Utils.NoNull(Object.keys(allPreferences)
                        .filter(key => key.startsWith(prefix))
                        .map(key => key.substring(prefix.length, key.length - "-enabled".length))));
                    
                    if(knownThemes.size === 0){
                        return undefined
                    }
                    
                     const knownThemeDescriptions = hiddenThemes.filter(theme => knownThemes.has(theme.id))
                         .map(theme => MoreScreen.createLinkButton(state, theme)?.SetClass(buttonClass));

                    const knownLayouts = new Combine(knownThemeDescriptions).SetClass(themeListStyle)

                    return new Combine([
                        new Title(t.previouslyHiddenTitle),
                        t.hiddenExplanation.Subs({
                            hidden_discovered: "" + knownThemes.size,
                            total_hidden: "" + hiddenTotal
                        }),
                        knownLayouts
                    ])

                })
            ).SetClass("flex flex-col"),
            undefined,
            state.osmConnection.isLoggedIn
        )


    }

    private static createOfficialThemesList(state: { osmConnection: OsmConnection, locationControl?: UIEventSource<Loc> }, buttonClass: string): BaseUIElement {
        let officialThemes = themeOverview["default"];

        let buttons = officialThemes.map((layout) => {
            if (layout === undefined) {
                console.trace("Layout is undefined")
                return undefined
            }
            if (layout.hideFromOverview) {
                return undefined;
            }
            const button = MoreScreen.createLinkButton(state, layout)?.SetClass(buttonClass);
            if (layout.id === personal.id) {
                return new VariableUiElement(
                    state.osmConnection.userDetails.map(userdetails => userdetails.csCount)
                        .map(csCount => {
                            if (csCount < Constants.userJourney.personalLayoutUnlock) {
                                return undefined
                            } else {
                                return button
                            }
                        })
                )
            }
            return button;
        })

        let customGeneratorLink = MoreScreen.createCustomGeneratorButton(state)
        buttons.splice(0, 0, customGeneratorLink);

        return new Combine(buttons)
    }

    /*
    * Returns either a link to the issue tracker or a link to the custom generator, depending on the achieved number of changesets
    * */
    private static createCustomGeneratorButton(state: { osmConnection: OsmConnection }): VariableUiElement {
        const tr = Translations.t.general.morescreen;
        return new VariableUiElement(
            state.osmConnection.userDetails.map(userDetails => {
                if (userDetails.csCount < Constants.userJourney.themeGeneratorReadOnlyUnlock) {
                    return new SubtleButton(null, tr.requestATheme.Clone(), {
                        url: "https://github.com/pietervdvn/MapComplete/issues",
                        newTab: true
                    });
                }
                return new SubtleButton(Svg.pencil_ui(), tr.createYourOwnTheme.Clone(), {
                    url: "https://pietervdvn.github.io/mc/legacy/070/customGenerator.html",
                    newTab: false
                });
            })
        )
    }


}