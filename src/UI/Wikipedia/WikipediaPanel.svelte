<script lang="ts">
  /**
   * Shows one or more wikidata info boxes or wikipedia articles in a tabbed component.
   */
  import type { FullWikipediaDetails } from "../../Logic/Web/Wikipedia"
  import Wikipedia from "../../Logic/Web/Wikipedia"
  import Locale from "../i18n/Locale"
  import { Store } from "../../Logic/UIEventSource"
  import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@rgossiaux/svelte-headlessui"
  import WikipediaTitle from "./WikipediaTitle.svelte"
  import WikipediaArticle from "./WikipediaArticle.svelte"
  import { onDestroy } from "svelte"

  /**
   * Either a wikidata item or a '<language>:<article>' link
   */
  export let wikiIds: Store<string[]>
  let wikipediaStores: Store<Store<FullWikipediaDetails>[]> = Locale.language.bind((language) =>
    wikiIds?.map((wikiIds) => wikiIds?.map((id) => Wikipedia.fetchArticleAndWikidata(id, language)))
  )
  let _wikipediaStores
  onDestroy(
    wikipediaStores.addCallbackAndRunD((wikipediaStores) => {
      _wikipediaStores = wikipediaStores
    })
  )
</script>

{#if _wikipediaStores !== undefined}
  {#if _wikipediaStores.length === 1}
    <WikipediaArticle wikipediaDetails={_wikipediaStores[0]} />
  {:else}
    <TabGroup>
      <TabList>
        {#each _wikipediaStores as store (store.tag)}
          <Tab class={({ selected }) => (selected ? "tab-selected" : "tab-unselected")}>
            <WikipediaTitle wikipediaDetails={store} />
          </Tab>
        {/each}
      </TabList>
      <TabPanels>
        {#each _wikipediaStores as store (store.tag)}
          <TabPanel>
            <WikipediaArticle wikipediaDetails={store} />
          </TabPanel>
        {/each}
      </TabPanels>
    </TabGroup>
  {/if}
{/if}

<style>
  /* Actually used, don't remove*/
  .tab-selected {
    background-color: rgb(59 130 246);
    color: rgb(255 255 255);
  }

  /* Actually used, don't remove*/
  .tab-unselected {
    background-color: rgb(255 255 255);
    color: rgb(0 0 0);
  }
</style>
