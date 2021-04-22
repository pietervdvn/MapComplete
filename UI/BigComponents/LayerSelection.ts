import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";
import {VariableUiElement} from "../Base/VariableUIElement";
import State from "../../State";
import CheckBox from "../Input/CheckBox";
import Combine from "../Base/Combine";
import {FixedUiElement} from "../Base/FixedUiElement";
import Translations from "../i18n/Translations";
import LayerConfig from "../../Customizations/JSON/LayerConfig";

/**
 * Shows the panel with all layers and a toggle for each of them
 */
export default class LayerSelection extends UIElement {

    private _checkboxes: UIElement[];
    private activeLayers: UIEventSource<{
        readonly isDisplayed: UIEventSource<boolean>,
        readonly layerDef: LayerConfig;
    }[]>;

    constructor(activeLayers: UIEventSource<{
        readonly isDisplayed: UIEventSource<boolean>,
        readonly layerDef: LayerConfig;
    }[]>) {
        super(activeLayers);
        if(activeLayers === undefined){
            throw "ActiveLayers should be defined..."
        }
        this.activeLayers = activeLayers;

    }

    InnerRender(): string {

        this._checkboxes = [];

        for (const layer of this.activeLayers.data) {
            const leafletStyle = layer.layerDef.GenerateLeafletStyle(
                new UIEventSource<any>({id: "node/-1"}),
                false)
            const leafletHtml = leafletStyle.icon.html;
            const icon =
                new FixedUiElement(leafletHtml.Render())
                    .SetClass("single-layer-selection-toggle")
            let iconUnselected: UIElement = new FixedUiElement(leafletHtml.Render())
                .SetClass("single-layer-selection-toggle")
                .SetStyle("opacity:0.2;");

            const name = Translations.WT(layer.layerDef.name)?.Clone()
                ?.SetStyle("font-size:large;margin-left: 0.5em;");

            if((name ?? "") === ""){
                continue
            }

            const zoomStatus = new VariableUiElement(State.state.locationControl.map(location => {
                if (location.zoom < layer.layerDef.minzoom) {
                    return Translations.t.general.layerSelection.zoomInToSeeThisLayer
                        .SetClass("alert")
                        .SetStyle("display: block ruby;width:min-content;")
                        .Render();
                }
                return ""
            }))
            const style = "display:flex;align-items:center;"
            const styleWhole = "display:flex; flex-wrap: wrap"
            this._checkboxes.push(new CheckBox(
                new Combine([new Combine([icon, name]).SetStyle(style), zoomStatus])
                    .SetStyle(styleWhole),
                new Combine([new Combine([iconUnselected, "<del>", name, "</del>"]).SetStyle(style), zoomStatus])
                    .SetStyle(styleWhole),
                layer.isDisplayed)
                .SetStyle("margin:0.3em;")
            );
        }


        return new Combine(this._checkboxes)
            .SetStyle("display:flex;flex-direction:column;")
            .Render();
    }

}