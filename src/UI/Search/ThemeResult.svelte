<script lang="ts">
  import { MinimalLayoutInformation } from "../../Models/ThemeConfig/LayoutConfig"
  import { Translation } from "../i18n/Translation"
  import Icon from "../Map/Icon.svelte"
  import Tr from "../Base/Tr.svelte"
  import ThemeSearch from "../../Logic/Search/ThemeSearch"

  export let entry: MinimalLayoutInformation
  let otherTheme = entry
</script>
{#if entry}
  <a href={ThemeSearch.createUrlFor(otherTheme)}
     class="flex items-center p-2 w-full gap-y-2 rounded-xl searchresult">

    <Icon icon={otherTheme.icon} clss="w-6 h-6 m-1" />
    <div class="flex flex-col">
      <b>
        <Tr t={new Translation(otherTheme.title)} />
      </b>
    </div>
  </a>
{/if}
