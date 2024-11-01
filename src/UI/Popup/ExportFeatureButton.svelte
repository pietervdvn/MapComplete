<script lang="ts">

  import ArrowDownTray from "@babeard/svelte-heroicons/mini/ArrowDownTray"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import { Store } from "../../Logic/UIEventSource"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import { GeoOperations } from "../../Logic/GeoOperations"
  import type { Feature, LineString } from "geojson"
  import { Utils } from "../../Utils"
  import { Translation } from "../i18n/Translation"

  const t = Translations.t.general.download

  export let tags: Store<Record<string, string>>
  export let layer: LayerConfig
  export let feature: Feature

  export let mimetype: string
  export let extension: string
  export let maintext: Translation
  export let helpertext: Translation
  export let construct: (feature: Feature, title: string) => (Blob | string)
  function exportGpx() {
    console.log("Exporting as GPX!")
    const tgs = tags.data
    const title = layer.title?.GetRenderValue(tgs)?.Subs(tgs)?.txt ?? "gpx_track"
    const data = construct(feature, title)
    Utils.offerContentsAsDownloadableFile(data, title + "_mapcomplete_export."+extension, {
      mimetype,
    })
  }

</script>


<button class="w-full" on:click={() => exportGpx()}>
  <ArrowDownTray class="w-11 h-11 mr-2"/>
  <div class="flex flex-col items-start w-full">
    <Tr t={maintext} cls="font-bold text-lg" />
    <Tr t={helpertext} cls="subtle text-start" />
  </div>
</button>
