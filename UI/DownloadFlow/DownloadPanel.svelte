<script lang="ts">

    import type {SpecialVisualizationState} from "../SpecialVisualization";
    import Loading from "../Base/Loading.svelte";
    import Translations from "../i18n/Translations";
    import Tr from "../Base/Tr.svelte";
    import DownloadHelper from "./DownloadHelper";
    import DownloadButton from "./DownloadButton.svelte";
    import {GeoOperations} from "../../Logic/GeoOperations";

    export let state: SpecialVisualizationState
    let isLoading = state.dataIsLoading

    const t = Translations.t.general.download

    const downloadHelper = new DownloadHelper(state)

    let metaIsIncluded = false
    const name = state.layout.id


    function offerSvg(): string {
        const maindiv = document.getElementById("maindiv")
        const layers = state.layout.layers.filter((l) => l.source !== null)
        return downloadHelper.asSvg({
            layers,
            mapExtent: state.mapProperties.bounds.data,
            width: maindiv.offsetWidth,
            height: maindiv.offsetHeight,
        })
    }

</script>


{#if $isLoading}
    <Loading/>
{:else}

    <div class="w-full flex flex-col"></div>
    <h3>
        <Tr t={t.title}/>
    </h3>

    <DownloadButton {state}
                    extension="geojson"
                    mimetype="application/vnd.geo+json"
                    construct={(geojson) => JSON.stringify(geojson)}
                    mainText={t.downloadGeojson}
                    helperText={t.downloadGeoJsonHelper}
                    {metaIsIncluded}/>

    <DownloadButton {state}
                    extension="csv"
                    mimetype="text/csv"
                    construct={(geojson) => GeoOperations.toCSV(geojson)}
                    mainText={t.downloadCSV}
                    helperText={t.downloadCSVHelper}
                    {metaIsIncluded}/>


    <label class="mb-8 mt-2">
        <input type="checkbox" bind:value={metaIsIncluded}>
        <Tr t={t.includeMetaData}/>
    </label>

    <DownloadButton {state} {metaIsIncluded}
                    extension="svg"
                    mimetype="image/svg+xml"
                    mainText={t.downloadAsSvg}
                    helperText={t.downloadAsSvgHelper}
                    construct={offerSvg}
    />

    <DownloadButton {state} {metaIsIncluded}
                    extension="png"
                    mimetype="image/png"
                    mainText={t.downloadAsPng}
                    helperText={t.downloadAsPngHelper}
                    construct={_ => state.mapProperties.exportAsPng(4)}
    />

    <DownloadButton {state}
                    mimetype="application/pdf"
                    extension="pdf"
                    mainText={t.downloadAsPdf}
                    helperText={t.downloadAsPdfHelper}
                    construct={_ => state.mapProperties.exportAsPng(4)}
    />


    <Tr cls="link-underline" t={t.licenseInfo}/>
{/if}

