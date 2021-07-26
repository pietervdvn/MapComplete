import { Utils } from "./../../Utils";
import { FixedInputElement } from "./../Input/FixedInputElement";
import { RadioButton } from "./../Input/RadioButton";
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
import Svg from "../../Svg";
import FilterConfig from "../../Customizations/JSON/FilterConfig";
import CheckBoxes from "../Input/Checkboxes";
import { InputElement } from "../Input/InputElement";
import { TagsFilter } from "../../Logic/Tags/TagsFilter";
import InputElementMap from "../Input/InputElementMap";
import { And } from "../../Logic/Tags/And";

/**
 * Shows the filter
 */

export default class FilterView extends VariableUiElement {
  constructor(filteredLayer) {
    super(
      filteredLayer.map((filteredLayers) =>
        filteredLayers.map(FilterView.createOneFilteredLayerElement)
      )
    );
  }

  static createOneFilteredLayerElement(filteredLayer) {
    const layer: LayerConfig = filteredLayer.layerDef;
    const iconStyle = "width:1.5rem;height:1.5rem;margin-left:1.25rem";

    const icon = new Combine([Svg.checkbox_filled]).SetStyle(iconStyle);
    const iconUnselected = new Combine([Svg.checkbox_empty]).SetStyle(
      iconStyle
    );

    if (filteredLayer.layerDef.name === undefined) {
      return;
    }

    const style = "display:flex;align-items:center;color:#007759";

    const name: Translation = Translations.WT(
      filteredLayer.layerDef.name
    )?.Clone();

    const styledNameChecked = name
      .Clone()
      .SetStyle("font-size:large;padding-left:1.25rem");

    const styledNameUnChecked = name
      .Clone()
      .SetStyle("font-size:large;padding-left:1.25rem");

    const layerChecked = new Combine([icon, styledNameChecked]).SetStyle(style);

    const layerNotChecked = new Combine([
      iconUnselected,
      styledNameUnChecked,
    ]).SetStyle(style);

    let listFilterElements: InputElement<TagsFilter>[] = layer.filters.map(
      FilterView.createFilter
    );

    function update() {
      let listTagsFilters = Utils.NoNull(
        listFilterElements.map((input) => input.GetValue().data)
      );
      filteredLayer.appliedTags.setData(new And(listTagsFilters));
    }

    listFilterElements.forEach((inputElement) =>
      inputElement.GetValue().addCallback((_) => update())
    );

    return new Toggle(
      new Combine([layerChecked, ...listFilterElements]),
      layerNotChecked,
      filteredLayer.isDisplayed
    )
      .ToggleOnClick()
      .SetStyle("margin:0.3em;");
  }

  static createFilter(filterConfig: FilterConfig): InputElement<TagsFilter> {
    if (filterConfig.options.length === 1) {
      let option = filterConfig.options[0];
      let checkboxes = new CheckBoxes([option.question.Clone()]);

      return new InputElementMap(
        checkboxes,
        (t0, t1) => t0 === t1,
        (numbers) => (numbers.length > 0 ? option.osmTags : undefined),
        (tagsFilter) => (tagsFilter == undefined ? [] : [0])
      );
    }

    let options = filterConfig.options;

    return new RadioButton(
      options.map(
        (option) =>
          new FixedInputElement(option.question.Clone(), option.osmTags)
      )
    );
  }
}
