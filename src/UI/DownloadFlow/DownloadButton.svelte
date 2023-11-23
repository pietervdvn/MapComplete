<script lang="ts">
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import { ArrowDownTrayIcon } from "@babeard/svelte-heroicons/mini"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import type { FeatureCollection } from "geojson"
  import Loading from "../Base/Loading.svelte"
  import { Translation } from "../i18n/Translation"
  import DownloadHelper from "./DownloadHelper"
  import { Utils } from "../../Utils"
  import type { PriviligedLayerType } from "../../Models/Constants"
  import { UIEventSource } from "../../Logic/UIEventSource"

  export let state: SpecialVisualizationState

  export let extension: string
  export let mimetype: string
  export let construct: (
    geojsonCleaned: FeatureCollection,
    title: string,
    status?: UIEventSource<string>
  ) => (Blob | string) | Promise<void>
  export let mainText: Translation
  export let helperText: Translation
  export let metaIsIncluded: boolean
  let downloadHelper: DownloadHelper = new DownloadHelper(state)

  const t = Translations.t.general.download

  let isExporting = false
  let isError = false

  let status: UIEventSource<string> = new UIEventSource<string>(undefined)

  async function clicked() {
    isExporting = true
    const gpsLayer = state.layerState.filteredLayers.get(<PriviligedLayerType>"gps_location")
    state.lastClickObject.features.setData([])
    state.userRelatedState.preferencesAsTags.data["__showTimeSensitiveIcons"] = "no"
    state.userRelatedState.preferencesAsTags.ping()
    const gpsIsDisplayed = gpsLayer.isDisplayed.data
    try {
      gpsLayer.isDisplayed.setData(false)
      const geojson: FeatureCollection = downloadHelper.getCleanGeoJson(metaIsIncluded)
      const name = state.layout.id

      const title = `MapComplete_${name}_export_${new Date()
        .toISOString()
        .substr(0, 19)}.${extension}`
      const promise = construct(geojson, title, status)
      let data: Blob | string
      if (typeof promise === "string") {
        data = promise
      } else if (typeof promise["then"] === "function") {
        data = await (<Promise<Blob | string>>promise)
      } else {
        data = <Blob>promise
      }
      if (!data) {
        return
      }
      console.log("Got data", data)
      Utils.offerContentsAsDownloadableFile(data, title, {
        mimetype,
      })
    } catch (e) {
      isError = true
      console.error(e)
    } finally {
      isExporting = false
      gpsLayer.isDisplayed.setData(gpsIsDisplayed)
      state.userRelatedState.preferencesAsTags.data["__showTimeSensitiveIcons"] = "yes"
      state.userRelatedState.preferencesAsTags.ping()
    }
  }
</script>

{#if isError}
  <Tr cls="alert" t={Translations.t.general.error} />
{:else if isExporting}
  <Loading>
    {#if $status}
      {$status}
    {:else}
      <Tr t={t.exporting} />
    {/if}
  </Loading>
{:else}
  <button class="flex w-full" on:click={clicked}>
    <slot name="image">
      <ArrowDownTrayIcon class="mr-2 h-12 w-12 shrink-0" />
    </slot>
    <span class="flex flex-col items-start">
      <Tr t={mainText} />
      <Tr t={helperText} cls="subtle" />
    </span>
  </button>
{/if}
