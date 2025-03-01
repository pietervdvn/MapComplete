<script lang="ts">
  import Translations from "../i18n/Translations"
  import { CogIcon, EyeIcon, HeartIcon, TranslateIcon } from "@rgossiaux/svelte-heroicons/solid"
  import Page from "../Base/Page.svelte"
  import PrivacyPolicy from "./PrivacyPolicy.svelte"
  import Tr from "../Base/Tr.svelte"
  import If from "../Base/If.svelte"
  import CommunityIndexView from "./CommunityIndexView.svelte"
  import Community from "../../assets/svg/Community.svelte"
  import LoginToggle from "../Base/LoginToggle.svelte"
  import { CloseButton } from "flowbite-svelte"
  import HotkeyTable from "./HotkeyTable.svelte"
  import { Utils } from "../../Utils"
  import Constants from "../../Models/Constants"
  import Mastodon from "../../assets/svg/Mastodon.svelte"
  import Liberapay from "../../assets/svg/Liberapay.svelte"
  import DocumentMagnifyingGlass from "@babeard/svelte-heroicons/outline/DocumentMagnifyingGlass"
  import OpenIdEditor from "./OpenIdEditor.svelte"
  import OpenJosm from "../Base/OpenJosm.svelte"
  import MapillaryLink from "./MapillaryLink.svelte"
  import Bug from "../../assets/svg/Bug.svelte"
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
  import { BoltIcon, ShareIcon } from "@babeard/svelte-heroicons/mini"
  import Copyright from "../../assets/svg/Copyright.svelte"
  import Pencil from "../../assets/svg/Pencil.svelte"
  import SidebarUnit from "../Base/SidebarUnit.svelte"
  import Squares2x2 from "@babeard/svelte-heroicons/mini/Squares2x2"
  import EnvelopeOpen from "@babeard/svelte-heroicons/mini/EnvelopeOpen"
  import PanoramaxLink from "./PanoramaxLink.svelte"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import MagnifyingGlassCircle from "@babeard/svelte-heroicons/mini/MagnifyingGlassCircle"
  import { AndroidPolyfill } from "../../Logic/Web/AndroidPolyfill"
  import Forgejo from "../../assets/svg/Forgejo.svelte"
  import ChartBar from "@babeard/svelte-heroicons/solid/ChartBar"
  import QueueList from "@babeard/svelte-heroicons/solid/QueueList"
  import { MenuState } from "../../Models/MenuState"
  import { OsmConnection } from "../../Logic/Osm/OsmConnection"
  import FeatureSwitchState from "../../Logic/State/FeatureSwitchState"
  import ThemeConfig from "../../Models/ThemeConfig/ThemeConfig"
  import type { MapProperties } from "../../Models/MapProperties"
  import FavouritesFeatureSource from "../../Logic/FeatureSource/Sources/FavouritesFeatureSource"
  import Hotkeys from "../Base/Hotkeys"
  import { ArrowTrendingUp } from "@babeard/svelte-heroicons/solid/ArrowTrendingUp"
  import ArrowTopRightOnSquare from "@babeard/svelte-heroicons/mini/ArrowTopRightOnSquare"

  export let state: {
    favourites: FavouritesFeatureSource
    guistate: MenuState,
    osmConnection: OsmConnection,
    theme?: ThemeConfig,
    featureSwitches: Partial<FeatureSwitchState>,
    mapProperties?: MapProperties,
    userRelatedState?: UserRelatedState
  }
  let hotkeys = Hotkeys._docs
  let userdetails = state.osmConnection.userDetails

  let usersettingslayer = new LayerConfig(<LayerConfigJson>usersettings, "usersettings", true)

  let theme = state.theme
  let featureSwitches = state.featureSwitches
  let showHome = featureSwitches?.featureSwitchBackToThemeOverview
  let pg = state.guistate.pageStates
  let location = state.mapProperties?.location
  export let onlyLink: boolean
  const t = Translations.t.general.menu
  let shown = new UIEventSource(state.guistate.pageStates.menu.data || !onlyLink)
  state.guistate.pageStates.menu.addCallback((isShown) => {
    if (!onlyLink) {
      return true
    }
    if (isShown) {
      shown.setData(true)
    } else {
      Utils.waitFor(250).then(() => {
        shown.setData(state.guistate.pageStates.menu.data)
      })
    }
  })
  let isAndroid = AndroidPolyfill.inAndroid
