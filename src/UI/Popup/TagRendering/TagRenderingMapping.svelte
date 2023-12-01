<script lang="ts">
  import { Translation } from "../../i18n/Translation"
  import SpecialTranslation from "./SpecialTranslation.svelte"
  import type { SpecialVisualizationState } from "../../SpecialVisualization"
  import type { Feature } from "geojson"
  import { UIEventSource } from "../../../Logic/UIEventSource"
  import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
  import { twJoin } from "tailwind-merge"

  export let selectedElement: Feature
  export let tags: UIEventSource<Record<string, string>>
  export let state: SpecialVisualizationState
  export let layer: LayerConfig

  export let mapping: {
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
  }
</script>

{#if mapping.icon !== undefined}
  <div class="inline-flex items-center">
    <img
      class={twJoin(`mapping-icon-${mapping.iconClass}`, "mr-1")}
      src={mapping.icon}
      aria-hidden="true"
      alt=""
    />
    <SpecialTranslation t={mapping.then} {tags} {state} {layer} feature={selectedElement} />
  </div>
{:else if mapping.then !== undefined}
  <SpecialTranslation t={mapping.then} {tags} {state} {layer} feature={selectedElement} />
{/if}
