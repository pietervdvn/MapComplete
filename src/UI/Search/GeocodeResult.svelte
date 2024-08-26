<script lang="ts">
  import { GeocodingUtils } from "../../Logic/Geocoding/GeocodingProvider"
  import type { GeocodeResult } from "../../Logic/Geocoding/GeocodingProvider"
  import { GeoOperations } from "../../Logic/GeoOperations"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig"
  import { createEventDispatcher } from "svelte"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import { BBox } from "../../Logic/BBox"
  import ToSvelte from "../Base/ToSvelte.svelte"
  import Icon from "../Map/Icon.svelte"
  import TagRenderingAnswer from "../Popup/TagRendering/TagRenderingAnswer.svelte"
  import ArrowUp from "@babeard/svelte-heroicons/mini/ArrowUp"

  export let entry: GeocodeResult
  export let state: SpecialVisualizationState

  let layer: LayerConfig
  let tags: UIEventSource<Record<string, string>>
  let descriptionTr: TagRenderingConfig = undefined
  if (entry.feature?.properties?.id) {
    layer = state.layout.getMatchingLayer(entry.feature.properties)
    tags = state.featureProperties.getStore(entry.feature.properties.id)
    descriptionTr = layer.tagRenderings.find(tr => tr.labels.indexOf("description") >= 0)
  }

  let dispatch = createEventDispatcher<{ select }>()
  let distance = state.mapProperties.location.mapD(l => GeoOperations.distanceBetween([l.lon, l.lat], [entry.lon, entry.lat]))
  let bearing = state.mapProperties.location.mapD(l => GeoOperations.bearing([l.lon, l.lat], [entry.lon, entry.lat]))
  let mapRotation = state.mapProperties.rotation
  let inView = state.mapProperties.bounds.mapD(bounds => bounds.contains([entry.lon, entry.lat]))


  function select() {
    if (entry.boundingbox) {
      const [lat0, lat1, lon0, lon1] = entry.boundingbox
      state.mapProperties.bounds.set(
        new BBox([
          [lon0, lat0],
          [lon1, lat1],
        ]).pad(0.01),
      )
    } else {
      state.mapProperties.flyTo(entry.lon, entry.lat, GeocodingUtils.categoryToZoomLevel[entry.category] ?? 17)
    }
    if (entry.feature?.properties?.id) {
      state.selectedElement.set(entry.feature)
    }
    state.recentlySearched.addSelected(entry)
    dispatch("select")
  }
</script>

<button class="unstyled w-full link-no-underline searchresult" on:click={() => select() }>
  <div class="p-2 flex items-center w-full gap-y-2">
    {#if layer}
      <ToSvelte construct={() => layer.defaultIcon(entry.feature.properties).SetClass("w-6 h-6")} />
    {:else if entry.category}
      <Icon icon={GeocodingUtils.categoryToIcon[entry.category]} clss="w-6 h-6 shrink-0" color="#aaa" />
    {/if}
    <div class="flex flex-col items-start pl-2 w-full">
      <div class="flex flex-wrap gap-x-2 justify-between w-full">
        <b class="nowrap">
          {#if layer && $tags?.id}
            <TagRenderingAnswer config={layer.title} selectedElement={entry.feature} {state} {tags} {layer} />
          {:else}
            {entry.display_name ?? entry.osm_id}
          {/if}
        </b>
        {#if $distance > 50}
          <div class="flex gap-x-1 items-center">
            {#if $bearing && !$inView}
              <ArrowUp class="w-4 h-4 shrink-0" style={`transform: rotate(${$bearing - $mapRotation}deg)`} />
            {/if}
            {#if $distance}
              {GeoOperations.distanceToHuman($distance)}
            {/if}
          </div>
        {/if}
      </div>
      <div class="flex flex-wrap gap-x-2">

        {#if descriptionTr}
          <TagRenderingAnswer defaultSize="subtle" noIcons={true} config={descriptionTr} {tags} {state}
                              selectedElement={entry.feature} {layer} />
        {/if}
        {#if descriptionTr && entry.description}
          –
        {/if}
        {#if entry.description}
          <div class="subtle flex justify-between w-full">
            {entry.description}
          </div>
        {/if}
      </div>

    </div>
  </div>
</button>
