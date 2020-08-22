import {UIElement} from "./UIElement";
import {VerticalCombine} from "./Base/VerticalCombine";
import Translations from "./i18n/Translations";
import {AllKnownLayouts} from "../Customizations/AllKnownLayouts";
import Combine from "./Base/Combine";
import {SubtleButton} from "./Base/SubtleButton";
import {State} from "../State";
import {CustomLayout} from "../Logic/CustomLayers";


export class MoreScreen extends UIElement {

    constructor() {
        super(State.state.locationControl);
        this.ListenTo(State.state.osmConnection.userDetails);
    }

    InnerRender(): string {
        
        const tr = Translations.t.general.morescreen;

        const els: UIElement[] = []
        for (const k in AllKnownLayouts.allSets) {
            const layout = AllKnownLayouts.allSets[k]
            if (layout.hideFromOverview && State.state.osmConnection.userDetails.data.name !== "Pieter Vander Vennet") {
                continue
            }
            if (layout.name === State.state.layoutToUse.data.name) {
                continue;
            }
            if (layout.name === CustomLayout.NAME) {
                if (!State.state.osmConnection.userDetails.data.loggedIn) {
                    continue;
                }
                if (State.state.osmConnection.userDetails.data.csCount < 
                    State.userJourney.customLayoutUnlock) {
                    continue;
                }
            }

            const currentLocation = State.state.locationControl.data;
            const linkText =
                `https://pietervdvn.github.io/MapComplete/${layout.name}.html?z=${currentLocation.zoom}&lat=${currentLocation.lat}&lon=${currentLocation.lon}`
            let description = Translations.W(layout.description);
            if(description !== undefined){
                description = new Combine(["<br/>", description]);
            }
            const link =
                new SubtleButton(layout.icon,
                    new Combine([
                        "<b>",
                        Translations.W(layout.title),
                        "</b>",
                        description ?? "",
                    ]), {url: linkText, newTab: false});

            els.push(link)
        }


        return new VerticalCombine([
            tr.intro,
            tr.requestATheme,
            new VerticalCombine(els),
            tr.streetcomplete
        ]).Render();
    }

}