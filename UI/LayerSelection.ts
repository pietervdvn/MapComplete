import { UIElement } from "./UIElement";
import { FilteredLayer } from "../Logic/FilteredLayer";
import { CheckBox } from "./Input/CheckBox";
import Combine from "./Base/Combine";
import {Utils} from "../Utils";

export class LayerSelection extends UIElement{

    private readonly _checkboxes: UIElement[];

    constructor(layers: FilteredLayer[]) {
      super(undefined);
      this._checkboxes = [];
      
      for (const layer of layers) {
          const checkbox = `<svg width="26" height="18" viewBox="0 0 26 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 7.28571L10.8261 15L23 3" stroke="#003B8B" stroke-width="4" stroke-linejoin="round"/>
            </svg>`;
          let icon = "<img >";
          if (layer.layerDef.icon && layer.layerDef.icon !== "") {
              icon = `<img width="20" height="20" src="${layer.layerDef.icon}" alt="">`
          }
          const name = layer.layerDef.name;

          this._checkboxes.push(new CheckBox(
              new Combine([checkbox, icon, name]),
              new Combine([
                  `<svg width="26" height="18" viewBox="0 0 26 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 7.28571L10.8261 15L23 3" stroke="#ffffff" stroke-width="4" stroke-linejoin="round"/>
            </svg>`,
                  icon,
                  layer.layerDef.name]),
              layer.isDisplayed));
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