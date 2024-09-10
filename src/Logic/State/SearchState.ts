import GeocodingProvider, {
    FilterPayload, FilterResult,
    GeocodeResult,
    GeocodingUtils, LayerResult,
    type SearchResult,
} from "../Search/GeocodingProvider"
import { ImmutableStore, Store, Stores, UIEventSource } from "../UIEventSource"
import CombinedSearcher from "../Search/CombinedSearcher"
import FilterSearch from "../Search/FilterSearch"
import LocalElementSearch from "../Search/LocalElementSearch"
import CoordinateSearch from "../Search/CoordinateSearch"
import ThemeSearch from "../Search/ThemeSearch"
import OpenStreetMapIdSearch from "../Search/OpenStreetMapIdSearch"
import PhotonSearch from "../Search/PhotonSearch"
import ThemeViewState from "../../Models/ThemeViewState"
import Translations from "../../UI/i18n/Translations"
import type { MinimalLayoutInformation } from "../../Models/ThemeConfig/LayoutConfig"
import MoreScreen from "../../UI/BigComponents/MoreScreen"
import { BBox } from "../BBox"
import { Translation } from "../../UI/i18n/Translation"
import GeocodingFeatureSource from "../Search/GeocodingFeatureSource"
import ShowDataLayer from "../../UI/Map/ShowDataLayer"
import LayerSearch from "../Search/LayerSearch"

export default class SearchState {

    public readonly isSearching = new UIEventSource(false)
    public readonly feedback: UIEventSource<Translation> = new UIEventSource<Translation>(undefined)
    public readonly searchTerm: UIEventSource<string> = new UIEventSource<string>("")
    public readonly searchIsFocused = new UIEventSource(false)
    public readonly suggestions: Store<SearchResult[]>
    public readonly filterSuggestions: Store<FilterResult[]>
    public readonly themeSuggestions: Store<MinimalLayoutInformation[]>
    public readonly layerSuggestions: Store<LayerResult[]>
    public readonly locationSearchers: ReadonlyArray<GeocodingProvider<GeocodeResult>>

    private readonly state: ThemeViewState
    public readonly showSearchDrawer: UIEventSource<boolean>
    public readonly suggestionsSearchRunning: Store<boolean>

    constructor(state: ThemeViewState) {
        this.state = state

        this.locationSearchers = [
            // new LocalElementSearch(state, 5),
            new CoordinateSearch(),
            new OpenStreetMapIdSearch(state),
            new PhotonSearch(), // new NominatimGeocoding(),
        ]

        const bounds = state.mapProperties.bounds
        const suggestionsList = this.searchTerm.stabilized(250).mapD(search => {
                if (search.length === 0) {
                    return undefined
                }
                return this.locationSearchers.map(ls => ls.suggest(search, { bbox: bounds.data }))

            }, [bounds],
        )
        this.suggestionsSearchRunning = suggestionsList.bind(suggestions => {
            if (suggestions === undefined) {
                return new ImmutableStore(true)
            }
            return Stores.concat(suggestions).map(suggestions => suggestions.some(list => list === undefined))
        })
        this.suggestions = suggestionsList.bindD(suggestions =>
            Stores.concat(suggestions).map(suggestions => CombinedSearcher.merge(suggestions)),
        )

        const themeSearch = new ThemeSearch(state, 3)
        this.themeSuggestions = this.searchTerm.mapD(query => themeSearch.searchDirect(query, 3))

        const layerSearch = new LayerSearch(state, 5)
        this.layerSuggestions = this.searchTerm.mapD(query => layerSearch.searchDirect(query, 5))

        const filterSearch = new FilterSearch(state)
        this.filterSuggestions = this.searchTerm.stabilized(50)
            .mapD(query => filterSearch.searchDirectly(query))
            .mapD(filterResult => {
                const active = state.layerState.activeFilters.data
                return filterResult.filter(({ payload: { filter, index, layer } }) => {
                    const foundMatch = active.some(active =>
                        active.filter.id === filter.id && layer.id === active.layer.id && active.control.data === index)

                    return !foundMatch
                })
            }, [state.layerState.activeFilters])
        const geocodedFeatures = new GeocodingFeatureSource(this.suggestions.stabilized(250))
        state.featureProperties.trackFeatureSource(geocodedFeatures)

        new ShowDataLayer(
            state.map,
            {
                layer: GeocodingUtils.searchLayer,
                features: geocodedFeatures,
                selectedElement: state.selectedElement,
            },
        )

        this.showSearchDrawer = new UIEventSource(false)

        this.searchIsFocused.addCallbackAndRunD(sugg => {
            if (sugg) {
                this.showSearchDrawer.set(true)
            }
        })


    }

    public async apply(result: FilterResult | LayerResult) {
        if (result.category === "filter") {
            return this.applyFilter(result.payload)
        }
        if (result.category === "layer") {
            return this.applyLayer(result)
        }
    }

    private async applyLayer(layer: LayerResult) {
        for (const [name, otherLayer] of this.state.layerState.filteredLayers) {
            otherLayer.isDisplayed.setData(name === layer.osm_id)
        }
    }

    private async applyFilter(payload: FilterPayload) {
        const state = this.state

        const { layer, filter, index } = payload
        for (const [name, otherLayer] of state.layerState.filteredLayers) {
            otherLayer.isDisplayed.setData(name === layer.id)
        }
        const flayer = state.layerState.filteredLayers.get(layer.id)
        flayer.isDisplayed.set(true)
        const filtercontrol = flayer.appliedFilters.get(filter.id)
        console.log("Could not apply", layer.id, ".", filter.id, index)
        if (filtercontrol.data === index) {
            filtercontrol.setData(undefined)
        } else {
            filtercontrol.setData(index)
        }
    }

}
