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
    private elementsToRestore: Set<HTMLElement> = new Set<HTMLElement>();

    constructor(title: UIElement, content: UIElement, onClose: (() => void)) {
        super();
        this.dumbMode = false;
        const returnToTheMap = Svg.back_svg().onClick(() => {
            console.log("Clicked back!");
            this.RestoreLeaflet();
            if (onClose() !== undefined) {
                console.error("WARNING: onClose is not defined")
                onClose();
            }
        }).SetClass("block sm:hidden mb-2 bg-blue-50 rounded-full w-12 h-12 p-1.5")

        title.SetClass("block w-full")
        const ornament = new Combine([new Ornament().SetStyle("height:5em;")])
            .SetClass("block sm:hidden h-5")


        this._component =
            new Combine([
            new Combine([
            new Combine([returnToTheMap, title])
                .AddClass("border-b-2 border-black shadow sm:shadow-none bg-white p-2 pb-0 sm:p-0 flex overflow-x-hidden flex-shrink-0 max-h-20vh"),
            new Combine(["<span>", content, "</span>", ornament])
                .SetClass("block p-2 sm:pt-4 w-full h-screen landscape:h-screen  sm:h-full sm:w-full overflow-y-auto overflow-x-hidden"),
            // We add an ornament which takes around 5em. This is in order to make sure the Web UI doesn't hide
        ]).SetClass("block flex flex-col  relative bg-white")
        ]).SetClass("fixed top-0 left-0 right-0 h-screen w-screen sm:max-h-65vh sm:w-auto");

    }

    InnerRender(): string {
        return this._component.Render();
    }
    
    protected InnerUpdate(htmlElement: HTMLElement) {

        do {
            // A leaflet workaround: in order for fullscreen to work, we need to get the parent element which does a transform3d and remove/read the transform
            if (htmlElement.style.transform !== "") {
                this.elementsToRestore.add(htmlElement);
                htmlElement.classList.add("no-transform")
            }
            htmlElement = htmlElement.parentElement;
        } while (htmlElement != null)

        super.InnerUpdate(htmlElement);
    }

    private RestoreLeaflet() {
        this.elementsToRestore.forEach(
            el => el.classList.remove("no-transform")
        );

    }


}