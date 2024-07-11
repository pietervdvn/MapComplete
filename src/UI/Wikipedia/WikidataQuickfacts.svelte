<script lang="ts">

  import { Translation } from "../i18n/Translation"
  import WikidataPreviewBox from "./WikidataPreviewBox"
  import { WikidataResponse } from "../../Logic/Web/Wikidata"
  import Tr from "../Base/Tr.svelte"

  export let wikidata: WikidataResponse

  let propertiesToRender = WikidataPreviewBox.extraProperties.filter(property => {
    for (const requirement of property.requires) {
      if (!wikidata.claims?.has("P" + requirement.p)) {
        return false
      }
      if (!wikidata.claims?.get("P" + requirement.p).has("Q" + requirement.q)) {
        return false
      }

      const key = property.property
      if (wikidata.claims?.get(key) === undefined) {
        return false
      }
    return true
    }
  })

  function getProperty(property: {property: string}){
    const key = property.property
    const value = Array.from(wikidata.claims?.get(key)).join(", ")
    return value
  }

</script>

{#if propertiesToRender.length > 0}
  <div class="flex justify-start items-center">
    {#each propertiesToRender as property}
      {#if typeof property.display === "string" }
        {property.display}
      {:else if property.display instanceof Translation}
        <Tr cls="m-2 shrink-0"
            t={property.display.Subs({value: getProperty(property)}) } />
      {:else}
        <svelte:component this={property.display.get(getProperty(property))} class="h-6 w-fit m-1"/>
      {/if}
    {/each}
  </div>
{/if}

