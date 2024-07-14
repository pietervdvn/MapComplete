<script lang="ts">
  import Translations from "../i18n/Translations"
  import { Utils } from "../../Utils"
  import Constants from "../../Models/Constants"
  import Tr from "../Base/Tr.svelte"
  import Add from "../../assets/svg/Add.svelte"
  import Github from "../../assets/svg/Github.svelte"
  import Mastodon from "../../assets/svg/Mastodon.svelte"
  import Liberapay from "../../assets/svg/Liberapay.svelte"
  import { EyeIcon } from "@rgossiaux/svelte-heroicons/solid"
  import MapillaryLink from "./MapillaryLink.svelte"
  import OpenJosm from "../Base/OpenJosm.svelte"
  import OpenIdEditor from "./OpenIdEditor.svelte"
  import If from "../Base/If.svelte"
  import Community from "../../assets/svg/Community.svelte"
  import Bug from "../../assets/svg/Bug.svelte"
  import ThemeViewState from "../../Models/ThemeViewState"
  import DocumentChartBar from "@babeard/svelte-heroicons/outline/DocumentChartBar"

  export let state: ThemeViewState

  let layout = state.layout
  let featureSwitches = state.featureSwitches
  let showHome = featureSwitches.featureSwitchBackToThemeOverview
</script>

<div class="link-underline links-w-full m-2 flex flex-col gap-y-1">
  <Tr t={Translations.t.general.aboutMapComplete.intro} />

  {#if $showHome}
    <a class="flex" href={Utils.HomepageLink()}>
      <Add class="h-6 w-6" />
      {#if Utils.isIframe}
        <Tr t={Translations.t.general.seeIndex} />
      {:else}
        <Tr t={Translations.t.general.backToIndex} />
      {/if}
    </a>
  {/if}

  <a class="flex" href="https://github.com/pietervdvn/MapComplete/" target="_blank">
    <Github class="h-6 w-6" />
    <Tr t={Translations.t.general.attribution.gotoSourceCode} />
  </a>

  <a class="flex" href="https://github.com/pietervdvn/MapComplete/issues" target="_blank">
    <Bug class="h-6 w-6" />
    <Tr t={Translations.t.general.attribution.openIssueTracker} />
  </a>

  <a
    class="flex"
    href={"https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Themes/" + layout.id + ".md"}
    target="_blank"
  >
    <DocumentChartBar class="h-6 w-6" />
    <Tr
      t={Translations.t.general.attribution.openThemeDocumentation.Subs({
        name: layout.title,
      })}
    />
  </a>

  <a class="flex" href="https://en.osm.town/@MapComplete" target="_blank">
    <Mastodon class="h-6 w-6" />
    <Tr t={Translations.t.general.attribution.followOnMastodon} />
  </a>

  <a class="flex" href="https://liberapay.com/pietervdvn/" target="_blank">
    <Liberapay class="h-6 w-6" />
    <Tr t={Translations.t.general.attribution.donate} />
  </a>

  <button class="as-link" on:click={() => state.guistate.communityIndexPanelIsOpened.setData(true)}>
    <Community class="h-6 w-6" />
    <Tr t={Translations.t.communityIndex.title} />
  </button>

  <If condition={featureSwitches.featureSwitchEnableLogin}>
    <OpenIdEditor mapProperties={state.mapProperties} />
    <OpenJosm {state} />
    <MapillaryLink large={false} mapProperties={state.mapProperties} />
  </If>

  <button class="as-link" on:click={() => state.guistate.privacyPanelIsOpened.setData(true)}>
    <EyeIcon class="h-6 w-6 pr-1" />
    <Tr t={Translations.t.privacy.title} />
  </button>

  <div class="subtle">
    {Constants.vNumber}
  </div>
</div>
