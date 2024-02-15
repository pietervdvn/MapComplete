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

  export let state: ThemeViewState
  let isLoading = state.dataIsLoading

  const t = Translations.t.general.download

  const downloadHelper = new DownloadHelper(state)

  let metaIsIncluded = false
  const name = state.layout.id

  function offerSvg(noSelfIntersectingLines: boolean): string {
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
</script>

{#if $isLoading}
  <Loading />
{:else}
  <div class="flex w-full flex-col" />
  <h3>
    <Tr t={t.title} />
  </h3>

  <DownloadButton
    {state}
    extension="geojson"
    mimetype="application/vnd.geo+json"
    construct={(geojson) => JSON.stringify(geojson)}
    mainText={t.downloadGeojson}
    helperText={t.downloadGeoJsonHelper}
    {metaIsIncluded}
  />

  <DownloadButton
    {state}
    extension="csv"
    mimetype="text/csv"
    construct={(geojson) => GeoOperations.toCSV(geojson)}
    mainText={t.downloadCSV}
    helperText={t.downloadCSVHelper}
    {metaIsIncluded}
  />

  <label class="mb-8 mt-2">
    <input type="checkbox" bind:value={metaIsIncluded} />
    <Tr t={t.includeMetaData} />
  </label>

  <DownloadButton
    {state}
    {metaIsIncluded}
    extension="svg"
    mimetype="image/svg+xml"
    mainText={t.downloadAsSvg}
    helperText={t.downloadAsSvgHelper}
    construct={() => offerSvg(false)}
  />

  <DownloadButton
    {state}
    {metaIsIncluded}
    extension="svg"
    mimetype="image/svg+xml"
    mainText={t.downloadAsSvgLinesOnly}
    helperText={t.downloadAsSvgLinesOnlyHelper}
    construct={() => offerSvg(true)}
  />

  <DownloadButton
    {state}
    {metaIsIncluded}
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

  <Tr cls="link-underline" t={t.licenseInfo} />
{/if}
