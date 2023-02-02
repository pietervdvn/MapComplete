<script lang="ts">
  // A contact link indicates how a mapper can contact their local community  
  // The _properties_ of a community feature
  import Locale from "../i18n/Locale.js";
  import Translations from "../i18n/Translations";
  import ToSvelte from "../Base/ToSvelte.svelte";
  import * as native from "../../assets/language_native.json";
  import { TypedTranslation } from "../i18n/Translation";

  const availableTranslationTyped: TypedTranslation<{ native: string }> = Translations.t.communityIndex.available;
  const availableTranslation = availableTranslationTyped.OnEveryLanguage((s, ln) => s.replace("{native}", native[ln] ?? ln));
  export let country: { resources; nameEn: string };
  let resources: { id: string, resolved: Record<string, string>, languageCodes: string[] }[] = []
  $: resources = Array.from(Object.values(country?.resources ?? {}));
  
  const language = Locale.language;

</script>

<div>
  {#if country?.nameEn}
    <h3>{country?.nameEn}</h3>
  {/if}
  {#each resources as resource}
    <div class="flex link-underline items-center my-4">
      <img
        class="w-8 h-8 m-2"
        src={"https://raw.githubusercontent.com/osmlab/osm-community-index/main/dist/img/" +
      resource.type +
      ".svg"}
      />
      <div class="flex flex-col">
        <a href={resource.resolved.url} target="_blank" rel="noreferrer nofollow" class="font-bold">
          {resource.resolved.name ?? resource.resolved.url}
        </a>
        {resource.resolved?.description}
        {#if (resource.languageCodes?.indexOf($language) >= 0)}
          <span class="border-2 rounded-full border-lime-500 text-sm w-fit px-2">
          <ToSvelte construct={() => availableTranslation.Clone()} />
          </span>
        {/if}

      </div>
    </div>
  {/each}
</div>
