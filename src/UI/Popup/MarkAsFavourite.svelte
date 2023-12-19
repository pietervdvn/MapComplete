<script lang="ts">
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import { HeartIcon as HeartSolidIcon } from "@babeard/svelte-heroicons/solid"
  import { HeartIcon as HeartOutlineIcon } from "@babeard/svelte-heroicons/outline"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import LoginToggle from "../Base/LoginToggle.svelte"
  import type { Feature } from "geojson"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"

  /**
   * A full-blown 'mark as favourite'-button
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
    <div class="flex h-fit items-start">
      <HeartSolidIcon class="mr-2 w-16 shrink-0" on:click={() => markFavourite(false)} />
      <div class="flex w-full flex-col">
        <button class="flex flex-col items-start" on:click={() => markFavourite(false)}>
          <Tr t={t.button.unmark} />
          <Tr cls="normal-font subtle" t={t.button.unmarkNotDeleted} />
        </button>
      </div>
    </div>
    <Tr cls="font-bold thanks m-2 p-2 block" t={t.button.isFavourite} />
  {:else}
    <div class="flex items-start">
      <HeartOutlineIcon class="mr-2 w-16 shrink-0" on:click={() => markFavourite(true)} />
      <button class="flex w-full flex-col items-start" on:click={() => markFavourite(true)}>
        <Tr t={t.button.markAsFavouriteTitle} />
        <Tr cls="normal-font subtle" t={t.button.markDescription} />
      </button>
    </div>
  {/if}
</LoginToggle>
