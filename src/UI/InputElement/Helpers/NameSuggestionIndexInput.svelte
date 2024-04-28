<script lang="ts">
  import type { Feature, MultiPolygon } from "geojson"
  import { UIEventSource } from "../../../Logic/UIEventSource"
  import * as nsi from "../../../../node_modules/name-suggestion-index/dist/nsi.json"
  import * as nsiFeatures from "../../../../node_modules/name-suggestion-index/dist/featureCollection.json"
  import { LocationConflation } from "@rapideditor/location-conflation"
  import * as turf from "@turf/turf"
  import { SearchIcon } from "@rgossiaux/svelte-heroicons/solid"
  import { twMerge } from "tailwind-merge"

  const nsiFile: NSIFile = nsi
  const loco = new LocationConflation(nsiFeatures)

  /**
   * All props for this input helper
   */
  export let value: UIEventSource<string> = new UIEventSource<string>(undefined)
  // Since we're getting extra tags aside from the standard we need to export them
  export let extraTags: UIEventSource<Record<string, string>>
  export let feature: Feature
  export let helperArgs: (string | number | boolean)[]
  export let key: string

  let maintag = helperArgs[0].toString()
  let tag = key
  let addExtraTags = helperArgs[1].split(";")

  const path = `${tag}s/${maintag.split("=")[0]}/${maintag.split("=")[1]}`

  // Check if the path exists in the NSI file
  if (!nsiFile.nsi[path]) {
    console.error(`Path ${path} does not exist in the NSI file`)
    throw new Error(`Path ${path} does not exist in the NSI file`)
  }

  let items = nsiFile.nsi[path].items

  let selectedItem: NSIItem = items.find((item) => item.tags[tag] === value.data)

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

  /**
   * Some interfaces for the NSI files
   */

  /**
   * Main name suggestion index file
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

  /**
   * Function called when an item is selected
   */
  function select(item: NSIItem) {
    value.setData(item.tags[tag])
    selectedItem = item
    // Tranform the object into record<string, string> and remove the tag we're using, as well as the maintag
    const tags = Object.entries(item.tags).reduce((acc, [key, value]) => {
      if (key !== tag && key !== maintag.split("=")[0]) {
        acc[key] = value
      }
      return acc
    }, {} as Record<string, string>)

    // Also check if the object currently matches a different item, based on the key
    const otherItem = items.find((item) => item.tags[tag] === feature.properties[key])

    // If the other item is not the same as the selected item, we need to make sure we clear any old keys we don't need anymore by setting them to an empty string
    if (otherItem && otherItem !== item) {
      Object.keys(otherItem.tags).forEach((key) => {
        // If we have a different value for the key, we don't need to clear it
        if (!tags[key] && key !== tag && key !== maintag.split("=")[0]) {
          console.log(`Clearing key ${key}`)
          tags[key] = ""
        }
      })
    }

    // If we have layer-defined extra tags, also add them
    addExtraTags.forEach((extraTag) => {
      tags[extraTag.split("=")[0]] = extraTag.split("=")[1]
    })

    // Finally, set the extra tags
    extraTags.setData(tags)
  }
</script>

<div>
  <div class="normal-background my-2 flex w-5/6 justify-between rounded-full pl-2">
    <input type="text" placeholder="Filter entries" bind:value={filter} class="outline-none" />
    <SearchIcon aria-hidden="true" class="h-6 w-6 self-end" />
  </div>
  <div class="flex h-36 w-full flex-wrap overflow-scroll">
    {#each filteredItems as item}
      <div
        class={twMerge(
          "m-1 h-fit rounded-full border-2 border-black p-4 text-center text-black",
          selectedItem === item ? "interactive" : "bg-white"
        )}
        on:click={() => {
          select(item)
        }}
        on:keydown={(e) => {
          if (e.key === "Enter") {
            select(item)
          }
        }}
      >
        {item.displayName}
      </div>
    {/each}
  </div>
</div>
