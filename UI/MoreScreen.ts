import {UIElement} from "./UIElement";
import {VerticalCombine} from "./Base/VerticalCombine";
import Translations from "./i18n/Translations";
import {AllKnownLayouts} from "../Customizations/AllKnownLayouts";
import {FixedUiElement} from "./Base/FixedUiElement";
import {Utils} from "../Utils";
import {link} from "fs";
import {UIEventSource} from "./UIEventSource";
import {VariableUiElement} from "./Base/VariableUIElement";
import Combine from "./Base/Combine";
import {SubtleButton} from "./Base/SubtleButton";
import {State} from "../State";


export class MoreScreen extends UIElement {

    constructor() {
        super(State.state.locationControl);
    }

    InnerRender(): string {
        const tr = Translations.t.general.morescreen;

        const els: UIElement[] = []
        for (const k in AllKnownLayouts.allSets) {
            const layout = AllKnownLayouts.allSets[k]
            if (layout.hideFromOverview) {
                continue
            }
            if (layout.name === State.state.layoutToUse.data.name) {
                continue;
            }

            const currentLocation = State.state.locationControl.data;
            const linkText =
                `https://pietervdvn.github.io/MapComplete/${layout.name}.html?z=${currentLocation.zoom}&lat=${currentLocation.lat}&lon=${currentLocation.lon}`
            const link =
                new SubtleButton(layout.icon,
                    new Combine([
                        "<b>",
                        Translations.W(layout.title),
                        "</b>",
                        "<br/>",
                        Translations.W(layout.description),
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