<script lang="ts">
  import { GeocodingUtils } from "../../Logic/Search/GeocodingProvider"
  import type { GeocodeResult } from "../../Logic/Search/GeocodingProvider"
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
  import DefaultIcon from "../Map/DefaultIcon.svelte"

  export let entry: GeocodeResult
  export let state: SpecialVisualizationState

  let layer: LayerConfig
  let tags: UIEventSource<Record<string, string>>
  let descriptionTr: TagRenderingConfig = undefined
  if (entry.feature?.properties?.id) {
    layer = state.theme.getMatchingLayer(entry.feature.properties)
    tags = state.featureProperties.getStore(entry.feature.properties.id)
    descriptionTr = layer?.tagRenderings?.find((tr) => tr.labels.indexOf("description") >= 0)
  }

  let distance = state.mapProperties.location.mapD((l) =>
    GeoOperations.distanceBetween([l.lon, l.lat], [entry.lon, entry.lat])
  )
  let bearing = state.mapProperties.location.mapD((l) =>
    GeoOperations.bearing([l.lon, l.lat], [entry.lon, entry.lat])
  )
  let mapRotation = state.mapProperties.rotation
  let inView = state.mapProperties.bounds.mapD((bounds) => bounds.contains([entry.lon, entry.lat]))

  function select() {
    if (entry.boundingbox) {
      const [lat0, lat1, lon0, lon1] = entry.boundingbox
      state.mapProperties.bounds.set(
        new BBox([
          [lon0, lat0],
          [lon1, lat1],
        ]).pad(0.01)
      )
    } else {
      state.mapProperties.flyTo(
        entry.lon,
        entry.lat,
        GeocodingUtils.categoryToZoomLevel[entry.category] ?? 17
      )
    }
    if (entry.feature?.properties?.id) {
      state.selectedElement.set(entry.feature)
    }
    state.userRelatedState.recentlyVisitedSearch.add(entry)
    state.searchState.closeIfFullscreen()
  }
</script>

<button class="unstyled link-no-underline searchresult w-full" on:click={() => select()}>
  <div class="flex w-full items-center gap-y-2 p-2">
    {#if layer}
      <div class="h-6">
        <DefaultIcon {layer} properties={entry.feature.properties} clss="w-6 h-6"/>
      </div>
    {:else if entry.category}
      <Icon
        icon={GeocodingUtils.categoryToIcon[entry.category]}
        clss="w-6 h-6 shrink-0"
        color="#aaa"
      />
    {/if}
    <div class="flex w-full flex-col items-start pl-2">
      <div class="flex w-full flex-wrap justify-between gap-x-2">
        <b class="nowrap">
          {#if layer && $tags?.id}
            <TagRenderingAnswer
              config={layer.title}
              selectedElement={entry.feature}
              {state}
              {tags}
              {layer}
            />
          {:else}
            {entry.display_name ?? entry.osm_id}
          {/if}
        </b>
        {#if $distance > 50}
          <div class="flex items-center gap-x-1">
            {#if $bearing && !$inView}
              <ArrowUp
                class="h-4 w-4 shrink-0"
                style={`transform: rotate(${$bearing - $mapRotation}deg)`}
              />
            {/if}
            {#if $distance}
              {GeoOperations.distanceToHuman($distance)}
            {/if}
          </div>
        {/if}
      </div>
      <div class="flex flex-wrap gap-x-2">
        {#if descriptionTr && tags}
          <TagRenderingAnswer
            defaultSize="subtle"
            noIcons={true}
            config={descriptionTr}
            {tags}
            {state}
            selectedElement={entry.feature}
            {layer}
          />
        {/if}
        {#if descriptionTr && tags && entry.description}
          –
        {/if}
        {#if entry.description}
          <div class="subtle flex w-full justify-between">
            {entry.description}
          </div>
        {/if}
      </div>
    </div>
  </div>
</button>
