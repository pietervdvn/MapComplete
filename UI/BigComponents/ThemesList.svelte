<script lang="ts">
  import NoThemeResultButton from "./NoThemeResultButton.svelte"

  import { OsmConnection } from "../../Logic/Osm/OsmConnection"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import type Loc from "../../Models/Loc"
  import Locale from "../i18n/Locale"
  import CustomGeneratorButton from "./CustomGeneratorButton.svelte"
  import ProfessionalServicesButton from "./ProfessionalServicesButton.svelte"
  import ThemeButton from "./ThemeButton.svelte"
  import { LayoutInformation } from "../../Models/ThemeConfig/LayoutConfig"
  import MoreScreen from "./MoreScreen"

  export let search: UIEventSource<string>
  export let themes: LayoutInformation[]
  export let state: { osmConnection: OsmConnection; locationControl?: UIEventSource<Loc> }
  export let isCustom: boolean = false
  export let onMainScreen: boolean = true
  export let hideThemes: boolean = true

  // Filter theme based on search value
  $: filteredThemes = themes.filter((theme) => MoreScreen.MatchesLayout(theme, $search))
</script>

<section>
  <slot name="title" />
  {#if onMainScreen}
    <div class="md:grid md:grid-flow-row md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#if ($search === undefined || $search === "") && !isCustom && hideThemes}
        <CustomGeneratorButton userDetails={state.osmConnection.userDetails} />
        <ProfessionalServicesButton />
      {/if}

      {#each filteredThemes as theme (theme.id)}
        {#if theme !== undefined && !(hideThemes && theme?.hideFromOverview)}
          <ThemeButton {theme} {isCustom} userDetails={state.osmConnection.userDetails} {state} />
        {/if}
      {/each}
    </div>
  {:else}
    <div>
      {#if ($search === undefined || $search === "") && !isCustom && hideThemes}
        <CustomGeneratorButton userDetails={state.osmConnection.userDetails} />
        <ProfessionalServicesButton />
      {/if}

      {#each filteredThemes as theme (theme.id)}
        {#if theme !== undefined && !(hideThemes && theme?.hideFromOverview)}
          <ThemeButton {theme} {isCustom} userDetails={state.osmConnection.userDetails} {state} />
        {/if}
      {/each}
    </div>
  {/if}

  {#if filteredThemes.length == 0}
    <NoThemeResultButton {search} />
  {/if}
</section>

<style lang="scss">
  section {
    @apply flex flex-col;
  }
</style>
