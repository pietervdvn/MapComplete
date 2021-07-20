import { FixedUiElement } from "./../Base/FixedUiElement";
import { LayerConfigJson } from "./../../Customizations/JSON/LayerConfigJson";
import { UIEventSource } from "../../Logic/UIEventSource";
import { VariableUiElement } from "../Base/VariableUIElement";
import State from "../../State";
import Toggle from "../Input/Toggle";
import Combine from "../Base/Combine";
import Translations from "../i18n/Translations";
import LayerConfig from "../../Customizations/JSON/LayerConfig";
import BaseUIElement from "../BaseUIElement";
import { Translation } from "../i18n/Translation";
import ScrollableFullScreen from "../Base/ScrollableFullScreen";

/**
 * Shows the filter
 */
export default class FilterView extends ScrollableFullScreen {
  constructor(isShown: UIEventSource<boolean>) {
    super(FilterView.GenTitle, FilterView.Generatecontent, "filter", isShown);
  }

  private static GenTitle(): BaseUIElement {
    return new FixedUiElement(`Filter`).SetClass(
      "text-2xl break-words font-bold p-2"
    );
  }

  private static Generatecontent(): BaseUIElement {
    let filterPanel: BaseUIElement = new FixedUiElement("more stuff");

    if (State.state.filteredLayers.data.length > 1) {
      let layers = State.state.filteredLayers;
      console.log(layers);
      filterPanel = new Combine(["layerssss", "<br/>", filterPanel]);
    }

    return filterPanel;
  }
}
