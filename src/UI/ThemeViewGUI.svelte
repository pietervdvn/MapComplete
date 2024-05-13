<script lang="ts">
  import { Store, UIEventSource } from "../Logic/UIEventSource"
  import { Map as MlMap } from "maplibre-gl"
  import MaplibreMap from "./Map/MaplibreMap.svelte"
  import FeatureSwitchState from "../Logic/State/FeatureSwitchState"
  import MapControlButton from "./Base/MapControlButton.svelte"
  import ToSvelte from "./Base/ToSvelte.svelte"
  import If from "./Base/If.svelte"
  import type { Feature } from "geojson"
  import SelectedElementView from "./BigComponents/SelectedElementView.svelte"
  import LayerConfig from "../Models/ThemeConfig/LayerConfig"
  import ThemeViewState from "../Models/ThemeViewState"
  import type { MapProperties } from "../Models/MapProperties"
  import Geosearch from "./BigComponents/Geosearch.svelte"
  import Translations from "./i18n/Translations"
  import {
    CogIcon,
    EyeIcon,
    HeartIcon,
    MenuIcon,
    XCircleIcon
  } from "@rgossiaux/svelte-heroicons/solid"
  import Tr from "./Base/Tr.svelte"
  import CommunityIndexView from "./BigComponents/CommunityIndexView.svelte"
  import FloatOver from "./Base/FloatOver.svelte"
  import Constants from "../Models/Constants"
  import TabbedGroup from "./Base/TabbedGroup.svelte"
  import UserRelatedState from "../Logic/State/UserRelatedState"
  import LoginToggle from "./Base/LoginToggle.svelte"
  import LoginButton from "./Base/LoginButton.svelte"
  import CopyrightPanel from "./BigComponents/CopyrightPanel"
  import DownloadPanel from "./DownloadFlow/DownloadPanel.svelte"
  import ModalRight from "./Base/ModalRight.svelte"
  import { Utils } from "../Utils"
  import Hotkeys from "./Base/Hotkeys"
  import LevelSelector from "./BigComponents/LevelSelector.svelte"
  import SelectedElementTitle from "./BigComponents/SelectedElementTitle.svelte"
  import ThemeIntroPanel from "./BigComponents/ThemeIntroPanel.svelte"
  import type { RasterLayerPolygon } from "../Models/RasterLayers"
  import { AvailableRasterLayers } from "../Models/RasterLayers"
  import RasterLayerOverview from "./Map/RasterLayerOverview.svelte"
  import IfHidden from "./Base/IfHidden.svelte"
  import { onDestroy } from "svelte"
  import MapillaryLink from "./BigComponents/MapillaryLink.svelte"
  import OpenIdEditor from "./BigComponents/OpenIdEditor.svelte"
  import OpenBackgroundSelectorButton from "./BigComponents/OpenBackgroundSelectorButton.svelte"
  import StateIndicator from "./BigComponents/StateIndicator.svelte"
  import ShareScreen from "./BigComponents/ShareScreen.svelte"
  import UploadingImageCounter from "./Image/UploadingImageCounter.svelte"
  import PendingChangesIndicator from "./BigComponents/PendingChangesIndicator.svelte"
  import Cross from "../assets/svg/Cross.svelte"
  import LanguagePicker from "./InputElement/LanguagePicker.svelte"
  import Mastodon from "../assets/svg/Mastodon.svelte"
  import Bug from "../assets/svg/Bug.svelte"
  import Liberapay from "../assets/svg/Liberapay.svelte"
  import OpenJosm from "./Base/OpenJosm.svelte"
  import Min from "../assets/svg/Min.svelte"
  import Plus from "../assets/svg/Plus.svelte"
  import Filter from "../assets/svg/Filter.svelte"
  import Add from "../assets/svg/Add.svelte"
  import Community from "../assets/svg/Community.svelte"
  import Download from "../assets/svg/Download.svelte"
  import Share from "../assets/svg/Share.svelte"
  import Favourites from "./Favourites/Favourites.svelte"
  import ImageOperations from "./Image/ImageOperations.svelte"
  import VisualFeedbackPanel from "./BigComponents/VisualFeedbackPanel.svelte"
  import { Orientation } from "../Sensors/Orientation"
  import GeolocationControl from "./BigComponents/GeolocationControl.svelte"
  import Compass_arrow from "../assets/svg/Compass_arrow.svelte"
  import ReverseGeocoding from "./BigComponents/ReverseGeocoding.svelte"
  import FilterPanel from "./BigComponents/FilterPanel.svelte"
  import PrivacyPolicy from "./BigComponents/PrivacyPolicy.svelte"
  import { BBox } from "../Logic/BBox"
  import ReviewsOverview from "./Reviews/ReviewsOverview.svelte"
  import ExtraLinkButton from "./BigComponents/ExtraLinkButton.svelte"
  import CloseAnimation from "./Base/CloseAnimation.svelte"
  import { LastClickFeatureSource } from "../Logic/FeatureSource/Sources/LastClickFeatureSource"

  export let state: ThemeViewState
  let layout = state.layout
  let maplibremap: UIEventSource<MlMap> = state.map
  let selectedElement: UIEventSource<Feature> = new UIEventSource<Feature>(undefined)
  let compass = Orientation.singleton.alpha
  let compassLoaded = Orientation.singleton.gotMeasurement
  Orientation.singleton.startMeasurements()

  state.selectedElement.addCallback((selected) => {
    if (!selected) {
      selectedElement.setData(selected)
      return
    }
    if (selected !== selectedElement.data) {
      // We first set the selected element to 'undefined' to force the popup to close...
      selectedElement.setData(undefined)
    }
    // ... we give svelte some time to update with requestAnimationFrame ...
    window.requestAnimationFrame(() => {
      // ... and we force a fresh popup window
      selectedElement.setData(selected)
    })
  })

  let selectedLayer: Store<LayerConfig> = state.selectedElement.mapD((element) => {
    if (element.properties.id.startsWith("current_view")) {
      return currentViewLayer
    }
    if (element.properties.id === "new_point_dialog") {
      return layout.layers.find((l) => l.id === "last_click")
    }
    if (element.properties.id === "location_track") {
      return layout.layers.find((l) => l.id === "gps_track")
    }
    return state.layout.getMatchingLayer(element.properties)
  })
  let currentZoom = state.mapProperties.zoom
  let showCrosshair = state.userRelatedState.showCrosshair
  let visualFeedback = state.visualFeedback
  let viewport: UIEventSource<HTMLDivElement> = new UIEventSource<HTMLDivElement>(undefined)
  let mapproperties: MapProperties = state.mapProperties
  state.mapProperties.installCustomKeyboardHandler(viewport)
  let canZoomIn = mapproperties.maxzoom.map(
    (mz) => mapproperties.zoom.data < mz,
    [mapproperties.zoom]
  )
  let canZoomOut = mapproperties.minzoom.map(
    (mz) => mapproperties.zoom.data > mz,
    [mapproperties.zoom]
  )

  function updateViewport() {
    const rect = viewport.data?.getBoundingClientRect()
    if (!rect) {
      return
    }
    const mlmap = state.map.data
    if (!mlmap) {
      return undefined
    }
    const topLeft = mlmap.unproject([rect.left, rect.top])
    const bottomRight = mlmap.unproject([rect.right, rect.bottom])
    const bbox = new BBox([
      [topLeft.lng, topLeft.lat],
      [bottomRight.lng, bottomRight.lat]
    ])
    state.visualFeedbackViewportBounds.setData(bbox)
  }

  viewport.addCallbackAndRunD(() => {
    updateViewport()
  })
  mapproperties.bounds.addCallbackAndRunD(() => {
    updateViewport()
  })
  let featureSwitches: FeatureSwitchState = state.featureSwitches
  let availableLayers = state.availableLayers
  let currentViewLayer: LayerConfig = layout.layers.find((l) => l.id === "current_view")
  let rasterLayer: Store<RasterLayerPolygon> = state.mapProperties.rasterLayer
  let rasterLayerName =
    rasterLayer.data?.properties?.name ??
    AvailableRasterLayers.defaultBackgroundLayer.properties.name
  onDestroy(
    rasterLayer.addCallbackAndRunD((l) => {
      rasterLayerName = l.properties.name
    })
  )
  let previewedImage = state.previewedImage

  let debug = state.featureSwitches.featureSwitchIsDebugging
  debug.addCallbackAndRun((dbg) => {
    if (dbg) {
      document.body.classList.add("debug")
    } else {
      document.body.classList.remove("debug")
    }
  })

  function forwardEventToMap(e: KeyboardEvent) {
    const mlmap = state.map.data
    if (!mlmap) {
      return
    }
    if (!mlmap.keyboard.isEnabled()) {
      return
    }
    const animation = mlmap.keyboard?.keydown(e)
    animation?.cameraAnimation(mlmap)
  }

  /**
   * Needed for the animations
   */
  let openMapButton : UIEventSource<HTMLElement> = new UIEventSource<HTMLElement>(undefined)
  let openMenuButton : UIEventSource<HTMLElement> = new UIEventSource<HTMLElement>(undefined)
  let openCurrentViewLayerButton : UIEventSource<HTMLElement> = new UIEventSource<HTMLElement>(undefined)
  let _openNewElementButton: HTMLButtonElement
  let openNewElementButton : UIEventSource<HTMLElement> = new UIEventSource<HTMLElement>(undefined)

  $: {
    openNewElementButton.setData(_openNewElementButton)
  }
  let openFilterButton : UIEventSource<HTMLElement> = new UIEventSource<HTMLElement>(undefined)
  let openBackgroundButton : UIEventSource<HTMLElement> = new UIEventSource<HTMLElement>(undefined)

