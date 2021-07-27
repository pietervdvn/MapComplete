import BaseUIElement from "../BaseUIElement";

export class CenterFlexedElement extends BaseUIElement {
  private _html: string;

  constructor(html: string) {
    super();
    this._html = html ?? "";
  }

  InnerRender(): string {
    return this._html;
  }

  protected InnerConstructElement(): HTMLElement {
    const e = document.createElement("div");
    e.innerHTML = this._html;
    e.style.display = "flex";
    e.style.height = "100%";
    e.style.width = "100%";
    e.style.flexDirection = "column";
    e.style.flexWrap = "nowrap";
    e.style.alignContent = "center";
    e.style.justifyContent = "center";
    e.style.alignItems = "center";
    return e;
  }

  AsMarkdown(): string {
    return this._html;
  }
}
