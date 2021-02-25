import {UIElement} from "../UIElement";
import Svg from "../../Svg";
import Combine from "./Combine";
import Ornament from "./Ornament";
import {FixedUiElement} from "./FixedUiElement";
import {UIEventSource} from "../../Logic/UIEventSource";

/**
 * Wraps some contents into a panel that scrolls the content _under_ the title
 */
export default class ScrollableFullScreen extends UIElement {
    private static readonly empty = new FixedUiElement("");
    public isShown: UIEventSource<boolean>;
    private _component: UIElement;
    private _fullscreencomponent: UIElement;

    constructor(title: (() => UIElement), content: (() => UIElement), isShown: UIEventSource<boolean> = new UIEventSource<boolean>(false)) {
        super();
        this.isShown = isShown;

        this._component = this.BuildComponent(title(), content(), isShown);
        this._fullscreencomponent = this.BuildComponent(title(), content(), isShown);
        this.dumbMode = false;
        const self = this;
        isShown.addCallback(isShown => {
            if (isShown) {
                self.Activate();
            } else {
                self.clear();

            }
        })
    }

    InnerRender(): string {
        return this._component.Render();
    }

    Activate(): void {
        this.isShown.setData(true)
        this._fullscreencomponent.AttachTo("fullscreen");
        const fs = document.getElementById("fullscreen");
        fs.classList.remove("hidden")
    }

    private BuildComponent(title: UIElement, content: UIElement, isShown: UIEventSource<boolean>) {
        const returnToTheMap =
            new Combine([
                Svg.back_svg().SetClass("block md:hidden"),
                Svg.close_svg().SetClass("hidden md:block")
            ])
                .onClick(() => {
                    isShown.setData(false)
                }).SetClass("mb-2 bg-blue-50 rounded-full w-12 h-12 p-1.5 flex-shrink-0")

        title.SetClass("block text-l sm:text-xl md:text-2xl w-full font-bold p-2 pl-4 max-h-20vh overflow-y-auto")
        const ornament = new Combine([new Ornament().SetStyle("height:5em;")])
            .SetClass("md:hidden h-5")
        return new Combine([
            new Combine([
                new Combine([returnToTheMap, title])
                    .SetClass("border-b-2 border-black shadow md:shadow-none bg-white p-2 pb-0 md:p-0 flex flex-shrink-0"),
                new Combine([content, ornament])
                    .SetClass("block p-2 md:pt-4 w-full h-full overflow-y-auto md:max-h-65vh"),
                // We add an ornament which takes around 5em. This is in order to make sure the Web UI doesn't hide
            ]).SetClass("flex flex-col h-full relative bg-white")
        ]).SetClass("fixed top-0 left-0 right-0 h-screen w-screen md:max-h-65vh md:w-auto md:relative z-above-controls");

    }

    private clear() {
        ScrollableFullScreen.empty.AttachTo("fullscreen")
        const fs = document.getElementById("fullscreen");
        fs.classList.add("hidden")
    }


}