</script>

<div class="absolute top-0 left-0 h-screen w-screen overflow-hidden">
  <MaplibreMap map={maplibremap} mapProperties={mapproperties} />
</div>

{#if $visualFeedback}
  <div
    class="pointer-events-none absolute top-0 left-0 flex h-screen w-screen items-center justify-center overflow-hidden"
  >
    <div
      bind:this={$viewport}
      class:border={$visualFeedback}
      style="border: 2px solid #ff000044; width: 300px; height: 300px"
    />
  </div>
{/if}

<div class="pointer-events-none absolute top-0 left-0 w-full">
  <!-- Top components -->

  <div class="pointer-events-auto float-right mt-1 flex flex-col px-1 max-[480px]:w-full sm:m-2">
    <If condition={state.visualFeedback}>
      {#if $selectedElement === undefined}
        <div class="w-fit">
          <VisualFeedbackPanel {state} />
        </div>
      {/if}
    </If>
    <If condition={state.featureSwitches.featureSwitchSearch}>
      <Geosearch
        bounds={state.mapProperties.bounds}
        on:searchCompleted={() => {
          state.map?.data?.getCanvas()?.focus()
        }}
        perLayer={state.perLayer}
        selectedElement={state.selectedElement}
        geolocationState={state.geolocation.geolocationState}
      />
    </If>
  </div>
  <div class="float-left m-1 flex flex-col sm:mt-2">
    <MapControlButton
      on:click={() => state.guistate.themeIsOpened.setData(true)}
      on:keydown={forwardEventToMap}
      htmlElem={openMapButton}
    >
      <div class="m-0.5 mx-1 flex cursor-pointer items-center max-[480px]:w-full sm:mx-1 md:mx-2">
        <img
          role="presentation"
          alt=""
          class="mr-0.5 block h-6 w-6 sm:mr-1 md:mr-2 md:h-8 md:w-8"
          src={layout.icon}
        />
        <b class="mr-1">
          <Tr t={layout.title} />
        </b>
      </div>
    </MapControlButton>
    <MapControlButton
      arialabel={Translations.t.general.labels.menu}
      on:click={() => state.guistate.menuIsOpened.setData(true)}
      on:keydown={forwardEventToMap}
      htmlElem={openMenuButton}
    >
      <MenuIcon class="h-8 w-8 cursor-pointer" />
    </MapControlButton>
    {#if currentViewLayer?.tagRenderings && currentViewLayer.defaultIcon()}
      <MapControlButton
        on:click={() => {
          state.selectCurrentView()
        }}
        on:keydown={forwardEventToMap}
        htmlElem={openCurrentViewLayerButton}
      >
        <ToSvelte
          construct={() => currentViewLayer.defaultIcon().SetClass("w-8 h-8 cursor-pointer")}
        />
      </MapControlButton>
    {/if}
    <ExtraLinkButton {state} />
    <UploadingImageCounter featureId="*" showThankYou={false} {state} />
    <PendingChangesIndicator {state} />
    <If condition={state.featureSwitchIsTesting}>
      <div class="alert w-fit">Testmode</div>
    </If>
    <If condition={state.featureSwitches.featureSwitchFakeUser}>
      <div class="alert w-fit">Faking a user (Testmode)</div>
    </If>
  </div>
  <div class="flex w-full flex-col items-center justify-center">
    <!-- Flex and w-full are needed for the positioning -->
    <!-- Centermessage -->
    <StateIndicator {state} />
    <ReverseGeocoding {state} />
  </div>
</div>

<div class="pointer-events-none absolute bottom-0 left-0 mb-4 w-screen">
  <!-- bottom controls -->
  <div class="flex w-full items-end justify-between px-4">
    <div class="flex flex-col">
      <If condition={featureSwitches.featureSwitchEnableLogin}>
        {#if (state.layout.hasPresets() && state.layout.enableAddNewPoints) || state.layout.hasNoteLayer()}
          <button
            class="pointer-events-auto w-fit low-interaction"
            class:disabled={$currentZoom < Constants.minZoomLevelToAddNewPoint}
            bind:this={_openNewElementButton}
            on:click={() => {
              state.openNewDialog()
            }}
            on:keydown={forwardEventToMap}
          >
            {#if $currentZoom < Constants.minZoomLevelToAddNewPoint}
              <Tr t={Translations.t.general.add.zoomInFurther} />
            {:else if state.layout.hasPresets()}
              <Tr t={Translations.t.general.add.title} />
            {:else}
              <Tr t={Translations.t.notes.addAComment} />
            {/if}
          </button>
        {/if}
      </If>

      <div class="flex">
        <!-- bottom left elements -->
        <If condition={state.featureSwitches.featureSwitchFilter}>
          <MapControlButton
            arialabel={Translations.t.general.labels.filter}
            on:click={() => state.guistate.openFilterView()}
            on:keydown={forwardEventToMap}
            htmlElem={openFilterButton}
          >
            <Filter class="h-6 w-6" />
          </MapControlButton>
        </If>
        <If condition={state.featureSwitches.featureSwitchBackgroundSelection}>
          <OpenBackgroundSelectorButton hideTooltip={true} {state} htmlElem={openBackgroundButton} />
        </If>
        <a
          class="bg-black-transparent pointer-events-auto h-fit max-h-12 cursor-pointer self-end overflow-hidden rounded-2xl pl-1 pr-2 text-white opacity-50 hover:opacity-100"
          on:click={() => {
            state.guistate.themeViewTab.setData("copyright")
            state.guistate.themeIsOpened.setData(true)
          }}
        >
          © OpenStreetMap, <span class="w-24">{rasterLayerName}</span>
        </a>
      </div>
    </div>

    <div class="flex flex-col items-end">
      <!-- bottom right elements -->
      <If condition={state.floors.map((f) => f.length > 1)}>
        <div class="pointer-events-auto mr-0.5">
          <LevelSelector
            floors={state.floors}
            layerState={state.layerState}
            zoom={state.mapProperties.zoom}
          />
        </div>
      </If>
      <MapControlButton
        arialabel={Translations.t.general.labels.zoomIn}
        enabled={canZoomIn}
        on:click={() => mapproperties.zoom.update((z) => z + 1)}
        on:keydown={forwardEventToMap}
      >
        <Plus class="h-8 w-8" />
      </MapControlButton>
      <MapControlButton
        enabled={canZoomOut}
        arialabel={Translations.t.general.labels.zoomOut}
        on:click={() => mapproperties.zoom.update((z) => z - 1)}
        on:keydown={forwardEventToMap}
      >
        <Min class="h-8 w-8" />
      </MapControlButton>
      <If condition={featureSwitches.featureSwitchGeolocation}>
        <div class="relative m-0">
          <MapControlButton
            arialabel={Translations.t.general.labels.jumpToLocation}
            on:click={() => state.geolocationControl.handleClick()}
            on:keydown={forwardEventToMap}
          >
            <GeolocationControl {state} />
            <!-- h-8 w-8 + p-0.5 sm:p-1 + 2px border => 9 sm: 10 in total-->
          </MapControlButton>
          {#if $compassLoaded}
            <div class="absolute top-0 left-0 m-0.5 h-0 w-0 sm:m-1">
              <Compass_arrow
                class="compass_arrow"
                style={`rotate: calc(${-$compass}deg + 45deg); transform-origin: 50% 50%;`}
              />
            </div>
          {/if}
        </div>
      </If>
    </div>
  </div>
</div>

<LoginToggle ignoreLoading={true} {state}>
  {#if ($showCrosshair === "yes" && $currentZoom >= 17) || $showCrosshair === "always" || $visualFeedback}
    <!-- Don't use h-full: h-full does _not_ include the area under the URL-bar, which offsets the crosshair a bit -->
    <div
      class="pointer-events-none absolute top-0 left-0 flex w-full items-center justify-center"
      style="height: 100vh"
    >
      <Cross class="h-4 w-4" />
    </div>
  {/if}
  <!-- Add in an empty container to remove error messages if login fails -->
  <svelte:fragment slot="error" />
</LoginToggle>

{#if $selectedElement !== undefined && $selectedLayer !== undefined && !$selectedLayer.popupInFloatover}
  <!-- right modal with the selected element view -->
  <ModalRight
    on:close={() => {
      selectedElement.setData(undefined)
    }}
  >
    <div slot="close-button" />
    <div class="normal-background absolute flex h-full w-full flex-col">
      <SelectedElementTitle {state} layer={$selectedLayer} selectedElement={$selectedElement} />
      <SelectedElementView {state} selectedElement={$selectedElement} />
    </div>
  </ModalRight>
{/if}

{#if $selectedElement !== undefined && $selectedLayer !== undefined && $selectedLayer.popupInFloatover}
  <!-- Floatover with the selected element, if applicable -->
  <FloatOver
    on:close={() => {
      state.selectedElement.setData(undefined)
    }}
  >
    <div class="flex h-full w-full flex-col">
      {#if $selectedLayer.popupInFloatover === "title"}
        <SelectedElementTitle {state} layer={$selectedLayer} selectedElement={$selectedElement}>
          <span slot="close-button" />
        </SelectedElementTitle>
      {/if}
      <SelectedElementView {state} layer={$selectedLayer} selectedElement={$selectedElement} />
    </div>
  </FloatOver>
{/if}

<If condition={state.previewedImage.map((i) => i !== undefined)}>
  <FloatOver extraClasses="p-1" on:close={() => state.previewedImage.setData(undefined)}>
    <button
      class="absolute right-4 top-4 h-8 w-8 rounded-full p-0"
      on:click={() => previewedImage.setData(undefined)}
      slot="close-button"
    >
      <XCircleIcon />
    </button>
    <ImageOperations image={$previewedImage} />
  </FloatOver>
</If>

<If condition={state.guistate.themeIsOpened}>
  <!-- Theme menu -->
  <FloatOver on:close={() => state.guistate.themeIsOpened.setData(false)}>
    <span slot="close-button"><!-- Disable the close button --></span>
    <TabbedGroup
      condition1={state.featureSwitches.featureSwitchFilter}
      tab={state.guistate.themeViewTabIndex}
    >
      <div slot="post-tablist">
        <XCircleIcon
          class="mr-2 h-8 w-8"
          on:click={() => state.guistate.themeIsOpened.setData(false)}
        />
      </div>

      <div class="flex" slot="title0">
        <img class="block h-4 w-4" src={layout.icon} />
        <Tr t={layout.title} />
      </div>

      <div class="m-4 h-full" slot="content0">
        <ThemeIntroPanel {state} />
      </div>

      <div class="flex" slot="title1">
        <If condition={state.featureSwitches.featureSwitchEnableExport}>
          <Download class="h-4 w-4" />
          <Tr t={Translations.t.general.download.title} />
        </If>
      </div>
      <div class="m-4" slot="content1">
        <DownloadPanel {state} />
      </div>

      <div slot="title2">
        <Tr t={Translations.t.general.attribution.title} />
      </div>

      <ToSvelte construct={() => new CopyrightPanel(state)} slot="content2" />

      <div class="flex" slot="title3">
        <Share class="h-4 w-4" />
        <Tr t={Translations.t.general.sharescreen.title} />
      </div>
      <div class="m-2" slot="content3">
        <ShareScreen {state} />
      </div>
    </TabbedGroup>
  </FloatOver>
</If>

<If condition={state.guistate.filtersPanelIsOpened}>
  <FloatOver on:close={() => state.guistate.filtersPanelIsOpened.setData(false)}>
    <FilterPanel {state} />
  </FloatOver>
</If>

<IfHidden condition={state.guistate.backgroundLayerSelectionIsOpened}>
  <!-- background layer selector -->
  <FloatOver
    on:close={() => {
      state.guistate.backgroundLayerSelectionIsOpened.setData(false)
    }}
  >
    <div class="h-full p-2">
      <RasterLayerOverview
        {availableLayers}
        map={state.map}
        mapproperties={state.mapProperties}
        userstate={state.userRelatedState}
        visible={state.guistate.backgroundLayerSelectionIsOpened}
      />
    </div>
  </FloatOver>
</IfHidden>

<If condition={state.guistate.menuIsOpened}>
  <!-- Menu page -->
  <FloatOver on:close={() => state.guistate.menuIsOpened.setData(false)}>
    <span slot="close-button"><!-- Hide the default close button --></span>
    <TabbedGroup
      condition1={featureSwitches.featureSwitchEnableLogin}
      condition2={state.featureSwitches.featureSwitchCommunityIndex}
      tab={state.guistate.menuViewTabIndex}
    >
      <div slot="post-tablist">
        <XCircleIcon
          class="mr-2 h-8 w-8"
          on:click={() => state.guistate.menuIsOpened.setData(false)}
        />
      </div>
      <div class="flex" slot="title0">
        <Tr t={Translations.t.general.menu.aboutMapComplete} />
      </div>

      <div class="links-as-button links-w-full m-2 flex flex-col gap-y-1" slot="content0">
        <Tr t={Translations.t.general.aboutMapComplete.intro} />

        <a class="flex" href={Utils.HomepageLink()}>
          <Add class="h-6 w-6" />
          <Tr t={Translations.t.general.backToIndex} />
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

        <button
          class="small soft flex"
          on:click={() => state.guistate.communityIndexPanelIsOpened.setData(true)}
        >
          <Community class="h-6 w-6" />
          <Tr t={Translations.t.communityIndex.title} />
        </button>

        <If condition={featureSwitches.featureSwitchEnableLogin}>
          <OpenIdEditor mapProperties={state.mapProperties} />
          <OpenJosm {state} />
          <MapillaryLink large={false} mapProperties={state.mapProperties} />
        </If>

        <button
          class="small soft flex"
          on:click={() => state.guistate.privacyPanelIsOpened.setData(true)}
        >
          <EyeIcon class="h-6 w-6 pr-1" />
          <Tr t={Translations.t.privacy.title} />
        </button>
        <div class="m-2 flex flex-col">
          <ToSvelte construct={Hotkeys.generateDocumentationDynamic} />
        </div>
        {Constants.vNumber}
      </div>

      <div class="flex" slot="title1">
        <CogIcon class="h-6 w-6" />
        <Tr t={UserRelatedState.usersettingsConfig.title.GetRenderValue({})} />
      </div>

      <div class="links-as-button" slot="content1">
        <!-- All shown components are set by 'usersettings.json', which happily uses some special visualisations created specifically for it -->
        <LoginToggle {state}>
          <div class="flex flex-col" slot="not-logged-in">
            <LanguagePicker availableLanguages={layout.language} />
            <Tr cls="alert" t={Translations.t.userinfo.notLoggedIn} />
            <LoginButton clss="primary" osmConnection={state.osmConnection} />
          </div>
          <SelectedElementView
            highlightedRendering={state.guistate.highlightedUserSetting}
            selectedElement={{
              type: "Feature",
              properties: { id: "settings" },
              geometry: { type: "Point", coordinates: [0, 0] },
            }}
            {state}
            tags={state.userRelatedState.preferencesAsTags}
          />
        </LoginToggle>
      </div>

      <div class="flex" slot="title2">
        <HeartIcon class="h-6 w-6" />
        <Tr t={Translations.t.favouritePoi.tab} />
      </div>

      <div class="m-2 flex flex-col" slot="content2">
        <h3>
          <Tr t={Translations.t.favouritePoi.title} />
        </h3>
        <Favourites {state} />
        <h3>
          <Tr t={Translations.t.reviews.your_reviews} />
        </h3>
        <ReviewsOverview {state} />
      </div>
    </TabbedGroup>
  </FloatOver>
</If>

<If condition={state.guistate.privacyPanelIsOpened}>
  <FloatOver on:close={() => state.guistate.privacyPanelIsOpened.setData(false)}>
    <div class="flex h-full flex-col overflow-hidden">
      <h2 class="low-interaction m-0 flex items-center p-4 drop-shadow-md">
        <EyeIcon class="w-6 pr-2" />
        <Tr t={Translations.t.privacy.title} />
      </h2>
      <div class="overflow-auto p-4">
        <PrivacyPolicy {state}/>
      </div>
    </div>
  </FloatOver>
</If>

<If condition={state.guistate.communityIndexPanelIsOpened}>
  <FloatOver on:close={() => state.guistate.communityIndexPanelIsOpened.setData(false)}>
    <div class="flex h-full flex-col overflow-hidden">
      <h2 class="low-interaction m-0 flex items-center p-4">
        <Community class="h-6 w-6" />
        <Tr t={Translations.t.communityIndex.title} />
      </h2>
      <div class="overflow-auto p-4">
        <CommunityIndexView location={state.mapProperties.location} />
      </div>
    </div>
  </FloatOver>
</If>


<CloseAnimation isOpened={state.guistate.themeIsOpened} moveTo={openMapButton} debug="theme"/>
<CloseAnimation isOpened={state.guistate.menuIsOpened} moveTo={openMenuButton} debug="menu"/>
<CloseAnimation isOpened={selectedLayer.map(sl => (sl !== undefined && sl === currentViewLayer))} moveTo={openCurrentViewLayerButton} debug="currentViewLayer"/>
<CloseAnimation isOpened={selectedElement.map(sl =>{ console.log("SE is", sl);  return sl !== undefined && sl?.properties?.id === LastClickFeatureSource.newPointElementId })} moveTo={openNewElementButton} debug="newElement"/>
<CloseAnimation isOpened={state.guistate.filtersPanelIsOpened} moveTo={openFilterButton} debug="filter"/>
<CloseAnimation isOpened={state.guistate.backgroundLayerSelectionIsOpened} moveTo={openBackgroundButton} debug="bg"/>
