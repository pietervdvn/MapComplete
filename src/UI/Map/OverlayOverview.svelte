<script lang="ts">
  /**
   * The OverlayOverview shows all available and lets users toggle them using checkboxes
   */
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import type { MapProperties } from "../../Models/MapProperties"
  import Delete_icon from "../../assets/svg/Delete_icon.svelte"

  export let mapproperties: MapProperties

  let overlays = mapproperties.overlays
</script>

<div class="flex h-full flex-col">
  <slot name="title">
    <h3><Tr t={Translations.t.general.overlay.current} /></h3>
  </slot>

  {#if $overlays.length === 0}
    <p><Tr t={Translations.t.general.overlay.none} /></p>
  {:else}
    <ul class="list-none">
      {#each $overlays as overlay}
        <li>
          <div class="flex space-x-2">
            <button
              on:click={() => {
                mapproperties.overlays.setData(
                  mapproperties.overlays.data.filter(
                    (o) => o.properties.id !== overlay.properties.id
                  )
                )
              }}
              aria-label={Translations.t.general.overlay.remove.toString()}
            >
              ❌
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
              aria-label={Translations.t.general.overlay.up.toString()}
            >
              ⬆️
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
              aria-label={Translations.t.general.overlay.down.toString()}
            >
              ⬇️
            </button>
            <div class="flex items-center">
              {overlay.properties.name}
            </div>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>
