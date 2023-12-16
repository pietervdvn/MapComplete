<script lang="ts">
  import type { Feature } from "geojson"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import TagRenderingAnswer from "../Popup/TagRendering/TagRenderingAnswer.svelte"
  import { GeoOperations } from "../../Logic/GeoOperations"
  import { Store } from "../../Logic/UIEventSource"

  export let state: SpecialVisualizationState
  export let feature: Feature
  export let i: number = undefined
  let id = feature.properties.id
  let tags = state.featureProperties.getStore(id)
  let layer: LayerConfig = state.layout.getMatchingLayer(tags.data)

  function select() {
    state.selectedElement.setData(undefined)
    state.selectedLayer.setData(layer)
    state.selectedElement.setData(feature)
  }

  let bearingAndDist: Store<{ bearing: number, dist: number }> = state.mapProperties.location.map(l => {
      let fcenter = GeoOperations.centerpointCoordinates(feature)
      let mapCenter = [l.lon, l.lat]

      let bearing = Math.round(GeoOperations.bearing(fcenter, mapCenter))
      let dist = Math.round(GeoOperations.distanceBetween(fcenter, mapCenter))
      return { bearing, dist }
    },
  )
</script>

<button class="cursor-pointer small flex" on:click={() => select()}>
  {#if i !== undefined}
    <span class="font-bold">{i + 1}.</span>
  {/if}
  <TagRenderingAnswer config={layer.title} {layer} selectedElement={feature} {state} {tags} />
  <span class="flex">{$bearingAndDist.dist}m {$bearingAndDist.bearing}°</span>
</button>
