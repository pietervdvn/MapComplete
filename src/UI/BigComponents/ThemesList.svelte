<script lang="ts">
  import NoThemeResultButton from "./NoThemeResultButton.svelte"

  import { OsmConnection } from "../../Logic/Osm/OsmConnection"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import ThemeButton from "./ThemeButton.svelte"
  import { MinimalLayoutInformation } from "../../Models/ThemeConfig/LayoutConfig"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"

  export let search: UIEventSource<string>
  export let themes: MinimalLayoutInformation[]
  export let state: { osmConnection: OsmConnection }

  export let hasSelection : boolean = true

</script>

<section class="w-full">
  <slot name="title" />
  <div class="theme-list my-2 gap-4 md:grid md:grid-flow-row md:grid-cols-2 lg:grid-cols-3">
    {#each themes as theme (theme.id)}
      <ThemeButton
        {theme}
        {state}
      >
        {#if $search && hasSelection && themes?.[0] === theme}
        <span class="thanks hidden-on-mobile" aria-hidden="true">
          <Tr t={Translations.t.general.morescreen.enterToOpen} />
        </span>
        {/if}
      </ThemeButton>
    {/each}
  </div>

  {#if themes?.length === 0}
    <NoThemeResultButton {search} />
  {/if}
</section>
