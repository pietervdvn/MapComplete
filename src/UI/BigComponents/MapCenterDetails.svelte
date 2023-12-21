<script lang="ts">
  import { Store } from "../../Logic/UIEventSource"
  import { GeoOperations } from "../../Logic/GeoOperations"
  import ThemeViewState from "../../Models/ThemeViewState"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"

  /**
   * Indicates how far away the viewport center is from the current user location
   */
  export let state: ThemeViewState
  const t = Translations.t.general.visualFeedback
  let map = state.mapProperties

  let currentLocation = state.geolocation.geolocationState.currentGPSLocation
  let distanceToCurrentLocation: Store<{ distance: string, distanceInMeters: number, bearing: number }> = map.location.mapD(({ lon, lat }) => {
    const current = currentLocation.data
    if (!current) {
      return undefined
    }
    const gps: [number, number] = [current.longitude, current.latitude]
    const mapCenter: [number, number] = [lon, lat]
    const distanceInMeters = Math.round(GeoOperations.distanceBetween(gps, mapCenter))
    const distance = GeoOperations.distanceToHuman(distanceInMeters)
    const bearing = Math.round(GeoOperations.bearing(gps, mapCenter))
    return { distance, bearing, distanceInMeters }
  }, [currentLocation])
</script>

{#if $currentLocation !== undefined}
  {#if $distanceToCurrentLocation.distanceInMeters < 20}
    <Tr t={t.viewportCenterCloseToGps} />
  {:else}
    <Tr t={t.viewportCenterDetails.Subs($distanceToCurrentLocation)} />
  {/if}
{/if}
