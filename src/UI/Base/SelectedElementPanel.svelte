<script lang="ts">
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import type { Feature } from "geojson"
  import SelectedElementView from "../BigComponents/SelectedElementView.svelte"
  import SelectedElementTitle from "../BigComponents/SelectedElementTitle.svelte"
  import UserRelatedState from "../../Logic/State/UserRelatedState"
  import { LastClickFeatureSource } from "../../Logic/FeatureSource/Sources/LastClickFeatureSource"
  import Loading from "./Loading.svelte"
  import { onDestroy } from "svelte"

  export let state: SpecialVisualizationState
  export let selected: Feature
  let tags = state.featureProperties.getStore(selected.properties.id)

  export let absolute = true
  function getLayer(properties: Record<string, string>) {
    if (properties.id === "settings") {
      return UserRelatedState.usersettingsConfig
    }
    if (properties.id.startsWith(LastClickFeatureSource.newPointElementId)) {
      return state.layout.layers.find((l) => l.id === "last_click")
    }
    if (properties.id === "location_track") {
      return state.layout.layers.find((l) => l.id === "gps_track")
    }
    return state.layout.getMatchingLayer(properties)
  }

  let layer = getLayer(selected.properties)

  let stillMatches = tags.map(
    (tags) => !layer?.source?.osmTags || layer?.source?.osmTags?.matchesProperties(tags)
  )
  onDestroy(
    stillMatches.addCallbackAndRunD((matches) => {
      if (matches) {
        return
      }
      /*
       * This is a workaround. Normally, we would dynamically rewrite 'layer' and this should update the view.
       * However, because there are quite some legacy elements and some elements have a different layer calculation,
       * we simply close the popup and open it again.
       * See #1956
       */
      state.selectedElement.setData(undefined)
      requestAnimationFrame(() => {
        state.selectedElement.setData(selected)
      })
    })
  )
</script>

{#if !$stillMatches}
  <Loading />
{:else}
  <div class="normal-background flex h-full w-full flex-col" class:absolute>
    <SelectedElementTitle {state} {layer} selectedElement={selected} />
    <SelectedElementView {state} {layer} selectedElement={selected} />
  </div>
{/if}
