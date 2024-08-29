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
  import { Avatar, Sidebar, SidebarWrapper } from "flowbite-svelte"
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

  export let state: ThemeViewState
  let userdetails = state.osmConnection.userDetails

  let usersettingslayer = new LayerConfig(<LayerConfigJson>usersettings, "usersettings", true)

  let layout = state.layout
  let featureSwitches = state.featureSwitches
  let showHome = featureSwitches.featureSwitchBackToThemeOverview
  let pg = state.guistate.pageStates
  export let onlyLink: boolean
</script>

<Sidebar>
  <SidebarWrapper divClass="link-underline">

    <!-- User related: avatar, settings, favourits, logout -->
    <div>
      <LoginToggle {state} >
        <LoginButton osmConnection={state.osmConnection} slot="not-logged-in"></LoginButton>
        <div class="flex">

          <Avatar src={$userdetails.img} rounded />
          Welcome <b>{$userdetails.name}</b>
        </div>
        <LogoutButton osmConnection={state.osmConnection}/>
      </LoginToggle>


      <Page {onlyLink} shown={pg.usersettings}>
        <div class="flex" slot="header">
          <CogIcon class="h-6 w-6" />
          <Tr t={UserRelatedState.usersettingsConfig.title.GetRenderValue({})} />
        </div>

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

        <div class="flex" slot="header">
          <HeartIcon class="h-6 w-6" />
          <Tr t={Translations.t.favouritePoi.tab} />
        </div>
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
      </LoginToggle>



    </div>


    <!-- Theme related: documentation links, download, ... -->
    <div>
      <h3>
        About {layout.id}
      </h3>

      <Page {onlyLink} shown={pg.about_theme}>
        <div class="flex" slot="header">
          <Marker icons={layout.icon} size="h-4 w-4" />
          <Tr t={layout.title} />
        </div>
        <ThemeIntroPanel {state} />
      </Page>

      <FilterPage {onlyLink} {state} />

      <RasterLayerOverview {onlyLink} {state} />

      <Page {onlyLink} shown={pg.share}>
        <div class="flex" slot="header">
          <Share class="h-4 w-4" />
          <Tr t={Translations.t.general.sharescreen.title} />
        </div>
        <ShareScreen {state} />
      </Page>


      {#if state.featureSwitches.featureSwitchEnableExport}
        <Page {onlyLink} shown={pg.download}>
          <div slot="header" class="flex">
            <ArrowDownTray class="h-4 w-4" />
            <Tr t={Translations.t.general.download.title} />
          </div>
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

    <!-- Legal info: privacy policy, map attribution, icon attribution -->
    <div>
      <h3>Legal</h3>

      <Page {onlyLink} shown={pg.copyright}>
        <Tr slot="header" t={Translations.t.general.attribution.attributionTitle} />
        <CopyrightPanel {state} />
      </Page>


      <Page {onlyLink} shown={pg.copyright_icons}>
        <div slot="header">
          <Tr t={ Translations.t.general.attribution.iconAttribution.title} />
        </div>
        <CopyrightAllIcons {state} />

      </Page>


      <Page {onlyLink} shown={pg.privacy}>
        <div class="flex gap-x-2" slot="header">
          <EyeIcon class="w-6 pr-2" />
          <Tr t={Translations.t.privacy.title} />
        </div>
        <PrivacyPolicy {state} />
      </Page>

    </div>

    <!-- Other links and tools for the given location: open iD/JOSM; community index, ... -->
    <div>

      <h3>
        Discover more
      </h3>

      <Page {onlyLink} shown={pg.community_index}>
        <div class="flex gap-x-2" slot="header">
          <Community class="h-6 w-6" />
          <Tr t={Translations.t.communityIndex.title} />
        </div>
        <CommunityIndexView location={state.mapProperties.location} />
      </Page>


      <If condition={featureSwitches.featureSwitchEnableLogin}>
        <OpenIdEditor mapProperties={state.mapProperties} />
        <OpenJosm {state} />
        <MapillaryLink large={false} mapProperties={state.mapProperties} />
      </If>

    </div>
    <!-- About MC: various hints -->
    <div>

      <h3>
        <Tr t={Translations.t.general.menu.aboutMapComplete} />
      </h3>

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


      <Page {onlyLink} shown={pg.hotkeys}>
        <Tr t={ Translations.t.hotkeyDocumentation.title} slot="header" />
        <HotkeyTable />
      </Page>

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

      <div class="subtle">
        {Constants.vNumber}
      </div>
    </div>

  </SidebarWrapper>
</Sidebar>
