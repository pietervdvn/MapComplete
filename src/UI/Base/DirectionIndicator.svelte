<script lang="ts">

  /**
   * An A11Y feature which indicates how far away and in what direction the feature lies.
   *
   */

  import { GeoOperations } from "../../Logic/GeoOperations"
  import { Store } from "../../Logic/UIEventSource"
  import type { Feature } from "geojson"
  import ThemeViewState from "../../Models/ThemeViewState"
  import Compass_arrow from "../../assets/svg/Compass_arrow.svelte"
  import { twMerge } from "tailwind-merge"
  import { Orientation } from "../../Sensors/Orientation"

  export let state: ThemeViewState
  export let feature: Feature

  let fcenter = GeoOperations.centerpointCoordinates(feature)
  // Bearing and distance relative to the map center
  let bearingAndDist: Store<{ bearing: number; dist: number }> = state.mapProperties.location.map(
    (l) => {
      let mapCenter = [l.lon, l.lat]
      let bearing = Math.round(GeoOperations.bearing(fcenter, mapCenter))
      let dist = Math.round(GeoOperations.distanceBetween(fcenter, mapCenter))
      return { bearing, dist }
    },
  )
  let bearingFromGps = state.geolocation.geolocationState.currentGPSLocation.mapD(coordinate => {
    return GeoOperations.bearing([coordinate.longitude, coordinate.latitude], fcenter)
  })
  let compass = Orientation.singleton.alpha.map(compass => compass ?? 0)
  export let size = "w-8 h-8"
</script>

<div class={twMerge("relative", size)}>
  <div class={twMerge("absolute top-0 left-0 flex items-center justify-center text-sm",size)}>
    {GeoOperations.distanceToHuman($bearingAndDist.dist)}
  </div>
  {#if $bearingFromGps !== undefined}
    <div class={twMerge("absolute top-0 left-0 rounded-full border border-gray-500", size)}>
      <Compass_arrow class={size}
                     style={`transform: rotate( calc( 45deg + ${$bearingFromGps - $compass}deg) );`} />
    </div>
  {/if}
</div>
<span>{$bearingAndDist.bearing}° {GeoOperations.bearingToHuman($bearingAndDist.bearing)} {GeoOperations.bearingToHumanRelative($bearingAndDist.bearing - $compass)}</span>
