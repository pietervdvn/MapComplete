<script lang="ts">
  /**
   * An input element which allows to select one or more langauges
   */
  import { UIEventSource } from "../../../Logic/UIEventSource"
  import all_languages from "../../../assets/language_translations.json"
  import { Translation } from "../../i18n/Translation"
  import Tr from "../../Base/Tr.svelte"
  import Translations from "../../i18n/Translations.js"
  import { SearchIcon } from "@rgossiaux/svelte-heroicons/solid"
  import Locale from "../../i18n/Locale"

  /**
   * Will contain one or more ISO-language codes
   */
  export let selectedLanguages: UIEventSource<string[]>
  /**
   * The country (countries) that the point lies in.
   * Note that a single place might be claimed by multiple countries
   */
  export let countries: Set<string>
  let searchValue: UIEventSource<string> = new UIEventSource<string>("")
  let searchLC = searchValue.mapD((search) => search.toLowerCase())
  const knownLanguagecodes = Object.keys(all_languages)
  let probableLanguages = []
  let isChecked = {}
  for (const lng of knownLanguagecodes) {
    const lngInfo = all_languages[lng]
    if (lngInfo._meta?.countries?.some((l) => countries.has(l))) {
      probableLanguages.push(lng)
    }
    isChecked[lng] = false
  }
  let newlyChecked: UIEventSource<string[]> = new UIEventSource<string[]>([])

  function update(isChecked: Record<string, boolean>) {
    const currentlyChecked = new Set<string>(selectedLanguages.data)
    const languages: string[] = []
    for (const lng in isChecked) {
      if (isChecked[lng]) {
        languages.push(lng)
        if (!currentlyChecked.has(lng)) {
          newlyChecked.data.push(lng)
          newlyChecked.ping()
        }
      }
    }
    selectedLanguages.setData(languages)
  }
  function matchesSearch(lng: string, searchLc: string | undefined): boolean {
    if (!searchLc) {
      return
    }
    if (lng.indexOf(searchLc) >= 0) {
      return true
    }

    const languageInfo = all_languages[lng]
    const native: string = languageInfo[lng]?.toLowerCase()
    if (native?.indexOf(searchLc) >= 0) {
      return true
    }
    const current: string = languageInfo[Locale.language.data]?.toLowerCase()
    if (current?.indexOf(searchLc) >= 0) {
      return true
    }

    return false
  }
  function onEnter() {
    // we select the first match which is not yet checked
    for (const lng of knownLanguagecodes) {
      if (lng === searchLC.data) {
        isChecked[lng] = true

        return
      }
    }
    for (const lng of knownLanguagecodes) {
      if (matchesSearch(lng, searchLC.data)) {
        isChecked[lng] = true
        return
      }
    }
  }
  $: {
    update(isChecked)
  }
  searchValue.addCallback((_) => {
    newlyChecked.setData([])
  })
</script>

<form on:submit|preventDefault={() => onEnter()}>
  {#each probableLanguages as lng}
    <label class="no-image-background flex items-center gap-1">
      <input bind:checked={isChecked[lng]} type="checkbox" />
      <Tr t={new Translation(all_languages[lng])} />
      <span class="subtle">({lng})</span>
    </label>
  {/each}

  <label class="neutral-label relative m-4 mx-16 block">
    <SearchIcon class="absolute right-0 h-6 w-6" />
    <input bind:value={$searchValue} type="text" />
    <Tr t={Translations.t.general.useSearch} />
  </label>

  <div class="overflow-auto" style="max-height: 25vh">
    {#each knownLanguagecodes as lng}
      {#if isChecked[lng] && $newlyChecked.indexOf(lng) < 0 && probableLanguages.indexOf(lng) < 0}
        <label class="no-image-background flex items-center gap-1">
          <input bind:checked={isChecked[lng]} type="checkbox" />
          <Tr t={new Translation(all_languages[lng])} />
          <span class="subtle">({lng})</span>
        </label>
      {/if}
    {/each}

    {#each knownLanguagecodes as lng}
      {#if $searchLC.length > 0 && matchesSearch(lng, $searchLC) && (!isChecked[lng] || $newlyChecked.indexOf(lng) >= 0) && probableLanguages.indexOf(lng) < 0}
        <label class="no-image-background flex items-center gap-1">
          <input bind:checked={isChecked[lng]} type="checkbox" />
          <Tr t={new Translation(all_languages[lng])} />
          <span class="subtle">({lng})</span>
        </label>
      {/if}
    {/each}
  </div>
</form>
