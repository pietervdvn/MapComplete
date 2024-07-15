<script lang="ts">
  import type { FullWikipediaDetails } from "../../Logic/Web/Wikipedia"
  import { Store } from "../../Logic/UIEventSource"
  import FromHtml from "../Base/FromHtml.svelte"
  import Loading from "../Base/Loading.svelte"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import Wikipedia from "../../assets/svg/Wikipedia.svelte"
  import Wikidatapreview from "./Wikidatapreview.svelte"
  import AccordionSingle from "../Flowbite/AccordionSingle.svelte"

  /**
   * Shows a wikipedia-article + wikidata preview for the given item
   */
  export let wikipediaDetails: Store<FullWikipediaDetails>
  let titleOnly = wikipediaDetails.mapD(
    (details) => Object.keys(details).length === 1 && details.title !== undefined
  )
</script>

<div class="low-interaction border-gray-300 border-dashed rounded-xl p-2 flex flex-col">
  {#if $titleOnly}
    <Loading>{$wikipediaDetails.title}</Loading>
  {/if}


  {#if $wikipediaDetails.wikidata}
    <Wikidatapreview wikidata={$wikipediaDetails.wikidata} />
  {/if}

  {#if $wikipediaDetails.articleUrl}
    {#if $wikipediaDetails.firstParagraph === "" || $wikipediaDetails.firstParagraph === undefined}
      <Loading>
        <Tr t={Translations.t.general.wikipedia.loading} />
      </Loading>
    {:else}
      <FromHtml clss="wikipedia-article" src={$wikipediaDetails.firstParagraph} />
      {#if $wikipediaDetails.articleUrl}
        <a class="flex self-end my-2" href={$wikipediaDetails.articleUrl} rel="noreferrer" target="_blank">
          <Wikipedia class="h-6 w-6" />
          <Tr t={Translations.t.general.wikipedia.fromWikipedia} />
        </a>
      {/if}
      <AccordionSingle>
        <Tr slot="header" t={Translations.t.general.wikipedia.readMore} />
        <FromHtml clss="wikipedia-article" src={$wikipediaDetails.restOfArticle} />
      </AccordionSingle>
    {/if}
  {/if}
</div>
