<script lang="ts">
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import { HeartIcon as HeartSolidIcon } from "@babeard/svelte-heroicons/solid"
  import { HeartIcon as HeartOutlineIcon } from "@babeard/svelte-heroicons/outline"
  import Translations from "../i18n/Translations"
  import LoginToggle from "../Base/LoginToggle.svelte"
  import type { Feature } from "geojson"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import { ariaLabel } from "../../Utils/ariaLabel"
  import { UIEventSource } from "../../Logic/UIEventSource"

  /**
   * A small 'mark as favourite'-button to serve as title-icon
   */
  export let state: SpecialVisualizationState
  export let feature: Feature
  export let tags: UIEventSource<Record<string, string>>
  export let layer: LayerConfig
  let isFavourite = tags?.map((tags) => tags._favourite === "yes")
  const t = Translations.t.favouritePoi

  function markFavourite(isFavourite: boolean) {
    state.favourites.markAsFavourite(feature, layer.id, state.layout.id, tags, isFavourite)
  }
</script>

<LoginToggle ignoreLoading={true} {state}>
  {#if $isFavourite}
    <button
      class="soft no-image-background m-0 h-8 w-8 p-0"
      on:click={() => markFavourite(false)}
      use:ariaLabel={Translations.t.favouritePoi.button.isMarkedShort}
    >
      <HeartSolidIcon aria-hidden={true} />
    </button>
  {:else}
    <button
      class="no-image-background soft m-0 h-8 w-8 p-0"
      on:click={() => markFavourite(true)}
      use:ariaLabel={Translations.t.favouritePoi.button.isNotMarkedShort}
    >
      <HeartOutlineIcon aria-hidden={true} />
    </button>
  {/if}
</LoginToggle>
