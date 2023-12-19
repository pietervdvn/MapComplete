<script lang="ts">/**
 * Shows the current address when shaken
 **/
import Motion from "../../Sensors/Motion"
import { Geocoding } from "../../Logic/Osm/Geocoding"
import type { MapProperties } from "../../Models/MapProperties"

export let mapProperties: MapProperties
let lastDisplayed: Date = undefined
let currentLocation: string = undefined

async function displayLocation() {
  lastDisplayed = new Date()
  let result = await Geocoding.reverse(
    mapProperties.location.data,
    mapProperties.zoom.data,
  )
  console.log("Got result", result)
  let properties = result.features[0].properties
  currentLocation = properties.display_name
  window.setTimeout(() => {
    currentLocation = undefined
  }, 5000)
}

Motion.singleton.lastShakeEvent.addCallbackD(shaken => {
  console.log("Got a shaken event")
  if (shaken.getTime() - lastDisplayed.getTime() < 1000) {
    console.log("To soon:",shaken.getTime() - lastDisplayed.getTime())
   // return
  }
  displayLocation()
})

Motion.singleton.startListening()
mapProperties.location.stabilized(500).addCallbackAndRun(loc => {
  displayLocation()
})
</script>

{#if currentLocation}
  <div role="alert" aria-live="assertive" class="normal-background">
    {currentLocation}
  </div>
{/if}
