<script context="module" lang="ts">
  export interface Theme {
    id: string
    icon: string
    title: any
    shortDescription: any
    definition?: any
    mustHaveLanguage?: boolean
    hideFromOverview: boolean
    keywords?: any[]
  }
</script>

<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource"
  import Svg from "../../Svg"
  import ToSvelte from "../Base/ToSvelte.svelte"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"
  import Search_disable from "../../assets/svg/Search_disable.svelte"

  export let search: UIEventSource<string>

  const t = Translations.t.general.morescreen
</script>

<div class="w-full">
  <h5>{t.noMatchingThemes.toString()}</h5>
  <div class="flex justify-center">
    <button on:click={() => search.setData("")}>
      <Search_disable class="mr-2 w-6" />
      <Tr t={t.noSearch} />
    </button>
  </div>
</div>
