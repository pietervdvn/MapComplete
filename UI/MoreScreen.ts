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
        this.ListenTo(State.state.installedThemes);

    }

    private createLinkButton(layout: Layout, customThemeDefinition: string = undefined) {
        if (layout.hideFromOverview) {
            if (State.state.osmConnection.GetPreference("hidden-theme-" + layout.name + "-enabled").data !== "true") {
                return undefined;
            }
        }
        if (layout.name === State.state.layoutToUse.data.name) {
            return undefined;
        }

        const currentLocation = State.state.locationControl.data;
        let linkText =
            `./${layout.name.toLowerCase()}.html?z=${currentLocation.zoom}&lat=${currentLocation.lat}&lon=${currentLocation.lon}`

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


        for (const k in AllKnownLayouts.allSets) {
            const layout : Layout = AllKnownLayouts.allSets[k];
            if (k === PersonalLayout.NAME) {
                if (State.state.osmConnection.userDetails.data.csCount < State.userJourney.customLayoutUnlock) {
                    continue;
                }
            }
            if(layout.name !== k){
                continue; // This layout was added multiple time due to an uppercase
            }
            els.push(this.createLinkButton(layout));
        }


        const customThemesNames = State.state.installedThemes.data ?? [];
        if (customThemesNames !== []) {
            els.push(Translations.t.general.customThemeIntro)
        }

        for (const installed of State.state.installedThemes.data) {
            els.push(this.createLinkButton(installed.layout, installed.definition));
        }


        return new VerticalCombine([
            tr.intro,
            new VerticalCombine(els),
            tr.streetcomplete
        ]).Render();
    }

}