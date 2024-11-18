<script lang="ts">
  /**
   * Either shows the 'recent' themes (if search string is empty) or shows matching theme results
   */
  import Translations from "../i18n/Translations"
  import ThemeSearch from "../../Logic/Search/ThemeSearch"
  import SidebarUnit from "../Base/SidebarUnit.svelte"
  import ThemeResult from "./ThemeResult.svelte"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import DotMenu from "../Base/DotMenu.svelte"
  import { TrashIcon } from "@babeard/svelte-heroicons/mini"
  import { CogIcon } from "@rgossiaux/svelte-heroicons/solid"
  import Tr from "../Base/Tr.svelte"

  export let state: SpecialVisualizationState
  let searchTerm = state.searchState.searchTerm
  let recentThemes = state.userRelatedState.recentlyVisitedThemes.value.map((themes) =>
    themes.filter((th) => th !== state.theme.id).slice(0, 6)
  )
  let themeResults = state.searchState.themeSuggestions

  const t = Translations.t.general.search
</script>

{#if $themeResults.length > 0}
  <SidebarUnit>
    <h3>
      <Tr t={t.otherMaps} />
    </h3>
    {#each $themeResults as entry (entry.id)}
      <ThemeResult {entry} />
    {/each}
  </SidebarUnit>
{/if}

{#if $searchTerm.length === 0 && $recentThemes?.length > 0}
  <SidebarUnit>
    <div class="flex w-full justify-between">
      <h3 class="m-2">
        <Tr t={t.recentThemes} />
      </h3>
      <DotMenu>
        <button
          on:click={() => {
            state.userRelatedState.recentlyVisitedThemes.clear()
          }}
        >
          <TrashIcon />
          <Tr t={t.deleteThemeHistory} />
        </button>
        <button on:click={() => state.guistate.openUsersettings("sync-visited-themes")}>
          <CogIcon />
          <Tr t={t.editThemeSync} />
        </button>
      </DotMenu>
    </div>
    {#each $recentThemes as themeId (themeId)}
      <ThemeResult entry={ThemeSearch.officialThemesById.get(themeId)} />
    {/each}
  </SidebarUnit>
{/if}
