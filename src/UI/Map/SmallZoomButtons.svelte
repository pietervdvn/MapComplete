<script lang="ts">
  import Translations from "../i18n/Translations.js"
  import Min from "../../assets/svg/Min.svelte"
  import MapControlButton from "../Base/MapControlButton.svelte"
  import Plus from "../../assets/svg/Plus.svelte"
  import type { MapProperties } from "../../Models/MapProperties"

  export let adaptor: MapProperties
  let canZoomIn = adaptor.maxzoom.map((mz) => adaptor.zoom.data < mz, [adaptor.zoom])
  let canZoomOut = adaptor.minzoom.map((mz) => adaptor.zoom.data > mz, [adaptor.zoom])
</script>

<div class="pointer-events-none absolute bottom-0 right-0 flex flex-col">
  <MapControlButton
    enabled={canZoomIn}
    cls="m-0.5 p-1"
    arialabel={Translations.t.general.labels.zoomIn}
    on:click={() => adaptor.zoom.update((z) => z + 1)}
  >
    <Plus class="h-5 w-5" />
  </MapControlButton>
  <MapControlButton
    enabled={canZoomOut}
    cls={"m-0.5 p-1"}
    arialabel={Translations.t.general.labels.zoomOut}
    on:click={() => adaptor.zoom.update((z) => z - 1)}
  >
    <Min class="h-5 w-5" />
  </MapControlButton>
</div>
