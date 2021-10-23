import {UIElement} from "../UIElement";
import Svg from "../../Svg";
import Combine from "./Combine";
import {FixedUiElement} from "./FixedUiElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import Hash from "../../Logic/Web/Hash";
import BaseUIElement from "../BaseUIElement";
import Img from "./Img";

/**
 *
 * The scrollableFullScreen is a bit of a peculiar component:
 * - It shows a title and some contents, constructed from the respective functions passed into the constructor
 * - When the element is 'activated', one clone of title+contents is attached to the fullscreen
 * - The element itself will - upon rendering - also show the title and contents (allthough it'll be a different clone)
 *
 *
 */
export default class ScrollableFullScreen extends UIElement {
    private static readonly empty = new FixedUiElement("");
    private static _currentlyOpen: ScrollableFullScreen;
    public isShown: UIEventSource<boolean>;
    private _component: BaseUIElement;
    private _fullscreencomponent: BaseUIElement;

    constructor(title: ((mode: string) => BaseUIElement), content: ((mode: string) => BaseUIElement),
                isShown: UIEventSource<boolean> = new UIEventSource<boolean>(false)
    ) {
        super();
        this.isShown = isShown;

        this._component = this.BuildComponent(title("desktop"), content("desktop"), isShown)
            .SetClass("hidden md:block");
        this._fullscreencomponent = this.BuildComponent(title("mobile"), content("mobile").SetClass("pb-20"), isShown);


        const self = this;
        isShown.addCallback(isShown => {
            if (isShown) {
                self.Activate();
            } else {
                ScrollableFullScreen.clear();
            }
        })
    }

    private static clear() {
        ScrollableFullScreen.empty.AttachTo("fullscreen")
        const fs = document.getElementById("fullscreen");
        ScrollableFullScreen._currentlyOpen?.isShown?.setData(false);
        fs.classList.add("hidden")
        Hash.hash.setData(undefined);
    }

    InnerRender(): BaseUIElement {
        return this._component;
    }

    Activate(): void {
        this.isShown.setData(true)
        this._fullscreencomponent.AttachTo("fullscreen");
        const fs = document.getElementById("fullscreen");
        ScrollableFullScreen._currentlyOpen = this;
        fs.classList.remove("hidden")
    }

    private BuildComponent(title: BaseUIElement, content: BaseUIElement, isShown: UIEventSource<boolean>) {
        const returnToTheMap =
            new Combine([
                new Img(Svg.back.replace(/#000000/g,"#cccccc"),true)
                    .SetClass("block md:hidden w-12 h-12 p-2"),
               new Img(Svg.close.replace(/#000000/g,"#cccccc"),true)
                   .SetClass("hidden md:block  w-12 h-12  p-3")
            ]).SetClass("rounded-full p-0 flex-shrink-0 self-center")

        returnToTheMap.onClick(() => {
            isShown.setData(false)
        })

        title.SetClass("block text-l sm:text-xl md:text-2xl w-full font-bold p-0 max-h-20vh overflow-y-auto")
        return new Combine([
            new Combine([
                new Combine([returnToTheMap, title])
                    .SetClass("border-b-1 border-black shadow bg-white flex flex-shrink-0 pt-1 pb-1 md:pt-0 md:pb-0"),
                new Combine([content])
                    .SetClass("block p-2 md:pt-4 w-full h-full overflow-y-auto md:max-h-65vh"),
                // We add an ornament which takes around 5em. This is in order to make sure the Web UI doesn't hide
            ]).SetClass("flex flex-col h-full relative bg-white")
        ]).SetClass("fixed top-0 left-0 right-0 h-screen w-screen md:max-h-65vh md:w-auto md:relative z-above-controls md:rounded-xl overflow-hidden");

    }

}