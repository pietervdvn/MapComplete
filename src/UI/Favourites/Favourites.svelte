<script lang="ts">
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import FavouriteSummary from "./FavouriteSummary.svelte"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"
  import { Utils } from "../../Utils"
  import { GeoOperations } from "../../Logic/GeoOperations"
  import type { Feature, Point } from "geojson"
  import LoginToggle from "../Base/LoginToggle.svelte"
  import LoginButton from "../Base/LoginButton.svelte"
  import ArrowDownTray from "@babeard/svelte-heroicons/mini/ArrowDownTray"

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
        mimetype: "application/vnd.geo+json"
      }
    )
  }

  function downloadGPX() {
    const gpx = GeoOperations.toGpxPoints(<Feature<Point>>favourites.data, "MapComplete favourites")
    Utils.offerContentsAsDownloadableFile(
      gpx,
      "mapcomplete-favourites-" + new Date().toISOString() + ".gpx",
      {
        mimetype: "{gpx=application/gpx+xml}"
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

  <div class="flex flex-col">
    {#if $favourites.length === 0}
      <Tr t={Translations.t.favouritePoi.noneYet} />
    {:else}
      <Tr t={Translations.t.favouritePoi.intro.Subs({ length: $favourites?.length ?? 0 })} />
      <Tr t={Translations.t.favouritePoi.introPrivacy} />
    {/if}
    {#each $favourites as feature (feature.properties.id)}
      <FavouriteSummary {feature} {state} />
    {/each}

    {#if $favourites.length > 0}
      <div class="mt-8 flex">
        <button on:click={() => downloadGeojson()}>
          <ArrowDownTray class="h-6 w-6" />
          <Tr t={Translations.t.favouritePoi.downloadGeojson} />
        </button>
        <button on:click={() => downloadGPX()}>
          <ArrowDownTray class="h-6 w-6" />
          <Tr t={Translations.t.favouritePoi.downloadGpx} />
        </button>
      </div>
    {/if}
  </div>
</LoginToggle>
