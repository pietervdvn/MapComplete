<script lang="ts">
  import type { Feature, MultiPolygon } from "geojson"
  import { UIEventSource } from "../../../Logic/UIEventSource"
  import { SearchIcon } from "@rgossiaux/svelte-heroicons/solid"
  import { twMerge } from "tailwind-merge"
  import { GeoOperations } from "../../../Logic/GeoOperations"
  import NameSuggestionIndex from "../../../Logic/Web/NameSuggestionIndex"
  import type { NSIItem } from "../../../Logic/Web/NameSuggestionIndex"


  export let value: UIEventSource<string> = new UIEventSource<string>(undefined)
  // Since we're getting extra tags aside from the standard we need to export them
  export let extraTags: UIEventSource<Record<string, string>>
  export let feature: Feature
  export let helperArgs: (string | number | boolean)[]
  /**
   * An inputhelper is always used with a freeform.
   * The 'key' is what the value will be written into.
   * This will probably be `brand` or `operator`
   */
  export let key: string

  let maintag = helperArgs[0].toString()
  let tag = key
  let addExtraTags: string[] = []
  if (helperArgs[1]) {
    addExtraTags = helperArgs[1].split(";")
  }

  const path = `${key}s/${maintag.split("=")[0]}/${maintag.split("=")[1]}`

  // Check if the path exists in the NSI file
  if (!nsiFile.nsi[path]) {
    console.error(`Path ${path} does not exist in the NSI file`)
    throw new Error(`Path ${path} does not exist in the NSI file`)
  }

  let items: NSIItem[] = NameSuggestionIndex.getSuggestionsFor(path, feature.properties["_country"])

  let selectedItem: NSIItem = items.find((item) => item.tags[key] === value.data)

  // Get the coordinates if the feature is a point, otherwise use the center
  let [lon, lat] = GeoOperations.centerpointCoordinates(feature)

  /**
   * Filter the items, first by the display name, then by the location set
   */
  let filter = ""
  $: filteredItems = items
    .filter((item) => item.displayName.toLowerCase().includes(filter.toLowerCase()))
    .filter((item) => {
      // Check if the feature is in the location set using the location-conflation library

      return true
    })



  /**
   * Function called when an item is selected
   */
  function select(item: NSIItem) {
    value.setData(item.tags[key])
    selectedItem = item
    // Transform the object into record<string, string> and remove the tag we're using, as well as the maintag
    const tags = Object.entries(item.tags).reduce((acc, [k, value]) => {
      if (k !== key && key !== maintag.split("=")[0]) {
        acc[k] = value
      }
      return acc
    }, {} as Record<string, string>)

    // Also check if the object currently matches a different item, based on the key
    const otherItem = items.find((item) => item.tags[key] === feature.properties[key])

    // If the other item is not the same as the selected item, we need to make sure we clear any old keys we don't need anymore by setting them to an empty string
    if (otherItem && otherItem !== item) {
      Object.keys(otherItem.tags).forEach((k) => {
        // If we have a different value for the key, we don't need to clear it
        if (!tags[k] && key !== k && key !== maintag.split("=")[0]) {
          console.log(`Clearing key ${key}`)
          tags[k] = ""
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

  value.addCallback((value) => {
    // If the value changes by the user typing we might need to update the selected item or make sure we clear any old keys

    // First, check if the value is already selected, in that case we don't need to do anything
    if (selectedItem && selectedItem.tags[tag] === value) {
      return
    }

    // If the value is not selected, we check if there is an item with the same value and select it
    const item = items.find((item) => item.tags[key] === value)
    if (item) {
      select(item)
    } else {
      // If there is no item with the value, we need to clear the extra tags based on the last selected item by looping over the tags from the last selected item
      if (selectedItem) {
        const tags = Object.entries(selectedItem.tags).reduce((acc, [k, value]) => {
          if (key !== k && key !== maintag.split("=")[0]) {
            acc[key] = ""
          }
          return acc
        }, {} as Record<string, string>)
        extraTags.setData(tags)
      }
    }
  })
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
