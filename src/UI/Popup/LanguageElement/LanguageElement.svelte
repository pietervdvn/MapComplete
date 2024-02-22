<script lang="ts">
  import { UIEventSource } from "../../../Logic/UIEventSource"
  import LanguageQuestion from "./LanguageQuestion.svelte"
  import LanguageAnswer from "./LanguageAnswer.svelte"
  import Tr from "../../Base/Tr.svelte"
  import Translations from "../../i18n/Translations"
  import type { SpecialVisualizationState } from "../../SpecialVisualization"
  import type { Feature } from "geojson"
  import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
  import EditButton from "../TagRendering/EditButton.svelte"

  export let key: string
  export let tags: UIEventSource<Record<string, string>>

  export let state: SpecialVisualizationState
  export let feature: Feature
  export let layer: LayerConfig | undefined

  export let question: string
  export let on_no_known_languages: string = undefined
  export let single_render: string
  export let item_render: string
  export let render_all: string // Should contain one `{list()}`
  let prefix = key + ":"
  let foundLanguages = tags.map((tags) => {
    const foundLanguages: string[] = []
    for (const k in tags) {
      const v = tags[k]
      if (v !== "yes") {
        continue
      }
      if (k.startsWith(prefix)) {
        foundLanguages.push(k.substring(prefix.length))
      }
    }
    return foundLanguages
  })

  const forceInputMode = new UIEventSource(false)
</script>

{#if $foundLanguages.length === 0 && on_no_known_languages && !$forceInputMode}
  <div class="low-interaction flex items-center justify-between rounded p-1">
    <div>
      {on_no_known_languages}
    </div>
    <EditButton on:click={(_) => forceInputMode.setData(true)} />
  </div>
{:else if $forceInputMode || $foundLanguages.length === 0}
  <LanguageQuestion
    {question}
    {foundLanguages}
    {prefix}
    {state}
    {tags}
    {feature}
    {layer}
    on:save={(_) => forceInputMode.setData(false)}
  >
    <span slot="cancel-button">
      {#if $forceInputMode}
        <button on:click={(_) => forceInputMode.setData(false)}>
          <Tr t={Translations.t.general.cancel} />
        </button>
      {/if}
    </span>
  </LanguageQuestion>
{:else}
  <div class="low-interaction flex items-center justify-between rounded p-2">
    <div>
      <LanguageAnswer
        {single_render}
        {item_render}
        {render_all}
        languages={foundLanguages}
        {state}
        {tags}
        {feature}
        {layer}
      />
    </div>
    <EditButton on:click={(_) => forceInputMode.setData(true)} />
  </div>
{/if}
