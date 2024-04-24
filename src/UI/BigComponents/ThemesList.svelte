<script lang="ts">
  import NoThemeResultButton from "./NoThemeResultButton.svelte"

  import { OsmConnection } from "../../Logic/Osm/OsmConnection"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import ThemeButton from "./ThemeButton.svelte"
  import { LayoutInformation } from "../../Models/ThemeConfig/LayoutConfig"
  import MoreScreen from "./MoreScreen"
  import themeOverview from "../../assets/generated/theme_overview.json"

  export let search: UIEventSource<string>
  export let themes: LayoutInformation[]
  export let state: { osmConnection: OsmConnection }
  export let isCustom: boolean = false
  export let hideThemes: boolean = true

  // Filter theme based on search value
  $: filteredThemes = themes.filter((theme) => MoreScreen.MatchesLayout(theme, $search))

  // Determine which is the first theme, after the search, using all themes
  $: allFilteredThemes = themeOverview.filter((theme) => MoreScreen.MatchesLayout(theme, $search))
  $: firstTheme = allFilteredThemes[0]
</script>

<section class="w-full">
  <slot name="title" />
  <div class="theme-list my-2 gap-4 md:grid md:grid-flow-row md:grid-cols-2 lg:grid-cols-3">
    {#each filteredThemes as theme (theme.id)}
      {#if theme !== undefined && !(hideThemes && theme?.hideFromOverview)}
        <!-- TODO: doesn't work if first theme is hidden -->
        {#if theme === firstTheme && !isCustom && $search !== "" && $search !== undefined}
          <ThemeButton
            {theme}
            {isCustom}
            userDetails={state.osmConnection.userDetails}
            {state}
            selected={true}
          />
        {:else}
          <ThemeButton {theme} {isCustom} userDetails={state.osmConnection.userDetails} {state} />
        {/if}
      {/if}
    {/each}
  </div>

  {#if filteredThemes.length === 0}
    <NoThemeResultButton {search} />
  {/if}
</section>
