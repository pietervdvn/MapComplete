<script lang="ts">
  // All the relevant links
  import ThemeViewState from "../../Models/ThemeViewState"
  import Translations from "../i18n/Translations"
  import { CogIcon, EyeIcon, HeartIcon } from "@rgossiaux/svelte-heroicons/solid"
  import Page from "../Base/Page.svelte"
  import PrivacyPolicy from "./PrivacyPolicy.svelte"
  import Tr from "../Base/Tr.svelte"
  import If from "../Base/If.svelte"
  import CommunityIndexView from "./CommunityIndexView.svelte"
  import Community from "../../assets/svg/Community.svelte"
  import LoginToggle from "../Base/LoginToggle.svelte"
  import { CloseButton, Sidebar } from "flowbite-svelte"
  import HotkeyTable from "./HotkeyTable.svelte"
  import { Utils } from "../../Utils"
  import Constants from "../../Models/Constants"
  import Mastodon from "../../assets/svg/Mastodon.svelte"
  import Liberapay from "../../assets/svg/Liberapay.svelte"
  import DocumentMagnifyingGlass from "@babeard/svelte-heroicons/outline/DocumentMagnifyingGlass"
  import DocumentChartBar from "@babeard/svelte-heroicons/outline/DocumentChartBar"
  import OpenIdEditor from "./OpenIdEditor.svelte"
  import OpenJosm from "../Base/OpenJosm.svelte"
  import MapillaryLink from "./MapillaryLink.svelte"
  import Github from "../../assets/svg/Github.svelte"
  import Bug from "../../assets/svg/Bug.svelte"
  import Add from "../../assets/svg/Add.svelte"
  import CopyrightPanel from "./CopyrightPanel.svelte"
  import CopyrightAllIcons from "./CopyrightAllIcons.svelte"
  import LanguagePicker from "../InputElement/LanguagePicker.svelte"
  import LoginButton from "../Base/LoginButton.svelte"
  import SelectedElementView from "./SelectedElementView.svelte"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import type { LayerConfigJson } from "../../Models/ThemeConfig/Json/LayerConfigJson"
  import usersettings from "../../assets/generated/layers/usersettings.json"
  import UserRelatedState from "../../Logic/State/UserRelatedState"
  import ArrowDownTray from "@babeard/svelte-heroicons/mini/ArrowDownTray"
  import DownloadPanel from "../DownloadFlow/DownloadPanel.svelte"
  import Favourites from "../Favourites/Favourites.svelte"
  import ReviewsOverview from "../Reviews/ReviewsOverview.svelte"
  import Share from "@babeard/svelte-heroicons/solid/Share"
  import ShareScreen from "./ShareScreen.svelte"
  import FilterPage from "./FilterPage.svelte"
  import RasterLayerOverview from "../Map/RasterLayerOverview.svelte"
  import ThemeIntroPanel from "./ThemeIntroPanel.svelte"
  import Marker from "../Map/Marker.svelte"
  import LogoutButton from "../Base/LogoutButton.svelte"
  import { BoltIcon } from "@babeard/svelte-heroicons/mini"
  import Copyright from "../../assets/svg/Copyright.svelte"
  import Pencil from "../../assets/svg/Pencil.svelte"
  import Squares2x2 from "@babeard/svelte-heroicons/mini/Squares2x2"

  export let state: ThemeViewState
  let userdetails = state.osmConnection.userDetails

  let usersettingslayer = new LayerConfig(<LayerConfigJson>usersettings, "usersettings", true)

  let layout = state.layout
  let featureSwitches = state.featureSwitches
  let showHome = featureSwitches.featureSwitchBackToThemeOverview
  let pg = state.guistate.pageStates
  export let onlyLink: boolean
  const t = Translations.t.general.menu
</script>

