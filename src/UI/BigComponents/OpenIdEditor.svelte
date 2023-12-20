<script lang="ts">
  import { Store } from "../../Logic/UIEventSource"
  import { PencilIcon } from "@babeard/svelte-heroicons/solid"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"

  export let mapProperties: { location: Store<{ lon: number; lat: number }>; zoom: Store<number> }
  let location = mapProperties.location
  let zoom = mapProperties.zoom
  export let objectId: undefined | string = undefined

  let elementSelect = ""
  if (objectId !== undefined) {
    const parts = objectId?.split("/")
    const tp = parts[0]
    if (
      parts.length === 2 &&
      !isNaN(Number(parts[1])) &&
      (tp === "node" || tp === "way" || tp === "relation")
    ) {
      elementSelect = "&" + tp + "=" + parts[1]
    }
  }
  const idLink = `https://www.openstreetmap.org/edit?editor=id${elementSelect}#map=${$zoom ?? 0}/${
    $location?.lat ?? 0
  }/${$location?.lon ?? 0}`
</script>

<a class="flex items-center" target="_blank" href={idLink}>
  <PencilIcon class="h-6 w-6 pr-2" />
  <Tr t={Translations.t.general.attribution.editId} />
</a>
