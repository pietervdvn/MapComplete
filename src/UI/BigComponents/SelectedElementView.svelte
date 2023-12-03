<script lang="ts">
  import type { Feature } from "geojson"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import TagRenderingEditable from "../Popup/TagRendering/TagRenderingEditable.svelte"
  import { onDestroy } from "svelte"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"

  export let state: SpecialVisualizationState
  export let layer: LayerConfig
  export let selectedElement: Feature
  export let tags: UIEventSource<Record<string, string>>
  export let highlightedRendering: UIEventSource<string> = undefined

  let _metatags: Record<string, string>
  onDestroy(
    state.userRelatedState.preferencesAsTags.addCallbackAndRun((tags) => {
      _metatags = tags
    })
  )

  let knownTagRenderings = layer.tagRenderings.filter(
    (config) =>
      (config.condition?.matchesProperties($tags) ?? true) &&
      config.metacondition?.matchesProperties({ ...$tags, ..._metatags } ?? true) &&
      config.IsKnown($tags)
  )
  $: {
    knownTagRenderings = layer.tagRenderings.filter(
      (config) =>
        (config.condition?.matchesProperties($tags) ?? true) &&
        config.metacondition?.matchesProperties({ ...$tags, ..._metatags } ?? true) &&
        config.IsKnown($tags)
    )
  }
</script>

{#if $tags._deleted === "yes"}
  <Tr t={Translations.t.delete.isDeleted} />
  <button class="w-full" on:click={() => state.selectedElement.setData(undefined)}>
    <Tr t={Translations.t.general.returnToTheMap} />
  </button>
{:else}
  <div class="flex h-full flex-col gap-y-2 overflow-y-auto p-1 px-2">
    {#each knownTagRenderings as config (config.id)}
      <TagRenderingEditable
        {tags}
        {config}
        {state}
        {selectedElement}
        {layer}
        {highlightedRendering}
        clss={knownTagRenderings.length === 1 ? "h-full" : "tr-length-" + knownTagRenderings.length}
      />
    {/each}
  </div>
{/if}
