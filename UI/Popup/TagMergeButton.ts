import { Changes } from "../../Logic/Osm/Changes";
import FeaturePipelineState from "../../Logic/State/FeaturePipelineState";
import { UIEventSource } from "../../Logic/UIEventSource";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import Combine from "../Base/Combine";
import { SubtleButton } from "../Base/SubtleButton";
import Table from "../Base/Table";
import { VariableUiElement } from "../Base/VariableUIElement";
import BaseUIElement from "../BaseUIElement";
import { DefaultGuiState } from "../DefaultGuiState";
import Translations from "../i18n/Translations";
import { DropDown } from "../Input/DropDown";
import { AutoAction } from "./AutoApplyButton";
import TagApplyButton from "./TagApplyButton";

export default class TagMergeButton implements AutoAction {
  public readonly funcName = "tag_merge";
  public readonly docs =
    "Shows a comparison between the current tags and the new tags, allowing the user to select what the new tags should be.";
  public readonly supportsAutoAction = true;
  public readonly args = [
    {
      name: "new_tags",
      doc: "The new tags to show in the comparison, if the field starts with '$' it will be looked up in the tag source",
    },
    {
      name: "message",
      doc: "The text to show to the contributor",
    },
    {
      name: "image",
      defaultValue: "./assets/svg/addSmall.svg",
      doc: "An image to show to the contributor on the button",
    },
    {
      name: "id_of_object_to_apply_this_one",
      defaultValue: undefined,
      doc: "If specified, applies the the tags onto _another_ object. The id will be read from properties[id_of_object_to_apply_this_one] of the selected object. The tags are still calculated based on the tags of the _selected_ element",
    },
  ];
  public readonly example = "";

  async applyActionOn(
    state: {
      layoutToUse: LayoutConfig;
      changes: Changes;
    },
    tags: UIEventSource<any>,
    args: string[]
  ): Promise<void> {}

  public updateView(
    state: FeaturePipelineState,
    tagSource: UIEventSource<any>,
    argument: string[],
    guistate: DefaultGuiState
  ): BaseUIElement {
    return this.constr(state, tagSource, argument, guistate);
  }

  public constr(
    state: FeaturePipelineState,
    tagSource: UIEventSource<any>,
    argument: string[],
    guistate: DefaultGuiState
  ): BaseUIElement {
    const newTags = TagApplyButton.generateTagsToApply(argument[0], tagSource);
    const otherId = tagSource.data[argument[3]];
    const otherElement = state.allElements.getEventSourceById(otherId);
    const t = Translations.t.general.merge_button;
    
    otherElement.addCallback(this.updateView.bind(this, state, tagSource, argument, guistate));

    let table = [];
    for (const tag of newTags.data) {
      if (tag.value !== otherElement.data[tag.key]) {
        const otherTag = new Combine([
          `${tag.key}=`,
          new VariableUiElement(
            otherElement.map((otherElement) => {
              return otherElement[tag.key];
            })
          ),
        ]);

        let items = [
          {
            value: tag.value,
            shown: tag.value,
          }
        ];

        if (
          otherElement.data[tag.key] !== undefined &&
          otherElement.data[tag.key] !== tag.value
        ) {
          items.push({
            value: otherElement.data[tag.key],
            shown: otherElement.data[tag.key],
          });
        }

        if (items.length == 1) {
          // If there is only one item, we don't need to show the dropdown
          table.push([
            `${tag.key}=${tag.value}`,
            tag.value,
            otherTag,
          ]);
        } else {
          // There is more than one choice, so we need to show the dropdown
          const dropdown = new DropDown("", items);
          table.push([`${tag.key}=${tag.value}`, dropdown, otherTag]);
        }
      }
    }
    return new Combine([
      new Table([t.new_tags, t.result, t.current_tags], table),
      new SubtleButton(argument[2], argument[1]),
    ]);
  }
}
