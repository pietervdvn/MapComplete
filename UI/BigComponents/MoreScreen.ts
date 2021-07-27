import {VariableUiElement} from "../Base/VariableUIElement";
import LayoutConfig from "../../Customizations/JSON/LayoutConfig";
import {AllKnownLayouts} from "../../Customizations/AllKnownLayouts";
import Svg from "../../Svg";
import State from "../../State";
import Combine from "../Base/Combine";
import {SubtleButton} from "../Base/SubtleButton";
import Translations from "../i18n/Translations";
import * as personal from "../../assets/themes/personal/personal.json"
import Constants from "../../Models/Constants";
import LanguagePicker from "../LanguagePicker";
import IndexText from "./IndexText";
import BaseUIElement from "../BaseUIElement";

export default class MoreScreen extends Combine {


    constructor(onMainScreen: boolean = false) {
        super(MoreScreen.Init(onMainScreen, State.state));
    }

    private static Init(onMainScreen: boolean, state: State): BaseUIElement [] {
        const tr = Translations.t.general.morescreen;
        let intro: BaseUIElement = tr.intro.Clone();
        let themeButtonStyle = ""
        let themeListStyle = ""
        if (onMainScreen) {
            intro = new Combine([
                LanguagePicker.CreateLanguagePicker(Translations.t.index.title.SupportedLanguages())
                    .SetClass("absolute top-2 right-3"),
                new IndexText()
            ]);
            
            themeButtonStyle = "h-32 min-h-32 max-h-32 overflow-ellipsis overflow-hidden"
            themeListStyle = "md:grid md:grid-flow-row md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-g4 gap-4"
        }

        return[
            intro,
            MoreScreen.createOfficialThemesList(state, themeButtonStyle).SetClass(themeListStyle),
            MoreScreen.createUnofficialThemeList(themeButtonStyle)?.SetClass(themeListStyle),
            tr.streetcomplete.Clone().SetClass("block text-base mx-10 my-3 mb-10")
        ];
    }
    
    private static createUnofficialThemeList(buttonClass: string): BaseUIElement{
        return new VariableUiElement(State.state.installedThemes.map(customThemes => {
            const els : BaseUIElement[] = []
            if (customThemes.length > 0) {
                els.push(Translations.t.general.customThemeIntro.Clone())

                const customThemesElement = new Combine(
                    customThemes.map(theme => MoreScreen.createLinkButton(theme.layout, theme.definition)?.SetClass(buttonClass))
                )
                els.push(customThemesElement)
            }
            return els;
        }));
    }

    private static createOfficialThemesList(state: State, buttonClass: string): BaseUIElement {
        let officialThemes = AllKnownLayouts.layoutsList

        let buttons = officialThemes.map((layout) => {
            if(layout === undefined){
                console.trace("Layout is undefined")
                return undefined
            }
            const button = MoreScreen.createLinkButton(layout)?.SetClass(buttonClass);
            if(layout.id === personal.id){
                return new VariableUiElement(
                    State.state.osmConnection.userDetails.map(userdetails => userdetails.csCount)
                        .map(csCount => {
                            if(csCount < Constants.userJourney.personalLayoutUnlock){
                                return undefined
                            }else{
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
    private static createCustomGeneratorButton(state: State): VariableUiElement {
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

    /**
     * Creates a button linking to the given theme
     * @param layout
     * @param customThemeDefinition
     * @private
     */
    private static createLinkButton(layout: LayoutConfig, customThemeDefinition: string = undefined): BaseUIElement {
        if (layout === undefined) {
            return undefined;
        }
        if (layout.id === undefined) {
            console.error("ID is undefined for layout", layout);
            return undefined;
        }
        if (layout.hideFromOverview) {
            return undefined;
        }
        if (layout.id === State.state.layoutToUse.data?.id) {
            return undefined;
        }

        const currentLocation = State.state.locationControl;
        
        let path = window.location.pathname;
        // Path starts with a '/' and contains everything, e.g. '/dir/dir/page.html'
        path = path.substr(0, path.lastIndexOf("/"));
        // Path will now contain '/dir/dir', or empty string in case of nothing
        if (path === "") {
            path = "."
        }

        let linkPrefix = `${path}/${layout.id.toLowerCase()}.html?`
        let linkSuffix = ""
        if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
            linkPrefix = `${path}/index.html?layout=${layout.id}&`
        }

        if (customThemeDefinition) {
            linkPrefix = `${path}/index.html?userlayout=${layout.id}&`
            linkSuffix = `#${customThemeDefinition}`
        }

        const linkText = currentLocation.map(currentLocation => {
            const params = [
                ["z", currentLocation?.zoom],
                ["lat", currentLocation?.lat],
                ["lon",currentLocation?.lon]
            ].filter(part => part[1] !== undefined)
                .map(part => part[0]+"="+part[1])
                .join("&")
            return `${linkPrefix}${params}${linkSuffix}`;
        })

  
       

        let description = Translations.WT(layout.shortDescription).Clone();
        return new SubtleButton(layout.icon,
            new Combine([
                `<dt class='text-lg leading-6 font-medium text-gray-900 group-hover:text-blue-800'>`,
                Translations.WT(layout.title).Clone(),
                `</dt>`,
                `<dd class='mt-1 text-base text-gray-500 group-hover:text-blue-900 overflow-ellipsis'>`,
                description.Clone().SetClass("subtle") ?? "",
                `</dd>`,
            ]), {url: linkText, newTab: false});
    }


}