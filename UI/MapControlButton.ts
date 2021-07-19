import BaseUIElement from "./BaseUIElement";
import Combine from "./Base/Combine";

/**
 * A button floating above the map, in a uniform style
 */
export default class MapControlButton extends Combine {
  constructor(contents: BaseUIElement) {
    super([contents]);
    this.SetClass(
      "relative block rounded-full w-10 h-10 p-1 pointer-events-auto z-above-map subtle-background"
    );
    this.SetStyle("box-shadow: 0 0 10px var(--shadow-color);");
  }
}
