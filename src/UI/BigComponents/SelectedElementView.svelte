<script lang="ts">
  import type { Feature } from "geojson"
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import TagRenderingEditable from "../Popup/TagRendering/TagRenderingEditable.svelte"
  import { onDestroy } from "svelte"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"
  import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig"

  export let state: SpecialVisualizationState
  export let layer: LayerConfig
  export let selectedElement: Feature
  export let highlightedRendering: UIEventSource<string> = undefined

  export let tags: UIEventSource<Record<string, string>> = state.featureProperties.getStore(
    selectedElement.properties.id
  )

  let _metatags: Record<string, string>
  onDestroy(
    state.userRelatedState.preferencesAsTags.addCallbackAndRun((tags) => {
      _metatags = tags
    })
  )

  let knownTagRenderings: Store<TagRenderingConfig[]> = tags.mapD((tgs) =>
    layer.tagRenderings.filter(
      (config) =>
        (config.condition?.matchesProperties(tgs) ?? true) &&
        (config.metacondition?.matchesProperties({ ...tgs, ..._metatags }) ?? true) &&
        config.IsKnown(tgs)
    )
  )
</script>

{#if $tags._deleted === "yes"}
  <div aria-live="assertive">
    <Tr t={Translations.t.delete.isDeleted} />
  </div>
  <button class="w-full" on:click={() => state.selectedElement.setData(undefined)}>
    <Tr t={Translations.t.general.returnToTheMap} />
  </button>
{:else}
  <div class="flex h-full w-full flex-col gap-y-2 overflow-y-auto p-1 px-4" tabindex="-1">
    {#each $knownTagRenderings as config (config.id)}
      <TagRenderingEditable
        {tags}
        {config}
        {state}
        {selectedElement}
        {layer}
        {highlightedRendering}
        clss={$knownTagRenderings.length === 1
          ? "h-full"
          : "tr-length-" + $knownTagRenderings.length}
      />
    {/each}
  </div>
{/if}
