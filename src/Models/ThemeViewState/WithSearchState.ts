import ThemeConfig from "../ThemeConfig/ThemeConfig"
import SearchState from "../../Logic/State/SearchState"
import Hotkeys from "../../UI/Base/Hotkeys"
import Translations from "../../UI/i18n/Translations"
import Zoomcontrol from "../../UI/Zoomcontrol"
import { WithVisualFeedbackState } from "./WithVisualFeedbackState"
import { ShowDataLayerOptions } from "../../UI/Map/ShowDataLayerOptions"
import LayerConfig from "../ThemeConfig/LayerConfig"
import ShowDataLayer from "../../UI/Map/ShowDataLayer"
import { Store } from "../../Logic/UIEventSource"

export class WithSearchState extends WithVisualFeedbackState {
    public readonly searchState: SearchState

    constructor(theme: ThemeConfig, mvtAvailableLayers: Store<Set<string>>) {
        super(theme, mvtAvailableLayers)
        this.searchState = new SearchState(this)
        this.initHotkeysSearch()

        {
            // Register the search layer on the map

            const source = this.searchState.locationResults
            const flayer = this.layerState.filteredLayers.get("search")
            this.featureProperties.trackFeatureSource(source)
            const options: ShowDataLayerOptions & { layer: LayerConfig } = {
                features: source,
                doShowLayer: flayer.isDisplayed,
                layer: flayer.layerDef,
                metaTags: this.userRelatedState.preferencesAsTags,
                onClick: (feature) => {
                    this.searchState.clickedOnMap(feature)
                },
            }
            new ShowDataLayer(this.map, options)
        }
    }

    private initHotkeysSearch() {
        const docs = Translations.t.hotkeyDocumentation

        Hotkeys.RegisterHotkey({ ctrl: "F" }, docs.selectSearch, () => {
            this.searchState.feedback.set(undefined)
            this.searchState.searchIsFocused.set(true)
        })

        Hotkeys.RegisterHotkey({ nomod: "Escape", onUp: true }, docs.closeSidebar, () => {
            if (this.guistate.closeAll()) {
                return
            }
            if (this.searchState.showSearchDrawer.data) {
                this.searchState.showSearchDrawer.set(false)
            }
            Zoomcontrol.resetzoom()
            this.focusOnMap()
        })
    }
}
