<script lang="ts">
  import type { FullWikipediaDetails } from "../../Logic/Web/Wikipedia";
  import { Store } from "../../Logic/UIEventSource";
  import FromHtml from "../Base/FromHtml.svelte";
  import Loading from "../Base/Loading.svelte";
  import { Disclosure, DisclosureButton, DisclosurePanel } from "@rgossiaux/svelte-headlessui";
  import { ChevronRightIcon } from "@rgossiaux/svelte-heroicons/solid";
  import ToSvelte from "../Base/ToSvelte.svelte";
  import WikidataPreviewBox from "./WikidataPreviewBox";
  import Tr from "../Base/Tr.svelte";
  import Translations from "../i18n/Translations";

  /**
   * Small helper
   */
  export let wikipediaDetails: Store<FullWikipediaDetails>;
</script>

<a href={$wikipediaDetails.articleUrl} target="_blank" rel="noreferrer" class="flex">
  <img src="./assets/svg/wikipedia.svg" class="w-6 h-6"/>
  <Tr t={Translations.t.general.wikipedia.fromWikipedia}/>
</a>

{#if $wikipediaDetails.wikidata}
  <ToSvelte construct={WikidataPreviewBox.WikidataResponsePreview($wikipediaDetails.wikidata)} />
{/if}

{#if $wikipediaDetails.firstParagraph === "" || $wikipediaDetails.firstParagraph === undefined}
  <Loading >
    <Tr t={Translations.t.general.wikipedia.loading}/>
  </Loading>
{:else}
  <FromHtml src={$wikipediaDetails.firstParagraph} />
  <Disclosure let:open>
    <DisclosureButton>
      <span class="flex">
      <ChevronRightIcon class="w-6 h-6" style={open ? "transform: rotate(90deg);" : ""} />
      Read the rest of the article
        
      </span>
    </DisclosureButton>
    <DisclosurePanel>
      <FromHtml src={$wikipediaDetails.restOfArticle} />
    </DisclosurePanel>
  </Disclosure>
{/if}