<div class="low-interaction flex h-screen flex-col gap-y-2 overflow-y-auto p-2 sm:gap-y-3 sm:p-3">
  <div class="flex justify-between">
    <h2>
      <Tr t={t.title} />
    </h2>
    <CloseButton
      on:click={() => {
        pg.menu.set(false)
      }}
    />
  </div>
  {#if $showHome}
    <a class="button primary flex" href={Utils.HomepageLink()}>
      <Squares2x2 class="h-10 w-10" />
      {#if Utils.isIframe}
        <Tr t={Translations.t.general.seeIndex} />
      {:else}
        <Tr t={Translations.t.general.backToIndex} />
      {/if}
    </a>
  {/if}

  <!-- User related: avatar, settings, favourits, logout -->
  <div class="sidebar-unit">
    <LoginToggle {state}>
      <LoginButton osmConnection={state.osmConnection} slot="not-logged-in" />
      <div class="flex items-center gap-x-4">
        {#if $userdetails.img}
          <img src={$userdetails.img} class="h-14 w-14 rounded-full" />
        {/if}
        <b>{$userdetails.name}</b>
      </div>
    </LoginToggle>

    <Page {onlyLink} shown={pg.usersettings} bodyPadding="p-0">
      <svelte:fragment slot="header">
        <CogIcon />
        <Tr t={UserRelatedState.usersettingsConfig.title.GetRenderValue({})} />
      </svelte:fragment>

      <!-- All shown components are set by 'usersettings.json', which happily uses some special visualisations created specifically for it -->
      <LoginToggle {state}>
        <div class="flex flex-col" slot="not-logged-in">
          <LanguagePicker availableLanguages={layout.language} />
          <Tr cls="alert" t={Translations.t.userinfo.notLoggedIn} />
          <LoginButton clss="primary" osmConnection={state.osmConnection} />
        </div>
        <SelectedElementView
          highlightedRendering={state.guistate.highlightedUserSetting}
          layer={usersettingslayer}
          selectedElement={{
            type: "Feature",
            properties: { id: "settings" },
            geometry: { type: "Point", coordinates: [0, 0] },
          }}
          {state}
          tags={state.userRelatedState.preferencesAsTags}
        />
      </LoginToggle>
    </Page>

    <LoginToggle {state}>
      <Page {onlyLink} shown={pg.favourites}>
        <svelte:fragment slot="header">
          <HeartIcon />
          <Tr t={Translations.t.favouritePoi.tab} />
        </svelte:fragment>

        <h3>
          <Tr t={Translations.t.favouritePoi.title} />
        </h3>
        <div>
          <Favourites {state} />
          <h3>
            <Tr t={Translations.t.reviews.your_reviews} />
          </h3>
          <ReviewsOverview {state} />
        </div>
      </Page>
      <div class="self-end">
        <LogoutButton osmConnection={state.osmConnection} />
      </div>
    </LoginToggle>

    <LanguagePicker />
  </div>

  <!-- Theme related: documentation links, download, ... -->
  <div class="sidebar-unit">
    <h3>
      <Tr t={t.aboutCurrentThemeTitle} />
    </h3>

    <Page {onlyLink} shown={pg.about_theme}>
      <svelte:fragment slot="link">
        <Marker icons={layout.icon} />
        <Tr t={t.showIntroduction} />
      </svelte:fragment>
      <svelte:fragment slot="header">
        <Marker size="h-6 w-6 mr-2"  icons={layout.icon} />
        <Tr t={layout.title} />
      </svelte:fragment>
      <ThemeIntroPanel {state} />
    </Page>

    <FilterPage {onlyLink} {state} />

    <RasterLayerOverview {onlyLink} {state} />

    <Page {onlyLink} shown={pg.share}>
      <svelte:fragment slot="header">
        <Share />
        <Tr t={Translations.t.general.sharescreen.title} />
      </svelte:fragment>
      <ShareScreen {state} />
    </Page>

    {#if state.featureSwitches.featureSwitchEnableExport}
      <Page {onlyLink} shown={pg.download}>
        <svelte:fragment slot="header">
          <ArrowDownTray />
          <Tr t={Translations.t.general.download.title} />
        </svelte:fragment>
        <DownloadPanel {state} />
      </Page>
    {/if}

    {#if layout.official}
      <a
        class="flex"
        href={"https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Themes/" +
          layout.id +
          ".md"}
        target="_blank"
      >
        <DocumentMagnifyingGlass class="h-6 w-6" />
        <Tr
          t={Translations.t.general.attribution.openThemeDocumentation.Subs({
            name: layout.title,
          })}
        />
      </a>

      <a class="flex" href={Utils.OsmChaLinkFor(31, layout.id)} target="_blank">
        <DocumentChartBar class="h-6 w-6" />
        <Tr t={Translations.t.general.attribution.openOsmcha.Subs({ theme: layout.title })} />
      </a>
    {/if}
  </div>

  <!-- Other links and tools for the given location: open iD/JOSM; community index, ... -->
  <div class="sidebar-unit">
    <h3>
      <Tr t={t.moreUtilsTitle} />
    </h3>

    <Page {onlyLink} shown={pg.community_index}>
      <svelte:fragment slot="header">
        <Community />
        <Tr t={Translations.t.communityIndex.title} />
      </svelte:fragment>
      <CommunityIndexView location={state.mapProperties.location} />
    </Page>

    <If condition={featureSwitches.featureSwitchEnableLogin}>
      <OpenIdEditor mapProperties={state.mapProperties} />
      <OpenJosm {state} />
      <MapillaryLink large={false} mapProperties={state.mapProperties} />
    </If>
  </div>

  <!-- About MC: various outward links, legal info, ... -->
  <div class="sidebar-unit">
    <h3>
      <Tr t={Translations.t.general.menu.aboutMapComplete} />
    </h3>

    <a class="flex" href={window.location.protocol + "//" + window.location.host + "/studio.html"}>
      <Pencil class="mr-2 h-6 w-6" />
      <Tr t={Translations.t.general.morescreen.createYourOwnTheme} />
    </a>

    <div class="hidden-on-mobile w-full">
      <Page {onlyLink} shown={pg.hotkeys}>
        <svelte:fragment slot="header">
          <BoltIcon />
          <Tr t={Translations.t.hotkeyDocumentation.title} />
        </svelte:fragment>
        <HotkeyTable />
      </Page>
    </div>

    <a class="flex" href="https://github.com/pietervdvn/MapComplete/" target="_blank">
      <Github class="h-6 w-6" />
      <Tr t={Translations.t.general.attribution.gotoSourceCode} />
    </a>

    <a class="flex" href="https://github.com/pietervdvn/MapComplete/issues" target="_blank">
      <Bug class="h-6 w-6" />
      <Tr t={Translations.t.general.attribution.openIssueTracker} />
    </a>

    <a class="flex" href="https://en.osm.town/@MapComplete" target="_blank">
      <Mastodon class="h-6 w-6" />
      <Tr t={Translations.t.general.attribution.followOnMastodon} />
    </a>

    <a class="flex" href="https://liberapay.com/pietervdvn/" target="_blank">
      <Liberapay class="h-6 w-6" />
      <Tr t={Translations.t.general.attribution.donate} />
    </a>

    <Page {onlyLink} shown={pg.copyright}>
      <svelte:fragment slot="header">
        <Copyright />
        <Tr t={Translations.t.general.attribution.attributionTitle} />
      </svelte:fragment>
      <CopyrightPanel {state} />
    </Page>

    <Page {onlyLink} shown={pg.copyright_icons}>
      <svelte:fragment slot="header">
        <Copyright />
        <Tr t={Translations.t.general.attribution.iconAttribution.title} />
      </svelte:fragment>
      <CopyrightAllIcons {state} />
    </Page>

    <Page {onlyLink} shown={pg.privacy}>
      <svelte:fragment slot="header">
        <EyeIcon />
        <Tr t={Translations.t.privacy.title} />
      </svelte:fragment>
      <PrivacyPolicy {state} />
    </Page>

    <div class="subtle self-end">
      {Constants.vNumber}
    </div>
  </div>
</div>

<style>
  :global(.sidebar-unit) {
    display: flex;
    flex-direction: column;
    row-gap: 0.25rem;
    background: var(--background-color);
    padding: 0.5rem;
    border-radius: 0.5rem;
  }

  :global(.sidebar-unit > h3) {
    margin-top: 0;
    margin-bottom: 0.5rem;
    padding: 0.25rem;
  }

  :global(.sidebar-button svg, .sidebar-button img) {
    width: 1.5rem;
    height: 1.5rem;
    margin-right: 0.5rem;
    flex-shrink: 0;
  }

  :global(.sidebar-button .weblate-link > svg) {
    width: 0.75rem;
    height: 0.75rem;
    flex-shrink: 0;
  }

  :global(.sidebar-button, .sidebar-unit > a) {
    display: flex;
    align-items: center;
    border-radius: 0.25rem !important;
    padding: 0.4rem 0.75rem !important;
    text-decoration: none !important;
    width: 100%;
    text-align: start;
  }

  :global(
      .sidebar-button > svg,
      .sidebar-button > img,
      .sidebar-unit a > img,
      .sidebar-unit > a svg
    ) {
    margin-right: 0.5rem;
    flex-shrink: 0;
  }

  :global(.sidebar-button:hover, .sidebar-unit > a:hover) {
    background: var(--low-interaction-background) !important;
  }
</style>
