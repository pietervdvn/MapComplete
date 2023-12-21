<script lang="ts">
  import type { Feature } from "geojson"
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import TagRenderingAnswer from "../Popup/TagRendering/TagRenderingAnswer.svelte"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"
  import { XCircleIcon } from "@rgossiaux/svelte-heroicons/solid"
  import { ariaLabel } from "../../Utils/ariaLabel"

  export let state: SpecialVisualizationState
  export let layer: LayerConfig
  export let selectedElement: Feature
  let tags: UIEventSource<Record<string, string>> = state.featureProperties.getStore(
    selectedElement.properties.id
  )
  $: {
    tags = state.featureProperties.getStore(selectedElement.properties.id)
  }

  let metatags: Store<Record<string, string>> = state.userRelatedState.preferencesAsTags
</script>

{#if $tags._deleted === "yes"}
  <Tr t={Translations.t.delete.isDeleted} />
{:else}
  <div
    class="low-interaction flex items-center justify-between border-b-2 border-black px-3 drop-shadow-md"
  >
    <div class="flex flex-col">
      <!-- Title element-->
      <h3>
        <a href={`#${$tags.id}`}>
        <TagRenderingAnswer config={layer.title} {selectedElement} {state} {tags} {layer} />
        </a>
      </h3>
      
      <div
        class="no-weblate title-icons links-as-button mr-2 flex flex-row flex-wrap items-center gap-x-0.5 p-1 pt-0.5 sm:pt-1"
      >
        {#each layer.titleIcons as titleIconConfig}
          {#if (titleIconConfig.condition?.matchesProperties($tags) ?? true) && (titleIconConfig.metacondition?.matchesProperties( { ...$metatags, ...$tags } ) ?? true) && titleIconConfig.IsKnown($tags)}
            <div class={titleIconConfig.renderIconClass ?? "flex h-8 w-8 items-center"}>
              <TagRenderingAnswer
                config={titleIconConfig}
                {tags}
                {selectedElement}
                {state}
                {layer}
                extraClasses="h-full justify-center"
              />
            </div>
          {/if}
        {/each}
      </div>
    </div>

    <button
      on:click={() => state.selectedElement.setData(undefined)}
      use:ariaLabel={Translations.t.general.backToMap}
      class="rounded-full border-none p-0"
    >
      <XCircleIcon aria-hidden={true} class="h-8 w-8" />
    </button>
  </div>
{/if}

<style>
  :global(.title-icons a) {
    display: block !important;
  }
</style>
