import {UIElement} from "./UIElement";
import {CheckBox} from "./Input/CheckBox";
import Combine from "./Base/Combine";
import {State} from "../State";
import Translations from "./i18n/Translations";
import {FixedUiElement} from "./Base/FixedUiElement";
import {VariableUiElement} from "./Base/VariableUIElement";

export class LayerSelection extends UIElement {

    private readonly _checkboxes: UIElement[];

    constructor() {
        super(undefined);
        this._checkboxes = [];

        for (const layer of State.state.filteredLayers.data) {
            let iconUrl = "./asets/checkbox.svg";
            let iconUrlBlank = "";
            if (layer.layerDef.icon && layer.layerDef.icon !== "") {
                iconUrl = layer.layerDef.icon as string;
                iconUrlBlank = layer.layerDef.icon as string;
            }
            const icon = new FixedUiElement(`<img style="height:2em;max-width: 2em;" src="${iconUrl}">`);

            let iconUnselected: UIElement;
                iconUnselected = new FixedUiElement(`<img style="height:2em;max-width: 2em; opacity:0.2;" src="${iconUrl}">`);
            
            const name = Translations.WT(layer.layerDef.name).Clone()
                .SetStyle("font-size:large;margin-left: 0.5em;");


            const zoomStatus = new VariableUiElement(State.state.locationControl.map(location => {
                if (location.zoom < layer.layerDef.minzoom) {
                    return Translations.t.general.zoomInToSeeThisLayer
                        .SetClass("alert")
                        .SetStyle("display: block ruby;width:min-content;")
                        .Render();
                }
                return ""
            }))
            const style = "display:flex;align-items:center;"
            this._checkboxes.push(new CheckBox(
                new Combine([icon, name, zoomStatus]).SetStyle(style),
                new Combine([iconUnselected, "<del>", name, "</del>", zoomStatus]).SetStyle(style),
                layer.isDisplayed)
                .SetStyle("margin:0.3em;")
            );
        }
    }

    InnerRender(): string {
        return new Combine(this._checkboxes)
            .SetStyle("display:flex;flex-direction:column;")
            .Render();
    }

}