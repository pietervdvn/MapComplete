<script lang="ts">
  // A contact link indicates how a mapper can contact their local community
  // The _properties_ of a community feature
  import Locale from "../i18n/Locale.js"
  import Translations from "../i18n/Translations"
  import ToSvelte from "../Base/ToSvelte.svelte"
  import * as native from "../../assets/language_native.json"
  import { TypedTranslation } from "../i18n/Translation"

  const availableTranslationTyped: TypedTranslation<{ native: string }> =
    Translations.t.communityIndex.available
  const availableTranslation = availableTranslationTyped.OnEveryLanguage((s, ln) =>
    s.replace("{native}", native[ln] ?? ln)
  )
  export let country: { resources; nameEn: string }
  let resources: {
    id: string
    resolved: Record<string, string>
    languageCodes: string[]
    type: string
  }[] = []
  $: resources = Array.from(Object.values(country?.resources ?? {}))

  const language = Locale.language
</script>

<div>
  {#if country?.nameEn}
    <h3>{country?.nameEn}</h3>
  {/if}
  {#each resources as resource}
    <div class="link-underline my-4 flex items-center">
      <img
        class="m-2 h-8 w-8"
        src={`https://raw.githubusercontent.com/pietervdvn/MapComplete-data/main/community_index/${resource.type}.svg`}
      />
      <div class="flex flex-col">
        <a
          href={resource.resolved.url}
          target="_blank"
          rel="noreferrer nofollow noopener"
          class="font-bold"
        >
          {resource.resolved.name ?? resource.resolved.url}
        </a>
        {resource.resolved?.description}
        {#if resource.languageCodes?.indexOf($language) >= 0}
          <div class="thanks w-fit">
            <ToSvelte construct={() => availableTranslation.Clone()} />
          </div>
        {/if}
      </div>
    </div>
  {/each}
</div>
