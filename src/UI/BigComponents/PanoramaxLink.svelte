<script lang="ts">
  import Translations from "../i18n/Translations"
  import { Store } from "../../Logic/UIEventSource"
  import Tr from "../Base/Tr.svelte"
  import Mapillary_black from "../../assets/svg/Mapillary_black.svelte"
  import { twMerge } from "tailwind-merge"
  import { PanoramaxXYZ, Panoramax } from "panoramax-js/dist"
  import Panoramax_bw from "../../assets/svg/Panoramax_bw.svelte"
  import {default as Panoramax_svg} from "../../assets/svg/Panoramax.svelte"

  /*
      A subtleButton which opens panoramax in a new tab at the current location
       */

  export let host: Panoramax = new PanoramaxXYZ()
  export let mapProperties: {
    readonly zoom: Store<number>
    readonly location: Store<{ lon: number; lat: number }>
  }
  let location = mapProperties.location
  let zoom = mapProperties.zoom
  let href = location.mapD(location =>
    host.createViewLink({
      location,
      zoom: zoom.data,
    }), [zoom])
  export let large: boolean = true
</script>

<a class="flex items-center" href={$href} target="_blank">
  <Panoramax_svg class={twMerge("shrink-0", large ? "m-2 mr-4 h-12 w-12" : "h-5 w-5 pr-1")} />
  {#if large}
    <div class="flex flex-col">
      <Tr t={Translations.t.general.attribution.openPanoramax} />
      <Tr cls="subtle" t={Translations.t.general.attribution.panoramaxHelp} />
    </div>
  {:else}
    <Tr t={Translations.t.general.attribution.openPanoramax} />
  {/if}
</a>
