<script lang="ts">
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"
  import NextButton from "../Base/NextButton.svelte"
  import Geosearch from "./Geosearch.svelte"
  import ThemeViewState from "../../Models/ThemeViewState"
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import { SearchIcon } from "@rgossiaux/svelte-heroicons/solid"
  import { twJoin } from "tailwind-merge"
  import { Utils } from "../../Utils"
  import type { GeolocationPermissionState } from "../../Logic/State/GeoLocationState"
  import { GeoLocationState } from "../../Logic/State/GeoLocationState"
  import If from "../Base/If.svelte"
  import { ExclamationTriangleIcon } from "@babeard/svelte-heroicons/mini"
  import Location_refused from "../../assets/svg/Location_refused.svelte"
  import Location from "../../assets/svg/Location.svelte"
  import ChevronDoubleLeft from "@babeard/svelte-heroicons/solid/ChevronDoubleLeft"
  import GeolocationIndicator from "./GeolocationIndicator.svelte"

  /**
   * The theme introduction panel
   */
  export let state: ThemeViewState
  let layout = state.layout
  let selectedElement = state.selectedElement

  let triggerSearch: UIEventSource<any> = new UIEventSource<any>(undefined)
  let searchEnabled = false

  let geolocation = state.geolocation.geolocationState
  let geopermission: Store<GeolocationPermissionState> = geolocation.permission
  let currentGPSLocation = geolocation.currentGPSLocation
  let gpsExplanation = geolocation.gpsStateExplanation
  let gpsAvailable = geolocation.gpsAvailable

  function jumpToCurrentLocation() {
    state.geolocationControl.handleClick()
    const glstate = state.geolocation.geolocationState
    if (glstate.currentGPSLocation.data !== undefined) {
      const c: GeolocationCoordinates = glstate.currentGPSLocation.data
      state.guistate.themeIsOpened.setData(false)
      const coor = { lon: c.longitude, lat: c.latitude }
      state.mapProperties.location.setData(coor)
    }
    if (glstate.permission.data !== "granted") {
      glstate.requestPermission()
      return
    }
  }
</script>

<div class="flex h-full flex-col justify-between">
  <div>
    <!-- Intro, description, ... -->

    <Tr t={layout.description} />

    <If condition={state.featureSwitches.featureSwitchEnableLogin}>
      <Tr t={Translations.t.general.welcomeExplanation.general} />
      {#if layout.layers.some((l) => l.presets?.length > 0)}
        <Tr t={Translations.t.general.welcomeExplanation.addNew} />
      {/if}
    </If>

    <Tr t={layout.descriptionTail} />

    <!-- Buttons: open map, go to location, search -->
    <NextButton clss="primary w-full" on:click={() => state.guistate.themeIsOpened.setData(false)}>
      <div class="flex w-full flex-col items-center">
        <div class="flex w-full justify-center text-2xl">
          <Tr t={Translations.t.general.openTheMap} />
        </div>
        <If condition={state.featureSwitches.featureSwitchEnableLogin}>
          <Tr t={Translations.t.general.openTheMapReason} />
        </If>
      </div>
    </NextButton>

    <div class="flex w-full flex-wrap sm:flex-nowrap">
      <If condition={state.featureSwitches.featureSwitchGeolocation}>
        <button
          disabled={!$gpsAvailable}
          class:disabled={!$gpsAvailable}
          class="flex w-full items-center gap-x-2"
          on:click={jumpToCurrentLocation}
        >
          <GeolocationIndicator {state} />
          <Tr t={$gpsExplanation} />
        </button>
      </If>

      <If condition={state.featureSwitches.featureSwitchSearch}>
        <div
          class=".button low-interaction m-1 flex h-fit w-full flex-wrap items-center justify-end gap-x-2 gap-y-2 rounded border p-1"
        >
          <div style="min-width: 16rem; " class="grow">
            <Geosearch
              bounds={state.mapProperties.bounds}
              on:searchCompleted={() => state.guistate.themeIsOpened.setData(false)}
              on:searchIsValid={(event) => {
                searchEnabled = event.detail
              }}
              perLayer={state.perLayer}
              {selectedElement}
              {triggerSearch}
              geolocationState={state.geolocation.geolocationState}
              searcher={state.geosearch}
              {state}
            />
          </div>
          <button
            class={twJoin(
              "small flex w-fit shrink-0 items-center justify-between gap-x-2",
              !searchEnabled && "disabled"
            )}
            on:click={() => triggerSearch.ping()}
          >
            <Tr t={Translations.t.general.search.searchShort} />
            <SearchIcon class="h-6 w-6" />
          </button>
        </div>
      </If>
    </div>

    {#if $currentGPSLocation === undefined && $geopermission === "requested" && GeoLocationState.isSafari()}
      <a
        href="https://support.apple.com/en-us/HT207092"
        class="button w-full"
        target="_blank"
        rel="noopener"
      >
        <div class="link-underline m-1 flex w-full">
          <ExclamationTriangleIcon class="w-12 pr-2" />
          <div class="flex w-full flex-col">
            <Tr cls="font-normal" t={Translations.t.general.enableGeolocationForSafari} />
            <Tr t={Translations.t.general.enableGeolocationForSafariLink} />
          </div>
        </div>
      </a>
    {/if}
  </div>

  {#if Utils.isIframe}
    <div class="link-underline flex justify-end">
      <a href="https://mapcomplete.org" target="_blank">
        <Tr t={Translations.t.general.poweredByMapComplete} />
      </a>
    </div>
  {:else}
    <If condition={state.featureSwitches.featureSwitchBackToThemeOverview}>
      <div class="link-underline m-2 mx-4 flex w-full">
        <a class="flex w-fit items-center justify-end" href={Utils.HomepageLink()}>
          <ChevronDoubleLeft class="h-4 w-4" />
          <Tr t={Translations.t.general.backToIndex} />
        </a>
      </div>
    </If>
  {/if}
</div>
