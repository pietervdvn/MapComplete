<script lang="ts">
  import Translations from "../i18n/Translations";
  import Svg from "../../Svg";
  import Tr from "../Base/Tr.svelte";
  import NextButton from "../Base/NextButton.svelte";
  import Geosearch from "./Geosearch.svelte";
  import ToSvelte from "../Base/ToSvelte.svelte";
  import ThemeViewState from "../../Models/ThemeViewState";
  import { Store, UIEventSource } from "../../Logic/UIEventSource";
  import { SearchIcon } from "@rgossiaux/svelte-heroicons/solid";
  import { twJoin } from "tailwind-merge";
  import { Utils } from "../../Utils";
  import type { GeolocationPermissionState } from "../../Logic/State/GeoLocationState";

  /**
   * The theme introduction panel
   */
  export let state: ThemeViewState;
  let layout = state.layout;
  let selectedElement = state.selectedElement;
  let selectedLayer = state.selectedLayer;

  let triggerSearch: UIEventSource<any> = new UIEventSource<any>(undefined);
  let searchEnabled = false;

  let geopermission: Store<GeolocationPermissionState> = state.geolocation.geolocationState.permission;
  let currentGPSLocation = state.geolocation.geolocationState.currentGPSLocation;

  geopermission.addCallback(perm => console.log(">>>> Permission", perm));

  function jumpToCurrentLocation() {
    const glstate = state.geolocation.geolocationState;
    if (glstate.currentGPSLocation.data !== undefined) {
      const c: GeolocationCoordinates = glstate.currentGPSLocation.data;
      state.guistate.themeIsOpened.setData(false);
      const coor = { lon: c.longitude, lat: c.latitude };
      state.mapProperties.location.setData(coor);
    }
    if (glstate.permission.data !== "granted") {
      glstate.requestPermission();
      return;
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
      {#if $currentGPSLocation !== undefined || $geopermission === "prompt"}
        <button class="flex w-full items-center gap-x-2" on:click={jumpToCurrentLocation}>
          <ToSvelte construct={Svg.crosshair_svg().SetClass("w-8 h-8")} />
          <Tr t={Translations.t.general.openTheMapAtGeolocation} />
        </button>
        <!-- No geolocation granted - we don't show the button -->
      {:else if $geopermission === "requested"}
        <button class="flex w-full items-center gap-x-2 disabled" on:click={jumpToCurrentLocation}>
          <!-- Even though disabled, when clicking we request the location again in case the contributor dismissed the location popup -->
          <ToSvelte construct={Svg.crosshair_svg().SetClass("w-8 h-8").SetClass("animate-spin")} />
          <Tr t={Translations.t.general.waitingForGeopermission} />
        </button>
      {:else if $geopermission !== "denied"}
        <button class="flex w-full items-center gap-x-2 disabled">
          <ToSvelte construct={Svg.crosshair_svg().SetClass("w-8 h-8").SetClass("motion-safe:animate-spin")} />
          <Tr t={Translations.t.general.waitingForLocation} />
        </button>
      {/if}

      <div class=".button low-interaction m-1 flex w-full items-center gap-x-2 rounded border p-2">
        <div class="w-full">
          <Geosearch
            bounds={state.mapProperties.bounds}
            on:searchCompleted={() => state.guistate.themeIsOpened.setData(false)}
            on:searchIsValid={(isValid) => {
              searchEnabled = isValid
            }}
            perLayer={state.perLayer}
            {selectedElement}
            {selectedLayer}
            {triggerSearch}
          />
        </div>
        <button
          class={twJoin("flex items-center justify-between gap-x-2", !searchEnabled && "disabled")}
          on:click={() => triggerSearch.ping()}
        >
          <Tr t={Translations.t.general.search.searchShort} />
          <SearchIcon class="h-6 w-6" />
        </button>
      </div>
    </div>
  </div>

  <div class="links-as-button links-w-full m-2 flex flex-col gap-y-1">
    <!-- bottom buttons, a bit hidden away: switch layout -->
    <a class="flex" href={Utils.HomepageLink()}>
      <img class="h-6 w-6" src="./assets/svg/add.svg" />
      <Tr t={Translations.t.general.backToIndex} />
    </a>
  </div>
</div>
