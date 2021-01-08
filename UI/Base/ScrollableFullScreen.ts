import {UIElement} from "../UIElement";
import Svg from "../../Svg";
import State from "../../State";
import Combine from "./Combine";

/**
 * Wraps some contents into a panel that scrolls the content _under_ the title
 */
export default class ScrollableFullScreen extends UIElement{
    private _component: Combine;
   

    constructor(title: UIElement, content: UIElement) {
        super();
        const returnToTheMap = Svg.back_svg().onClick(() => {
            State.state.fullScreenMessage.setData(undefined);
            State.state.selectedElement.setData(undefined);
        }).SetClass("only-on-mobile")
            .SetClass("featureinfobox-back-to-the-map")
        
        this._component = new Combine([
            new Combine([returnToTheMap, title]).SetClass("featureinfobox-titlebar"),
            new Combine([content]).SetClass("featureinfobox-content")
        ])
        this.SetClass("featureinfobox");
        
    }
    
    InnerRender(): string {
        return this._component.Render();
    }


}