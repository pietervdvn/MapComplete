<script lang="ts">
  import { Store, Stores, UIEventSource } from "../../Logic/UIEventSource"
  import type { Feature } from "geojson"
  import Translations from "../i18n/Translations"
  import Loading from "../Base/Loading.svelte"
  import Hotkeys from "../Base/Hotkeys"
  import { BBox } from "../../Logic/BBox"
  import { GeoIndexedStoreForLayer } from "../../Logic/FeatureSource/Actors/GeoIndexedStore"
  import { createEventDispatcher, onDestroy } from "svelte"
  import { placeholder } from "../../Utils/placeholder"
  import { SearchIcon } from "@rgossiaux/svelte-heroicons/solid"
  import { ariaLabel } from "../../Utils/ariaLabel"
  import { GeoLocationState } from "../../Logic/State/GeoLocationState"
  import { NominatimGeocoding } from "../../Logic/Geocoding/NominatimGeocoding"
  import { GeocodingUtils } from "../../Logic/Geocoding/GeocodingProvider"
  import type { SearchResult } from "../../Logic/Geocoding/GeocodingProvider"
  import type GeocodingProvider from "../../Logic/Geocoding/GeocodingProvider"

  import SearchResults from "./SearchResults.svelte"
  import type { MinimalLayoutInformation } from "../../Models/ThemeConfig/LayoutConfig"
  import { focusWithArrows } from "../../Utils/focusWithArrows"
  import ShowDataLayer from "../Map/ShowDataLayer"
  import ThemeViewState from "../../Models/ThemeViewState"
  import GeocodingFeatureSource from "../../Logic/Geocoding/GeocodingFeatureSource"
  import MoreScreen from "../BigComponents/MoreScreen"

  export let perLayer: ReadonlyMap<string, GeoIndexedStoreForLayer> | undefined = undefined
  export let bounds: UIEventSource<BBox>
  export let selectedElement: UIEventSource<Feature> | undefined = undefined

  export let geolocationState: GeoLocationState | undefined = undefined
  export let clearAfterView: boolean = true
  export let searcher: GeocodingProvider = new NominatimGeocoding()
  export let state: ThemeViewState
  let searchContents: UIEventSource<string> = new UIEventSource<string>("")
  export let triggerSearch: UIEventSource<any> = new UIEventSource<any>(undefined)
  onDestroy(
    triggerSearch.addCallback(() => {
      performSearch()
    })
  )

  let isRunning: boolean = false

  let inputElement: HTMLInputElement

  let feedback: string = undefined

  let isFocused = new UIEventSource(false)

  function focusOnSearch() {
    requestAnimationFrame(() => {
      inputElement?.focus()
      inputElement?.select()
    })
  }

  Hotkeys.RegisterHotkey({ ctrl: "F" }, Translations.t.hotkeyDocumentation.selectSearch, () => {
    feedback = undefined
    focusOnSearch()
  })

  const dispatch = createEventDispatcher<{ searchCompleted; searchIsValid: boolean }>()
  $: {
    if (!$searchContents?.trim()) {
      dispatch("searchIsValid", false)
    } else {
      dispatch("searchIsValid", true)
    }
  }


  async function performSearch() {
    try {
      isRunning = true
      geolocationState?.allowMoving.setData(true)
      geolocationState?.requestMoment.setData(undefined) // If the GPS is still searching for a fix, we say that we don't want tozoom to it anymore
      const searchContentsData = $searchContents?.trim() ?? ""

      if (searchContentsData === "") {
        return
      }
      const result = await searcher.search(searchContentsData, { bbox: bounds.data, limit: 10 })
      console.log("Results are", result)
      if (result.length == 0) {
        feedback = Translations.t.general.search.nothing.txt
        focusOnSearch()
        return
      }
      const poi = result[0]
      if (poi.category === "theme") {
        const theme = <MinimalLayoutInformation>poi.payload
        const url = MoreScreen.createUrlFor(theme, false)
        console.log("Found a theme, going to", url)
        // @ts-ignore
        window.location = url
        return
      }
      if(poi.category === "filter"){
        return  // Should not happen
      }
      if (poi.boundingbox) {

        const [lat0, lat1, lon0, lon1] = poi.boundingbox
        bounds.set(
          new BBox([
            [lon0, lat0],
            [lon1, lat1]
          ]).pad(0.01)
        )
      } else if (poi.lon && poi.lat) {
        state.mapProperties.flyTo(poi.lon, poi.lat, GeocodingUtils.categoryToZoomLevel[poi.category] ?? 16)
      }
      if (perLayer !== undefined) {
        const id = poi.osm_type + "/" + poi.osm_id
        const layers = Array.from(perLayer?.values() ?? [])
        for (const layer of layers) {
          const found = layer.features.data.find((f) => f.properties.id === id)
          if (found === undefined) {
            continue
          }
          selectedElement?.setData(found)
          console.log("Found an element that probably matches:", selectedElement?.data)
          break
        }
      }
      if (clearAfterView) {
        searchContents.setData("")
      }
      dispatch("searchIsValid", false)
      dispatch("searchCompleted")
      isFocused.setData(false)
    } catch (e) {
      console.error(e)
      feedback = Translations.t.general.search.error.txt
      focusOnSearch()
    } finally {
      isRunning = false
    }
  }

  let suggestions: Store<SearchResult[]> = searchContents.stabilized(250).bindD(search => {
      if (search.length === 0) {
        return undefined
      }
      return Stores.holdDefined(bounds.bindD(bbox => searcher.suggest(search, { bbox, limit: 15 })))
    }
  )
  suggestions.addCallbackAndRun(suggestions => console.log(">>> suggestions are", suggestions))
  let geocededFeatures=  new GeocodingFeatureSource(suggestions.stabilized(250))
  state.featureProperties.trackFeatureSource(geocededFeatures)

  new ShowDataLayer(
    state.map,
    {
      layer: GeocodingUtils.searchLayer,
      features:  geocededFeatures,
      selectedElement: state.selectedElement
    }
  )

  let geosearch: HTMLDivElement

  function checkFocus() {
    window.requestAnimationFrame(() => {
      if (geosearch?.contains(document.activeElement)) {
        return
      }
      isFocused.setData(false)
    })
  }

  document.addEventListener("focus", () => {
    checkFocus()
  }, true /* use 'capturing' instead of bubbling, needed for focus-events*/)


