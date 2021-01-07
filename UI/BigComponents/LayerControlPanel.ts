import {UIElement} from "../UIElement";
import State from "../../State";
import BackgroundSelector from "./BackgroundSelector";
import LayerSelection from "./LayerSelection";
import Combine from "../Base/Combine";
import Translations from "../i18n/Translations";

export default class LayerControlPanel extends UIElement{
    private readonly _panel: UIElement;
    
    
    constructor() {
        super();
        let layerControlPanel: UIElement = undefined;
        if (State.state.layoutToUse.data.enableBackgroundLayerSelection) {
            layerControlPanel = new BackgroundSelector();
            layerControlPanel.SetStyle("margin:1em");
            layerControlPanel.onClick(() => {
            });
        }

        if (State.state.filteredLayers.data.length > 1) {
            const layerSelection = new LayerSelection();
            layerSelection.onClick(() => {            });
            layerControlPanel = new Combine([layerSelection, "<br/>", layerControlPanel]);
        }


        const backButton = new Combine([
            new Combine([Translations.t.general.returnToTheMap.Clone().SetClass("to-the-map")])
                .SetClass("to-the-map-inner")

        ]).SetClass("only-on-mobile")
            .onClick(() => State.state.fullScreenMessage.setData(undefined));
        
        layerControlPanel = new Combine([layerControlPanel, backButton]);
        
        this._panel = layerControlPanel;
    }
    
    InnerRender(): string {
        return this._panel.Render();
    }
    
}