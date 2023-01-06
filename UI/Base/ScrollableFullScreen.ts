import Svg from "../../Svg"
import Combine from "./Combine"
import { FixedUiElement } from "./FixedUiElement"
import { UIEventSource } from "../../Logic/UIEventSource"
import Hash from "../../Logic/Web/Hash"
import BaseUIElement from "../BaseUIElement"
import Title from "./Title"
import Hotkeys from "./Hotkeys"
import Translations from "../i18n/Translations"

/**
 *
 * The scrollableFullScreen is a bit of a peculiar component:
 * - It shows a title and some contents, constructed from the respective functions passed into the constructor
 * - When the element is 'activated', one clone of title+contents is attached to the fullscreen
 * - The element itself will - upon rendering - also show the title and contents (allthough it'll be a different clone)
 *
 *
 */
export default class ScrollableFullScreen {
    private static readonly empty = ScrollableFullScreen.initEmpty()
    private static _currentlyOpen: ScrollableFullScreen
    public isShown: UIEventSource<boolean>
    private hashToShow: string
    private _fullscreencomponent: BaseUIElement
    private _resetScrollSignal: UIEventSource<void> = new UIEventSource<void>(undefined)

    constructor(
        title: (options: { mode: string }) => BaseUIElement,
        content: (options: {
            mode: string
            resetScrollSignal: UIEventSource<void>
        }) => BaseUIElement,
        hashToShow: string,
        isShown: UIEventSource<boolean> = new UIEventSource<boolean>(false)
    ) {
        this.hashToShow = hashToShow
        this.isShown = isShown

        if (hashToShow === undefined || hashToShow === "") {
            throw "HashToShow should be defined as it is vital for the 'back' key functionality"
        }

        const mobileOptions = {
            mode: "mobile",
            resetScrollSignal: this._resetScrollSignal,
        }

        this._fullscreencomponent = this.BuildComponent(
            title(mobileOptions),
            content(mobileOptions).SetClass("pb-20")
        )

        const self = this
        Hash.hash.addCallback((h) => {
            if (h === undefined) {
                isShown.setData(false)
            }
        })

        isShown.addCallbackD((isShown) => {
            if (isShown) {
                // We first must set the hash, then activate the panel
                // If the order is wrong, this will cause the panel to disactivate again
                Hash.hash.setData(hashToShow)
                ScrollableFullScreen._currentlyOpen = self
                self.Activate()
            } else {
                if (self.hashToShow !== undefined) {
                    Hash.hash.setData(undefined)
                }
                // Some cleanup...
                ScrollableFullScreen.collapse()
            }
        })
        if (isShown.data) {
            Hash.hash.setData(hashToShow)
            ScrollableFullScreen._currentlyOpen = self
            this.Activate()
        }
    }

    private static initEmpty(): FixedUiElement {
        Hotkeys.RegisterHotkey(
            { nomod: "Escape", onUp: true },
            Translations.t.hotkeyDocumentation.closeSidebar,
            ScrollableFullScreen.collapse
        )

        return new FixedUiElement("")
    }
    public static collapse() {
        const fs = document.getElementById("fullscreen")
        if (fs !== null) {
            ScrollableFullScreen.empty.AttachTo("fullscreen")
            fs.classList.add("hidden")
        }

        const opened = ScrollableFullScreen._currentlyOpen
        if (opened !== undefined) {
            opened?.isShown?.setData(false)
        }
    }

    Destroy() {
        this._fullscreencomponent.Destroy()
    }

    /**
     * Actually show this in the 'fullscreen'-div
     * @constructor
     */
    public Activate(): void {
        this.isShown.setData(true)
        if (this.hashToShow && this.hashToShow !== "") {
            Hash.hash.setData(this.hashToShow)
        }
        this._fullscreencomponent.AttachTo("fullscreen")
        const fs = document.getElementById("fullscreen")
        ScrollableFullScreen._currentlyOpen = this
        fs?.classList?.remove("hidden")
    }

    private BuildComponent(title: BaseUIElement, content: BaseUIElement): BaseUIElement {
        const returnToTheMap = new Combine([
            Svg.back_svg().SetClass("block md:hidden w-12 h-12 p-2 svg-foreground"),
            Svg.close_svg().SetClass("hidden md:block  w-12 h-12  p-3 svg-foreground"),
        ]).SetClass("rounded-full p-0 flex-shrink-0 self-center")

        returnToTheMap.onClick(() => {
            this.isShown.setData(false)
            Hash.hash.setData(undefined)
        })

        title = new Title(title, 2)
        title.SetClass(
            "text-l sm:text-xl md:text-2xl w-full p-0 max-h-20vh overflow-y-auto self-center"
        )

        const contentWrapper = new Combine([content]).SetClass(
            "block p-2 md:pt-4 w-full h-full overflow-y-auto desktop:max-h-65vh"
        )

        this._resetScrollSignal.addCallback((_) => {
            contentWrapper.ScrollToTop()
        })

        return new Combine([
            new Combine([
                new Combine([returnToTheMap, title]).SetClass(
                    "border-b-1 border-black shadow bg-white flex flex-shrink-0 pt-1 pb-1 md:pt-0 md:pb-0"
                ),
                contentWrapper,
                // We add an ornament which takes around 5em. This is in order to make sure the Web UI doesn't hide
            ]).SetClass("flex flex-col h-full relative bg-white"),
        ]).SetClass(
            "fixed top-0 left-0 right-0 h-screen w-screen desktop:max-h-65vh md:w-auto md:relative z-above-controls md:rounded-xl overflow-hidden"
        )
    }

    static ActivateCurrent() {
        ScrollableFullScreen._currentlyOpen?.Activate()
    }
}
