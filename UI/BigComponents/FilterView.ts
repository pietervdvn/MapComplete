import { Utils } from "./../../Utils";
import { FixedInputElement } from "./../Input/FixedInputElement";
import { RadioButton } from "./../Input/RadioButton";
import { VariableUiElement } from "../Base/VariableUIElement";
import Toggle from "../Input/Toggle";
import Combine from "../Base/Combine";
import Translations from "../i18n/Translations";
import LayerConfig from "../../Customizations/JSON/LayerConfig";
import { Translation } from "../i18n/Translation";
import Svg from "../../Svg";
import FilterConfig from "../../Customizations/JSON/FilterConfig";
import CheckBoxes from "../Input/Checkboxes";
import { InputElement } from "../Input/InputElement";
import { TagsFilter } from "../../Logic/Tags/TagsFilter";
import InputElementMap from "../Input/InputElementMap";
import { And } from "../../Logic/Tags/And";
import { UIEventSource } from "../../Logic/UIEventSource";

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

    const style =
      "display:flex;align-items:center;color:#007759;padding:0.5rem 0;";

    const name: Translation = Translations.WT(
      filteredLayer.layerDef.name
    )?.Clone();

    const styledNameChecked = name
      .Clone()
      .SetStyle("font-size:large;padding-left:1.25rem");

    const styledNameUnChecked = name
      .Clone()
      .SetStyle("font-size:large;padding-left:1.25rem");

    const layerChecked = new Combine([icon, styledNameChecked])
      .SetStyle(style)
      .onClick(() => filteredLayer.isDisplayed.setData(false));

    const layerNotChecked = new Combine([iconUnselected, styledNameUnChecked])
      .SetStyle(style)
      .onClick(() => filteredLayer.isDisplayed.setData(true));

    let listFilterElements: InputElement<TagsFilter>[] = layer.filters.map(
      FilterView.createFilter
    );

    const update = () => {
      let listTagsFilters = Utils.NoNull(
        listFilterElements.map((input) => input.GetValue().data)
      );
      filteredLayer.appliedFilters.setData(new And(listTagsFilters));
    };

    listFilterElements.forEach((inputElement) =>
      inputElement.GetValue().addCallback((_) => update())
    );

    return new Toggle(
      new Combine([layerChecked, ...listFilterElements]),
      layerNotChecked,
      filteredLayer.isDisplayed
    ).SetStyle("margin:0.3em;");
  }

  static createFilter(filterConfig: FilterConfig): InputElement<TagsFilter> {
    if (filterConfig.options.length === 1) {
      let option = filterConfig.options[0];
      let checkboxes = new CheckBoxes(
        [option.question.Clone()],
        new UIEventSource<number[]>([]),
        "background-color: #F1F1F1;padding:0.25rem 0.5rem;",
        "border:none;padding-left:3rem;color:#007759;display:flex;margin:0;justify-content:center;align-items:center;flex-direction:row;flex-wrap:nowrap;",
        "margin:0;padding:0;",
        "margin:0;padding:0.25rem 0 0 0.25rem;"
      );

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
      ),
      true,
      "background-color: #F1F1F1;padding:0.25rem 0.5rem;",
      "border:none;padding-left:3rem;color:#007759;display:flex;margin:0;justify-content:center;align-items:center;flex-direction:row;flex-wrap:nowrap;",
      "margin:0;padding:0;"
    );
  }
}
