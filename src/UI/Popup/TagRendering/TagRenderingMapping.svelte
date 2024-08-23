<script lang="ts">
  import { Translation } from "../../i18n/Translation"
  import SpecialTranslation from "./SpecialTranslation.svelte"
  import type { SpecialVisualizationState } from "../../SpecialVisualization"
  import type { Feature } from "geojson"
  import { UIEventSource } from "../../../Logic/UIEventSource"
  import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
  import { twJoin } from "tailwind-merge"
  import Marker from "../../Map/Marker.svelte"

  export let selectedElement: Feature
  export let tags: UIEventSource<Record<string, string>>
  export let state: SpecialVisualizationState
  export let layer: LayerConfig

  /**
   * Css classes to apply
   */
  export let clss: string = "ml-2"
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
      | string
  }

  const emojiHeights = {
    "small":"2rem",
    "medium":"3rem",
    "large":"5rem"
  }
</script>

{#if mapping.icon !== undefined}
  <div class="inline-flex items-center">
    <Marker
      icons={mapping.icon}
      size={twJoin(
        `mapping-icon-${mapping.iconClass ?? "small"}-height mapping-icon-${
          mapping.iconClass ?? "small"
        }-width`,
        "shrink-0"
      )}

      emojiHeight={ emojiHeights[mapping.iconClass] ?? "2rem"}

      clss={`mapping-icon-${mapping.iconClass ?? "small"}`}
    />
    <SpecialTranslation t={mapping.then} {tags} {state} {layer} feature={selectedElement} {clss} />
  </div>
{:else if mapping.then !== undefined}
  <SpecialTranslation t={mapping.then} {tags} {state} {layer} feature={selectedElement} {clss} />
{/if}
