import {VerticalCombine} from "../Base/VerticalCombine";
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

export default class MoreScreen extends UIElement {

    
    constructor() {
        super(State.state.locationControl);
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
        if (layout.id === State.state.layoutToUse.data.id) {
            return undefined;
        }

        const currentLocation = State.state.locationControl.data;
        let linkText =
            `./${layout.id.toLowerCase()}.html?z=${currentLocation.zoom}&lat=${currentLocation.lat}&lon=${currentLocation.lon}`

        if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
            linkText = `./index.html?layout=${layout.id}&z=${currentLocation.zoom}&lat=${currentLocation.lat}&lon=${currentLocation.lon}`
        }

        if (customThemeDefinition) {
            linkText = `./index.html?userlayout=${layout.id}&z=${currentLocation.zoom}&lat=${currentLocation.lat}&lon=${currentLocation.lon}#${customThemeDefinition}`

        }

        let description = Translations.W(layout.shortDescription);
        if (description !== undefined) {
            description = new Combine(["<br/>", description]);
        }
        return new SubtleButton(layout.icon,
            new Combine([
                "<b>",
                Translations.W(layout.title),
                "</b>",
                description ?? "",
            ]), {url: linkText, newTab: false});
    }

    InnerRender(): string {

        const tr = Translations.t.general.morescreen;

        const els: UIElement[] = []

        els.push(new VariableUiElement(
            State.state.osmConnection.userDetails.map(userDetails => {
                if (userDetails.csCount < Constants.userJourney.themeGeneratorReadOnlyUnlock) {
                    return tr.requestATheme.Render();
                }
                return new SubtleButton(Svg.pencil_ui(), tr.createYourOwnTheme, {
                    url: "./customGenerator.html",
                    newTab: false
                }).Render();
            })
        ));


        for (const k in AllKnownLayouts.allSets) {
            const layout : LayoutConfig = AllKnownLayouts.allSets[k];
            if (k === personal.id) {
                if (State.state.osmConnection.userDetails.data.csCount < Constants.userJourney.personalLayoutUnlock) {
                    continue;
                }
            }
            if (layout.id !== k) {
                continue; // This layout was added multiple time due to an uppercase
            }
            els.push(this.createLinkButton(layout));
        }


        const customThemesNames = State.state.installedThemes.data ?? [];
        
        if (customThemesNames.length > 0) {
            els.push(Translations.t.general.customThemeIntro)

            for (const installed of State.state.installedThemes.data) {
                els.push(this.createLinkButton(installed.layout, installed.definition));
            }
        }


        return new VerticalCombine([
            tr.intro,
            new VerticalCombine(els),
            tr.streetcomplete
        ]).Render();
    }

}