<script lang="ts">
  /**
   * The comparison tool loads json-data from a speficied URL, eventually post-processes it
   * and compares it with the current object
   */
  import Loading from "../Base/Loading.svelte"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import ComparisonTable from "./ComparisonTable.svelte"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import type { Feature } from "geojson"
  import type { OsmTags } from "../../Models/OsmFeature"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"
  import AccordionSingle from "../Flowbite/AccordionSingle.svelte"
  import GlobeAlt from "@babeard/svelte-heroicons/mini/GlobeAlt"
  import { ComparisonState } from "./ComparisonState"

  export let externalData: Store<
    | { success: { content: Record<string, string> } }
    | { error: string }
    | undefined
    | null /* null if no URL is found, undefined if loading*/
  >
  export let state: SpecialVisualizationState
  export let tags: UIEventSource<OsmTags>
  export let layer: LayerConfig
  export let feature: Feature
  export let readonly = false
  export let sourceUrl: Store<string>

  export let collapsed: boolean
  const t = Translations.t.external

  let comparisonState: Store<ComparisonState | undefined> = externalData.mapD((external) => {
    if (external["success"]) {
      return new ComparisonState(tags, external["success"])
    }
    return undefined
  })
  let unknownImages = comparisonState.bindD((ct) => ct.unknownImages)
  let knownImages = comparisonState.bindD((ct) => ct.knownImages)
  let propertyKeysExternal = comparisonState.mapD((ct) => ct.propertyKeysExternal)
  let hasDifferencesAtStart = comparisonState.mapD((ct) => ct.hasDifferencesAtStart)
</script>

{#if !$sourceUrl}
  <!-- empty block -->
{:else if $externalData === undefined}
  <Loading />
{:else if $externalData["error"] !== undefined}
  <div class="subtle low-interaction rounded p-2 px-4 italic">
    <Tr t={Translations.t.external.error} />
  </div>
{:else if $propertyKeysExternal.length === 0 && $knownImages.size + $unknownImages.length === 0}
  <Tr cls="subtle" t={t.noDataLoaded} />
{:else if !$hasDifferencesAtStart}
  <span class="subtle text-sm">
    <Tr t={t.allIncluded.Subs({ source: $sourceUrl })} />
  </span>
{:else if $comparisonState !== undefined}
  <AccordionSingle expanded={!collapsed}>
    <span slot="header" class="flex">
      <GlobeAlt class="h-6 w-6" />
      <Tr t={Translations.t.external.title} />
    </span>
    <ComparisonTable
      externalProperties={$externalData["success"]}
      {state}
      {feature}
      {layer}
      {tags}
      {readonly}
      sourceUrl={$sourceUrl}
      comparisonState={$comparisonState}
    />
  </AccordionSingle>
{/if}
