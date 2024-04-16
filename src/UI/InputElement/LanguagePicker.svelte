<script lang="ts">
  // Languages in the language itself
  import native from "../../assets/language_native.json"
  // Translated languages
  import language_translations from "../../assets/language_translations.json"

  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import Locale from "../i18n/Locale"
  import { LanguageIcon } from "@babeard/svelte-heroicons/solid"
  import Dropdown from "../Base/Dropdown.svelte"
  import { twMerge } from "tailwind-merge"
  import Translations from "../i18n/Translations"
  import { ariaLabel } from "../../Utils/ariaLabel"

  /**
   * Languages one can choose from
   * Defaults to _all_ languages known by MapComplete
   */
  export let availableLanguages: string[] = Object.keys(native)
  /**
   * EventStore to assign to, defaults to 'Locale.langauge'
   */
  export let assignTo: UIEventSource<string> = Locale.language
  export let preferredLanguages: Store<string[]> = undefined
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
  export let clss: string = undefined
  let current = Locale.language
</script>

{#if availableLanguages?.length > 1}
  <form class={twMerge("flex max-w-full items-center pr-4", clss)}>
    <label
      for="pick-language"
      class="neutral-label flex max-w-full"
      use:ariaLabel={Translations.t.general.pickLanguage}
    >
      <LanguageIcon class="mr-1 h-4 w-4 shrink-0" aria-hidden="true" />
    </label>

    <Dropdown cls="max-w-full" value={assignTo} id="pick-language">
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

      {#each availableLanguages.filter((l) => l !== "_context") as language}
        <option value={language} class="font-bold">
          {native[language] ?? ""}
          {#if language !== $current}
            {#if language_translations[language]?.[$current] !== undefined}
              ({language_translations[language]?.[$current] + " - " + language ?? language})
            {:else}
              ({language})
            {/if}
          {/if}
        </option>
      {/each}
    </Dropdown>
  </form>
{/if}
