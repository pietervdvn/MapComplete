<script lang="ts">

  import Wikidata, { WikidataResponse } from "../../Logic/Web/Wikidata"
  import { Translation } from "../i18n/Translation"
  import { WikimediaImageProvider } from "../../Logic/ImageProviders/WikimediaImageProvider"
  import { default as Wikidata_icon } from "../../assets/svg/Wikidata.svelte"
  import WikidataQuickfacts from "./WikidataQuickfacts.svelte"
  import Tr from "../Base/Tr.svelte"

  export let wikidata: WikidataResponse
  export let imageStyle: string = "max-width: 5rem; width: unset; height: 4rem"

  let imageProperty: string | undefined = Array.from(wikidata?.claims?.get("P18") ?? [])[0]
  let imageUrl = WikimediaImageProvider.singleton.PrepUrl(imageProperty)?.url

</script>

<div class="flex w-full p-2 flex-wrap">

  {#if imageUrl}
    <img src={imageUrl} style={imageStyle} class="mr-2" />
  {/if}

  <div class="flex flex-col flex-grow">

    <div class="flex w-full justify-between flex-wrap">
      <Tr cls="font-bold" t={ Translation.fromMap(wikidata.labels) } />
      <a href={Wikidata.IdToArticle(wikidata.id)} target="_blank" class="flex must-link items-center">
        <Wikidata_icon class="w-10" /> {wikidata.id}
      </a>
    </div>
      <Tr t={  Translation.fromMap(wikidata.descriptions, true)} />



    <div class="flex">
    <WikidataQuickfacts {wikidata} />
    </div>

    <slot name="extra"></slot>
  </div>
</div>
