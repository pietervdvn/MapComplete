import State from "../../State";
import BackgroundSelector from "./BackgroundSelector";
import Combine from "../Base/Combine";
import ScrollableFullScreen from "../Base/ScrollableFullScreen";
import Translations from "../i18n/Translations";
import {UIEventSource} from "../../Logic/UIEventSource";
import BaseUIElement from "../BaseUIElement";
import Toggle from "../Input/Toggle";
import FilterView from "./FilterView";
import {DownloadPanel} from "./DownloadPanel";

export default class LayerControlPanel extends ScrollableFullScreen {

    constructor(isShown: UIEventSource<boolean>) {
        super(LayerControlPanel.GenTitle, LayerControlPanel.GeneratePanel, "layers", isShown);
    }

    private static GenTitle(): BaseUIElement {
        return Translations.t.general.layerSelection.title
            .Clone()
            .SetClass("text-2xl break-words font-bold p-2");
    }

    private static GeneratePanel(): BaseUIElement {
        const elements: BaseUIElement[] = [];

        if (State.state.layoutToUse.data.enableBackgroundLayerSelection) {
            const backgroundSelector = new BackgroundSelector();
            backgroundSelector.SetStyle("margin:1em");
            backgroundSelector.onClick(() => {
            });
            elements.push(backgroundSelector)
        }
        elements.push(
            new Toggle(
                new FilterView(State.state.filteredLayers),
                undefined,
                State.state.filteredLayers.map(
                    (layers) => layers.length > 1 || layers[0].layerDef.filters.length > 0
                )
            )
        );

        elements.push(new Toggle(
            new DownloadPanel(),
            undefined,
            State.state.featureSwitchEnableExport
        ))
        


    elements.push(
      new Toggle(
        new DownloadPanel(),
        undefined,
        State.state.featureSwitchEnableExport
      )
    );

    return new Combine(elements).SetClass("flex flex-col");
  }
}
