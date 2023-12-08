<script lang="ts">
    // Languages in the language itself
    import native from "../../assets/language_native.json"
    // Translated languages
    import language_translations from "../../assets/language_translations.json"

    import { UIEventSource } from "../../Logic/UIEventSource"
    import Locale from "../i18n/Locale"
    import { LanguageIcon } from "@babeard/svelte-heroicons/solid"
    import Dropdown from "../Base/Dropdown.svelte"
    import { twMerge } from "tailwind-merge"

    /**
   * Languages one can choose from
   * Defaults to _all_ languages known by MapComplete
   */
  export let availableLanguages: string[] = Object.keys(native)
  /**
   * EventStore to assign to, defaults to 'Locale.langauge'
   */
  export let assignTo: UIEventSource<string> = Locale.language
  export let preferredLanguages: UIEventSource<string[]> = undefined
  let preferredFiltered: string[] = undefined
  preferredLanguages?.addCallbackAndRunD((preferredLanguages) => {
    let lng = navigator.language
    if (lng === "en-US") {
      lng = "en"
    }
    if (preferredLanguages?.indexOf(lng) < 0) {
      preferredLanguages?.push(lng)
    }
    preferredFiltered = preferredLanguages?.filter((l) => availableLanguages.indexOf(l) >= 0)
  })
  export let clss : string = undefined
  let current = Locale.language
</script>

{#if availableLanguages?.length > 1}
  <form class={twMerge("flex items-center max-w-full pr-4", clss)}>
    <LanguageIcon class="h-4 w-4 mr-1 shrink-0" />
    <Dropdown cls="max-w-full" value={assignTo}>
      {#if preferredFiltered}
        {#each preferredFiltered as language}
          <option value={language} class="font-bold">
            {native[language] ?? ""}
            {#if language !== $current}
              ({language_translations[language]?.[$current] ?? language})
            {/if}
          </option>
        {/each}
        <option disabled />
      {/if}

      {#each availableLanguages as language}
        <option value={language} class="font-bold">
          {native[language] ?? ""}
          {#if language !== $current}
            ({language_translations[language]?.[$current] + " - " + language ?? language})
          {/if}
        </option>
      {/each}
    </Dropdown>
  </form>
{/if}
