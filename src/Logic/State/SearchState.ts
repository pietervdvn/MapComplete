import GeocodingProvider, { type SearchResult } from "../Search/GeocodingProvider"
import { ImmutableStore, Store, Stores, UIEventSource } from "../UIEventSource"
import CombinedSearcher from "../Search/CombinedSearcher"
import FilterSearch, { FilterSearchResult } from "../Search/FilterSearch"
import LocalElementSearch from "../Search/LocalElementSearch"
import CoordinateSearch from "../Search/CoordinateSearch"
import ThemeSearch from "../Search/ThemeSearch"
import OpenStreetMapIdSearch from "../Search/OpenStreetMapIdSearch"
import PhotonSearch from "../Search/PhotonSearch"
import ThemeViewState from "../../Models/ThemeViewState"
import type { MinimalThemeInformation } from "../../Models/ThemeConfig/ThemeConfig"
import { Translation } from "../../UI/i18n/Translation"
import GeocodingFeatureSource from "../Search/GeocodingFeatureSource"
import LayerSearch from "../Search/LayerSearch"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import { FeatureSource } from "../FeatureSource/FeatureSource"
import { Feature } from "geojson"

export default class SearchState {

    public readonly feedback: UIEventSource<Translation> = new UIEventSource<Translation>(undefined)
    public readonly searchTerm: UIEventSource<string> = new UIEventSource<string>("")
    public readonly searchIsFocused = new UIEventSource(false)
    public readonly suggestions: Store<SearchResult[]>
    public readonly filterSuggestions: Store<FilterSearchResult[]>
    public readonly themeSuggestions: Store<MinimalThemeInformation[]>
    public readonly layerSuggestions: Store<LayerConfig[]>
    public readonly locationSearchers: ReadonlyArray<GeocodingProvider>

    private readonly state: ThemeViewState
    public readonly showSearchDrawer: UIEventSource<boolean>
    public readonly suggestionsSearchRunning: Store<boolean>
    public readonly locationResults: FeatureSource

    constructor(state: ThemeViewState) {
        this.state = state

        this.locationSearchers = [
            new LocalElementSearch(state, 5),
            new CoordinateSearch(),
            new OpenStreetMapIdSearch(state),
            new PhotonSearch(true, 2),
            new PhotonSearch(),
            // new NominatimGeocoding(),
        ]

        const bounds = state.mapProperties.bounds
        const suggestionsList = this.searchTerm.stabilized(250).mapD(search => {
                if (search.length === 0) {
                    return undefined
                }
                return this.locationSearchers.map(ls => ls.suggest(search, { bbox: bounds.data }))

            }, [bounds]
        )
        this.suggestionsSearchRunning = suggestionsList.bind(suggestions => {
            if (suggestions === undefined) {
                return new ImmutableStore(true)
            }
            return Stores.concat(suggestions).map(suggestions => suggestions.some(list => list === undefined))
        })
        this.suggestions = suggestionsList.bindD(suggestions =>
            Stores.concat(suggestions).map(suggestions => CombinedSearcher.merge(suggestions))
        )

        const themeSearch = new ThemeSearch(state)
        this.themeSuggestions = this.searchTerm.mapD(query => themeSearch.search(query, 3))

        const layerSearch = new LayerSearch(state.theme)
        this.layerSuggestions = this.searchTerm.mapD(query => layerSearch.search(query, 5))

        const filterSearch = new FilterSearch(state)
        this.filterSuggestions = this.searchTerm.stabilized(50)
            .mapD(query => filterSearch.search(query))
            .mapD(filterResult => {
                const active = state.layerState.activeFilters.data
                return filterResult.filter(({ filter, index, layer }) => {
                    const foundMatch = active.some(active =>
                        active.filter.id === filter.id && layer.id === active.layer.id && active.control.data === index)

                    return !foundMatch
                })
            }, [state.layerState.activeFilters])
        this.locationResults = new GeocodingFeatureSource(this.suggestions.stabilized(250))

        this.showSearchDrawer = new UIEventSource(false)

        this.searchIsFocused.addCallbackAndRunD(sugg => {
            if (sugg) {
                this.showSearchDrawer.set(true)
            }
        })


    }

    public async apply(result: FilterSearchResult[] | LayerConfig) {
        if (result instanceof LayerConfig) {
            return this.applyLayer(result)
        }
        return this.applyFilter(result)
    }

    private async applyLayer(layer: LayerConfig) {
        for (const [name, otherLayer] of this.state.layerState.filteredLayers) {
            otherLayer.isDisplayed.setData(name === layer.id)
        }
    }

    private async applyFilter(payload: FilterSearchResult[]) {
        const state = this.state

        const layersToShow = payload.map(fsr => fsr.layer.id)
        console.log("Layers to show are", layersToShow)
        for (const [name, otherLayer] of state.layerState.filteredLayers) {
            const layer = otherLayer.layerDef
            if (!layer.isNormal()) {
                continue
            }
            otherLayer.isDisplayed.setData(layersToShow.indexOf(layer.id) >= 0)
        }
        for (const { filter, index, layer } of payload) {
            const flayer = state.layerState.filteredLayers.get(layer.id)
            flayer.isDisplayed.set(true)
            const filtercontrol = flayer.appliedFilters.get(filter.id)
            if (filtercontrol.data === index) {
                filtercontrol.setData(undefined)
            } else {
                filtercontrol.setData(index)
            }
        }
    }

    closeIfFullscreen() {
        if (window.innerWidth < 640) {
            this.showSearchDrawer.set(false)
        }
    }

    async clickedOnMap(feature: Feature) {
        const osmid = feature.properties.osm_id
        const localElement = this.state.indexedFeatures.featuresById.data.get(osmid)
        if (localElement) {
            this.state.selectedElement.set(localElement)
            return
        }
        // This feature might not be loaded because we zoomed out
        const object = await this.state.osmObjectDownloader.DownloadObjectAsync(osmid)
        if(object === "deleted"){
            return
        }
        const f = object.asGeoJson()
        this.state.indexedFeatures.addItem(f)
        this.state.featureProperties.trackFeature(f)
        this.state.selectedElement.set(f)
    }
}
