import {UIElement} from "../UIElement";
import Svg from "../../Svg";
import State from "../../State";
import Combine from "./Combine";
import Ornament from "./Ornament";

/**
 * Wraps some contents into a panel that scrolls the content _under_ the title
 */
export default class ScrollableFullScreen extends UIElement {
    private _component: Combine;


    constructor(title: UIElement, content: UIElement, onClose: (() => void)) {
        super();
        const returnToTheMap = Svg.back_svg().onClick(() => {
            onClose();
        }).SetClass("sm:hidden")
            .SetClass("featureinfobox-back-to-the-map")
        title.SetStyle("width: 100%; display: block;")
        const ornament = new Combine([new Ornament().SetStyle("height:5em;")])
            .SetClass("block sm:hidden")

        this._component = new Combine([
            new Combine([returnToTheMap, title])
                .SetClass("text-xl break-words"),
            new Combine([content, ornament])
                
        ])
        this.SetClass("fixed h-screen w-screen fixed sm:relative");

    }

    InnerRender(): string {
        return this._component.Render();
    }


}