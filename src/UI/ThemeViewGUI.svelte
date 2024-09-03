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
  import { MenuIcon } from "@rgossiaux/svelte-heroicons/solid"
  import Tr from "./Base/Tr.svelte"
  import FloatOver from "./Base/FloatOver.svelte"
  import Constants from "../Models/Constants"
  import LoginToggle from "./Base/LoginToggle.svelte"
  import LevelSelector from "./BigComponents/LevelSelector.svelte"
  import type { RasterLayerPolygon } from "../Models/RasterLayers"
  import { AvailableRasterLayers } from "../Models/RasterLayers"
  import { onDestroy } from "svelte"
  import OpenBackgroundSelectorButton from "./BigComponents/OpenBackgroundSelectorButton.svelte"
  import StateIndicator from "./BigComponents/StateIndicator.svelte"
  import UploadingImageCounter from "./Image/UploadingImageCounter.svelte"
  import PendingChangesIndicator from "./BigComponents/PendingChangesIndicator.svelte"
  import Cross from "../assets/svg/Cross.svelte"
  import Min from "../assets/svg/Min.svelte"
  import Plus from "../assets/svg/Plus.svelte"
  import Filter from "../assets/svg/Filter.svelte"
  import VisualFeedbackPanel from "./BigComponents/VisualFeedbackPanel.svelte"
  import { Orientation } from "../Sensors/Orientation"
  import GeolocationIndicator from "./BigComponents/GeolocationIndicator.svelte"
  import Compass_arrow from "../assets/svg/Compass_arrow.svelte"
  import ReverseGeocoding from "./BigComponents/ReverseGeocoding.svelte"
  import { BBox } from "../Logic/BBox"
  import ExtraLinkButton from "./BigComponents/ExtraLinkButton.svelte"
  import { LastClickFeatureSource } from "../Logic/FeatureSource/Sources/LastClickFeatureSource"
  import Marker from "./Map/Marker.svelte"
  import SelectedElementPanel from "./Base/SelectedElementPanel.svelte"
  import MenuDrawer from "./BigComponents/MenuDrawer.svelte"
  import DrawerLeft from "./Base/DrawerLeft.svelte"
  import Hash from "../Logic/Web/Hash"
  import { Drawer } from "flowbite-svelte"
  import { linear, sineIn } from "svelte/easing"

  export let state: ThemeViewState
  let layout = state.layout
  let maplibremap: UIEventSource<MlMap> = state.map
  let state_selectedElement = state.selectedElement
  let selectedElement: UIEventSource<Feature> = new UIEventSource<Feature>(undefined)
  let compass = Orientation.singleton.alpha
  let compassLoaded = Orientation.singleton.gotMeasurement
  Orientation.singleton.startMeasurements()

  let slideDuration = 150 // ms
  state.selectedElement.addCallback((value) => {
    if (!value) {
      selectedElement.setData(undefined)
      return
    }
    if(!selectedElement.data){
      // The store for this component doesn't have value right now, so we can simply set it
      selectedElement.set(value)
      return
    }
    // We first set the selected element to 'undefined' to force the popup to close...
    selectedElement.setData(undefined)
    // ... and we give svelte some time to update with requestAnimationFrame ...
    window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        // ... and we force a fresh popup window
        selectedElement.setData(value)
      })
    }, slideDuration)
  })


  let selectedLayer: Store<LayerConfig> = state.selectedElement.mapD((element) => {
    const id = element.properties.id
    if (id.startsWith("current_view")) {
      return currentViewLayer
    }
    if (id.startsWith("summary_")) {
      console.log("Not selecting a summary object. The summary object is", element)
      return undefined
    }
    if (id.startsWith(LastClickFeatureSource.newPointElementId)) {
      return layout.layers.find((l) => l.id === "last_click")
    }
    if (id === "location_track") {
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
    [mapproperties.zoom],
  )
  let canZoomOut = mapproperties.minzoom.map(
    (mz) => mapproperties.zoom.data > mz,
    [mapproperties.zoom],
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
      [bottomRight.lng, bottomRight.lat],
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
  let currentViewLayer: LayerConfig = layout.layers.find((l) => l.id === "current_view")
  let rasterLayer: Store<RasterLayerPolygon> = state.mapProperties.rasterLayer
  let rasterLayerName =
    rasterLayer.data?.properties?.name ??
    AvailableRasterLayers.defaultBackgroundLayer.properties.name
  onDestroy(
    rasterLayer.addCallbackAndRunD((l) => {
      rasterLayerName = l.properties.name
    }),
  )
  let addNewFeatureMode = state.userRelatedState.addNewFeatureMode
  let gpsAvailable = state.geolocation.geolocationState.gpsAvailable
  let gpsButtonAriaLabel = state.geolocation.geolocationState.gpsStateExplanation
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

  let hash = Hash.hash
</script>

<main>
  <div class="absolute top-0 left-0 h-screen w-screen overflow-hidden">
    <MaplibreMap map={maplibremap} mapProperties={mapproperties} autorecovery={true} />
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

    <div
      class="flex bg-black-light-transparent pointer-events-auto items-center justify-between px-4 py-1 flex-wrap-reverse">
      <!-- Top bar with tools -->
      <div class="flex items-center">

        <MapControlButton
          cls="m-0.5 p-0.5 sm:p-1"
          arialabel={Translations.t.general.labels.menu}
          on:click={() => {console.log("Opening...."); state.guistate.pageStates.menu.setData(true)}}
          on:keydown={forwardEventToMap}
        >
          <MenuIcon class="h-6 w-6 cursor-pointer" />
        </MapControlButton>

        <MapControlButton
          on:click={() => state.guistate.pageStates.about_theme.set(true)}
          on:keydown={forwardEventToMap}
        >
          <div
            class="m-0.5 mx-1 flex cursor-pointer items-center max-[480px]:w-full sm:mx-1 mr-2"
          >
            <Marker icons={layout.icon} size="h-6 w-6 shrink-0 mr-0.5 sm:mr-1 md:mr-2" />
            <b class="mr-1">
              <Tr t={layout.title} />
            </b>
          </div>
        </MapControlButton>
      </div>

      {#if $debug && $hash}
        <div class="alert">
          {$hash}
        </div>
      {/if}

      <If condition={state.featureSwitches.featureSwitchSearch}>
        <div class="w-full sm:w-64 my-2 sm:mt-0">

          <Geosearch
            bounds={state.mapProperties.bounds}
            on:searchCompleted={() => {
            state.map?.data?.getCanvas()?.focus()
          }}
            perLayer={state.perLayer}
            selectedElement={state.selectedElement}
            geolocationState={state.geolocation.geolocationState}
          />
        </div>
      </If>

    </div>

    <div class="pointer-events-auto float-right mt-1 flex flex-col px-1 max-[480px]:w-full sm:m-2">
      <If condition={state.visualFeedback}>
        {#if $selectedElement === undefined}
          <div class="w-fit">
            <VisualFeedbackPanel {state} />
          </div>
        {/if}
      </If>

    </div>
    <div class="float-left m-1 flex flex-col sm:mt-2">
      <If condition={state.featureSwitches.featureSwitchWelcomeMessage}>


      </If>
      {#if currentViewLayer?.tagRenderings && currentViewLayer.defaultIcon()}
        <MapControlButton
          on:click={() => {
            state.selectCurrentView()
          }}
          on:keydown={forwardEventToMap}
        >
          <div class="h-8 w-8 cursor-pointer">
            <ToSvelte construct={() => currentViewLayer.defaultIcon()} />
          </div>
        </MapControlButton>
      {/if}
      <ExtraLinkButton {state} />
      <UploadingImageCounter featureId="*" showThankYou={false} {state} />
      <PendingChangesIndicator {state} />
      <If condition={state.featureSwitchIsTesting}>
        <div class="alert w-fit">Testmode</div>
      </If>
      {#if state.osmConnection.Backend().startsWith("https://master.apis.dev.openstreetmap.org")}
        <div class="thanks">Testserver</div>
      {/if}
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
          {#if $addNewFeatureMode.indexOf("button") >= 0 && ((state.layout.hasPresets() && state.layout.enableAddNewPoints) || state.layout.hasNoteLayer())}
            <button
              class="low-interaction pointer-events-auto w-fit"
              class:disabled={$currentZoom < Constants.minZoomLevelToAddNewPoint}
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

        <div class="flex items-center">
          <!-- bottom left elements -->
          <If condition={state.featureSwitches.featureSwitchFilter}>
            <MapControlButton
              arialabel={Translations.t.general.labels.filter}
              on:click={() => state.guistate.openFilterView()}
              on:keydown={forwardEventToMap}
            >
              <Filter class="h-6 w-6" />
            </MapControlButton>
          </If>
          <If condition={state.featureSwitches.featureSwitchBackgroundSelection}>
            <OpenBackgroundSelectorButton
              hideTooltip={true}
              {state}
            />
          </If>
          <button
            class="unstyled bg-black-transparent pointer-events-auto ml-1 h-fit max-h-12 cursor-pointer overflow-hidden rounded-2xl px-1 text-white opacity-50 hover:opacity-100"
            style="background: #00000088; padding: 0.25rem; border-radius: 2rem;"
            on:click={() => {state.guistate.pageStates.copyright.set(true)}}
          >
            © <span class="hidden sm:inline sm:pr-2">
              OpenStreetMap
              <span class="hidden w-24 md:inline md:pr-2">, {rasterLayerName}</span>
            </span>
          </button>
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
              enabled={gpsAvailable}
              arialabelDynamic={gpsButtonAriaLabel}
              on:click={() => state.geolocationControl.handleClick()}
              on:keydown={forwardEventToMap}
            >
              <GeolocationIndicator {state} />
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

  <DrawerLeft shown={state.guistate.pageStates.menu}>
    <div class="h-screen overflow-y-auto">
      <MenuDrawer onlyLink={true} {state} />
    </div>
  </DrawerLeft>
  <MenuDrawer onlyLink={false} {state} />

  {#if $selectedElement !== undefined && $selectedLayer !== undefined && !$selectedLayer.popupInFloatover}
    <!-- right modal with the selected element view -->
    <Drawer
      placement="right"
      transitionType="fly"
      activateClickOutside={false}
      backdrop={false}
      id="drawer-right"
      width="w-full md:w-6/12 lg:w-5/12 xl:w-4/12"
      rightOffset="inset-y-0 right-0"
      transitionParams={ {
    x: 640,
    duration: slideDuration,
    easing: linear
  }}
      divClass="overflow-y-auto z-50 "
      hidden={$selectedElement === undefined}
      on:close={() => {      state.selectedElement.setData(undefined)
    }}
    >
      <div slot="close-button" />
      <SelectedElementPanel {state} selected={$state_selectedElement} />
    </Drawer>
  {/if}

  {#if $selectedElement !== undefined && $selectedLayer !== undefined && $selectedLayer.popupInFloatover}
    <!-- Floatover with the selected element, if applicable -->

    {#if $selectedLayer.popupInFloatover === "title"}
      <FloatOver
        on:close={() => {
          state.selectedElement.setData(undefined)
        }}
      >
        <span slot="close-button" />
        <SelectedElementPanel absolute={false} {state} selected={$state_selectedElement} />
      </FloatOver>
    {:else}
      <FloatOver
        on:close={() => {
          state.selectedElement.setData(undefined)
        }}
      >
        <SelectedElementView {state} layer={$selectedLayer} selectedElement={$state_selectedElement} />
      </FloatOver>
    {/if}
  {/if}

</main>
