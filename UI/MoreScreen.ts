import {UIElement} from "./UIElement";
import {VerticalCombine} from "./Base/VerticalCombine";
import Translations from "./i18n/Translations";
import {AllKnownLayouts} from "../Customizations/AllKnownLayouts";
import {FixedUiElement} from "./Base/FixedUiElement";
import {Utils} from "../Utils";
import {link} from "fs";
import {UIEventSource} from "./UIEventSource";
import {VariableUiElement} from "./Base/VariableUIElement";


export class MoreScreen extends UIElement {
    private currentLocation: UIEventSource<{ zoom: number, lat: number, lon: number }>;

    constructor(currentLocation: UIEventSource<{ zoom: number, lat: number, lon: number }>) {
        super(currentLocation);
        this.currentLocation = currentLocation;
    }

    InnerRender(): string {
        const tr = Translations.t.general.morescreen;

        const els: UIElement[] = []
        for (const k in AllKnownLayouts.allSets) {
            const layout = AllKnownLayouts.allSets[k]
            if(layout.hideFromOverview){continue}

            const linkText =
                `https://pietervdvn.github.io/MapComplete/${layout.name}.html?z=${this.currentLocation.data.zoom}&lat=${this.currentLocation.data.lat}&lon=${this.currentLocation.data.lon}
            `
            const link = new FixedUiElement(
                `
                <span class="switch-layout">
                 <a href="${linkText}" target="_blank">
                <img src='${layout.icon}'>
                 <div><b>${Utils.Upper(layout.name)}</b><br/>
                  ${Translations.W(layout.description).Render()}</div>
                </a>
                </span>
`
            );

            els.push(link)


        }


        return new VerticalCombine([
            tr.intro,
            new VerticalCombine(els),
            tr.streetcomplete
        ]).Render();
    }

}