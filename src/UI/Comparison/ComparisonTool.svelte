<script lang="ts">
  /**
   * The comparison tool loads json-data from a speficied URL, eventually post-processes it
   * and compares it with the current object
   */
  import { onMount } from "svelte"
  import { Utils } from "../../Utils"
  import VeloparkLoader from "../../Logic/Web/VeloparkLoader"
  import Loading from "../Base/Loading.svelte"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import ComparisonTable from "./ComparisonTable.svelte"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import type { Feature } from "geojson"
  import type { OsmTags } from "../../Models/OsmFeature"

  export let url: string
  export let postprocessVelopark: boolean
  export let state: SpecialVisualizationState
  export let tags: UIEventSource<OsmTags>
  export let layer: LayerConfig
  export let feature: Feature
  export let readonly = false
  let data: any = undefined
  let error: any = undefined

  onMount(async () => {
    const _url = tags.data[url]
    if (!_url) {
      error = "No URL found in attribute" + url
    }
    try {
      console.log("Attempting to download", _url)
      const downloaded = await Utils.downloadJsonAdvanced(_url)
      if (downloaded["error"]) {
        console.error(downloaded)
        error = downloaded["error"]
        return
      }
      if (postprocessVelopark) {
        data = VeloparkLoader.convert(downloaded["content"])
        return
      }
      data = downloaded["content"]
    } catch (e) {
      console.error(e)
      error = "" + e
    }
  })
</script>

{#if error !== undefined}
  <div class="alert">
    Something went wrong: {error}
  </div>
{:else if data === undefined}
  <Loading>
    Loading {$tags[url]}
  </Loading>
{:else if data.properties !== undefined}
  <ComparisonTable
    externalProperties={data.properties}
    osmProperties={$tags}
    {state}
    {feature}
    {layer}
    {tags}
    {readonly}
  />
{/if}
