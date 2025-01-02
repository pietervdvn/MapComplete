<script lang="ts">
  /**
   * Wrapper around 'tagRenderingEditable' but might add mappings dynamically
   *
   * Note: does not forward the 'save-button'-slot
   */
  import TagRenderingConfig, {
    TagRenderingConfigUtils,
  } from "../../../Models/ThemeConfig/TagRenderingConfig"
  import { UIEventSource } from "../../../Logic/UIEventSource"
  import type { Feature } from "geojson"
  import type { SpecialVisualizationState } from "../../SpecialVisualization"
  import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
  import TagRenderingQuestion from "./TagRenderingQuestion.svelte"
  import type { UploadableTag } from "../../../Logic/Tags/TagUtils"
  import { writable } from "svelte/store"
  import Translations from "../../i18n/Translations"
  import { twJoin } from "tailwind-merge"
  import Tr from "../../Base/Tr.svelte"
  import { TrashIcon } from "@rgossiaux/svelte-heroicons/solid"
  import Loading from "../../Base/Loading.svelte"

  export let config: TagRenderingConfig
  export let tags: UIEventSource<Record<string, string>>

  export let selectedElement: Feature
  export let state: SpecialVisualizationState
  export let layer: LayerConfig | undefined
  export let selectedTags: UploadableTag = undefined
  export let extraTags: UIEventSource<Record<string, string>> = new UIEventSource({})

  let dynamicConfig = TagRenderingConfigUtils.withNameSuggestionIndex(config, tags, selectedElement)
</script>

{#if $dynamicConfig }
  <TagRenderingQuestion
    {tags}
    config={$dynamicConfig}
    {state}
    {selectedElement}
    {layer}
    {selectedTags}
    {extraTags}
  >
    <slot name="cancel" slot="cancel" />
  </TagRenderingQuestion>
{:else}
  <Loading />
{/if}
