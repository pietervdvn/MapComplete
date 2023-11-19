<script lang="ts">
  import Translations from "../i18n/Translations"
  import Svg from "../../Svg"
  import { Store } from "../../Logic/UIEventSource"
  import Tr from "../Base/Tr.svelte"
  import ToSvelte from "../Base/ToSvelte.svelte"
  import Mapillary_black from "../../assets/svg/Mapillary_black.svelte";

  /*
    A subtleButton which opens mapillary in a new tab at the current location
     */

  export let mapProperties: {
    readonly zoom: Store<number>
    readonly location: Store<{ lon: number; lat: number }>
  }
  let location = mapProperties.location
  let zoom = mapProperties.zoom
  let mapillaryLink = `https://www.mapillary.com/app/?focus=map&lat=${$location?.lat ?? 0}&lng=${
    $location?.lon ?? 0
  }&z=${Math.max(($zoom ?? 2) - 1, 1)}`
</script>

<a class="button flex items-center" href={mapillaryLink} target="_blank">
  <Mapillary_black class="w-12 h-12 m-2 mr-4 shrink-0"/>
  <div class="flex flex-col">
    <Tr t={Translations.t.general.attribution.openMapillary} />
    <Tr cls="subtle" t={Translations.t.general.attribution.mapillaryHelp} />
  </div>
</a>
