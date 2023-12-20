<script lang="ts">/**
 * Shows the current address when shaken
 **/
import Motion from "../../Sensors/Motion"
import { Geocoding } from "../../Logic/Osm/Geocoding"
import type { MapProperties } from "../../Models/MapProperties"
import Hotkeys from "../Base/Hotkeys"
import Translations from "../i18n/Translations"
import Locale from "../i18n/Locale"

export let mapProperties: MapProperties
let lastDisplayed: Date = undefined
let currentLocation: string = undefined

async function displayLocation() {
  lastDisplayed = new Date()
  let result = await Geocoding.reverse(
    mapProperties.location.data,
    mapProperties.zoom.data,
    Locale.language.data
  )
  let properties = result.features[0].properties
  currentLocation = properties.display_name
  window.setTimeout(() => {
    if(properties.display_name !== currentLocation){
      return
    }
    currentLocation = undefined
  }, 5000)
}

Motion.singleton.lastShakeEvent.addCallbackD(shaken => {
  if (lastDisplayed !== undefined && shaken.getTime() - lastDisplayed.getTime() < 2000) {
    return
  }
  displayLocation()
})
Hotkeys.RegisterHotkey({ nomod: "q" },
  Translations.t.hotkeyDocumentation.queryCurrentLocation,
  () => {
    displayLocation()
  })


Motion.singleton.startListening()
</script>

{#if currentLocation}
  <div role="alert" aria-live="assertive" class="normal-background rounded-full border-interactive px-2">
    {currentLocation}
  </div>
{/if}
