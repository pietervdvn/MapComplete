import { UIEventSource } from "../../Logic/UIEventSource";
import BaseUIElement from "../BaseUIElement";

export class VariableUiElement extends BaseUIElement {
  private _element: HTMLElement;

  constructor(
    contents: UIEventSource<string | BaseUIElement | BaseUIElement[]>
  ) {
    super();

    this._element = document.createElement("span");
    const el = this._element;
    contents.addCallbackAndRun((contents) => {
      while (el.firstChild) {
        el.removeChild(el.lastChild);
      }

      if (contents === undefined) {
        return el;
      }
      if (typeof contents === "string") {
        el.innerHTML = contents;
      } else if (contents instanceof Array) {
        for (const content of contents) {
          const c = content?.ConstructElement();
          if (c !== undefined && c !== null) {
            el.appendChild(c);
          }
        }
      } else {
        const c = contents.ConstructElement();
        if (c !== undefined && c !== null) {
          el.appendChild(c);
        }
      }
    });
  }

  protected InnerConstructElement(): HTMLElement {
    return this._element;
  }
}
