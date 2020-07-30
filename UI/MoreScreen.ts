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


export class MoreScreen extends UIElement {
    private currentLocation: UIEventSource<{ zoom: number, lat: number, lon: number }>;
    private currentLayout: string;

    constructor(currentLayout: string, currentLocation: UIEventSource<{ zoom: number, lat: number, lon: number }>) {
        super(currentLocation);
        this.currentLayout = currentLayout;
        this.currentLocation = currentLocation;
    }

    InnerRender(): string {
        const tr = Translations.t.general.morescreen;

        const els: UIElement[] = []
        for (const k in AllKnownLayouts.allSets) {
            const layout = AllKnownLayouts.allSets[k]
            if (layout.hideFromOverview) {
                continue
            }
            if (layout.name === this.currentLayout) {
                continue;
            }

            const linkText =
                `https://pietervdvn.github.io/MapComplete/${layout.name}.html?z=${this.currentLocation.data.zoom}&lat=${this.currentLocation.data.lat}&lon=${this.currentLocation.data.lon}`
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