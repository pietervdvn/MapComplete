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

    private createLinkButton(layout: LayoutConfig, customThemeDefinition: string = undefined) {
        if (layout === undefined) {
            return undefined;
        }
        if(layout.id === undefined){
            console.error("ID is undefined for layout",layout);
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
        if(path === ""){
            path = "."
        }
        
        const params = `z=${currentLocation.zoom ?? 1}&lat=${currentLocation.lat ?? 0}&lon=${currentLocation.lon ?? 0}`
        let linkText =
            `${path}/${layout.id.toLowerCase()}?${params}`

        if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
            linkText = `${path}/index.html?layout=${layout.id}&${params}`
        }

        if (customThemeDefinition) {
            linkText = `${path}/?userlayout=${layout.id}&${params}#${customThemeDefinition}`

        }

        let description = Translations.W(layout.shortDescription);
        return new SubtleButton(layout.icon,
            new Combine([
                `<dt class='text-lg leading-6 font-medium text-gray-900 group-hover:text-blue-800'>`,
                Translations.W(layout.title),
                `</dt>`,
                `<dd class='mt-1 text-base text-gray-500 group-hover:text-blue-900'>`,
                description ?? "",
                `</dd>`,
            ]), {url: linkText, newTab: false});
    }

    InnerRender(): string {

        const tr = Translations.t.general.morescreen;

        const els: UIElement[] = []

        const linkButton: UIElement[] = []

        for (const layout of AllKnownLayouts.layoutsList) {
            if (layout.id === personal.id) {
                if (State.state.osmConnection.userDetails.data.csCount < Constants.userJourney.personalLayoutUnlock) {
                    continue;
                }
            }
            linkButton.push(this.createLinkButton(layout));
        }

       
        els.push(new VariableUiElement(
            State.state.osmConnection.userDetails.map(userDetails => {
                if (userDetails.csCount < Constants.userJourney.themeGeneratorReadOnlyUnlock) {
                    return tr.requestATheme.SetClass("block text-base mx-10 my-3").Render();
                }
                return new SubtleButton(Svg.pencil_ui(), tr.createYourOwnTheme, {
                    url: "./customGenerator.html",
                    newTab: false
                }).Render();
            })
        ));

        els.push(new Combine(linkButton))


        const customThemesNames = State.state.installedThemes.data ?? [];

        if (customThemesNames.length > 0) {
            els.push(Translations.t.general.customThemeIntro)

            for (const installed of State.state.installedThemes.data) {
                els.push(this.createLinkButton(installed.layout, installed.definition));
            }
        }

        let intro : UIElement= tr.intro;
        if(this._onMainScreen){
           intro = new Combine([

           LanguagePicker.CreateLanguagePicker(Translations.t.index.title.SupportedLanguages())
               .SetClass("absolute top-2 right-3 dropdown-ui-element-2226"),
               new IndexText()
                   
                   
           ])
        }

        this._component = new Combine([
            intro,
            new Combine(els),
            tr.streetcomplete.SetClass("block text-base mx-10 my-3 mb-10")
        ]);
        return this._component.Render();
    }

}