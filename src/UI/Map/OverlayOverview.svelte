<script lang="ts">
  /**
   * The OverlayOverview shows all available and lets users toggle them using checkboxes
   */
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import type { MapProperties } from "../../Models/MapProperties"

  import { onMount } from "svelte"

  export let mapproperties: MapProperties

  let overlays = mapproperties.overlays

  onMount(() => {})
</script>

<div class="flex h-full flex-col">
  <slot name="title">
    <h3>Current Overlays</h3>
  </slot>

  <ul>
    {#each $overlays as overlay}
      <li>
        <button
          on:click={() => {
            mapproperties.overlays.setData(
              mapproperties.overlays.data.filter((o) => o.properties.id !== overlay.properties.id)
            )
          }}
        >
          Remove
        </button>
        <button
          on:click={() => {
            const index = mapproperties.overlays.data.findIndex(
              (o) => o.properties.id === overlay.properties.id
            )
            if (index === 0) {
              return
            }
            const newOverlays = [...mapproperties.overlays.data]
            newOverlays[index] = mapproperties.overlays.data[index - 1]
            newOverlays[index - 1] = mapproperties.overlays.data[index]
            mapproperties.overlays.setData(newOverlays)
          }}
        >
          Move Up
        </button>
        <button
          on:click={() => {
            const index = mapproperties.overlays.data.findIndex(
              (o) => o.properties.id === overlay.properties.id
            )
            if (index === mapproperties.overlays.data.length - 1) {
              return
            }
            const newOverlays = [...mapproperties.overlays.data]
            newOverlays[index] = mapproperties.overlays.data[index + 1]
            newOverlays[index + 1] = mapproperties.overlays.data[index]
            mapproperties.overlays.setData(newOverlays)
          }}
        >
          Move Down
        </button>
        {overlay.properties.name}
      </li>
    {/each}
  </ul>
</div>
