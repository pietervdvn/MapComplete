<script lang="ts">
  import { Translation } from "../../i18n/Translation"
  import SpecialTranslation from "./SpecialTranslation.svelte"
  import type { SpecialVisualizationState } from "../../SpecialVisualization"
  import type { Feature } from "geojson"
  import { UIEventSource } from "../../../Logic/UIEventSource"
  import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
  import { twJoin } from "tailwind-merge"
  import Marker from "../../Map/Marker.svelte"
  import ToSvelte from "../../Base/ToSvelte.svelte"
  import { And } from "../../../Logic/Tags/And"
  import { TagUtils } from "../../../Logic/Tags/TagUtils"
  import BaseUIElement from "../../BaseUIElement"
  import type { Mapping } from "../../../Models/ThemeConfig/TagRenderingConfig"
  import SvelteUIElement from "../../Base/SvelteUIElement"
  import Icon from "../../Map/Icon.svelte"
  import { TagsFilter } from "../../../Logic/Tags/TagsFilter"
  import DefaultIcon from "../../Map/DefaultIcon.svelte"

  export let selectedElement: Feature
  export let tags: UIEventSource<Record<string, string>>
  export let state: SpecialVisualizationState
  export let layer: LayerConfig
  export let noIcons = false

  /**
   * Css classes to apply
   */
  export let clss: string = "ml-2"
  export let mapping: {
    readonly if?: TagsFilter
    readonly then: Translation
    readonly searchTerms?: Record<string, string[]>
    readonly icon?: string
    readonly iconClass?:
      | "small"
      | "medium"
      | "large"
      | "small-height"
      | "medium-height"
      | "large-height"
      | string
  }

  const emojiHeights = {
    small: "2rem",
    medium: "3rem",
    large: "5rem",
  }

  function getAutoIcon(mapping: { readonly if?: TagsFilter }): Readonly<Record<string, string>> {
    for (const preset of layer.presets) {
      if (!new And(preset.tags).shadows(mapping.if)) {
        continue
      }

      return TagUtils.asProperties(preset.tags)
    }
    return undefined
  }
</script>

{#if mapping.icon !== undefined && !noIcons}
  <div class="inline-flex items-center">
    {#if mapping.icon === "auto"}
      <div class="mr-2 h-8 w-8 shrink-0">
        <DefaultIcon {layer} properties={getAutoIcon(mapping)} />
      </div>
    {:else}
      <Marker
        icons={mapping.icon}
        size={twJoin(
          "shrink-0",
          `mapping-icon-${mapping.iconClass ?? "small"}-height mapping-icon-${
            mapping.iconClass ?? "small"
          }-width`
        )}
        emojiHeight={emojiHeights[mapping.iconClass] ?? "2rem"}
        clss={`mapping-icon-${mapping.iconClass ?? "small"}`}
      />
    {/if}
    <SpecialTranslation t={mapping.then} {tags} {state} {layer} feature={selectedElement} {clss} />
  </div>
{:else if mapping.then !== undefined}
  <SpecialTranslation t={mapping.then} {tags} {state} {layer} feature={selectedElement} {clss} />
{/if}
