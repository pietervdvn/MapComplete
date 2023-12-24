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
    },
  )
  let bearingFromGps = state.geolocation.geolocationState.currentGPSLocation.mapD(coordinate => {
    return GeoOperations.bearing([coordinate.longitude, coordinate.latitude], fcenter)
  })
  let compass = Orientation.singleton.alpha

  let relativeDirections = Translations.t.general.visualFeedback.directionsRelative
  let absoluteDirections = Translations.t.general.visualFeedback.directionsAbsolute

  let closeToCurrentLocation = state.geolocation.geolocationState.currentGPSLocation.map(gps => {
      if (!gps) {
        return false
      }
      let l = state.mapProperties.location.data
      let mapCenter = [l.lon, l.lat]
      const dist = GeoOperations.distanceBetween([gps.longitude, gps.latitude], mapCenter)
      return dist < Constants.viewportCenterCloseToGpsCutoff
    },
    [state.mapProperties.location],
  )
  let labelFromCenter: Store<string> = bearingAndDist.mapD(({ bearing, dist }) => {
    const distHuman = GeoOperations.distanceToHuman(dist)
    const lang = Locale.language.data
    const t = absoluteDirections[GeoOperations.bearingToHuman(bearing)]
    const mainTr = Translations.t.general.visualFeedback.fromMapCenter.Subs({
      distance: distHuman,
      direction: t.textFor(lang),
    })
    return mainTr.textFor(lang)
  }, [compass, Locale.language])


  // Bearing and distance relative to the map center
  let bearingAndDistGps: Store<{
    bearing: number;
    dist: number
  } | undefined> = state.geolocation.geolocationState.currentGPSLocation.mapD(
    ({ longitude, latitude }) => {
      let gps = [longitude, latitude]
      let bearing = Math.round(GeoOperations.bearing(gps, fcenter))
      let dist = Math.round(GeoOperations.distanceBetween(fcenter, gps))
      return { bearing, dist }
    },
  )
  let labelFromGps: Store<string | undefined> = bearingAndDistGps.mapD(({ bearing, dist }) => {
    const distHuman = GeoOperations.distanceToHuman(dist)
    const lang = Locale.language.data
    let bearingHuman: string
    if (compass.data !== undefined) {
      console.log("compass:", compass.data)
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
  }, [compass, Locale.language])

  let label = labelFromCenter.map(labelFromCenter => {
    if (labelFromGps.data !== undefined) {
      if(closeToCurrentLocation.data){
        return labelFromGps.data
      }
      return labelFromCenter + ", " + labelFromGps.data
    }
    return labelFromCenter
  }, [labelFromGps])
  function focusMap(){
    state.mapProperties.location.setData({ lon: fcenter[0], lat: fcenter[1] })
  }
</script>

<button class={twMerge("relative rounded-full soft", size)} use:ariaLabelStore={label} on:click={() => focusMap()}>
  <div class={twMerge("absolute top-0 left-0 flex items-center justify-center text-sm break-words",size)}>
    {GeoOperations.distanceToHuman($bearingAndDistGps.dist)}
  </div>
  {#if $bearingFromGps !== undefined}
    <div class={twMerge("absolute top-0 left-0 rounded-full", size)}>
      <Compass_arrow class={size}
                     style={`transform: rotate( calc( 45deg + ${$bearingFromGps - ($compass ?? 0)}deg) );`} />
    </div>
  {/if}
</button>
