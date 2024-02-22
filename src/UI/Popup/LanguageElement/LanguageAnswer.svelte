<script lang="ts">
  import { Store, UIEventSource } from "../../../Logic/UIEventSource"
  import SpecialTranslation from "../TagRendering/SpecialTranslation.svelte"
  import { Translation, TypedTranslation } from "../../i18n/Translation"
  import type { SpecialVisualizationState } from "../../SpecialVisualization"
  import type { Feature } from "geojson"
  import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
  import * as all_languages from "../../../assets/language_translations.json"

  /**
   * Visualizes a list of the known languages
   */
  export let languages: Store<string[]>
  export let single_render: string
  export let item_render: string
  export let render_all: string // Should contain one `{list()}`

  export let tags: UIEventSource<Record<string, string>>

  export let state: SpecialVisualizationState
  export let feature: Feature
  export let layer: LayerConfig | undefined

  let [beforeListing, afterListing] = (render_all ?? "{list()}").split("{list()}")
</script>

{#if $languages.length === 1}
  <SpecialTranslation
    {state}
    {tags}
    {feature}
    {layer}
    t={new TypedTranslation({ "*": single_render }).PartialSubsTr(
      "language()",
      new Translation(all_languages[$languages[0]], undefined)
    )}
  />
{:else}
  {beforeListing}
  <ul>
    {#each $languages as language}
      <li>
        <SpecialTranslation
          {state}
          {tags}
          {feature}
          {layer}
          t={new TypedTranslation({ "*": item_render }).PartialSubsTr(
            "language()",
            new Translation(all_languages[language], undefined)
          )}
        />
      </li>
    {/each}
  </ul>
  {afterListing}
{/if}
