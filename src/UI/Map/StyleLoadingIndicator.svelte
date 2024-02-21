<script lang="ts">
  import Loading from "../Base/Loading.svelte"
  import { Stores, UIEventSource } from "../../Logic/UIEventSource"
  import { Map as MlMap } from "maplibre-gl"
  import { onDestroy } from "svelte"

  let isLoading = false
  export let map: UIEventSource<MlMap>
  onDestroy(Stores.Chronic(250).addCallback(
    () => {
      isLoading = !map.data?.isStyleLoaded()
    },
  ))
</script>


{#if isLoading}
  <Loading />
{/if}
