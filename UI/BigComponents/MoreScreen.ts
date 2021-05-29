import {UIElement} from "../UIElement";
import {VariableUiElement} from "../Base/VariableUIElement";
import LayoutConfig from "../../Customizations/JSON/LayoutConfig";
import {AllKnownLayouts} from "../../Customizations/AllKnownLayouts";
import Svg from "../../Svg";
import State from "../../State";
import Combine from "../Base/Combine";
import {SubtleButton} from "../Base/SubtleButton";
import Translations from "../i18n/Translations";
import * as personal from "../../assets/themes/personalLayout/personalLayout.json"
import Constants from "../../Models/Constants";
import LanguagePicker from "../LanguagePicker";
import IndexText from "./IndexText";

export default class MoreScreen extends UIElement {
    private readonly _onMainScreen: boolean;

    private _component: UIElement;


    constructor(onMainScreen: boolean = false) {
        super(State.state.locationControl);
        this._onMainScreen = onMainScreen;
        this.ListenTo(State.state.osmConnection.userDetails);
        this.ListenTo(State.state.installedThemes);
    }

    InnerRender(): string {

        const tr = Translations.t.general.morescreen;

        const els: UIElement[] = []

        const themeButtons: UIElement[] = []

        for (const layout of AllKnownLayouts.layoutsList) {
            if (layout.id === personal.id) {
                if (State.state.osmConnection.userDetails.data.csCount < Constants.userJourney.personalLayoutUnlock) {
                    continue;
                }
            }
            themeButtons.push(this.createLinkButton(layout));
        }


        els.push(new VariableUiElement(
            State.state.osmConnection.userDetails.map(userDetails => {
                if (userDetails.csCount < Constants.userJourney.themeGeneratorReadOnlyUnlock) {
                    return new SubtleButton(null, tr.requestATheme, {url:"https://github.com/pietervdvn/MapComplete/issues", newTab: true}).Render();
                }
                return new SubtleButton(Svg.pencil_ui(), tr.createYourOwnTheme, {
                    url: "./customGenerator.html",
                    newTab: false
                }).Render();
            })
        ));

        els.push(new Combine(themeButtons))


        const customThemesNames = State.state.installedThemes.data ?? [];

        if (customThemesNames.length > 0) {
            els.push(Translations.t.general.customThemeIntro)

            for (const installed of State.state.installedThemes.data) {
                els.push(this.createLinkButton(installed.layout, installed.definition));
            }
        }

        let intro: UIElement = tr.intro;
        const themeButtonsElement = new Combine(els)

        if (this._onMainScreen) {
            intro = new Combine([
                LanguagePicker.CreateLanguagePicker(Translations.t.index.title.SupportedLanguages())
                    .SetClass("absolute top-2 right-3"),
                new IndexText()
            ])
            themeButtons.map(e => e?.SetClass("h-32 min-h-32 max-h-32 overflow-ellipsis overflow-hidden"))
            themeButtonsElement.SetClass("md:grid md:grid-flow-row md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-g4 gap-4")
        }

        

        this._component = new Combine([
            intro,
            themeButtonsElement,
            tr.streetcomplete.SetClass("block text-base mx-10 my-3 mb-10")
        ]);
        return this._component.Render();
    }

    private createLinkButton(layout: LayoutConfig, customThemeDefinition: string = undefined) {
        if (layout === undefined) {
            return undefined;
        }
        if (layout.id === undefined) {
            console.error("ID is undefined for layout", layout);
            return undefined;
        }
        if (layout.hideFromOverview) {
            const pref = State.state.osmConnection.GetPreference("hidden-theme-" + layout.id + "-enabled");
            this.ListenTo(pref);
            if (pref.data !== "true") {
                return undefined;
            }
        }
        if (layout.id === State.state.layoutToUse.data?.id) {
            return undefined;
        }

        const currentLocation = State.state.locationControl.data;
        let path = window.location.pathname;
        // Path starts with a '/' and contains everything, e.g. '/dir/dir/page.html'
        path = path.substr(0, path.lastIndexOf("/"));
        // Path will now contain '/dir/dir', or empty string in case of nothing
        if (path === "") {
            path = "."
        }

        const params = `z=${currentLocation.zoom ?? 1}&lat=${currentLocation.lat ?? 0}&lon=${currentLocation.lon ?? 0}`
        let linkText =
            `${path}/${layout.id.toLowerCase()}.html?${params}`

        if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
            linkText = `${path}/index.html?layout=${layout.id}&${params}`
        }

        if (customThemeDefinition) {
            linkText = `${path}/index.html?userlayout=${layout.id}&${params}#${customThemeDefinition}`

        }

        let description = Translations.W(layout.shortDescription);
        return new SubtleButton(layout.icon,
            new Combine([
                `<dt class='text-lg leading-6 font-medium text-gray-900 group-hover:text-blue-800'>`,
                Translations.W(layout.title),
                `</dt>`,
                `<dd class='mt-1 text-base text-gray-500 group-hover:text-blue-900 overflow-ellipsis'>`,
                description ?? "",
                `</dd>`,
            ]), {url: linkText, newTab: false});
    }

}