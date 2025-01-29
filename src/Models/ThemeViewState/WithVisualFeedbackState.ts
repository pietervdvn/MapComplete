import ThemeConfig from "../ThemeConfig/ThemeConfig"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import Hotkeys from "../../UI/Base/Hotkeys"
import Translations from "../../UI/i18n/Translations"
import ThemeViewState from "../ThemeViewState"

export class WithVisualFeedbackState extends ThemeViewState {
    /**
     * If true, the user interface will toggle some extra aids for people using screenreaders and keyboard navigation
     * Triggered by navigating the map with arrows or by pressing 'space' or 'enter'
     */
    public readonly visualFeedback: UIEventSource<boolean> = new UIEventSource<boolean>(false)

    constructor(theme: ThemeConfig, mvtAvailableLayers: Store<Set<string>>) {
        super(theme, mvtAvailableLayers)
        this.initHotkeysVisualFeedback()

        ///// ACTORS /////

        this.userRelatedState.a11y.addCallbackAndRunD((a11y) => {
            if (a11y === "always") {
                this.visualFeedback.setData(true)
            } else if (a11y === "never") {
                this.visualFeedback.setData(false)
            }
        })
        this.mapProperties.onKeyNavigationEvent((keyEvent) => {
            if (this.userRelatedState.a11y.data === "never") {
                return
            }
            if (["north", "east", "south", "west"].indexOf(keyEvent.key) >= 0) {
                this.visualFeedback.setData(true)
                return true // Our job is done, unregister
            }
        })
    }

    /**
     * Selects the feature that is 'i' closest to the map center
     */
    private selectClosestAtCenter(i: number = 0) {
        console.log("Selecting closest", i)
        if (this.userRelatedState.a11y.data !== "never") {
            this.visualFeedback.setData(true)
        }

        const toSelect = this.closestFeatures.features?.data?.[i]
        if (!toSelect) {
            window.requestAnimationFrame(() => {
                const toSelect = this.closestFeatures.features?.data?.[i]
                if (!toSelect) {
                    return
                }
                this.setSelectedElement(toSelect)
            })
            return
        }
        this.setSelectedElement(toSelect)
    }

    private initHotkeysVisualFeedback() {
        const docs = Translations.t.hotkeyDocumentation

        Hotkeys.RegisterHotkey(
            {
                nomod: " ",
                onUp: true,
            },
            docs.selectItem,
            () => {
                if (this.selectedElement.data !== undefined) {
                    return false
                }
                if (this.guistate.isSomethingOpen()) {
                    return
                }
                if (
                    document.activeElement.tagName === "button" ||
                    document.activeElement.tagName === "input"
                ) {
                    return
                }
                this.selectClosestAtCenter(0)
            }
        )

        for (let i = 1; i < 9; i++) {
            let doc = docs.selectItemI.Subs({ i })
            if (i === 1) {
                doc = docs.selectItem
            } else if (i === 2) {
                doc = docs.selectItem2
            } else if (i === 3) {
                doc = docs.selectItem3
            }
            Hotkeys.RegisterHotkey(
                {
                    nomod: "" + i,
                    onUp: true,
                },
                doc,
                () => this.selectClosestAtCenter(i - 1)
            )
        }
    }
}