</script>

<div
  class="low-interaction flex h-screen flex-col gap-y-2 overflow-y-auto p-2 sm:gap-y-3 sm:p-3"
  class:hidden={!$shown}
>
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
  <SidebarUnit>
    <LoginToggle {state}>
      <LoginButton osmConnection={state.osmConnection} slot="not-logged-in" />
      <div class="flex items-center gap-x-4">
        {#if $userdetails.img}
          <img alt="avatar" src={$userdetails.img} class="h-14 w-14 rounded-full" />
        {/if}
        <b>{$userdetails.name}</b>
      </div>
    </LoginToggle>

    <Page {onlyLink} shown={pg.usersettings} bodyPadding="p-0 pb-4">
      <svelte:fragment slot="header">
        <CogIcon />
        <Tr t={UserRelatedState.usersettingsConfig.title.GetRenderValue({})} />
      </svelte:fragment>

      <!-- All shown components are set by 'usersettings.json', which happily uses some special visualisations created specifically for it -->
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
    </Page>

    <LoginToggle {state} silentFail>
      {#if state.favourites}
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
      {/if}
      {#if $hotkeys.length > 0}
        <div class="hidden-on-mobile w-full">
          <Page {onlyLink} shown={pg.hotkeys}>
            <svelte:fragment slot="header">
              <BoltIcon />
              <Tr t={Translations.t.hotkeyDocumentation.title} />
            </svelte:fragment>
            <HotkeyTable />
          </Page>
        </div>
      {/if}

      <div class="self-end">
        <LogoutButton osmConnection={state.osmConnection} />
      </div>
    </LoginToggle>
    <LanguagePicker />
  </SidebarUnit>

  <!-- Theme related: documentation links, download, ... -->
  {#if state.theme}
    <SidebarUnit>
      <h3>
        <Tr t={t.aboutCurrentThemeTitle} />
      </h3>

      <Page {onlyLink} shown={pg.about_theme}>
        <svelte:fragment slot="link">
          <Marker size="h-7 w-7" icons={theme.icon} />
          <Tr t={t.showIntroduction} />
        </svelte:fragment>
        <svelte:fragment slot="header">
          <Marker size="h-8 w-8 mr-3" icons={theme.icon} />
          <Tr t={theme.title} />
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

      {#if state.featureSwitches?.featureSwitchEnableExport}
        <Page {onlyLink} shown={pg.download}>
          <svelte:fragment slot="header">
            <ArrowDownTray />
            <Tr t={Translations.t.general.download.title} />
          </svelte:fragment>
          <DownloadPanel {state} />
        </Page>
      {/if}

      {#if theme.official}
        <a
          class="flex"
          href={"https://source.mapcomplete.org/MapComplete/MapComplete/src/branch/develop/Docs/Themes/" +
          theme.id +
          ".md"}
          target="_blank"
        >
          <DocumentMagnifyingGlass class="h-6 w-6" />
          <Tr
            t={Translations.t.general.attribution.openThemeDocumentation.Subs({
            name: theme.title,
          })}
          />
        </a>

        <a class="flex" href={Utils.OsmChaLinkFor(31, theme.id)} target="_blank">
          <QueueList class="h-6 w-6" />
          <Tr t={Translations.t.general.attribution.openOsmcha.Subs({ theme: theme.title })} />
        </a>
        <a class="flex" href={`./statistics.html?filter-mapcomplete-changes-theme-search={"search"%3A"${theme.id}"}`}
           target="_blank">
          <ChartBar class="h-6 w-6" />
          <Tr t={Translations.t.general.attribution.openStatistics.Subs({theme: theme.title})} />
        </a>
      {/if}
    </SidebarUnit>
  {/if}

  <!-- Other links and tools for the given location: open iD/JOSM; community index, ... -->
  {#if state.mapProperties?.location}
    <SidebarUnit>
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

      <If condition={featureSwitches?.featureSwitchEnableLogin}>
        <OpenIdEditor mapProperties={state.mapProperties} />
        <OpenJosm {state} />
        <PanoramaxLink large={false} mapProperties={state.mapProperties} />
        <MapillaryLink large={false} mapProperties={state.mapProperties} />
      </If>

      <a class="sidebar-button flex" href="geo:{$location.lat},{$location.lon}">
        <ShareIcon />
        <Tr t={t.openHereDifferentApp} />
      </a>
    </SidebarUnit>
  {/if}

  <!-- About MC: various outward links, legal info, ... -->
  <SidebarUnit>
    <h3>
      <Tr t={Translations.t.general.menu.aboutMapComplete} />
    </h3>

    <a class="flex" href={window.location.protocol + "//" + window.location.host + "/studio.html"}>
      <Pencil class="mr-2 h-6 w-6" />
      <Tr t={Translations.t.general.morescreen.createYourOwnTheme} />
    </a>


    <a class="flex" href="mailto:info@mapcomplete.org">
      <EnvelopeOpen class="h-6 w-6" />
      <Tr t={Translations.t.general.attribution.emailCreators} />
    </a>

    <a class="flex" href="https://en.osm.town/@MapComplete" target="_blank">
      <Mastodon class="h-6 w-6" />
      <Tr t={Translations.t.general.attribution.followOnMastodon} />
    </a>

    <a class="flex" href="https://liberapay.com/pietervdvn/" target="_blank">
      <Liberapay class="h-6 w-6" />
      <Tr t={Translations.t.general.attribution.donate} />
    </a>


    <a
      class="flex"
      href="https://source.mapcomplete.org/MapComplete/MapComplete/issues"
      target="_blank"
    >
      <Bug class="h-6 w-6" />
      <Tr t={Translations.t.general.attribution.openIssueTracker} />
    </a>

    <a class="flex" href="https://source.mapcomplete.org/MapComplete/MapComplete/" target="_blank">
      <Forgejo class="h-6 w-6" />
      <Tr t={Translations.t.general.attribution.gotoSourceCode} />
    </a>
    <a class="flex" href={`${Constants.weblate}projects/mapcomplete/`} target="_blank">
      <TranslateIcon class="h-6 w-6" />
      <Tr t={Translations.t.translations.activateButton} />
    </a>


    <a
      class="flex"
      href={window.location.protocol + "//" + window.location.host + "/inspector.html"}
    >
      <MagnifyingGlassCircle class="mr-2 h-6 w-6" />
      <Tr t={Translations.t.inspector.menu} />
    </a>

    {#if !state.theme}
      <a class="flex" href={`./statistics.html`}
         target="_blank">
        <ChartBar class="h-6 w-6" />
        <Tr t={Translations.t.general.attribution.openStatistics.Subs({theme: "MapComplete"})} />
      </a>
    {/if}

    <a class="flex" href={Utils.OsmChaLinkFor(7)} target="_blank">
      <ArrowTrendingUp class="mr-2 h-6 w-6" />
      <Tr t={Translations.t.general.attribution.openOsmchaLastWeek} />
    </a>
  </SidebarUnit>
  <SidebarUnit>
    <h3>
      <Tr t={Translations.t.general.menu.legal} />
    </h3>
    <Page {onlyLink} shown={pg.copyright}>
      <svelte:fragment slot="header">
        <Copyright />
        <Tr t={Translations.t.general.attribution.attributionTitle} />
      </svelte:fragment>
      <CopyrightPanel {state} />
    </Page>
    {#if state?.theme}
      <Page {onlyLink} shown={pg.copyright_icons}>
        <svelte:fragment slot="header">
          <Copyright />
          <Tr t={Translations.t.general.attribution.iconAttribution.title} />
        </svelte:fragment>
        <CopyrightAllIcons {state} />
      </Page>
    {/if}

    <Page {onlyLink} shown={pg.privacy}>
      <svelte:fragment slot="header">
        <EyeIcon />
        <Tr t={Translations.t.privacy.title} />
      </svelte:fragment>
      <PrivacyPolicy {state} />
      <a href="./privacy.html" class="button w-fit float-right" target="_blank">
        <ArrowTopRightOnSquare class="w-8 h-8" />
      </a>
    </Page>

  </SidebarUnit>

  <div class="subtle self-end">
    {Constants.vNumber}
    {#if $isAndroid}
      Android
    {/if}
  </div>
</div>
