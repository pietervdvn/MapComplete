import { UIElement } from "./UIElement";
import { FilteredLayer } from "../Logic/FilteredLayer";
import { CheckBox } from "./Base/CheckBox";

export class LayerSelection extends UIElement{

    private readonly _checkboxes: UIElement[];

    constructor(layers: FilteredLayer[]) {
      super(undefined);
      this._checkboxes = [];
      for (const layer of layers) {
        this._checkboxes.push(new CheckBox(layer.isDisplayed, `isEnabled ${layer.layerDef.name}`, `isDisabled ${layer.layerDef.name}`));
      }
    }

  InnerRender(): string {
    let html = ``;

    for (const checkBox of this._checkboxes) {
      const checkBoxHTML = checkBox.Render();
      const checkBoxListItem = `<li>${checkBoxHTML}</li>`;

      html = html + checkBoxListItem;
    }


    return `<ul>${html}</ul>`;
    }
    
}