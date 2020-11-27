import {UIElement} from "./UIElement";
import CheckBox from "./Input/CheckBox";
import Combine from "./Base/Combine";
import State from "../State";
import Translations from "./i18n/Translations";
import {FixedUiElement} from "./Base/FixedUiElement";
import {VariableUiElement} from "./Base/VariableUIElement";
import {UIEventSource} from "../Logic/UIEventSource";

export class LayerSelection extends UIElement {

    private readonly _checkboxes: UIElement[];

    constructor() {
        super(undefined);
        this._checkboxes = [];

        for (const layer of State.state.filteredLayers.data) {
            const leafletStyle = layer.layerDef.GenerateLeafletStyle(new UIEventSource<any>({id: "node/-1"}), true)
            const leafletHtml = leafletStyle.icon.html;
            const icon =
                new FixedUiElement(leafletHtml)
                    .SetClass("single-layer-selection-toggle")
            let iconUnselected: UIElement = new FixedUiElement(leafletHtml) 
                .SetClass("single-layer-selection-toggle")
                .SetStyle("opacity:0.2;");

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