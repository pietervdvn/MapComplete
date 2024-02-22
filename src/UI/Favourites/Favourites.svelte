<script lang="ts">
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import FavouriteSummary from "./FavouriteSummary.svelte"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"
  import { DownloadIcon } from "@rgossiaux/svelte-heroicons/solid"
  import { Utils } from "../../Utils"
  import { GeoOperations } from "../../Logic/GeoOperations"
  import type { Feature, Point } from "geojson"
  import LoginToggle from "../Base/LoginToggle.svelte"
  import LoginButton from "../Base/LoginButton.svelte"

  /**
   * A panel showing all your favourites
   */
  export let state: SpecialVisualizationState
  let favourites = state.favourites.allFavourites

  function downloadGeojson() {
    const contents = { features: favourites.data, type: "FeatureCollection" }
    Utils.offerContentsAsDownloadableFile(
      JSON.stringify(contents),
      "mapcomplete-favourites-" + new Date().toISOString() + ".geojson",
      {
        mimetype: "application/vnd.geo+json",
      }
    )
  }

  function downloadGPX() {
    const gpx = GeoOperations.toGpxPoints(<Feature<Point>>favourites.data, "MapComplete favourites")
    Utils.offerContentsAsDownloadableFile(
      gpx,
      "mapcomplete-favourites-" + new Date().toISOString() + ".gpx",
      {
        mimetype: "{gpx=application/gpx+xml}",
      }
    )
  }
</script>

<LoginToggle {state}>
  <div slot="not-logged-in">
    <LoginButton osmConnection={state.osmConnection}>
      <Tr t={Translations.t.favouritePoi.loginToSeeList} />
    </LoginButton>
  </div>

  <div class="flex flex-col" on:keypress={(e) => console.log("Got keypress", e)}>
    <Tr t={Translations.t.favouritePoi.intro.Subs({ length: $favourites?.length ?? 0 })} />
    <Tr t={Translations.t.favouritePoi.introPrivacy} />

    {#each $favourites as feature (feature.properties.id)}
      <FavouriteSummary {feature} {state} />
    {/each}

    <div class="mt-8">
      <button class="flex p-2" on:click={() => downloadGeojson()}>
        <DownloadIcon class="h-6 w-6" />
        <Tr t={Translations.t.favouritePoi.downloadGeojson} />
      </button>
      <button class="flex p-2" on:click={() => downloadGPX()}>
        <DownloadIcon class="h-6 w-6" />
        <Tr t={Translations.t.favouritePoi.downloadGpx} />
      </button>
    </div>
  </div>
</LoginToggle>
