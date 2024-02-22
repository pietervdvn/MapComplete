<script lang="ts">
  /**
   * Shows attributes that are loaded via linked data and which are suitable for import
   */
  import type { SpecialVisualizationState } from "./SpecialVisualization"
  import type { Store } from "../Logic/UIEventSource"
  import { Stores, UIEventSource } from "../Logic/UIEventSource"

  import type { Feature, Geometry } from "geojson"
  import LayerConfig from "../Models/ThemeConfig/LayerConfig"
  import LinkedDataLoader from "../Logic/Web/LinkedDataLoader"
  import Loading from "./Base/Loading.svelte"
  import { GeoOperations } from "../Logic/GeoOperations"
  import { OH } from "./OpeningHours/OpeningHours"

  export let state: SpecialVisualizationState
  export let tagsSource: UIEventSource<Record<string, string>>
  export let argument: string[]
  export let feature: Feature
  export let layer: LayerConfig
  export let key: string


  let url = tagsSource.mapD(tags => {
    if (!tags._country || !tags[key] || tags[key] === "undefined") {
      return undefined
    }
    return ({ url: tags[key], country: tags._country })
  })
  let dataWithErr = url.bindD(({ url, country }) => {
    return Stores.FromPromiseWithErr(LinkedDataLoader.fetchJsonLd(url, country))
  })
  
  let error = dataWithErr.mapD(d => d["error"])
  let data = dataWithErr.mapD(d => d["success"])

  let distanceToFeature: Store<string> = data.mapD(d => d.geo).mapD(geo => {
    const dist = Math.round(GeoOperations.distanceBetween(
      GeoOperations.centerpointCoordinates(<Geometry>geo), GeoOperations.centerpointCoordinates(feature)))
    return dist + "m"
  })
  let dataCleaned = data.mapD(d => {
    const featureTags = tagsSource.data
    console.log("Downloaded data is", d)
    d = { ...d }
    delete d["@context"]
    for (const k in d) {
      const v = featureTags[k]
      if (!v) {
        continue
      }
      if (k === "opening_hours") {
        const oh = [].concat(...v.split(";").map(r => OH.ParseRule(r) ?? []))
        const merged = OH.ToString(OH.MergeTimes(oh ?? []))
        if (merged === d[k]) {
          delete d[k]
          continue
        }
      }
      if (featureTags[k] === d[k]) {
        delete d[k]
      }
      delete d.geo
    }
    return d
  }, [tagsSource])

</script>
{#if $error}
  <div class="alert">
    {$error}
  </div>
{:else if $url}
  <div class="flex flex-col border border-dashed border-gray-500 p-1">
    {#if $dataCleaned !== undefined && Object.keys($dataCleaned).length === 0}
      No new data from website
    {:else if !$data}
      <Loading />
    {:else}
      {$distanceToFeature}
      <ul>
        {#each Object.keys($dataCleaned) as k}
          <li>
            <b>{k}</b>: {JSON.stringify($dataCleaned[k])} {$tagsSource[k]}  {($dataCleaned[k]) === $tagsSource[k]}
          </li>
        {/each}
      </ul>
    {/if}
  </div>
{/if}
