<script lang="ts">
  import type { RasterLayerPolygon } from "../../Models/RasterLayers"
  import OverlayMap from "./OverlayMap.svelte"
  import type { MapProperties } from "../../Models/MapProperties"
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import { Map as MlMap } from "maplibre-gl"
  import { createEventDispatcher, onDestroy } from "svelte"

  /***
   * Chooses a background-layer out of available options
   */
  export let availableLayers: RasterLayerPolygon[]
  export let mapproperties: MapProperties
  export let map: Store<MlMap>

  export let visible: Store<boolean> = undefined

  let dispatch = createEventDispatcher<{ appliedLayer }>()

  export let favourite: UIEventSource<string> | undefined = undefined

  let rasterLayer = new UIEventSource<RasterLayerPolygon>(availableLayers[0])
  let rasterLayerId = rasterLayer.sync(
    (l) => l?.properties?.id,
    [],
    (id) => availableLayers.find((l) => l.properties.id === id),
  )
  rasterLayer.setData(availableLayers[0])
  $: rasterLayer.setData(availableLayers[0])

  if (favourite) {
    onDestroy(
      favourite.addCallbackAndRunD((favourite) => {
        const fav = availableLayers?.find((l) => l.properties.id === favourite)
        if (!fav) {
          return
        }
        rasterLayer.setData(fav)
      }),
    )

    onDestroy(
      rasterLayer.addCallbackAndRunD((selected) => {
        favourite?.setData(selected.properties.id)
      }),
    )
  }

  let rasterLayerOnMap = UIEventSource.feedFrom(rasterLayer)

  if (visible) {
    onDestroy(
      visible?.addCallbackAndRunD((visible) => {
        if (visible) {
          rasterLayerOnMap.setData(rasterLayer.data ?? availableLayers[0])
        } else {
          rasterLayerOnMap.setData(undefined)
        }
      }),
    )
  }

  function apply() {
    mapproperties.rasterLayer.setData(rasterLayer.data)
    dispatch("appliedLayer")
  }

  function handleKeyPress(e: KeyboardEvent) {
    if (e.key === "Enter") {
      apply()
    }
  }
</script>

{#if availableLayers?.length > 0}
  <form class="flex h-full w-full flex-col" on:submit|preventDefault={() => {}}>
    <button
      tabindex="-1"
      on:click={() => apply()}
      class="m-0 h-full w-full cursor-pointer rounded-none border-none p-0"
    >
      <span class="pointer-events-none relative h-full w-full">
        <OverlayMap
          interactive={false}
          rasterLayer={rasterLayerOnMap}
          placedOverMap={map}
          placedOverMapProperties={mapproperties}
          {visible}
        />
      </span>
    </button>
    <select bind:value={$rasterLayerId} class="w-full" on:keydown={handleKeyPress}>
      {#each availableLayers as availableLayer}
        <option value={availableLayer.properties.id}>
          {availableLayer.properties.name}
          {#if availableLayer.properties.category.startsWith("historic")}
            ⏱️
          {/if}
          {#if availableLayer.properties.category.endsWith("elevation")}
            ⛰
          {/if}
          {#if availableLayer.properties.best}
            ⭐
          {/if}
        </option>
      {/each}
    </select>
  </form>
{/if}
