<script lang="ts">
  import Translations from "../i18n/Translations"
  import { Store } from "../../Logic/UIEventSource"
  import Tr from "../Base/Tr.svelte"
  import Mapillary_black from "../../assets/svg/Mapillary_black.svelte"
  import { Mapillary } from "../../Logic/ImageProviders/Mapillary"

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
</script>

<a class="button flex items-center" href={mapillaryLink} target="_blank">
  <Mapillary_black class="m-2 mr-4 h-12 w-12 shrink-0" />
  <div class="flex flex-col">
    <Tr t={Translations.t.general.attribution.openMapillary} />
    <Tr cls="subtle" t={Translations.t.general.attribution.mapillaryHelp} />
  </div>
</a>
