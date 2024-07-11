<script lang="ts">
  /**
   * Allows to search through wikidata and to select one value
   */


  import Translations from "../../i18n/Translations"
  import Tr from "../../Base/Tr.svelte"
  import { ImmutableStore, Store, Stores, UIEventSource } from "../../../Logic/UIEventSource"
  import Wikidata, { WikidataResponse } from "../../../Logic/Web/Wikidata"
  import Locale from "../../i18n/Locale"
  import SearchField from "../../BigComponents/SearchField.svelte"
  import Loading from "../../Base/Loading.svelte"
  import Wikidatapreview from "../../Wikipedia/Wikidatapreview.svelte"
  import { Utils } from "../../../Utils"
  import WikidataValidator from "../Validators/WikidataValidator"

  const t = Translations.t.general.wikipedia

  export let searchValue = new UIEventSource("Tom boonen")
  export let placeholder = t.searchWikidata
  export let allowMultiple = false

  export let notInstanceOf: number[] = []
  export let instanceOf: number[] = []

  export let value: UIEventSource<string>

  let selectedWikidataSingle: WikidataResponse = undefined
  let selectedMany: Record<string, boolean> = {}
  let previouslySeen = new Map<string, WikidataResponse>()

  $:{
    if (selectedWikidataSingle) {
      value.setData(selectedWikidataSingle.id)
    }
  }

  $:{
    console.log(selectedMany)
    const v = []
    for (const id in selectedMany) {
      if (selectedMany[id]) {
        v.push(id)
      }
    }
    value.setData(v.join(";"))
  }


  let tooShort = new ImmutableStore<{ success: WikidataResponse[] }>({ success: undefined })

  let searchResult: Store<{ success?: WikidataResponse[]; error?: any }> = searchValue
    .bind((searchText) => {
      if (searchText.length < 3 && !searchText.match(/[qQ][0-9]+/)) {
        return tooShort
      }
      const lang = Locale.language.data
      const key = lang + ":" + searchText
      let promise = WikidataValidator._searchCache.get(key)
      if (promise === undefined) {
        promise = Wikidata.searchAndFetch(searchText, {
          lang,
          maxCount: 5,
          notInstanceOf,
          instanceOf
        })
        WikidataValidator._searchCache.set(key, promise)
      }
      return Stores.FromPromiseWithErr(promise)
    })

  let selectedWithoutSearch: Store<WikidataResponse[]> = searchResult.map(sr => {
    for (const wikidataItem of sr?.success ?? []) {
      console.log("Saving", wikidataItem.id)
      previouslySeen.set(wikidataItem.id, wikidataItem)
    }
    let knownIds: Set<string> = new Set(sr?.success?.map(item => item.id))
    const seen = [selectedWikidataSingle]
    for (const id in selectedMany) {
      if (selectedMany[id]) {
        const item = previouslySeen.get(id)
        seen.push(item)
      }
    }
    return Utils.NoNull(seen).filter(i => !knownIds.has(i.id))
  })

</script>

<h3>
  <Tr t={Translations.t.general.wikipedia.searchWikidata} />
</h3>

<form>
  <SearchField {searchValue} placeholderText={placeholder}></SearchField>

  {#if $searchValue.trim().length === 0}
    <Tr cls="w-full flex justify-center p-4" t={ t.doSearch} />
  {:else if $searchValue.trim().length < 3}
    <Tr t={ t.searchToShort} />
  {:else if $searchResult === undefined}
    <div class="w-full flex justify-center p-4">
      <Loading>
        <Tr t={Translations.t.general.loading} />
      </Loading>
    </div>
  {:else if $searchResult.error !== undefined}
    <div class="w-full flex justify-center p-4">
      <Tr cls="alert" t={t.failed} />
    </div>
  {:else if $searchResult.success}
    {#if $searchResult.success.length === 0}
      <Tr cls="w-full flex justify-center p-4"  t={ t.noResults.Subs({search: $searchValue})} />
    {:else}
      {#each $searchResult.success as wikidata}

        <label class="low-interaction m-4 p-2 rounded-xl flex items-center">
          {#if allowMultiple}
            <input type="checkbox" bind:checked={selectedMany[wikidata.id]} />
          {:else}
            <input type="radio" name="selectedWikidata" value={wikidata} bind:group={selectedWikidataSingle} />
          {/if}

          <Wikidatapreview {wikidata} />
        </label>
      {/each}
    {/if}
  {/if}

  {#each $selectedWithoutSearch as wikidata}

    <label class="low-interaction m-4 p-2 rounded-xl flex items-center">
      {#if allowMultiple}
        <input type="checkbox" bind:checked={selectedMany[wikidata.id]} />
      {:else}
        <input type="radio" name="selectedWikidata" value={wikidata} bind:group={selectedWikidataSingle} />
      {/if}

      <Wikidatapreview {wikidata} />
    </label>
  {/each}

</form>

