import {UIElement} from "./UIElement";
import {VerticalCombine} from "./Base/VerticalCombine";
import Translations from "./i18n/Translations";
import {AllKnownLayouts} from "../Customizations/AllKnownLayouts";
import Combine from "./Base/Combine";
import {SubtleButton} from "./Base/SubtleButton";
import {State} from "../State";
import {VariableUiElement} from "./Base/VariableUIElement";
import {PersonalLayout} from "../Logic/PersonalLayout";
import {FixedUiElement} from "./Base/FixedUiElement";
import {Layout} from "../Customizations/Layout";
import {CustomLayoutFromJSON} from "../Customizations/JSON/CustomLayoutFromJSON";
import {All} from "../Customizations/Layouts/All";


export class MoreScreen extends UIElement {

    constructor() {
        super(State.state.locationControl);
        this.ListenTo(State.state.osmConnection.userDetails);
        this.ListenTo(State.state.osmConnection._preferencesHandler.preferences);

    }

    private createLinkButton(layout: Layout, customThemeDefinition: string = undefined) {
        if (layout.hideFromOverview && State.state.osmConnection.userDetails.data.name !== "Pieter Vander Vennet") {
            return undefined;
        }
        if (layout.name === State.state.layoutToUse.data.name) {
            return undefined;
        }

        if (layout.name === PersonalLayout.NAME) {
            return undefined;
        }

        const currentLocation = State.state.locationControl.data;
        let linkText =
            `./${layout.name}.html?z=${currentLocation.zoom}&lat=${currentLocation.lat}&lon=${currentLocation.lon}`

        if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
            linkText = `./index.html?layout=${layout.name}&z=${currentLocation.zoom}&lat=${currentLocation.lat}&lon=${currentLocation.lon}`
        }

        if (customThemeDefinition) {
            linkText = `./index.html?userlayout=${layout.name}&z=${currentLocation.zoom}&lat=${currentLocation.lat}&lon=${currentLocation.lon}#${customThemeDefinition}`

        }

        let description = Translations.W(layout.description);
        if (description !== undefined) {
            description = new Combine(["<br/>", description]);
        }
        const link =
            new SubtleButton(layout.icon,
                new Combine([
                    "<b>",
                    Translations.W(layout.title),
                    "</b>",
                    description ?? "",
                ]), {url: linkText, newTab: false})
        return link;
    }

    InnerRender(): string {

        const tr = Translations.t.general.morescreen;

        const els: UIElement[] = []

        els.push(new VariableUiElement(
            State.state.osmConnection.userDetails.map(userDetails => {
                if (userDetails.csCount < State.userJourney.themeGeneratorUnlock) {
                    return tr.requestATheme.Render();
                }
                return new SubtleButton("./assets/pencil.svg", tr.createYourOwnTheme, {
                    url: "./customGenerator.html",
                    newTab: false
                }).Render();
            })
        ));

        els.push(new VariableUiElement(
            State.state.osmConnection.userDetails.map(userDetails => {
                if (userDetails.csCount < State.userJourney.customLayoutUnlock) {
                    return "";
                }
                return new SubtleButton("./assets/star.svg",
                    new Combine([
                        "<b>",
                        Translations.t.favourite.title,
                        "</b>",
                        "<br>", Translations.t.favourite.description]), {
                        url: "https://pietervdvn.github.io/MapComplete/personal.html",
                        newTab: false
                    }).Render();
            })
        ));


        for (const k in AllKnownLayouts.allSets) {
            els.push(this.createLinkButton(AllKnownLayouts.allSets[k]));
        }

        const installedThemes = State.state.osmConnection._preferencesHandler.preferences.map(allPreferences => {
            const installedThemes = [];
            if(allPreferences === undefined){
                return installedThemes;
            }

            for (const allPreferencesKey in allPreferences) {
                "mapcomplete-installed-theme-Superficie-combined-length"
                const themename = allPreferencesKey.match(/^mapcomplete-installed-theme-(.*)-combined-length$/);
                if(themename){
                    installedThemes.push(themename[1]);
                }
            }
            
            return installedThemes;
            
        })
        const customThemesNames = installedThemes.data ?? [];
        if (customThemesNames !== []) {
            els.push(Translations.t.general.customThemeIntro)
        }

        console.log(customThemesNames);
        for (const installedThemeName of customThemesNames) {
            if(installedThemeName === ""){
                continue;
            }
            const customThemeDefinition = State.state.osmConnection.GetLongPreference("installed-theme-" + installedThemeName);
            try {
                const layout = CustomLayoutFromJSON.FromQueryParam(customThemeDefinition.data);
                els.push(this.createLinkButton(layout, customThemeDefinition.data));
            } catch (e) {
                console.log(customThemeDefinition.data);
                console.warn("Could not parse custom layout from preferences: ", installedThemeName, e);
            }
        }


        return new VerticalCombine([
            tr.intro,
            new VerticalCombine(els),
            tr.streetcomplete
        ]).Render();
    }

}