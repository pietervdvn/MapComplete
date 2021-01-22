import {UIElement} from "../UIElement";
import Svg from "../../Svg";
import State from "../../State";
import Combine from "./Combine";
import Ornament from "./Ornament";

/**
 * Wraps some contents into a panel that scrolls the content _under_ the title
 */
export default class ScrollableFullScreen extends UIElement {
    private _component: UIElement;


    constructor(title: UIElement, content: UIElement, onClose: (() => void)) {
        super();
        const returnToTheMap = Svg.back_svg().onClick(() => {
            onClose();
        })  .SetClass("block sm:hidden mb-2 bg-blue-50 rounded-full w-12 h-12 p-1.5")

        title.SetClass("block w-full")
        const ornament = new Combine([new Ornament().SetStyle("height:5em;")])
            .SetClass("block sm:hidden h-5")

        
       this._component = new Combine([
            new Combine([returnToTheMap, title])
                .AddClass("border-b-2 border-black shadow sm:shadow-none z-50 bg-white p-2 pb-0 sm:p-0 flex overflow-x-hidden flex-shrink-0 max-h-20vh"),
            new Combine(["<span>", content, "</span>", ornament])
                .SetClass("block p-2 sm:pt-4 w-full max-h-screen landscape:max-h-screen overflow-y-auto overflow-x-hidden"),
            // We add an ornament which takes around 5em. This is in order to make sure the Web UI doesn't hide
        ]).SetClass("block flex flex-col fixed max-h-screen sm:max-h-65vh sm:relative top-0 left-0 right-0");

    }
    

    InnerRender(): string {
        return this._component.Render();
    }


}