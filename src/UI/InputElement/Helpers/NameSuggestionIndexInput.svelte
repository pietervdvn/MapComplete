<script lang="ts">
  import type { Feature, MultiPolygon } from "geojson"
  import { UIEventSource } from "../../../Logic/UIEventSource"
  import * as nsi from "../../../../node_modules/name-suggestion-index/dist/nsi.json"
  import * as nsiFeatures from "../../../../node_modules/name-suggestion-index/dist/featureCollection.json"
  import { LocationConflation } from "@rapideditor/location-conflation"
  import * as turf from "@turf/turf"

  const nsiFile: NSIFile = nsi
  const loco = new LocationConflation(nsiFeatures)

  /**
   * All props for this input helper
   */
  export let value: UIEventSource<string> = new UIEventSource<string>(undefined)
  export let feature: Feature
  export let tags: UIEventSource<Record<string, string>>
  export let helperArgs: (string | number | boolean)[]
  export let key: string

  let maintag = helperArgs[0].toString()
  let tag = key

  const path = `${tag}s/${maintag.split("=")[0]}/${maintag.split("=")[1]}`

  // Check if the path exists in the NSI file
  if (!nsiFile.nsi[path]) {
    console.error(`Path ${path} does not exist in the NSI file`)
    throw new Error(`Path ${path} does not exist in the NSI file`)
  }

  let items = nsiFile.nsi[path].items

  // Get the coordinates if the feature is a point, otherwise use the center
  let lon: number
  let lat: number
  if (feature.geometry.type === "Point") {
    const coordinates = feature.geometry.coordinates
    lon = coordinates[0]
    lat = coordinates[1]
  } else {
    lon = feature.bbox[0] + (feature.bbox[2] - feature.bbox[0]) / 2
    lat = feature.bbox[1] + (feature.bbox[3] - feature.bbox[1]) / 2
  }

  /**
   * Filter the items, first by the display name, then by the location set
   */
  let filter = ""
  $: filteredItems = items
    .filter((item) => item.displayName.toLowerCase().includes(filter.toLowerCase()))
    .filter((item) => {
      // Check if the feature is in the location set using the location-conflation library
      const resolvedSet = loco.resolveLocationSet(item.locationSet)
      if (resolvedSet) {
        const setFeature: Feature<MultiPolygon> = resolvedSet.feature
        // We actually have a location set, so we can check if the feature is in it, by determining if our point is inside of the MultiPolygon using @turf/boolean-point-in-polygon
        return turf.booleanPointInPolygon([lon, lat], setFeature.geometry)
      }
      return true
    })
    .slice(0, 25)

  /**
   * Some interfaces for the NSI files
   */
  interface NSIFile {
    _meta: {
      version: string
      generated: string
      url: string
      hash: string
    }
    nsi: {
      [path: string]: NSIEntry
    }
  }

  interface NSIEntry {
    properties: {
      path: string
      skipCollection?: boolean
      preserveTags?: string[]
      exclude: unknown
    }
    items: NSIItem[]
  }

  interface NSIItem {
    displayName: string
    id: string
    locationSet: unknown
    tags: {
      [key: string]: string
    }
    fromTemplate?: boolean
  }
</script>

<div>
  <input type="text" placeholder="Filter entries" bind:value={filter} />
  <div class="flex h-32 w-full flex-wrap overflow-hidden">
    {#each filteredItems as item}
      <div
        class="m-1 h-fit rounded-full border border-black p-4 text-center"
        on:click={() => {
          value.setData(item.tags[tag])
        }}
      >
        {item.displayName}
      </div>
    {/each}
  </div>
</div>
