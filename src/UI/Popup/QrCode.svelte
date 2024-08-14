<script lang="ts">
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import type { Feature } from "geojson"
  import Loading from "../Base/Loading.svelte"
  import Qr from "../../Utils/Qr"
  import { GeoOperations } from "../../Logic/GeoOperations"

  const smallSize = 100
  const bigSize = 200
  let size = new UIEventSource(smallSize)

  export let state: SpecialVisualizationState
  export let tags: UIEventSource<Record<string, string>>
  export let feature: Feature

  let [lon, lat] = GeoOperations.centerpointCoordinates(feature)

  const includeLayout = window.location.pathname.split("/").at(-1).startsWith("theme")
  const layout = includeLayout ? "layout=" + state.layout.id + "&" : ""
  let id: Store<string> = tags.mapD((tags) => tags.id)
  let url = id.mapD(
    (id) =>
      `${window.location.protocol}//${window.location.host}${window.location.pathname}?${layout}lat=${lat}&lon=${lon}&z=15` +
      `#${id}`
  )

  function toggleSize() {
    if (size.data !== bigSize) {
      size.setData(bigSize)
    } else {
      size.setData(smallSize)
    }
  }
</script>

{#if $id.startsWith("node/-")}
  <!-- Not yet uploaded, doesn't have a fixed ID -->
  <Loading />
{:else}
  <img
    on:click={() => toggleSize()}
    src={new Qr($url).toImageElement($size)}
    style={`width: ${$size}px; height: ${$size}px`}
  />
{/if}
