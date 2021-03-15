import {UIElement} from "../UIElement";
import State from "../../State";
import BackgroundSelector from "./BackgroundSelector";
import LayerSelection from "./LayerSelection";
import Combine from "../Base/Combine";
import {FixedUiElement} from "../Base/FixedUiElement";
import ScrollableFullScreen from "../Base/ScrollableFullScreen";
import Translations from "../i18n/Translations";
import {UIEventSource} from "../../Logic/UIEventSource";

export default class LayerControlPanel extends ScrollableFullScreen {

    constructor(isShown: UIEventSource<boolean>) {
        super(LayerControlPanel.GenTitle, LayerControlPanel.GeneratePanel, "layers", isShown);
    }

    private static GenTitle(): UIElement {
        const title = Translations.t.general.layerSelection.title.SetClass("text-2xl break-words font-bold p-2")
        return title.Clone();
    }

    private static GeneratePanel() {
        let layerControlPanel: UIElement = new FixedUiElement("");
        if (State.state.layoutToUse.data.enableBackgroundLayerSelection) {
            layerControlPanel = new BackgroundSelector();
            layerControlPanel.SetStyle("margin:1em");
            layerControlPanel.onClick(() => {
            });
        }

        if (State.state.filteredLayers.data.length > 1) {
            const layerSelection = new LayerSelection(State.state.filteredLayers);
            layerSelection.onClick(() => {
            });
            layerControlPanel = new Combine([layerSelection, "<br/>", layerControlPanel]);
        }

        return layerControlPanel;
    }

}