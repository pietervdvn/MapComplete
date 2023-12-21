<script lang="ts">
  import Location_refused from "../../assets/svg/Location_refused.svelte"
  import { Store } from "../../Logic/UIEventSource.js"
  import type { GeolocationPermissionState } from "../../Logic/State/GeoLocationState.js"
  import ThemeViewState from "../../Models/ThemeViewState"
  import Location_locked from "../../assets/svg/Location_locked.svelte"
  import Location_unlocked from "../../assets/svg/Location_unlocked.svelte"
  import Location from "../../assets/svg/Location.svelte"

  export let state: ThemeViewState
  let geolocationstate = state.geolocation.geolocationState
  let geopermission: Store<GeolocationPermissionState> =
    state.geolocation.geolocationState.permission
  let allowMoving = geolocationstate.allowMoving
  let currentGPSLocation = state.geolocation.geolocationState.currentGPSLocation
  let geolocationControlState = state.geolocationControl
  let lastClickWasRecent = geolocationControlState.lastClickWithinThreeSecs
</script>

{#if !$allowMoving}
  <Location_locked class="h-8 w-8" />
{:else if $currentGPSLocation !== undefined}
  <!-- If we have a location; this implies that the location access was granted -->
  {#if $lastClickWasRecent}
    <Location_unlocked class="h-8 w-8" />
  {:else}
    <Location class="h-8 w-8" />
  {/if}
{:else if $geopermission === "prompt"}
  <Location class="h-8 w-8" />
{:else if $geopermission === "requested"}
  <!-- Even though disabled, when clicking we request the location again in case the contributor dismissed the location popup -->
  <Location class="h-8 w-8" style="animation: 3s linear 0s infinite normal none running spin;" />
{:else if $geopermission === "denied"}
  <Location_refused class="h-8 w-8" />
{:else}
  <Location class="h-8 w-8" style="animation: 3s linear 0s infinite normal none running spin;" />
{/if}
