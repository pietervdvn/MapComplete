<script lang="ts">
  import LinkableImage from "../Image/LinkableImage.svelte"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import type { OsmTags } from "../../Models/OsmFeature"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import type { Feature } from "geojson"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import ComparisonAction from "./ComparisonAction.svelte"
  import Party from "../../assets/svg/Party.svelte"
  import ChangeTagAction from "../../Logic/Osm/Actions/ChangeTagAction"
  import { Tag } from "../../Logic/Tags/Tag"
  import { And } from "../../Logic/Tags/And"
  import Loading from "../Base/Loading.svelte"
  import AttributedImage from "../Image/AttributedImage.svelte"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"
  import { ComparisonState } from "./ComparisonState"

  export let externalProperties: Record<string, string>
  delete externalProperties["@context"]
  export let sourceUrl: string

  export let tags: UIEventSource<OsmTags>
  export let state: SpecialVisualizationState
  export let feature: Feature
  export let layer: LayerConfig

  export let readonly = false

  export let comparisonState : ComparisonState
  let missing = comparisonState.missing
  let unknownImages = comparisonState.unknownImages
  let knownImages = comparisonState.knownImages
  let different =comparisonState.different

  const t = Translations.t.external

  let currentStep: "init" | "applying_all" | "all_applied" = "init"
  let applyAllHovered = false

  async function applyAllMissing() {
    currentStep = "applying_all"
    const tagsToApply = missing.data.map((k) => new Tag(k, externalProperties[k]))
    const change = new ChangeTagAction(tags.data.id, new And(tagsToApply), tags.data, {
      theme: state.layout.id,
      changeType: "import",
    })
    await state.changes.applyChanges(await change.CreateChangeDescriptions())
    currentStep = "all_applied"
  }
</script>


{#if $unknownImages.length === 0 && $missing.length === 0 && $different.length === 0}
  <div class="thanks m-0 flex items-center gap-x-2 px-2">
    <Party class="h-8 w-8 shrink-0" />
    <Tr t={t.allIncluded.Subs({ source: sourceUrl })} />
  </div>
{:else}
    {#if !readonly}
      <Tr t={t.loadedFrom.Subs({ url: sourceUrl, source: sourceUrl })} />
    {/if}

    <div class="flex flex-col" class:gap-y-8={!readonly}>
      {#if $different.length > 0}
        {#if !readonly}
          <h3>
            <Tr t={t.conflicting.title} />
          </h3>
          <Tr t={t.conflicting.intro} />
        {/if}
        {#each $different as key (key)}
          <div class="mx-2 rounded-2xl">
            <ComparisonAction
              {key}
              {state}
              {tags}
              {externalProperties}
              {layer}
              {feature}
              {readonly}
            />
          </div>
        {/each}
      {/if}

      {#if $missing.length > 0}
        {#if !readonly}
          <h3 class="m-0">
            <Tr t={t.missing.title} />
          </h3>

          <Tr t={t.missing.intro} />
        {/if}
        {#if currentStep === "init"}
          {#each $missing as key (key)}
            <div class:focus={applyAllHovered} class="mx-2 rounded-2xl">
              <ComparisonAction
                {key}
                {state}
                {tags}
                {externalProperties}
                {layer}
                {feature}
                {readonly}
              />
            </div>
          {/each}
          {#if !readonly && $missing.length > 1}
            <button
              on:click={() => applyAllMissing()}
              on:mouseover={() => (applyAllHovered = true)}
              on:focus={() => (applyAllHovered = true)}
              on:blur={() => (applyAllHovered = false)}
              on:mouseout={() => (applyAllHovered = false)}
            >
              <Tr t={t.applyAll} />
            </button>
          {/if}
        {:else if currentStep === "applying_all"}
          <Loading />
        {:else if currentStep === "all_applied"}
          <div class="thanks">
            <Tr t={t.allAreApplied} />
          </div>
        {/if}
      {/if}
    </div>

    {#if $unknownImages.length > 0}
      {#if readonly}
        <div class="w-full overflow-x-auto">
          <div class="flex h-32 w-max gap-x-2">
            {#each $unknownImages as image (image)}
              <AttributedImage
                imgClass="h-32 w-max shrink-0"
                image={{ url: image }}
                previewedImage={state.previewedImage}
              />
            {/each}
          </div>
        </div>
      {:else}
        {#each $unknownImages as image (image)}
          <LinkableImage
            {tags}
            {state}
            image={{
              pictureUrl: image,
              provider: "Velopark",
              thumbUrl: image,
              details: undefined,
              coordinates: undefined,
              osmTags: { image },
            }}
            {feature}
            {layer}
          />
        {/each}
      {/if}
    {/if}
    {#if externalProperties["_last_edit_timestamp"] !== undefined}
      <span class="subtle text-sm flex flex-end justify-end mt-2 mr-4">
        <Tr t={t.lastModified.Subs({date: new Date(externalProperties["_last_edit_timestamp"]).toLocaleString() })}/>
      </span>
    {/if}
{/if}
