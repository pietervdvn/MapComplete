<script lang="ts">
  import Translations from "../i18n/Translations"
  import { Store } from "../../Logic/UIEventSource"
  import Tr from "../Base/Tr.svelte"
  import Mapillary_black from "../../assets/svg/Mapillary_black.svelte"
  import { Mapillary } from "../../Logic/ImageProviders/Mapillary"
  import { twMerge } from "tailwind-merge"

  /*
      A subtleButton which opens mapillary in a new tab at the current location
       */

  export let mapProperties: {
    readonly zoom: Store<number>
    readonly location: Store<{ lon: number; lat: number }>
  }
  let location = mapProperties.location
  let zoom = mapProperties.zoom
  let mapillaryLink = Mapillary.createLink($location, $zoom)
  export let large: boolean = true
</script>

<a class="flex items-center" href={mapillaryLink} target="_blank">
  <Mapillary_black class={twMerge("shrink-0", large ? "m-2 mr-4 h-12 w-12" : "h-6 w-6 pr-2")} />
  {#if large}
    <div class="flex flex-col">
      <Tr t={Translations.t.general.attribution.openMapillary} />
      <Tr cls="subtle" t={Translations.t.general.attribution.mapillaryHelp} />
    </div>
  {:else}
    <Tr t={Translations.t.general.attribution.openMapillary} />
  {/if}
</a>
