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
  import Add from "../../assets/svg/Add.svelte"
  import Location_refused from "../../assets/svg/Location_refused.svelte"
  import Location from "../../assets/svg/Location.svelte"
  import SpecialTranslation from "../Popup/TagRendering/SpecialTranslation.svelte"

  /**
   * The theme introduction panel
   */
  export let state: ThemeViewState
  let layout = state.layout
  let selectedElement = state.selectedElement

  let triggerSearch: UIEventSource<any> = new UIEventSource<any>(undefined)
  let searchEnabled = false

  let geopermission: Store<GeolocationPermissionState> =
    state.geolocation.geolocationState.permission
  let currentGPSLocation = state.geolocation.geolocationState.currentGPSLocation

  function jumpToCurrentLocation() {
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
    <Tr t={Translations.t.general.welcomeExplanation.general} />
    {#if layout.layers.some((l) => l.presets?.length > 0)}
      <Tr t={Translations.t.general.welcomeExplanation.addNew} />
    {/if}

    <Tr t={layout.descriptionTail} />

    <!-- Buttons: open map, go to location, search -->
    <NextButton clss="primary w-full" on:click={() => state.guistate.themeIsOpened.setData(false)}>
      <div class="flex w-full justify-center text-2xl">
        <Tr t={Translations.t.general.openTheMap} />
      </div>
    </NextButton>

    <div class="flex w-full flex-wrap sm:flex-nowrap">
      <If condition={state.featureSwitches.featureSwitchGeolocation}>
        {#if $currentGPSLocation !== undefined || $geopermission === "prompt"}
          <button class="flex w-full items-center gap-x-2" on:click={jumpToCurrentLocation}>
            <Location class="h-8 w-8" />
            <Tr t={Translations.t.general.openTheMapAtGeolocation} />
          </button>
          <!-- No geolocation granted - we don't show the button -->
        {:else if $geopermission === "requested"}
          <button
            class="disabled flex w-full items-center gap-x-2"
            on:click={jumpToCurrentLocation}
          >
            <!-- Even though disabled, when clicking we request the location again in case the contributor dismissed the location popup -->
            <Location
              class="h-8 w-8"
              style="animation: 3s linear 0s infinite normal none running spin;"
            />
            <Tr t={Translations.t.general.waitingForGeopermission} />
          </button>
        {:else if $geopermission === "denied"}
          <button class="disabled flex w-full items-center gap-x-2">
            <Location_refused class="h-8 w-8" />
            <Tr t={Translations.t.general.geopermissionDenied} />
          </button>
        {:else}
          <button class="disabled flex w-full items-center gap-x-2">
            <Location
              class="h-8 w-8"
              style="animation: 3s linear 0s infinite normal none running spin;"
            />
            <Tr t={Translations.t.general.waitingForLocation} />
          </button>
        {/if}
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

  <div class="links-as-button links-w-full m-2 flex flex-col gap-y-1">
    <!-- bottom buttons, a bit hidden away: switch layout -->
    <a class="flex" href={Utils.HomepageLink()}>
      <Add class="h-6 w-6" />
      <Tr t={Translations.t.general.backToIndex} />
    </a>
  </div>
</div>
