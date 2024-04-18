<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource"
  import type { OsmTags } from "../../Models/OsmFeature"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import type { Feature } from "geojson"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import ChangeTagAction from "../../Logic/Osm/Actions/ChangeTagAction"
  import { Tag } from "../../Logic/Tags/Tag"
  import TagRenderingAnswer from "../Popup/TagRendering/TagRenderingAnswer.svelte"
  import Loading from "../Base/Loading.svelte"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"

  export let key: string
  export let externalProperties: Record<string, string>

  export let tags: UIEventSource<OsmTags>
  export let state: SpecialVisualizationState
  let isTesting = state.featureSwitchIsTesting
  let isDebug = state.featureSwitches.featureSwitchIsDebugging
  let showTags = state.userRelatedState.showTags
  export let feature: Feature
  export let layer: LayerConfig

  export let readonly = false

  let currentStep: "init" | "applying" | "done" = "init"

  /**
   * Copy the given key into OSM
   * @param key
   */
  async function apply(key: string) {
    currentStep = "applying"
    const change = new ChangeTagAction(
      tags.data.id,
      new Tag(key, externalProperties[key]),
      tags.data,
      {
        theme: state.layout.id,
        changeType: "import",
      }
    )
    await state.changes.applyChanges(await change.CreateChangeDescriptions())
    currentStep = "done"
  }

  let _country = $tags["_country"]
  let mockPropertiesOsm = { id: feature.properties.id, [key]: $tags[key], _country }
  let mockPropertiesExternal = {
    id: feature.properties.id,
    [key]: externalProperties[key],
    _country,
  }
  let trsWithKeys = layer.tagRenderings.filter((tr) => {
    const keys: string[] = [].concat(...tr.usedTags().map((t) => t.usedKeys()))
    return keys.indexOf(key) >= 0
  })
  let renderingBoth = trsWithKeys.find(
    (tr) => tr.IsKnown(mockPropertiesOsm) && tr.IsKnown(mockPropertiesExternal)
  )
  let renderingExternal =
    renderingBoth ?? trsWithKeys.find((tr) => tr.IsKnown(mockPropertiesExternal))
  let onOverwrite = false
  const t = Translations.t.external
</script>

<div>
  <div class="interactive flex w-full justify-between py-1 px-2">
    <div class="flex flex-col">
      <div>
        {#if renderingExternal}
          <TagRenderingAnswer
            tags={new UIEventSource(mockPropertiesExternal)}
            selectedElement={feature}
            config={renderingExternal}
            {layer}
            {state}
          />
        {:else}
          <div class="flex items-center gap-x-1">
            <b>{key}</b>
            {externalProperties[key]}
          </div>
        {/if}
      </div>

      {#if !readonly && ($isTesting || $isDebug || $showTags === "yes" || $showTags === "always" || $showTags === "full")}
        <div class="subtle text-sm">
          {#if $tags[key] !== undefined}
            <span>
              OSM:
              {key}={$tags[key]}
            </span>
          {/if}
          <span>
            {key}= {externalProperties[key]}
          </span>
        </div>
      {/if}
    </div>

    {#if !readonly}
      {#if currentStep === "init"}
        <button
          class="small"
          on:click={() => apply(key)}
          on:mouseover={() => (onOverwrite = true)}
          on:focus={() => (onOverwrite = true)}
          on:blur={() => (onOverwrite = false)}
          on:mouseout={() => (onOverwrite = false)}
        >
          {#if $tags[key]}
            <Tr t={t.overwrite} />
          {:else}
            <Tr t={t.apply} />
          {/if}
        </button>
      {:else if currentStep === "applying"}
        <Loading />
      {:else if currentStep === "done"}
        <div class="thanks">
          <Tr t={t.done} />
        </div>
      {:else}
        <div class="alert">
          <Tr t={t.error} />
        </div>
      {/if}
    {/if}
  </div>
  {#if $tags[key] && $tags[key] !== externalProperties[key]}
    <div class:glowing-shadow={onOverwrite}>
      <span class="subtle">
        <Tr t={t.currentInOsmIs} />
      </span>
      {#if renderingBoth}
        <TagRenderingAnswer
          tags={new UIEventSource(mockPropertiesOsm)}
          selectedElement={feature}
          config={renderingBoth}
          {layer}
          {state}
        />
      {:else}
        <div class="flex items-center gap-x-2">
          <b>{key}</b>
          {$tags[key]}
        </div>
      {/if}
    </div>
  {/if}
</div>
