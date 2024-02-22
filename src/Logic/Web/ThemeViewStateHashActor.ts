import ThemeViewState from "../../Models/ThemeViewState"
import Hash from "./Hash"
import { MenuState } from "../../Models/MenuState"

export default class ThemeViewStateHashActor {
    private readonly _state: ThemeViewState

    public static readonly documentation = [
        "The URL-hash can contain multiple values:",
        "",
        "- The id of the currently selected object, e.g. `node/1234`",
        "- The currently opened menu view",
        "- The base64-encoded JSON-file specifying a custom theme (only when loading)",
        "",
        "### Possible hashes to open a menu",
        "",
        "The possible hashes are:",
        "",
        MenuState._menuviewTabs.map((tab) => "`menu:" + tab + "`").join(","),
        MenuState._themeviewTabs.map((tab) => "`theme-menu:" + tab + "`").join(","),
    ]

    /**
     * Converts the hash to the appropriate themeview state and, vice versa, sets the hash.
     *
     * As the navigator-back-button changes the hash first, this class thus also handles the 'back'-button events.
     *
     * Note that there is no "real" way to intercept the back button, we can only detect the removal of the hash.
     * As such, we use a change in the hash to close the appropriate windows
     *
     * @param state
     */
    constructor(state: ThemeViewState) {
        this._state = state

        // First of all, try to recover the selected element
        if (Hash.hash.data) {
            const hash = Hash.hash.data
            this.loadStateFromHash(hash)
            Hash.hash.setData(hash) // reapply the previous hash
            state.indexedFeatures.featuresById.addCallbackAndRunD((_) => {
                let unregister = this.loadSelectedElementFromHash(hash)
                // once that we have found a matching element, we can be sure the indexedFeaturesource was popuplated and that the job is done
                return unregister
            })
        }

        // Register a hash change listener to correctly handle the back button
        Hash.hash.addCallback((hash) => {
            if (!!hash) {
                // There is still a hash
                // We _only_ have to (at most) close the overlays in this case
                if (state.previewedImage.data) {
                    state.previewedImage.setData(undefined)
                    return
                }

                const parts = hash.split(";")
                if (parts.indexOf("background") < 0) {
                    state.guistate.backgroundLayerSelectionIsOpened.setData(false)
                }
                this.loadSelectedElementFromHash(hash)
            } else {
                this.back()
            }
        })

        // At last, register callbacks on the state to update the hash when they change.
        // Note: these should use 'addCallback', not 'addCallbackAndRun'
        state.selectedElement.addCallback((_) => this.setHash())
        state.guistate.allToggles.forEach(({ toggle, submenu }) => {
            submenu?.addCallback((_) => this.setHash())
            toggle.addCallback((_) => this.setHash())
        })

        // When all is done, set the hash. This must happen last to give the code above correct info
        this.setHash()
    }

    /**
     * Selects the appropriate element
     * Returns true if this method can be unregistered for the first run
     * @param hash
     * @private
     */
    private loadSelectedElementFromHash(hash: string): boolean {
        const state = this._state
        const selectedElement = state.selectedElement
        // state.indexedFeatures.featuresById.stabilized(250)

        hash = hash.split(";")[0] // The 'selectedElement' is always the _first_ item in the hash (if any)

        // Set the hash based on the selected element...
        // ... search and select an element based on the hash
        if (selectedElement.data?.properties?.id === hash) {
            // We already have the correct hash
            return true
        }

        const found = state.indexedFeatures.featuresById.data?.get(hash)
        if (!found) {
            return false
        }
        if (found.properties.id === "last_click") {
            return true
        }
        const layer = this._state.layout.getMatchingLayer(found.properties)
        console.log(
            "Setting selected element based on hash",
            hash,
            "; found",
            found,
            "got matching layer",
            layer.id,
            ""
        )
        selectedElement.setData(found)
        return true
    }

    private loadStateFromHash(hash: string) {
        const state = this._state
        const parts = hash.split(":")
        outer: for (const { toggle, name, submenu } of state.guistate.allToggles) {
            for (const part of parts) {
                if (part === name) {
                    toggle.setData(true)
                    continue outer
                }
                if (part.indexOf(":") < 0) {
                    continue
                }
                const [main, submenuValue] = part.split(":")
                if (part !== main) {
                    continue
                }
                toggle.setData(true)
                submenu?.setData(submenuValue)
                continue outer
            }

            // If we arrive here, the loop above has not found any match
            toggle.setData(false)
        }
    }

    private setHash() {
        const s = this._state
        let h = ""

        for (const { toggle, showOverOthers, name, submenu } of s.guistate.allToggles) {
            if (showOverOthers || !toggle.data) {
                continue
            }
            h = name
            if (submenu?.data) {
                h += ":" + submenu.data
            }
        }

        if (s.selectedElement.data !== undefined) {
            h = s.selectedElement.data.properties.id
        }

        for (const { toggle, showOverOthers, name, submenu } of s.guistate.allToggles) {
            if (!showOverOthers || !toggle.data) {
                continue
            }
            if (h) {
                h += ";" + name
            } else {
                h = name
            }
            if (submenu?.data) {
                h += ":" + submenu.data
            }
        }
        Hash.hash.setData(h)
    }

    private back() {
        const state = this._state
        if (state.previewedImage.data) {
            state.previewedImage.setData(undefined)
            return
        }
        // history.pushState(null, null, window.location.pathname);
        if (state.selectedElement.data) {
            state.selectedElement.setData(undefined)
            return
        }
        if (state.guistate.closeAll()) {
            return
        }
    }
}
