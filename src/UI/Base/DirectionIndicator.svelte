<script lang="ts">
  /**
   * An A11Y feature which indicates how far away and in what direction the feature lies.
   *
   */

  import { GeoOperations } from "../../Logic/GeoOperations"
  import { Store } from "../../Logic/UIEventSource"
  import type { Feature } from "geojson"
  import Compass_arrow from "../../assets/svg/Compass_arrow.svelte"
  import { twMerge } from "tailwind-merge"
  import { Orientation } from "../../Sensors/Orientation"
  import Translations from "../i18n/Translations"
  import Constants from "../../Models/Constants"
  import Locale from "../i18n/Locale"
  import { ariaLabelStore } from "../../Utils/ariaLabel"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import Center from "../../assets/svg/Center.svelte"
  import Tr from "./Tr.svelte"

  export let state: SpecialVisualizationState
  export let feature: Feature
  export let size = "w-8 h-8"

  let fcenter = GeoOperations.centerpointCoordinates(feature)
  // Bearing and distance relative to the map center
  let bearingAndDist: Store<{ bearing: number; dist: number }> = state.mapProperties.location.map(
    (l) => {
      let mapCenter = [l.lon, l.lat]
      let bearing = Math.round(GeoOperations.bearing(mapCenter, fcenter))
      let dist = Math.round(GeoOperations.distanceBetween(fcenter, mapCenter))
      return { bearing, dist }
    }
  )
  let bearingFromGps = state.geolocation.geolocationState.currentGPSLocation.mapD((coordinate) => {
    return GeoOperations.bearing([coordinate.longitude, coordinate.latitude], fcenter)
  })
  let compass = Orientation.singleton.alpha

  let relativeDirections = Translations.t.general.visualFeedback.directionsRelative
  let absoluteDirections = Translations.t.general.visualFeedback.directionsAbsolute

  function round10(n: number) {
    if (n < 50) {
      return n
    }
    return Math.round(n / 10) * 10
  }

  let closeToCurrentLocation = state.geolocation.geolocationState.currentGPSLocation.map(
    (gps) => {
      if (!gps) {
        return false
      }
      let l = state.mapProperties.location.data
      let mapCenter = [l.lon, l.lat]
      const dist = GeoOperations.distanceBetween([gps.longitude, gps.latitude], mapCenter)
      return dist < Constants.viewportCenterCloseToGpsCutoff
    },
    [state.mapProperties.location]
  )
  let labelFromCenter: Store<string> = bearingAndDist.mapD(
    ({ bearing, dist }) => {
      const distHuman = GeoOperations.distanceToHuman(round10(dist))
      const lang = Locale.language.data
      const t = absoluteDirections[GeoOperations.bearingToHuman(bearing)]
      const mainTr = Translations.t.general.visualFeedback.fromMapCenter.Subs({
        distance: distHuman,
        direction: t.textFor(lang),
      })
      return mainTr.textFor(lang)
    },
    [compass, Locale.language]
  )

  // Bearing and distance relative to the map center
  let bearingAndDistGps: Store<
    | {
        bearing: number
        dist: number
      }
    | undefined
  > = state.geolocation.geolocationState.currentGPSLocation.mapD(({ longitude, latitude }) => {
    let gps = [longitude, latitude]
    let bearing = Math.round(GeoOperations.bearing(gps, fcenter))
    let dist = round10(Math.round(GeoOperations.distanceBetween(fcenter, gps)))
    return { bearing, dist }
  })
  let labelFromGps: Store<string | undefined> = bearingAndDistGps.mapD(
    ({ bearing, dist }) => {
      const distHuman = GeoOperations.distanceToHuman(dist)
      const lang = Locale.language.data
      let bearingHuman: string
      if (compass.data !== undefined) {
        const bearingRelative = bearing - compass.data
        const t = relativeDirections[GeoOperations.bearingToHumanRelative(bearingRelative)]
        bearingHuman = t.textFor(lang)
      } else {
        bearingHuman = absoluteDirections[GeoOperations.bearingToHuman(bearing)].textFor(lang)
      }
      const mainTr = Translations.t.general.visualFeedback.fromGps.Subs({
        distance: distHuman,
        direction: bearingHuman,
      })
      return mainTr.textFor(lang)
    },
    [compass, Locale.language]
  )

  let label = labelFromCenter.map(
    (labelFromCenter) => {
      if (labelFromGps.data !== undefined) {
        if (closeToCurrentLocation.data) {
          return labelFromGps.data
        }
        return labelFromCenter + ", " + labelFromGps.data
      }
      return labelFromCenter
    },
    [labelFromGps]
  )

  function focusMap() {
    state.mapProperties.location.setData({ lon: fcenter[0], lat: fcenter[1] })
  }
</script>

{#if $bearingAndDistGps === undefined}
  <!-- 
  Important: one would expect this to be a button - it certainly behaves as one
  However, this breaks the live-reading functionality (at least with Orca+FF),
  so we use a 'div' and add on:click manually
  -->
  <div
    class={twMerge(
      "soft relative flex cursor-pointer items-center justify-center rounded-full border border-black p-1",
      size
    )}
    on:click={() => focusMap()}
    use:ariaLabelStore={label}
  >
    <Center class=" h-6 w-6" />
  </div>
{:else if !!$label}
  <div
    class={twMerge("soft relative rounded-full border border-black", size)}
    on:click={() => focusMap()}
    use:ariaLabelStore={label}
  >
    <div
      class={twMerge(
        "absolute top-0 left-0 flex cursor-pointer items-center justify-center break-words text-xs",
        size
      )}
    >
      <div aria-hidden="true">
        {GeoOperations.distanceToHuman($bearingAndDistGps?.dist)}
      </div>
      <div class="offscreen">
        {$label}
      </div>
    </div>
    {#if $bearingFromGps !== undefined}
      <div class={twMerge("absolute top-0 left-0 rounded-full", size)}>
        <Compass_arrow
          class={size}
          style={`transform: rotate( calc( 45deg + ${$bearingFromGps - ($compass ?? 0)}deg) );`}
        />
      </div>
    {/if}
  </div>
{/if}

<style>
  .offscreen {
    clip: rect(1px, 1px, 1px, 1px);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap; /* added line */
    width: 1px;
  }
</style>
