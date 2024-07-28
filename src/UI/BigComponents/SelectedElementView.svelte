<script lang="ts">
  import type { Feature } from "geojson"
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import { onDestroy } from "svelte"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"
  import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig"
  import Delete_icon from "../../assets/svg/Delete_icon.svelte"
  import BackButton from "../Base/BackButton.svelte"
  import TagRenderingEditableDynamic from "../Popup/TagRendering/TagRenderingEditableDynamic.svelte"
  import { LastClickFeatureSource } from "../../Logic/FeatureSource/Sources/LastClickFeatureSource"

  export let state: SpecialVisualizationState
  export let selectedElement: Feature
  export let highlightedRendering: UIEventSource<string> = undefined

  export let tags: UIEventSource<Record<string, string>> = state?.featureProperties?.getStore(
    selectedElement.properties.id
  )

  let isAddNew = tags.mapD(
    (t) => t?.id?.startsWith(LastClickFeatureSource.newPointElementId) ?? false
  )


  export let layer: LayerConfig

  let _metatags: Record<string, string>
  if (state?.userRelatedState?.preferencesAsTags) {
    onDestroy(
      state.userRelatedState.preferencesAsTags.addCallbackAndRun((tags) => {
        _metatags = tags
      })
    )
  }

  let knownTagRenderings: Store<TagRenderingConfig[]> = tags.mapD((tgs) =>
    layer?.tagRenderings?.filter(
      (config) =>
        (config.condition?.matchesProperties(tgs) ?? true) &&
        (config.metacondition?.matchesProperties({ ...tgs, ..._metatags }) ?? true) &&
        config.IsKnown(tgs)
    )
  )
</script>

{#if $tags._deleted === "yes"}
  <div class="flex w-full flex-col p-2">
    <div aria-live="assertive" class="alert flex items-center justify-center self-stretch">
      <Delete_icon class="m-2 h-8 w-8" />
      <Tr t={Translations.t.delete.isDeleted} />
    </div>
    <BackButton clss="self-stretch mt-4" on:click={() => state.selectedElement.setData(undefined)}>
      <Tr t={Translations.t.general.returnToTheMap} />
    </BackButton>
  </div>
{:else}
  <div
    class="selected-element-view flex h-full w-full flex-col gap-y-1 overflow-y-auto"
    class:p1={!$isAddNew}
    class:px-4={!$isAddNew}
    tabindex="-1"
  >
    {#each $knownTagRenderings as config (config.id)}
      <TagRenderingEditableDynamic
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
