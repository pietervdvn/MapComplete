<script lang="ts">
  import { Store } from "../../Logic/UIEventSource"
  import { GeoOperations } from "../../Logic/GeoOperations"
  import ThemeViewState from "../../Models/ThemeViewState"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import { Orientation } from "../../Sensors/Orientation"
  import { Translation } from "../i18n/Translation"
  import Constants from "../../Models/Constants"

  /**
   * Indicates how far away the viewport center is from the current user location
   */
  export let state: ThemeViewState
  const t = Translations.t.general.visualFeedback
  const relativeDir = t.directionsRelative
  let map = state.mapProperties

  let currentLocation = state.geolocation.geolocationState.currentGPSLocation
  let distanceToCurrentLocation: Store<{
    distance: string
    distanceInMeters: number
    bearing: number
  }> = map.location.mapD(
    ({ lon, lat }) => {
      const current = currentLocation?.data
      if (!current) {
        return undefined
      }
      const gps: [number, number] = [current.longitude, current.latitude]
      const mapCenter: [number, number] = [lon, lat]
      const distanceInMeters = Math.round(GeoOperations.distanceBetween(gps, mapCenter))
      const distance = GeoOperations.distanceToHuman(distanceInMeters)
      const bearing = Math.round(GeoOperations.bearing(gps, mapCenter))
      const bearingDirection = GeoOperations.bearingToHuman(bearing)
      return { distance, bearing, distanceInMeters, bearingDirection }
    },
    [currentLocation]
  )
  let hasCompass = Orientation.singleton.gotMeasurement
  let compass = Orientation.singleton.alpha
  let relativeBearing: Store<{ distance: string; bearing: Translation }> = compass.mapD(
    (compass) => {
      if (!distanceToCurrentLocation.data) {
        return undefined
      }
      const bearing: Translation =
        relativeDir[
          GeoOperations.bearingToHumanRelative(distanceToCurrentLocation.data.bearing - compass)
        ]
      return { bearing, distance: distanceToCurrentLocation.data.distance }
    },
    [distanceToCurrentLocation]
  )
  let viewportCenterDetails = Translations.DynamicSubstitute(
    t.viewportCenterDetails,
    relativeBearing
  )
  let viewportCenterDetailsAbsolute = Translations.DynamicSubstitute(
    t.viewportCenterDetails,
    distanceToCurrentLocation.mapD(({ distance, bearing }) => {
      return { distance, bearing: t.directionsAbsolute[GeoOperations.bearingToHuman(bearing)] }
    })
  )
</script>

{#if $currentLocation !== undefined}
  {#if $distanceToCurrentLocation.distanceInMeters < Constants.viewportCenterCloseToGpsCutoff}
    <Tr t={t.viewportCenterCloseToGps} />
  {:else if $hasCompass}
    {$viewportCenterDetails}
  {:else}
    {$viewportCenterDetailsAbsolute}
  {/if}
{/if}
