import Hash from "./Hash"
import { MenuState } from "../../Models/MenuState"
import { AndroidPolyfill } from "./AndroidPolyfill"
import { IndexedFeatureSource } from "../FeatureSource/FeatureSource"
import { Feature } from "geojson"
import { UIEventSource } from "../UIEventSource"

export default class ThemeViewStateHashActor {
    private readonly _state: {
        indexedFeatures: IndexedFeatureSource,
        selectedElement: UIEventSource<Feature>,
        guistate: MenuState
    }
    private isUpdatingHash = false

    public static readonly documentation = [
        "The URL-hash can contain multiple values:",
        "",
        "- The id of the currently selected object, e.g. `node/1234`",
        "- The currently opened menu view",
        "",
        "### Possible hashes to open a menu",
        "",
        "The possible hashes are:",
        "",
        MenuState.pageNames.map((tab) => "`" + tab + "`").join(",")
    ]

    /**
     * Converts the hash to the appropriate theme-view state and, vice versa, sets the hash.
     *
     * As the navigator-back-button changes the hash first, this class thus also handles the (browser) 'back'-button events.
     *
     * Note that there is no "real" way to intercept the back button, we can only detect the removal of the hash.
     * As such, we use a change in the hash to close the appropriate windows
     *
     */
    constructor(state: {
        indexedFeatures: IndexedFeatureSource,
        selectedElement: UIEventSource<Feature>,
        guistate: MenuState,
    }) {
        this._state = state
        AndroidPolyfill.onBackButton(() => this.back(), {
            returnToIndex: state.featureSwitches.featureSwitchBackToThemeOverview
        })

        const hashOnLoad = Hash.hash.data
        const containsMenu = this.loadStateFromHash(hashOnLoad)
        // First of all, try to recover the selected element
        if (!containsMenu && hashOnLoad?.length > 0) {
            state.indexedFeatures.featuresById.addCallbackAndRunD(() => {
                // once that we have found a matching element, we can be sure the indexedFeaturesource was popuplated and that the job is done
                return this.loadSelectedElementFromHash(hashOnLoad)
            })
        }

        // At last, register callbacks on the state to update the hash when they change.
        // Note: these should use 'addCallback', not 'addCallbackAndRun'
        state.selectedElement.addCallback(() => this.setHash())

        // Register a hash change listener to correctly handle the back button
        Hash.hash.addCallback((hash) => {
            if (this.isUpdatingHash) {
                return
            }
            if (!hash) {
                this.back()
            } else {
                if (!this.loadStateFromHash(hash)) {
                    this.loadSelectedElementFromHash(hash)
                }
            }
        })

        for (const key in state.guistate.pageStates) {
            const toggle = state.guistate.pageStates[key]
            toggle.addCallback(() => this.setHash())
        }

        // When all is done, set the hash. This must happen last to give the code above correct info
        this.setHash()

    }

    /**
     * Selects the appropriate element
     * Returns true if this method can be unregistered for the first run
     */
    private loadSelectedElementFromHash(hash: string): boolean {
        const state = this._state
        const selectedElement = state.selectedElement

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
        if (found.properties.id.startsWith("last_click")) {
            return true
        }
        console.log("Setting selected element based on hash", hash, "; found", found)
        selectedElement.setData(found)
        return true
    }

    private loadStateFromHash(hash: string): boolean {
        for (const page in this._state.guistate.pageStates) {
            if (page === hash) {
                const toggle = this._state.guistate.pageStates[page]
                toggle.set(true)
                console.log("Loading menu view from hash:", page)
                return true
            }
        }
        return false
    }

    /**
     * Sets the hash based on:
     *
     * 1. Selected element ID
     * 2. A selected 'page' from the menu
     *
     */
    private setHash(): void {
        // Important ! This function is called by 'addCallback' and might thus never return 'true' or it will be unregistered
        this.isUpdatingHash = true
        try {
            const selectedElement = this._state.selectedElement.data
            if (selectedElement) {
                Hash.hash.set(selectedElement.properties.id)
                return
            }
            for (const page in this._state.guistate.pageStates) {
                const toggle = this._state.guistate.pageStates[page]
                if (toggle.data) {
                    Hash.hash.set(page)
                    return
                }
            }
            Hash.hash.set(undefined)
            return
        } finally {
            this.isUpdatingHash = false
        }
    }

    /**
     * Returns 'true' if an action was taken
     * @private
     */
    private back(): boolean {
        const state = this._state
        return state.guistate.closeAll()
    }
}
