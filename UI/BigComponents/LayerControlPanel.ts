import {UIElement} from "../UIElement";
import State from "../../State";
import BackgroundSelector from "./BackgroundSelector";
import LayerSelection from "./LayerSelection";
import Combine from "../Base/Combine";
import {FixedUiElement} from "../Base/FixedUiElement";
import ScrollableFullScreen from "../Base/ScrollableFullScreen";
import Translations from "../i18n/Translations";

export default class LayerControlPanel extends UIElement {
    private readonly _panel: UIElement;


    constructor() {
        super();
        let layerControlPanel: UIElement = new FixedUiElement("");
        if (State.state.layoutToUse.data.enableBackgroundLayerSelection) {
            layerControlPanel = new BackgroundSelector();
            layerControlPanel.SetStyle("margin:1em");
            layerControlPanel.onClick(() => {
            });
        }

        if (State.state.filteredLayers.data.length > 1) {
            const layerSelection = new LayerSelection();
            layerSelection.onClick(() => {
            });
            layerControlPanel = new Combine([layerSelection, "<br/>", layerControlPanel]);
        }


        const title =Translations.t.general.layerSelection.title.SetClass("featureinfobox-title")

        this._panel = new ScrollableFullScreen(title, layerControlPanel);
    }

    InnerRender(): string {
        return this._panel.Render();
    }

}