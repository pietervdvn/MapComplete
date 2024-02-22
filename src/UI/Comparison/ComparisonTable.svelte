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

  export let osmProperties: Record<string, string>
  export let externalProperties: Record<string, string>

  export let tags: UIEventSource<OsmTags>
  export let state: SpecialVisualizationState
  export let feature: Feature
  export let layer: LayerConfig

  export let readonly = false

  let externalKeys: string[] = Object.keys(externalProperties).sort()

  const imageKeyRegex = /image|image:[0-9]+/
  console.log("Calculating knwon images")
  let knownImages = new Set(
    Object.keys(osmProperties)
      .filter((k) => k.match(imageKeyRegex))
      .map((k) => osmProperties[k])
  )
  console.log("Known images are:", knownImages)
  let unknownImages = externalKeys
    .filter((k) => k.match(imageKeyRegex))
    .map((k) => externalProperties[k])
    .filter((i) => !knownImages.has(i))

  let propertyKeysExternal = externalKeys.filter((k) => k.match(imageKeyRegex) === null)
  let missing = propertyKeysExternal.filter((k) => osmProperties[k] === undefined)
  let same = propertyKeysExternal.filter((key) => osmProperties[key] === externalProperties[key])
  let different = propertyKeysExternal.filter(
    (key) => osmProperties[key] !== undefined && osmProperties[key] !== externalProperties[key]
  )

  let currentStep: "init" | "applying_all" | "all_applied" = "init"

  async function applyAllMissing() {
    currentStep = "applying_all"
    const tagsToApply = missing.map((k) => new Tag(k, externalProperties[k]))
    const change = new ChangeTagAction(tags.data.id, new And(tagsToApply), tags.data, {
      theme: state.layout.id,
      changeType: "import",
    })
    await state.changes.applyChanges(await change.CreateChangeDescriptions())
    currentStep = "all_applied"
  }
</script>

{#if different.length > 0}
  <h3>Conflicting items</h3>
  <table>
    <tr>
      <th>Key</th>
      <th>OSM</th>
      <th>External</th>
    </tr>
    {#each different as key}
      <tr>
        <td>{key}</td>
        <td>{osmProperties[key]}</td>
        <td>{externalProperties[key]}</td>
      </tr>
    {/each}
  </table>
{/if}

{#if missing.length > 0}
  {#if currentStep === "init"}
    <table class="w-full">
      <tr>
        <th>Key</th>
        <th>External</th>
      </tr>

      {#each missing as key}
        <ComparisonAction {key} {state} {tags} {externalProperties} {layer} {feature} {readonly} />
      {/each}
    </table>
    {#if !readonly}
      <button on:click={() => applyAllMissing()}>Apply all missing values</button>
    {/if}
  {:else if currentStep === "applying_all"}
    <Loading>Applying all missing values</Loading>
  {:else if currentStep === "all_applied"}
    <div class="thanks">All values are applied</div>
  {/if}
{/if}

{#if unknownImages.length === 0 && missing.length === 0 && different.length === 0}
  <div class="thanks m-0 flex items-center gap-x-2 px-2">
    <Party class="h-8 w-8" />
    All data from Velopark is also included into OpenStreetMap
  </div>
{/if}

{#if unknownImages.length > 0}
  {#if readonly}
    <div class="w-full overflow-x-auto">
      <div class="flex h-32 w-max gap-x-2">
        {#each unknownImages as image}
          <AttributedImage
            imgClass="h-32 w-max shrink-0"
            image={{ url: image }}
            previewedImage={state.previewedImage}
          />
        {/each}
      </div>
    </div>
  {:else}
    {#each unknownImages as image}
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
