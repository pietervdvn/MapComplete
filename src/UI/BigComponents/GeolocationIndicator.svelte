<script lang="ts">
  import Location_refused from "../../assets/svg/Location_refused.svelte"
  import { Store } from "../../Logic/UIEventSource.js"
  import type { GeolocationPermissionState } from "../../Logic/State/GeoLocationState.js"
  import ThemeViewState from "../../Models/ThemeViewState"
  import Location_locked from "../../assets/svg/Location_locked.svelte"
  import Location_unlocked from "../../assets/svg/Location_unlocked.svelte"
  import Location from "../../assets/svg/Location.svelte"
  import Location_empty from "../../assets/svg/Location_empty.svelte"

  export let state: ThemeViewState
  let geolocationstate = state.geolocation.geolocationState
  let geopermission: Store<GeolocationPermissionState> =
    state.geolocation.geolocationState.permission
  let allowMoving = geolocationstate.allowMoving
  let currentGPSLocation = state.geolocation.geolocationState.currentGPSLocation
  let geolocationControlState = state.geolocationControl
  let isAvailable = state.geolocation.geolocationState.gpsAvailable
  let lastClickWasRecent = geolocationControlState.lastClickWithinThreeSecs
  export let clss = "h-8 w-8 shrink-0"
</script>

{#if !$allowMoving}
  <Location_locked class={clss} />
{:else if $currentGPSLocation !== undefined}
  <!-- If we have a location; this implies that the location access was granted -->
  {#if $lastClickWasRecent}
    <Location_unlocked class={clss} />
  {:else}
    <Location class={clss} />
  {/if}
{:else if $geopermission === "denied" || !$isAvailable}
  <Location_refused class={clss} />
{:else if $geopermission === "prompt"}
  <Location_empty class={clss} />
{:else if $geopermission === "requested"}
  <!-- Even though disabled, when clicking we request the location again in case the contributor dismissed the location popup -->
  <Location_empty class={clss} style="animation: 3s linear 0s infinite normal none running spin;" />
{:else}
  <Location class={clss} style="animation: 3s linear 0s infinite normal none running spin;" />
{/if}
