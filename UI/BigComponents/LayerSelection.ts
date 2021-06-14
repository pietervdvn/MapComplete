import {UIEventSource} from "../../Logic/UIEventSource";
import {VariableUiElement} from "../Base/VariableUIElement";
import State from "../../State";
import Toggle from "../Input/Toggle";
import Combine from "../Base/Combine";
import Translations from "../i18n/Translations";
import LayerConfig from "../../Customizations/JSON/LayerConfig";
import BaseUIElement from "../BaseUIElement";

/**
 * Shows the panel with all layers and a toggle for each of them
 */
export default class LayerSelection extends Combine {


    constructor(activeLayers: UIEventSource<{
        readonly isDisplayed: UIEventSource<boolean>,
        readonly layerDef: LayerConfig;
    }[]>) {

        if (activeLayers === undefined) {
            throw "ActiveLayers should be defined..."
        }


        const checkboxes: BaseUIElement[] = [];

        for (const layer of activeLayers.data) {
            const leafletStyle = layer.layerDef.GenerateLeafletStyle(
                new UIEventSource<any>({id: "node/-1"}),
                false)
            const icon = new Combine([leafletStyle.icon.html]).SetClass("single-layer-selection-toggle")
            let iconUnselected: BaseUIElement = new Combine([leafletStyle.icon.html])
                .SetClass("single-layer-selection-toggle")
                .SetStyle("opacity:0.2;");

            const name = Translations.WT(layer.layerDef.name)?.Clone()
                ?.SetStyle("font-size:large;margin-left: 0.5em;");

            if ((name ?? "") === "") {
                continue
            }

            const zoomStatus = new VariableUiElement(State.state.locationControl.map(location => {
                if (location.zoom < layer.layerDef.minzoom) {
                    return Translations.t.general.layerSelection.zoomInToSeeThisLayer
                        .SetClass("alert")
                        .SetStyle("display: block ruby;width:min-content;")
                }
                return ""
            }))
            const style = "display:flex;align-items:center;"
            const styleWhole = "display:flex; flex-wrap: wrap"
            checkboxes.push(new Toggle(
                new Combine([new Combine([icon, name]).SetStyle(style), zoomStatus])
                    .SetStyle(styleWhole),
                new Combine([new Combine([iconUnselected, "<del>", name, "</del>"]).SetStyle(style), zoomStatus])
                    .SetStyle(styleWhole),
                layer.isDisplayed).ToggleOnClick()
                .SetStyle("margin:0.3em;")
            );
        }


        super(checkboxes)
        this.SetStyle("display:flex;flex-direction:column;")

    }
}