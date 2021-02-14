import {UIElement} from "../UIElement";
import Svg from "../../Svg";
import Combine from "./Combine";
import Ornament from "./Ornament";

/**
 * Wraps some contents into a panel that scrolls the content _under_ the title
 */
export default class ScrollableFullScreen extends UIElement {
    private static _isInited = false;
    private _component: UIElement;

    constructor(title: UIElement, content: UIElement, onClose: (() => void)) {
        super();
        if (!ScrollableFullScreen._isInited) {
            ScrollableFullScreen._isInited = ScrollableFullScreen.PreparePatchesForFullscreen();
        }
        const returnToTheMap =
            new Combine([
                Svg.back_svg().SetClass("block md:hidden"),
                Svg.close_svg().SetClass("hidden md:block")
            ])
                .onClick(() => {
                    console.log("Closing...")
                    ScrollableFullScreen.RestoreLeaflet();
                    if (onClose !== undefined) {
                        onClose();
                    } else {
                        console.error("WARNING: onClose is not defined")
                    }
                }).SetClass("mb-2 bg-blue-50 rounded-full w-12 h-12 p-1.5")

        title.SetClass("block w-full text-2xl font-bold p-2 pl-4")
        const ornament = new Combine([new Ornament().SetStyle("height:5em;")])
            .SetClass("md:hidden h-5")


        this._component =
            new Combine([
                new Combine([
                    new Combine([returnToTheMap, title])
                        .SetClass("border-b-2 border-black shadow md:shadow-none bg-white p-2 pb-0 md:p-0 flex overflow-x-hidden flex-shrink-0 max-h-20vh"),
                    new Combine([content, ornament])
                        .SetClass("block p-2 md:pt-4 w-full h-full overflow-y-auto overflow-x-hidden md:max-h-65vh"),
                    // We add an ornament which takes around 5em. This is in order to make sure the Web UI doesn't hide
                ]).SetClass("flex flex-col h-full relative bg-white")
            ]).SetClass("fixed top-0 left-0 right-0 h-screen w-screen md:max-h-65vh md:w-auto md:relative");

        this.dumbMode = false;
    }

    private static HideClutter(htmlElement: HTMLElement) {
        const whiteList = new Set<Element>();
        do {
            if(htmlElement === null){
                break;
            }
            if (htmlElement.classList.contains("clutter")) {
                // Don't hide the parent element
                whiteList.add(htmlElement)
            }
            htmlElement = htmlElement.parentElement;
        } while (htmlElement != null)

        const clutter = document.getElementsByClassName("clutter");
        for (let i = 0; i < clutter.length; ++i) {
            if (whiteList.has(clutter[i])) {
                continue;
            }
            const classlist = clutter[i].classList;
            if (classlist.contains("clutter-hidden")) {
                continue;
            }
            classlist.add("clutter-hidden");
        }


    }

    /**
     * Adds the 'clutter' class (which merely acts as a tag) onto some elements, e.g. the leaflet attributions
     * @constructor
     */
    private static PreparePatchesForFullscreen(): boolean {
        const toHide = document.getElementsByClassName("leaflet-control-container");
        for (let i = 0; i < toHide.length; ++i) {
            toHide[i].classList.add("clutter");
        }
        return true;
    }

    private static PatchLeaflet(htmlElement) {
        if(htmlElement === undefined || htmlElement === null){
            return;
        }

        let toHide = document.getElementsByClassName("leaflet-pane");
        for (let i = 0; i < toHide.length; ++i) {
            toHide[i].classList.add("no-transform");
            toHide[i].classList.add("scrollable-fullscreen-no-transform");
        }

        toHide = document.getElementsByClassName("leaflet-popup");
        for (let i = 0; i < toHide.length; ++i) {
            toHide[i].classList.add("no-transform");
            toHide[i].classList.add("scrollable-fullscreen-no-transform");
        }
        
        do {
            // A leaflet workaround: in order for fullscreen to work, we need to get the parent element which does a transform3d and remove/read the transform
            if (htmlElement.style.transform !== "") {
                if (!htmlElement.classList.contains("no-transform")) {
                    htmlElement.classList.add("no-transform");
                    htmlElement.classList.add("scrollable-fullscreen-no-transform")
                }
            }
            htmlElement = htmlElement.parentElement;
        } while (htmlElement != null)

    }

    public static RestoreLeaflet() {
        const noTransf = document.getElementsByClassName("scrollable-fullscreen-no-transform");
        for (let i = 0; i < noTransf.length; ++i) {
            noTransf[i].classList.remove("no-transform");
            noTransf[i].classList.remove("scrollable-fullscreen-no-transform");
        }
        let clutter = document.getElementsByClassName("clutter-hidden");

        do {
            for (let i = 0; i < clutter.length; ++i) {
                clutter[i].classList.remove("clutter-hidden");
            }
            clutter = document.getElementsByClassName("clutter-hidden");
        } while (clutter.length > 0)
    }

    InnerRender(): string {
        return this._component.Render();
    }
    
    public PrepFullscreen(htmlElement = undefined) {
        ScrollableFullScreen.PatchLeaflet(htmlElement);

        htmlElement = htmlElement ?? document.getElementById(this.id);
        ScrollableFullScreen.HideClutter(htmlElement);

    }

    protected InnerUpdate(htmlElement: HTMLElement) {
        this.PrepFullscreen(htmlElement)
        super.InnerUpdate(htmlElement);
    }
    
    Update() {
        super.Update();
    }


}