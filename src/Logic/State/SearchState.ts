import GeocodingProvider, {
    FilterPayload,
    GeocodeResult,
    GeocodingUtils,
    type SearchResult
} from "../Geocoding/GeocodingProvider"
import { RecentSearch } from "../Geocoding/RecentSearch"
import { ImmutableStore, Store, Stores, UIEventSource } from "../UIEventSource"
import CombinedSearcher from "../Geocoding/CombinedSearcher"
import FilterSearch from "../Geocoding/FilterSearch"
import LocalElementSearch from "../Geocoding/LocalElementSearch"
import CoordinateSearch from "../Geocoding/CoordinateSearch"
import ThemeSearch from "../Geocoding/ThemeSearch"
import OpenStreetMapIdSearch from "../Geocoding/OpenStreetMapIdSearch"
import PhotonSearch from "../Geocoding/PhotonSearch"
import ThemeViewState from "../../Models/ThemeViewState"
import Translations from "../../UI/i18n/Translations"
import type { MinimalLayoutInformation } from "../../Models/ThemeConfig/LayoutConfig"
import MoreScreen from "../../UI/BigComponents/MoreScreen"
import { BBox } from "../BBox"
import { Translation } from "../../UI/i18n/Translation"
import GeocodingFeatureSource from "../Geocoding/GeocodingFeatureSource"
import ShowDataLayer from "../../UI/Map/ShowDataLayer"

export default class SearchState {

    public readonly isSearching = new UIEventSource(false)
    public readonly recentlySearched: RecentSearch
    public readonly feedback: UIEventSource<Translation> = new UIEventSource<Translation>(undefined)
    public readonly searchTerm: UIEventSource<string> = new UIEventSource<string>("")
    public readonly searchIsFocused = new UIEventSource(false)
    public readonly suggestions: Store<SearchResult[]>
    public readonly filterSuggestions: Store<FilterPayload[]>
    public readonly themeSuggestions: Store<MinimalLayoutInformation[]>
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
            new PhotonSearch() // new NominatimGeocoding(),
        ]

        this.recentlySearched = new RecentSearch(state)
        const bounds = state.mapProperties.bounds
        const suggestionsList = this.searchTerm.stabilized(250).mapD(search => {
                if (search.length === 0) {
                    return undefined
                }
                return this.locationSearchers.map(ls => ls.suggest(search, { bbox: bounds.data }))

            }, [bounds]
        )
        this.suggestionsSearchRunning =  suggestionsList.bind(suggestions => {
            if(suggestions === undefined){
                return new ImmutableStore(true)
            }
            return Stores.concat(suggestions).map(suggestions => suggestions.some(list => list === undefined))
        })
        this.suggestions = suggestionsList.bindD(suggestions =>
            Stores.concat(suggestions).map(suggestions => CombinedSearcher.merge(suggestions))
        )

        const themeSearch = new ThemeSearch(state, 3)
        this.themeSuggestions = this.searchTerm.mapD(query => themeSearch.searchDirect(query, 3))


        const filterSearch = new FilterSearch(state)
        this.filterSuggestions = this.searchTerm.stabilized(50).mapD(query => filterSearch.searchDirectly(query)
        ).mapD(filterResult => {
            const active = state.layerState.activeFilters.data
            return filterResult.filter(({ filter, index, layer }) => {
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
                selectedElement: state.selectedElement
            }
        )

        this.showSearchDrawer = new UIEventSource(false)

        this.searchIsFocused.addCallbackAndRunD(sugg => {
            if (sugg) {
                this.showSearchDrawer.set(true)
            }
        })


    }


    public async apply(payload: FilterPayload) {
        const state = this.state
        const { layer, filter, index } = payload

        const flayer = state.layerState.filteredLayers.get(layer.id)
        const filtercontrol = flayer.appliedFilters.get(filter.id)
        for (const [name, otherLayer] of state.layerState.filteredLayers) {
            if (name === layer.id) {
                otherLayer.isDisplayed.setData(true)
                continue
            }
            otherLayer.isDisplayed.setData(false)
        }

        console.log("Could not apply", layer.id, ".", filter.id, index)
        if (filtercontrol.data === index) {
            filtercontrol.setData(undefined)
        } else {
            filtercontrol.setData(index)
        }
    }

    /**
     * Tries to search and goto a given location
     * Returns 'false' if search failed
     */
    public async performSearch(): Promise<boolean> {
        const query = this.searchTerm.data?.trim() ?? ""
        if (query === "") {
            return
        }
        const geolocationState = this.state.geolocation.geolocationState
        const searcher = this.state.searchState.geosearch
        const bounds = this.state.mapProperties.bounds
        const bbox = this.state.mapProperties.bounds.data
        try {
            this.isSearching.set(true)
            geolocationState?.allowMoving.setData(true)
            geolocationState?.requestMoment.setData(undefined) // If the GPS is still searching for a fix, we say that we don't want tozoom to it anymore
            const result = await searcher.search(query, { bbox })
            if (result.length == 0) {
                this.feedback.set(Translations.t.general.search.nothing)
                return false
            }
            const poi = result[0]
            if (poi.category === "theme") {
                const theme = <MinimalLayoutInformation>poi.payload
                const url = MoreScreen.createUrlFor(theme)
                window.location = <any>url
                return true
            }
            if (poi.category === "filter") {
                await this.apply(poi.payload)
                return true
            }
            if (poi.boundingbox) {
                const [lat0, lat1, lon0, lon1] = poi.boundingbox
                // Will trigger a 'fly to'
                bounds.set(
                    new BBox([
                        [lon0, lat0],
                        [lon1, lat1]
                    ]).pad(0.01)
                )
            } else if (poi.lon && poi.lat) {
                this.state.mapProperties.flyTo(poi.lon, poi.lat, GeocodingUtils.categoryToZoomLevel[poi.category] ?? 16)
            }
            const perLayer = this.state.perLayer
            if (perLayer !== undefined) {
                const id = poi.osm_type + "/" + poi.osm_id
                const layers = Array.from(perLayer?.values() ?? [])
                for (const layer of layers) {
                    const found = layer.features.data.find((f) => f.properties.id === id)
                    if (found === undefined) {
                        continue
                    }
                    this.state.selectedElement?.setData(found)
                }
            }
            return true
        } catch (e) {
            console.error(e)
            this.feedback.set(Translations.t.general.search.error)
            return false
        } finally {
            this.isSearching.set(false)
        }
    }


}
