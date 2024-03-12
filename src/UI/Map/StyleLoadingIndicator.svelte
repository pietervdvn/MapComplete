<script lang="ts">
  import Loading from "../Base/Loading.svelte"
  import { Stores, UIEventSource } from "../../Logic/UIEventSource"
  import { Map as MlMap } from "maplibre-gl"
  import { onDestroy } from "svelte"

  let isLoading = false
  export let map: UIEventSource<MlMap>
  export let rasterLayer: UIEventSource<any> = undefined
  
  let didChange = undefined
  onDestroy(rasterLayer?.addCallback(() => {
    didChange = true
  }) ??( () => {}))
  
  onDestroy(Stores.Chronic(250).addCallback(
    () => {
      isLoading = !map.data?.isStyleLoaded() && (didChange === undefined || didChange)
      if(didChange){
        didChange = false
      }
    },
  ))
</script>


{#if isLoading}
  <Loading cls="h-6 w-6" />
{:else}
  <slot />
{/if}
