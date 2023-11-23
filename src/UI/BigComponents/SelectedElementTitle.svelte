<script lang="ts">
  import type { Feature } from "geojson"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import TagRenderingAnswer from "../Popup/TagRendering/TagRenderingAnswer.svelte"
  import { onDestroy } from "svelte"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"
  import { XCircleIcon } from "@rgossiaux/svelte-heroicons/solid"

  export let state: SpecialVisualizationState
  export let layer: LayerConfig
  export let selectedElement: Feature
  export let tags: UIEventSource<Record<string, string>>

  let _tags: Record<string, string>
  onDestroy(
    tags.addCallbackAndRun((tags) => {
      _tags = tags
    })
  )

  let _metatags: Record<string, string>
  onDestroy(
    state.userRelatedState.preferencesAsTags.addCallbackAndRun((tags) => {
      _metatags = tags
    })
  )
</script>

{#if _tags._deleted === "yes"}
  <Tr t={Translations.t.delete.isDeleted} />
{:else}
  <div
    class="low-interaction flex items-center justify-between border-b-2 border-black px-3 drop-shadow-md"
  >
    <div class="flex flex-col">
      <!-- Title element-->
      <h3>
        <TagRenderingAnswer config={layer.title} {selectedElement} {state} {tags} {layer} />
      </h3>
      <div
        class="no-weblate title-icons links-as-button mr-2 flex flex-row flex-wrap items-center gap-x-0.5 p-1 pt-0.5 sm:pt-1"
      >
        {#each layer.titleIcons as titleIconConfig}
          {#if (titleIconConfig.condition?.matchesProperties(_tags) ?? true) && (titleIconConfig.metacondition?.matchesProperties( { ..._metatags, ..._tags } ) ?? true) && titleIconConfig.IsKnown(_tags)}
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
    <XCircleIcon
      class="h-8 w-8 cursor-pointer"
      on:click={() => state.selectedElement.setData(undefined)}
    />
  </div>
{/if}

<style>
  :global(.title-icons a) {
    display: block !important;
  }
</style>
