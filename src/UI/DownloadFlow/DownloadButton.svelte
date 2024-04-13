<script lang="ts">
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import { ArrowDownTrayIcon } from "@babeard/svelte-heroicons/mini"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import Loading from "../Base/Loading.svelte"
  import { Translation } from "../i18n/Translation"
  import { Utils } from "../../Utils"
  import type { PriviligedLayerType } from "../../Models/Constants"
  import { UIEventSource } from "../../Logic/UIEventSource"

  export let state: SpecialVisualizationState

  export let extension: string
  export let mimetype: string
  export let construct: (title: string, status?: UIEventSource<string>) => Promise<Blob | string>
  export let mainText: Translation
  export let helperText: Translation

  const t = Translations.t.general.download

  let isExporting = false
  let isError = false

  let status: UIEventSource<string> = new UIEventSource<string>(undefined)
  async function clicked() {
    isExporting = true

    const gpsLayer = state.layerState.filteredLayers.get(<PriviligedLayerType>"gps_location")
    state.userRelatedState.preferencesAsTags.data["__showTimeSensitiveIcons"] = "no"
    state.userRelatedState.preferencesAsTags.ping()
    const gpsIsDisplayed = gpsLayer.isDisplayed.data
    try {
      gpsLayer.isDisplayed.setData(false)
      const name = state.layout.id

      const title = `MapComplete_${name}_export_${new Date()
        .toISOString()
        .substr(0, 19)}.${extension}`
      const data: Blob | string = await construct(title, status)
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
