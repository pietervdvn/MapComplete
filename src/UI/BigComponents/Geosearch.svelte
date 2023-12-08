<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource"
  import type { Feature } from "geojson"
  import ToSvelte from "../Base/ToSvelte.svelte"
  import Svg from "../../Svg.js"
  import Translations from "../i18n/Translations"
  import Loading from "../Base/Loading.svelte"
  import Hotkeys from "../Base/Hotkeys"
  import { Geocoding } from "../../Logic/Osm/Geocoding"
  import { BBox } from "../../Logic/BBox"
  import { GeoIndexedStoreForLayer } from "../../Logic/FeatureSource/Actors/GeoIndexedStore"
  import { createEventDispatcher, onDestroy } from "svelte"

  export let perLayer: ReadonlyMap<string, GeoIndexedStoreForLayer> | undefined = undefined
  export let bounds: UIEventSource<BBox>
  export let selectedElement: UIEventSource<Feature> | undefined = undefined

  export let clearAfterView: boolean = true

  let searchContents: string = ""
  export let triggerSearch: UIEventSource<any> = new UIEventSource<any>(undefined)
  onDestroy(
    triggerSearch.addCallback((_) => {
      performSearch()
    })
  )

  let isRunning: boolean = false

  let inputElement: HTMLInputElement

  let feedback: string = undefined

  Hotkeys.RegisterHotkey({ ctrl: "F" }, Translations.t.hotkeyDocumentation.selectSearch, () => {
    feedback = undefined
    requestAnimationFrame(() => {
    inputElement?.focus()
    inputElement?.select()
    })
  })

  const dispatch = createEventDispatcher<{ searchCompleted; searchIsValid: boolean }>()
  $: {
    if (!searchContents?.trim()) {
      dispatch("searchIsValid", false)
    } else {
      dispatch("searchIsValid", true)
    }
  }

  async function performSearch() {
    try {
      isRunning = true
      searchContents = searchContents?.trim() ?? ""

      if (searchContents === "") {
        return
      }
      const result = await Geocoding.Search(searchContents, bounds.data)
      if (result.length == 0) {
        feedback = Translations.t.general.search.nothing.txt
        return
      }
      const poi = result[0]
      const [lat0, lat1, lon0, lon1] = poi.boundingbox
      bounds.set(
        new BBox([
          [lon0, lat0],
          [lon1, lat1],
        ]).pad(0.01)
      )
      if (perLayer !== undefined) {
        const id = poi.osm_type + "/" + poi.osm_id
        const layers = Array.from(perLayer?.values() ?? [])
        for (const layer of layers) {
          const found = layer.features.data.find((f) => f.properties.id === id)
          if (found === undefined) {
            continue;
          }
          selectedElement?.setData(found);
          console.log("Found an element that probably matches:", selectedElement?.data);
          break;
        }
      }
      if (clearAfterView) {
        searchContents = ""
      }
      dispatch("searchIsValid", false)
      dispatch("searchCompleted")
    } catch (e) {
      console.error(e)
      feedback = Translations.t.general.search.error.txt
    } finally {
      isRunning = false
    }
  }
</script>

<div class="normal-background flex justify-between rounded-full pl-2">
  <form class="w-full">
    {#if isRunning}
      <Loading>{Translations.t.general.search.searching}</Loading>
    {:else if feedback !== undefined}
      <div class="alert" on:click={() => (feedback = undefined)}>
        {feedback}
      </div>
    {:else}
      <input
        type="search"
        class="w-full"
        bind:this={inputElement}
        on:keypress={(keypr) => (keypr.key === "Enter" ? performSearch() : undefined)}
        bind:value={searchContents}
        placeholder={Translations.t.general.search.search}
      />
    {/if}
  </form>
  <div class="h-6 w-6 self-end" on:click={performSearch}>
    <ToSvelte construct={Svg.search_svg} />
  </div>
</div>
