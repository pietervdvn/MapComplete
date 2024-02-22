<script lang="ts">
  /**
   * Shows the current address when shaken
   **/
  import Motion from "../../Sensors/Motion"
  import { Geocoding } from "../../Logic/Osm/Geocoding"
  import Hotkeys from "../Base/Hotkeys"
  import Translations from "../i18n/Translations"
  import Locale from "../i18n/Locale"
  import MapCenterDetails from "./MapCenterDetails.svelte"
  import ThemeViewState from "../../Models/ThemeViewState"

  export let state: ThemeViewState
  let mapProperties = state.mapProperties
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
      if (properties.display_name !== currentLocation) {
        return
      }
      currentLocation = undefined
    }, 5000)
  }

  Motion.singleton.lastShakeEvent.addCallbackD((shaken) => {
    if (lastDisplayed !== undefined && shaken.getTime() - lastDisplayed.getTime() < 2000) {
      return
    }
    displayLocation()
  })
  Hotkeys.RegisterHotkey(
    { nomod: "q" },
    Translations.t.hotkeyDocumentation.queryCurrentLocation,
    () => {
      displayLocation()
    },
    [Translations.t.hotkeyDocumentation.shakePhone]
  )

  Motion.singleton.startListening()
</script>

{#if currentLocation}
  <div
    aria-live="assertive"
    class="normal-background border-interactive flex flex-col items-center rounded-full px-2"
  >
    {currentLocation}.
    <MapCenterDetails {state} />
  </div>
{/if}
