<script lang="ts">
  import { MinimalThemeInformation } from "../../Models/ThemeConfig/ThemeConfig"
  import { Translation } from "../i18n/Translation"
  import Icon from "../Map/Icon.svelte"
  import Tr from "../Base/Tr.svelte"
  import ThemeSearch from "../../Logic/Search/ThemeSearch"

  export let entry: MinimalThemeInformation
  let otherTheme = entry
</script>

{#if entry}
  <a
    href={ThemeSearch.createUrlFor(otherTheme)}
    class="searchresult flex w-full items-center gap-y-2 rounded-xl p-2"
  >
    <Icon icon={otherTheme.icon} clss="w-6 h-6 m-1" />
    <div class="flex flex-col">
      <b>
        <Tr t={new Translation(otherTheme.title)} />
      </b>
    </div>
  </a>
{/if}
