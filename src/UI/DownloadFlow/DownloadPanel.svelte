<script lang="ts">
  import Loading from "../Base/Loading.svelte"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"
  import DownloadHelper from "./DownloadHelper"
  import DownloadButton from "./DownloadButton.svelte"
  import { GeoOperations } from "../../Logic/GeoOperations"
  import { SvgToPdf } from "../../Utils/svgToPdf"
  import ThemeViewState from "../../Models/ThemeViewState"
  import DownloadPdf from "./DownloadPdf.svelte"
  import { PngMapCreator } from "../../Utils/pngMapCreator"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import ValidatedInput from "../InputElement/ValidatedInput.svelte"
  import { LocalStorageSource } from "../../Logic/Web/LocalStorageSource"

  export let state: ThemeViewState
  let isLoading = state.dataIsLoading

  const t = Translations.t.general.download

  const downloadHelper = new DownloadHelper(state)

  let metaIsIncluded = false

  let numberOfFeatures = state.featureSummary.totalNumberOfFeatures

  async function getGeojson() {
    await state.indexedFeatures.downloadAll()
    return downloadHelper.getCleanGeoJson(metaIsIncluded)
  }

  async function offerSvg(noSelfIntersectingLines: boolean): Promise<string> {
    await state.indexedFeatures.downloadAll()
    const maindiv = document.getElementById("maindiv")
    const layers = state.layout.layers.filter((l) => l.source !== null)
    return downloadHelper.asSvg({
      layers,
      mapExtent: state.mapProperties.bounds.data,
      width: maindiv.offsetWidth,
      height: maindiv.offsetHeight,
      noSelfIntersectingLines,
    })
  }

  let customWidth = LocalStorageSource.Get("custom-png-width", "20")
  let customHeight = LocalStorageSource.Get("custom-png-height", "20")

  async function offerCustomPng(): Promise<Blob> {
    console.log(
      "Creating a custom size png with dimensions",
      customWidth.data + "mm *",
      customHeight.data + "mm"
    )
    const creator = new PngMapCreator(state, {
      height: Number(customHeight.data),
      width: Number(customWidth.data),
    })
    return await creator.CreatePng("belowmap")
  }
</script>

{#if $isLoading}
  <Loading />
{:else if $numberOfFeatures > 100000}
  <Tr cls="alert" t={Translations.t.general.download.toMuch} />
{:else}
  <div class="flex w-full flex-col" />
  <h3>
    <Tr t={t.title} />
  </h3>

  <DownloadButton
    {state}
    extension="geojson"
    mimetype="application/vnd.geo+json"
    construct={async () => JSON.stringify(await getGeojson())}
    mainText={t.downloadGeojson}
    helperText={t.downloadGeoJsonHelper}
  />

  <DownloadButton
    {state}
    extension="csv"
    mimetype="text/csv"
    construct={async () => GeoOperations.toCSV(await getGeojson())}
    mainText={t.downloadCSV}
    helperText={t.downloadCSVHelper}
  />

  <label class="mb-8 mt-2">
    <input type="checkbox" bind:value={metaIsIncluded} />
    <Tr t={t.includeMetaData} />
  </label>

  <DownloadButton
    {state}
    extension="svg"
    mimetype="image/svg+xml"
    mainText={t.downloadAsSvg}
    helperText={t.downloadAsSvgHelper}
    construct={() => offerSvg(false)}
  />

  <DownloadButton
    {state}
    extension="svg"
    mimetype="image/svg+xml"
    mainText={t.downloadAsSvgLinesOnly}
    helperText={t.downloadAsSvgLinesOnlyHelper}
    construct={() => offerSvg(true)}
  />

  <DownloadButton
    {state}
    extension="png"
    mimetype="image/png"
    mainText={t.downloadAsPng}
    helperText={t.downloadAsPngHelper}
    construct={() => state.mapProperties.exportAsPng()}
  />

  <div class="flex flex-col">
    {#each Object.keys(SvgToPdf.templates) as key}
      {#if SvgToPdf.templates[key].isPublic}
        <DownloadPdf {state} templateName={key} />
      {/if}
    {/each}
  </div>

  <div class="low-interaction mt-4 p-2">
    <h3 class="m-0 mb-2">
      <Tr t={t.custom.title} />
    </h3>
    <div class="flex">
      <Tr t={t.custom.width} />
      <ValidatedInput {state} type="pnat" value={customWidth} />
    </div>
    <div class="flex">
      <Tr t={t.custom.height} />
      <ValidatedInput {state} type="pnat" value={customHeight} />
    </div>
    <DownloadButton
      mainText={t.custom.download.Subs({ width: $customWidth, height: $customHeight })}
      helperText={t.custom.downloadHelper}
      extension="png"
      construct={() => offerCustomPng()}
      {state}
      mimetype="image/png"
    />
  </div>

  <Tr cls="link-underline" t={t.licenseInfo} />
{/if}