</script>

<div bind:this={geosearch} use:focusWithArrows={"searchresult"}>

  <div class="normal-background flex justify-between rounded-full pl-2 w-full">
    <form class="flex w-full flex-wrap">
      {#if isRunning}
        <Loading>{Translations.t.general.search.searching}</Loading>
      {:else}
        <input
          type="search"
          class="w-full outline-none"
          bind:this={inputElement}
          on:keypress={(keypr) => {
          feedback = undefined
          if(keypr.key === "Enter"){
            performSearch()
            keypr.preventDefault()
          }
          return undefined
        }}
          on:focus={() => {isFocused.setData(true)}}
          on:blur={() => {checkFocus()}}
          bind:value={$searchContents}
          use:placeholder={Translations.t.general.search.search}
          use:ariaLabel={Translations.t.general.search.search}
        />
        {#if feedback !== undefined}
          <!-- The feedback is _always_ shown for screenreaders and to make sure that the searchfield can still be selected by tabbing-->
          <div class="alert" role="alert" aria-live="assertive">
            {feedback}
          </div>
        {/if}
      {/if}
    </form>
    <SearchIcon aria-hidden="true" class="h-6 w-6 self-end" on:click={performSearch} />
  </div>

  <div class="relative h-0" style="z-index: 10">
    <div class="absolute right-0 w-full sm:w-96 h-fit max-h-96">
      <SearchResults {isFocused} {state} results={$suggestions} searchTerm={searchContents}
                     on:select={() => {searchContents.set(""); isFocused.setData(false)}} />
    </div>
  </div>
</div>
