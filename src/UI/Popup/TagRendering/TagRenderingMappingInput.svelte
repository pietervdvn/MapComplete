<script lang="ts">
  /**
   * A thin wrapper around 'TagRenderingMapping'.
   * As extra, it contains:
   * - a slot to place an input element (such as a radio or checkbox)
   * - It'll hide the mapping if the searchterm does not match
   */
  import type { Feature } from "geojson"
  import { ImmutableStore, Store, UIEventSource } from "../../../Logic/UIEventSource"
  import type { SpecialVisualizationState } from "../../SpecialVisualization"
  import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
  import Locale from "../../i18n/Locale"
  import type { Mapping } from "../../../Models/ThemeConfig/TagRenderingConfig"
  import { TagsFilter } from "../../../Logic/Tags/TagsFilter"
  import { onDestroy } from "svelte"
  import TagRenderingMapping from "./TagRenderingMapping.svelte"
  import { twJoin } from "tailwind-merge"

  export let selectedElement: Feature
  export let tags: UIEventSource<Record<string, string>>
  export let state: SpecialVisualizationState
  export let layer: LayerConfig

  export let mapping: Mapping
  /**
   * If the mapping is selected, it should always be shown
   */
  export let mappingIsSelected: boolean

  /**
   * If there are many mappings, we might hide it.
   * This is the searchterm where it might hide
   */
  export let searchTerm: undefined | UIEventSource<string>

  $: {
    if (selectedElement !== undefined || mapping !== undefined) {
      searchTerm.setData(undefined)
    }
  }

  let matchesTerm: Store<boolean> | undefined =
    searchTerm?.map(
      (search) => {
        if (!search) {
          return true
        }
        if (mappingIsSelected) {
          return true
        }
        search = search.toLowerCase()
        // There is a searchterm - this might hide the mapping
        if (mapping.priorityIf?.matchesProperties(tags.data)) {
          return true
        }
        if (mapping.then.txt.toLowerCase().indexOf(search) >= 0) {
          return true
        }
        const searchTerms = mapping?.searchTerms?.[Locale.language.data]
        if (searchTerms?.some((t) => t.toLowerCase().indexOf(search) >= 0)) {
          return true
        }
        return false
      },
      [],
      onDestroy
    ) ?? new ImmutableStore(true)

  let mappingIsHidden: Store<boolean> = tags.map(
    (tags) => {
      if (mapping.hideInAnswer === undefined || mapping.hideInAnswer === false) {
        return false
      }
      if (mapping.hideInAnswer === true) {
        return true
      }

      return (<TagsFilter>mapping.hideInAnswer).matchesProperties(tags)
    },
    [],
    onDestroy
  )
</script>

{#if $matchesTerm && !$mappingIsHidden}
  <label class={twJoin("flex gap-x-1", mappingIsSelected && "checked")}>
    <slot />
    <TagRenderingMapping {mapping} {tags} {state} {selectedElement} {layer} />
  </label>
{/if}
