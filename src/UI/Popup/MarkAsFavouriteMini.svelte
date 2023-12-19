<script lang="ts">
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import { HeartIcon as HeartSolidIcon } from "@babeard/svelte-heroicons/solid"
  import { HeartIcon as HeartOutlineIcon } from "@babeard/svelte-heroicons/outline"
  import Translations from "../i18n/Translations"
  import LoginToggle from "../Base/LoginToggle.svelte"
  import type { Feature } from "geojson"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"

  /**
   * A small 'mark as favourite'-button to serve as title-icon
   */
  export let state: SpecialVisualizationState
  export let feature: Feature
  export let tags: Record<string, string>
  export let layer: LayerConfig
  let isFavourite = tags?.map((tags) => tags._favourite === "yes")
  const t = Translations.t.favouritePoi

  function markFavourite(isFavourite: boolean) {
    state.favourites.markAsFavourite(feature, layer.id, state.layout.id, tags, isFavourite)
  }
</script>

<LoginToggle ignoreLoading={true} {state}>
  {#if $isFavourite}
    <button class="m-0 h-8 w-8 p-0" on:click={() => markFavourite(false)}>
      <HeartSolidIcon />
    </button>
  {:else}
    <button class="no-image-background m-0 h-8 w-8 p-0" on:click={() => markFavourite(true)}>
      <HeartOutlineIcon />
    </button>
  {/if}
</LoginToggle>
